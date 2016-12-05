import * as mongoose from "mongoose";
import * as Promise from "bluebird";
import * as ExpressionNode from "../models/ExpressionNode";

export class ConditionParser {

    /**
     * Function that takes a "java style" conditional and looks for logical operators. If it finds any it splits up the
     * string and passes the pieces to parseCondition, if it does not find any it passes the entire string to
     * parseCondition.
     * @param   condition: String condition the conditional statement
     * @return  a tree containing all the different conditions split up by logical operators
     */
    deconstructCondition (condition: String) {
        condition = condition.trim();

        let ret = []; // TRY SORT OUT [String]
        let currCondition = "";

        for (let i = 0 ; i < condition.length ; i++) {
            let c = condition.charAt(i);
            if (c.match(/[^A-Za-z]+/)) {
                if( c === "&" || c === "|" ) {
                    if ((currCondition !== "") && (ret.indexOf(currCondition) === -1)) { // NEEDS TO BE FIXED TO HANDLE DUPLICATES. ONLY CHECK LAST ITEM IN LIST.
                        ret.push(currCondition);
                        currCondition = "";
                    }
                }
            }
            else {
                currCondition = currCondition.concat(c);
            }

            if (i === (condition.length - 1)) {
                ret.push(currCondition);
            }
        }

        return ret;

    }

    /**
     * Function that takes a "java style" conditional and returns an array with the pieces split up
     * @param   condition: String containing the condition to split up
     * @return  array of strings where the initial condition is split as follows on success:
     *          index 0: left side of the condition
     *          index 1: the operator
     *          index 2: the right side of the condition
     */
    parseCondtion (condition: String) {

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
    isCondition (condition: String) {
        let i = -1;
        if ((i = condition.indexOf("==")) !== -1 ) {
            return this.plusOffsetIsEdge(i, condition.length, 2);
        } else if ((i = condition.indexOf("!=")) !== -1 ) {
            return this.plusOffsetIsEdge(i, condition.length, 2);
        } else if ((i = condition.indexOf(">=")) !== -1 ) {
            return this.plusOffsetIsEdge(i, condition.length, 2);
        } else if ((i = condition.indexOf("<=")) !== -1 ) {
            return this.plusOffsetIsEdge(i, condition.length, 2);
        } else if ((i = condition.indexOf(">")) !== -1 ) {
            let ret = this.plusOffsetIsEdge(i, condition.length, 1)
            //return ret;

            if ( ret === undefined ) {
                return ret;
            }
            else {
                return -ret;
            }

        } else if ((i = condition.indexOf("<")) !== -1 ) {
            let ret = this.plusOffsetIsEdge(i, condition.length, 1)
            //return ret;

            if ( ret === undefined ) {
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
    plusOffsetIsEdge (index: number, length: number, offset: number): number {
        if (index === 0) {
            return undefined;
        } else if ((index + offset) === length) {
            return undefined;
        }
        else {
            return index;
        }
    }

}