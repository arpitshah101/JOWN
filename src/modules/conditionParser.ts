import * as Promise from "bluebird";
import * as mongoose from "mongoose";
import * as ExpressionNode from "../models/ExpressionNode";

export class ConditionParser {

	/**
	 * Function that takes a conditional, parses it and returns a tree with all the conditions
	 * @param   condition: String containing a conditional statement
	 * @return  a tree containing the conditions split up by logical operators
	 *          undefined if the conditional is not properly formatted
	 */
	public buildEvaluationTree (condition: String) {
		condition = condition.trim();

		let parsedCondition = this.deconstructCondition(condition);
		if (parsedCondition === undefined) {
			return undefined;
		}
		return this.addArrayToTree(parsedCondition);
	}

	/**
	 * 
	 */
	public addArrayToTree (parsedCondition: any[]) {
		let retTree: ExpressionNode.ExpressionNode;
		if (parsedCondition.length === 1) {
			let conditional = String(parsedCondition.pop);
			retTree = new ExpressionNode.ExpressionNode(conditional, undefined, undefined);
			return retTree;
		}
		for (let i = 0 ; i < parsedCondition.length ; i++) {
			if (parsedCondition[i] === "&&" || parsedCondition[i] === "||") {
				let left = this.addArrayToTree(parsedCondition[i - 1]);
				let right = this.addArrayToTree(parsedCondition[i + 1]);
				retTree = new ExpressionNode.ExpressionNode(String(parsedCondition[i]), left, right);
			}
		}

		return retTree;
	}

	/**
	 * Function that takes a "java style" conditional and looks for logical operators. If it finds any it splits up the
	 * string and passes the pieces to parseCondition, if it does not find any it passes the entire string to
	 * parseCondition.
	 * @param   condition: String condition the conditional statement
	 * @return  an array containing all the different conditions split up by logical operators and levels
	 *          undefined if the conditional is not properly formatted
	 */
	public deconstructCondition (condition: String) {
		condition = condition.trim();

		let ret = [];
		let currCondition = "";

		for (let i = 0 ; i < condition.length ; i++) {
			// From here until the end of the loop, C is the character at index i
			let c = condition.charAt(i);
			if (c.match(/[^A-Za-z0-9=<>!" ]+/)) {
				if ((i === 0) && (c === "(")) {
					ret.push(c);
				}
				if ((i !== 0) && (c === "(")) {
					let recRet = this.deconstructCondition(condition.substr(i));
					i = i + recRet[recRet.length - 1];
					// console.log(i + " -- " + recRet);
					recRet.pop();
					// console.log(recRet + "<<<<");
					ret.push(recRet);
				} else if ((i !== 0) && (c === ")")) {
					currCondition = currCondition.trim();
					if (currCondition !== "") {
						ret.push(currCondition);
					}
					ret.push(c);
					ret.push(i);
					return ret;
				} else if (c === "&" || c === "|") {
					if ((currCondition !== "") && (ret.indexOf(currCondition) === -1)) {
						// NEEDS TO BE FIXED TO HANDLE DUPLICATES. ONLY CHECK LAST ITEM IN LIST.
						currCondition = currCondition.trim();
						if (currCondition !== "") {
							ret.push(currCondition);
						}
						currCondition = "";
					}
					// See if there are any names left in the condition
					if (!this.hasNextCondition(condition, i)) {
						return undefined;
					}
					if ((c === condition.charAt(i + 1)) && (condition.charAt(i + 2).match(/[A-Za-z0-9" ]/))) {
						c = c.concat(c);
						ret.push(c);
						i++;
					}
					else {
						return undefined;
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
	public hasNextCondition (condition: String, index: number) {
		for (let j = index ; j < condition.length ; j++) {
			let c = condition.charAt(j);
			if (c.match(/[A-Za-z0-9"]/)) {
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
	 */
	public parseCondtion (condition: String) {

		condition = condition.trim();

		let result = [];

		let splitIndex = this.isCondition(condition);
		if ( splitIndex === undefined) {
			return undefined; // error, not a java conditional statement
		}

		result.push(condition.substr(0, splitIndex).trim());
		// Less than 0 means condition is a conditional with a single character operator
		if (splitIndex < 0) {
			Math.abs(splitIndex);
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
	public isCondition (condition: String) {
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
			if (ret === undefined) {
				return ret;
			}
			else {
				return -ret;
			}
		} else if (condition.indexOf("<") !== -1 ) {
			i = condition.indexOf("<");
			let ret = this.plusOffsetIsEdge(i, condition.length, 1);
			if (ret === undefined) {
				return ret;
			}
			else {
				return -ret;
			}

		}
		return undefined;
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
			return undefined;
		} else if ((index + offset) === length) {
			return undefined;
		}
		else {
			return index;
		}
	}

	/**
	 * Call this from the outside
	 */
	public parseAndEvaluate(expression: String, instanceId: String ) {
		let expressionArray = this.deconstructCondition(expression);
		let res: boolean;

		res = this.evaluateExpression(expressionArray, instanceId);
	}

	/**
	 * Evaluate expression in array and return boolean
	 */
	public evaluateExpression(expression: any[], instanceId: String) {
		let expressionArray = [];
		if (expression === undefined) {
			return undefined;
		}

		if (expression.length === 1) {
			// check for keywords?
			if (expression[0] === "true") {
				return true;
			} else if (expression[0] === "false") {
				return false;
			}

			// return expression[0]; for testing
			return expression[0];
		}

		if (expression.length === 3) {
			if (typeof(expression[0]) === "string" || expression[0] instanceof String) {
				expressionArray = expression[0].split(".");
			}
			else {
				return undefined
			}
			//PSEUDO-ish
			/*formObject = datamanager.getform(expressionArray[0], instanceID);
			let fieldValue = eval("formObject." + expressionArray[expressionArray.length - 1]);
			let concatExpression = "" + fieldValue + expression[1] + expression[2];
			let evaluated = eval(concatExpression);*/
		}
	}

	public evaluate() {
		let condArr = this.deconstructCondition("");
	}
}
