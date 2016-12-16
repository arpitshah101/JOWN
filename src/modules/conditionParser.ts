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
	public deconstructCondition (condition: String): any[] {
		let ret = [];
		let currCondition = "";

		condition = condition.trim();
		for (let i = 0 ; i < condition.length ; i++) {
			// From here until the end of the loop, C is the character at index i
			let c = condition.charAt(i);
			if (c.match(/[^A-Za-z0-9=<>!"._$ ]+/)) {
				if (c === "&" || c === "|") {
					if ((currCondition !== "") && (ret[ret.length - 1] !== currCondition)) {
						// console.log("deconstructCondition @ trim#3");
						currCondition = currCondition.trim();
						// console.log("deconstructCondition @ trim#3");
						if (currCondition !== "") {
							ret.push(currCondition);
						}
						currCondition = "";
					}
					// See if there are any names left in the condition
					if (!this.hasNextCondition(condition, i)) {
						return ["false"];
					}
					if ((c === condition.charAt(i + 1)) && (condition.charAt(i + 2).match(/[A-Za-z0-9"_$ ]/))) {
						c = c.concat(c);
						ret.push(c);
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

			if (i === (condition.length - 1)) {
				currCondition = currCondition.trim();
				if (currCondition !== "") {
					ret.push(currCondition);
				}
			}
		}
		// console.log(ret);
		return ret;
	}


	/**
	 * Function that checks if there is a trailing condition after logical AND or logical or
	 * @param   condition which is the string to check in
	 *          index which is the index of where to start checking
	 * @return  returns true if there is a trailing condition, false otherwise
	 */
	public hasNextCondition (condition: String, index: number): boolean {
		for (let j = index ; j < condition.length ; j++) {
			let c = condition.charAt(j);
			if (c.match(/[A-Za-z0-9"_.$]/)) {
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
	public parseCondition (condition: String): string[] {
		let result = [];

		condition = condition.trim();
		let splitIndex = this.isCondition(condition);
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
	public isCondition (condition: String): number {
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
	public parseAndEvaluate(expression: String, instanceId: mongoose.Types.ObjectId ): Bluebird<boolean> {
		let res: boolean;
		let conditionArray: any[];
		let evaluationString: String = "";

		// console.log(`EXECUTING PARSE & EVALUATE:`);
		// console.log(`\texpression: ${expression}`);

		if (!expression) {
			return Bluebird.resolve(false);
		} else if (expression.toLowerCase() === "true") {
			return Bluebird.resolve(true);
		} else if (expression.toLowerCase() === "false") {
			return Bluebird.resolve(false);
		}
		expression.trim();
		// console.log("expression @ parseAndEval: " + expression);
		let expressionArray = this.deconstructCondition(expression);

		// console.log(`\texpressionArray: ${expressionArray}`);

		return new Bluebird<boolean>((resolve, reject) => {
			Bluebird.reduce(expressionArray, (total: String, current: String) => {
				// console.log(`\n\tCurrent value of totalExpression: ${total}`);
				if (current !== "&&" && current !== "||") {
					conditionArray = this.parseCondition(current);
					total += " ";
					return this.evaluateExpression(conditionArray, instanceId)
						.then((value: any) => {
							// console.log(`\tExpression evaluated to ${value}`);
							return total += value;
						});
				}
				else {
					return Bluebird.resolve(total.concat(current.toString()));
				}
			}, evaluationString)
				.then((value: String) => { evaluationString = value; })
				.then(() => {
					// console.log("evaluationString @ EVAL: " + evaluationString);
					// console.log(`Evaluating string using eval: ${evaluationString}`);
					// tslint:disable-next-line:no-eval
					res = eval("" + evaluationString);
					// console.log(`Evaluated to ${res}`);
					resolve(res);
				});
		});
	}

	/**
	 * Evaluate expression in array and return boolean
	 * @param	expression: an array with either one statement such as "true" or a conditional expression that needs
	 * 			to be evaluated, in the format that deconstructCondition returns
	 * 			instanceId: the id of the instance the expression to be evaluated belongs to
	 * @returns	the result of the evaluation
	 */
	public evaluateExpression(expression: any[], instanceId: mongoose.Types.ObjectId): Bluebird<boolean> {
		let expressionArray = [];

		if (expression === undefined) {
			return Bluebird.resolve(false);
		}

		if (expression.length === 1) {
			// check for keywords?
			if (expression[0] === undefined) {
				return Bluebird.resolve(false);
			} else if (expression[0] === "true") {
				return Bluebird.resolve(true);
			} else if (expression[0] === "false") {
				return Bluebird.resolve(false);
			} else {
				return Bluebird.resolve(false);
			}
		}

		if (expression.length === 3) {
			if (typeof(expression[0]) === "string" || expression[0] instanceof String) {
				expressionArray = expression[0].split(".");
			}
			else {
				return Bluebird.resolve(false);
			}

			let fieldValue;
			return DataManager.getFormData(instanceId, expressionArray[0])
				.then((formObject: any) => {
					console.log("1. in promise: expressionArray: " + expressionArray);
					console.log("2. in promise: expressionArray[0]: " + expressionArray[0]);
					// if (expressionArray.indexOf("_$") === -1) {

					// console.log(`\n\texpressionArray: ${expressionArray}\n`);

					if (expressionArray[1] !== "_$") {
						console.log("3. indexOf(_$) === -1, before fieldValue: " + fieldValue);
						// tslint:disable-next-line:no-eval
						fieldValue = eval("formObject.data." + expressionArray[expressionArray.length - 1]);
						console.log("4. indexOf(_$) === -1, after fieldValue: " + fieldValue);
					}
					else {
						console.log("3. indexOf(_$) === 1, before fieldValue: " + fieldValue);
						// tslint:disable-next-line:no-eval
						fieldValue = eval("formObject." + expressionArray[expressionArray.length - 1]);
						console.log("4. indexOf(_$) === 1, after fieldValue: " + fieldValue);
					}
					fieldValue = "\"" + fieldValue + "\"";
					console.log("5. before concatExpression: " + fieldValue + " " + expression[1] + " " + expression[2]);
					let concatExpression = "" + fieldValue + expression[1] + expression[2];
					// tslint:disable-next-line:no-eval
					let evaluated = eval(concatExpression);
					console.log("6. evaluated: " + evaluated);
					if (typeof (evaluated) !== "boolean") {
						return Bluebird.resolve(false);
					}
					return Bluebird.resolve(evaluated);
				});
		}
	}
}