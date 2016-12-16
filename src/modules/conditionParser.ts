import * as Bluebird from "bluebird";
import * as mongoose from "mongoose";

import * as ExpressionNode from "../models/ExpressionNode";
import { DataManager } from "./dataManager";

export class ConditionParser {

	/**
	 * Function that takes a "java style" conditional and looks for logical operators. If it finds any it splits up the
	 * string and passes the pieces to parseConditional, if it does not find any it passes the entire string to
	 * parseConditional.
	 * @param   condition: string condition the conditional statement
	 * @return  an array containing all the different conditions split up by logical operators and levels
	 *          undefined if the conditional is not properly formatted
	 */
	public deconstructCondition (expression: string): string[] {

		let result: string[];
		let currCondition = "";

		for (let i = 0; i < expression.length ; i++) {
			// From here until the end of the loop, C is the character at index i
			let c = expression.charAt(i);
			if (c.match(/[^A-Za-z0-9=<>!"._$ ]+/)) {
				if (c === "&" || c === "|") {
					if (currCondition.trim() === "") {
						// If there is no string before the logical operator
						return ["false"];
					} else if (result[result.length - 1] === "&&" || result[result.length - 1] === "||") {
						// If the previous string is a logical operator
						return ["false"];
					}
					else {
						result.push(currCondition);
					}
					if (i > expression.length - 3) {
						// If there is no space for && or || or condition after
						return ["false"];
					} else if ((c === expression.charAt(i + 1)) && (expression.charAt(i + 2).match(/[A-Za-z0-9"_$ ]/))) {
						result.push(currCondition);
						result.push(c.concat(c));
						i++;
					}
					else {
						return ["false"];
					}
				}
			}
			else {
				currCondition = currCondition.concat(c);
			}
		}
		return result;
	}


	/**
	 * Function that checks if there is a trailing condition after logical AND or logical or
	 * @param   condition which is the string to check in
	 *          index which is the index of where to start checking
	 * @return  returns true if there is a trailing condition, false otherwise
	 */
	public hasNextCondition (condition: string, index: number): boolean {
		for (let j = index ; j < condition.length ; j++) {
			let c = condition.charAt(j);
			if (c.match(/[A-Za-z0-9"_.]/)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Function that takes a "java style" conditional and returns an array with the pieces split up
	 * @param   condition: String containing the condition to split up
	 * @return  array of strings where the initial condition is split as follows on success:
	 *          index 0: left side of the condition
	 *          index 1: the operator
	 *          index 2: the right side of the condition
	 * 			or if operators cannot be found, the original string to allow for situations where the string is "true"
	 */
	public parseConditional (condition: string): string[] {
		let result = [];

		condition = condition.trim();
		let splitIndex = this.isConditional(condition);
		if (splitIndex === 0) {
			// Not a conditional statement
			console.log("WARNING! String not containing a conditional passed to conditionParser.parseConditional");
			return ["false"]; // not a java conditional statement
		}
		result.push(condition.substr(0, splitIndex).trim());
		// Less than 0 means condition is a conditional with a single character operator
		if (splitIndex < 0) {
			splitIndex = Math.abs(splitIndex);
			result.push(condition.substr(splitIndex, 1));
			result.push(condition.substr(splitIndex + 1).trim());
		}
		else {
			result.push(condition.substr(splitIndex, 2));
			result.push(condition.substr(splitIndex + 2).trim());
		}
		return result;
	}

	/**
	 * Function to check if a passed string is actually a valid condition
	 * @param   condition: String containing the full condition to check
	 * @return  -1 if test fails
	 *          the index if the test passes by finding a two character operator
	 *          the negative value of the index -1 if the test passes by finding a single character operator
	 *          -1 to not end up in a situation where the index = 1 and becomes -1 which is the test fail code
	 */
	public isConditional (condition: string): number {
		let i = -1;
		if (condition.indexOf("==") !== -1 ) {
			i = condition.indexOf("==");
			return this.plusOffsetIsEdge(i, condition.length, 2);
		} else if (condition.indexOf("!=") !== -1 ) {
			i = condition.indexOf("!=");
			return this.plusOffsetIsEdge(i, condition.length, 2);
		} else if ( condition.indexOf(">=") !== -1 ) {
			i = condition.indexOf(">=");
			return this.plusOffsetIsEdge(i, condition.length, 2);
		} else if (condition.indexOf("<=") !== -1 ) {
			i = condition.indexOf("<=");
			return this.plusOffsetIsEdge(i, condition.length, 2);
		} else if (condition.indexOf(">") !== -1 ) {
			i = condition.indexOf(">");
			let ret = this.plusOffsetIsEdge(i, condition.length, 1);
			if (ret === 0) {
				return ret;
			}
			else {
				return -ret;
			}
		} else if (condition.indexOf("<") !== -1 ) {
			i = condition.indexOf("<");
			let ret = this.plusOffsetIsEdge(i, condition.length, 1);
			if (ret === 0) {
				return ret;
			}
			else {
				return -ret;
			}

		}
		return 0;
	}

	/**
	 * Function to check if the provided index is either to the first or the last character of a string
	 * for operator that is "offset" characters long
	 * @param   index: the given index where an operator has been found
	 *          length: the length of the string in which the opeartor has been found
	 * @return  -1 if the test fails (if index is either 0 or index + length of operator is same as length)
	 *          returns the index if it passes the test
	 */
	public plusOffsetIsEdge (index: number, length: number, offset: number): number {
		if (index === 0) {
			return 0;
		} else if ((index + offset) === length) {
			return 0;
		}
		else {
			return index;
		}
	}

	/**
	 * The function to call from the outside when a condition needs to be parsedCondition
	 * @param	expression: the string with conditions
	 * 			instanceId: the id of the instance the string "expression" belongs to
	 * @returns	the result of the evaluation of the condition
	 */
	public parseAndEvaluate(fullExpression: string, instanceId: mongoose.Types.ObjectId ): Bluebird<boolean> {
		let result: boolean;
		let fieldValue: Bluebird<string>;
		let conditionalArray: string[];
		let evaluationString: string = "";

		if (!fullExpression) {
			return Bluebird.resolve(false);
		} else if (fullExpression.toLowerCase() === "true") {
			return Bluebird.resolve(true);
		} else if (fullExpression.toLowerCase() === "false") {
			return Bluebird.resolve(false);
		}
		fullExpression = fullExpression.trim();
		// Splits fullExpression into an array where elements are separated by logical operators
		let expressionArray = this.deconstructCondition(fullExpression);
		// Goes through the array adding the elements to a string to evaluate later
		for (let expression of expressionArray) {
			if (expression === "&&" || expression === "||") {
				evaluationString = evaluationString.concat(expression);
			}
			else {
				if (this.isConditional(expression)) {
					conditionalArray = this.parseConditional(expression);
					fieldValue = this.resolveTerm(conditionalArray[0], instanceId);
					evaluationString = evaluationString.concat(fieldValue);
					evaluationString = evaluationString.concat(conditionalArray[1]);
					evaluationString = evaluationString.concat(conditionalArray[2]);
				} else {
					fieldValue = this.resolveTerm(expression, instanceId);
					evaluationString = evaluationString.concat(fieldValue);
				}
			}
		}
		// tslint:disable-next-line:no-eval
		result = eval(evaluationString);
		return Bluebird.resolve(result);
	}

	/**
	 * Resolves a term by parsing it and querying the DataManager for it if needed
	 */
	public resolveTerm(term: string, instanceId: mongoose.Types.ObjectId): Bluebird<string> {
		let result: string;
		let termArray = this.parseTerm(term);
		if (termArray.length === 1) {
			return Bluebird.resolve(termArray[0]);
		}
		return DataManager.getFormData(instanceId, term[0])
			.then((formObject: any) => {
				if (termArray.length === 2 ) {
					// Here the array looks something like ["formName", "data"]
					// tslint:disable-next-line:no-eval
					result = eval("formObject.data." + termArray[1]);
				} else if( termArray.length === 3 ) {
					// Here the array looks something like ["formName", "_$", "data"]
					// tslint:disable-next-line:no-eval
					result = eval("formObject." + termArray[2]);
				}
				else {
					// Shouldn't get here
					console.log("WARNING! termArray > 3 in conditionParser.resolveTerm");
					return Bluebird.resolve("false");
				}
				return Bluebird.resolve(result);
			});
	}

	/**
	 * Parses a term by splitting it by .
	 */
	public parseTerm (word: string): string[] {
		let result: string[];
		if (word.split(".").length === 1) {
			return [word];
		}
		else {
			return word.split(".");
		}
	}
}
