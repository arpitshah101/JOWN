import * as mongoose from "mongoose";
import * as Promise from "bluebird";

class ConditionParser {

    /**
     * Function that takes a "java style" conditional and looks for logical operators. If it finds any it splits up the
     * string and passes the pieces to parseCondition, if it does not find any it passes the entire string to
     * parseCondition.
     * @param   condition: String condition the conditional statement
     * @return  a tree containing all the different conditions split up by logical operators
     */
    deconstructCondition (condition: String) {
        condition = condition.trim();
    }

    /**
     * Function that takes a "java style" conditional and returns an array with the pieces split up
     * @param   condition: String containing the condition to split up
     * @return  array of strings where the initial condition is split as follows on success:
     *          index 0: left side of the condition
     *          index 1: the operator
     *          index 2: the right side of the condition
     */
    parseCondtion (condition: String): [String] {

        condition = condition.trim();

        let result: [String];
        let splitIndex = this.isCondition(condition);
        if ( splitIndex === -1) {
            return undefined; // error, not a java conditional statement
        }

        // Less than 0 means condition is a conditional with a single character operator
        if (splitIndex < 0) {
            Math.abs(++splitIndex);
            result[0] = condition.substr(splitIndex + 1).trim();
            result[1] = condition.substr(splitIndex, 1);
        }
        else {
            result[0] = condition.substr(splitIndex + 2).trim();
            result[1] = condition.substr(splitIndex, 1);
        }
        result[2] = condition.substr(0, splitIndex).trim();

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
    isCondition (condition: String): number {
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
            return -(this.plusOffsetIsEdge(i, condition.length, 1) - 1);
        } else if ((i = condition.indexOf("<")) !== -1 ) {
            return -(this.plusOffsetIsEdge(i, condition.length, 1) - 1);
        }
        return i;
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
            return -1; // CONSIDER CHANGING THIS TO UNDEFINED
        } else if ((index + offset) === length) {
            return -1; // CONSIDER CHANGING THIS TO UNDEFINED
        }
        else {
            return index;
        }
    }

}