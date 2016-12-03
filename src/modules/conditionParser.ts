
import * as mongoose from "mongoose";
import * as Promise from "bluebird";

class conditionParser {

    parseCondtion (condition: String) {

        condition = condition.trim()

        let splitIndex = this.isCondition(condition);
        if ( splitIndex == -1) {
            return; // error, not a java conditional statement
        }

        let formValue: any; // "left side" of a condition
        let testValue: any; // "right side" of a condition
        //Less than 0 means condition is a conditional with a single character operator
        if( splitIndex < 0 ) {
            Math.abs(--splitIndex);
            testValue = condition.substr(splitIndex + 1);
        }
        else {
            testValue = condition.substr(splitIndex + 2);
        }
        formValue = condition.substr(0, splitIndex);

        let res = condition.split(/[^A-Za-z]+/);
        



    }

    /**
     * Function to check if a passed string is actually a valid condition
     * @param   condition: String containing the full condition to check
     * @return  -1 if test fails
     *          the index if the test passes by finding a two character operator
     *          the negative value of the index -1 if the test passes by finding a single character operator
     *          index -1 to not end up in a situation where the index = 1 and becomes -1
     */
    isCondition (condition: String): number {
        let i = -1;
        if ((i = condition.indexOf("==")) != -1 ) {
            return this.plusOffsetIsEdge(i, condition.length, 2);
        } else if( (i = condition.indexOf("!=")) != -1 ) {
            return this.plusOffsetIsEdge(i, condition.length, 2);
        } else if( (i = condition.indexOf(">=")) != -1 ) {
            return this.plusOffsetIsEdge(i, condition.length, 2);
        } else if( (i = condition.indexOf("<=")) != -1 ) {
            return this.plusOffsetIsEdge(i, condition.length, 2);
        } else if( (i = condition.indexOf(">")) != -1 ) {
            return -(this.plusOffsetIsEdge(i, condition.length, 1) - 1);
        } else if( (i = condition.indexOf("<")) != -1 ) {
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
        if (index == 0) {
            return -1;
        } else if ((index + offset) == length) {
            return -1;
        }
        else {
            return index;
        }
    }

}