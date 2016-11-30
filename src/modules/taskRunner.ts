import { exec } from "child_process";

import * as mongoose from "mongoose";
import * as Promise from "bluebird";

import { PreDefTasks } from "./preDefTasks";

export class TaskRunner {

    run(command: string) {
        let cmd: string[] = this.tokenizeCommand(command);
        let cmdName = cmd[0];
        let args = cmd.slice(1);
        if (this.checkIfPreDef(cmdName)) {
            // pass args arr for execution
            return Promise.resolve(PreDefTasks.prototype[cmdName](args));
        }
        let execFunc = Promise.promisify(exec);
        let childProcess = execFunc(command);
        return childProcess.then(function (stdout: string) {
            return 0;
        }, function (error) {
            return 1;
        });
    }

    /**
     * Tokenizes commands into an ordered array of strings.
     */
    tokenizeCommand(command: string) {
        return command.match(/("(.*?)")|('(.*?)')|([^\s]+)/g);
    }

    /**
     * Checks if command is a function name in PreDefTasks class
     */
    checkIfPreDef(command: string): boolean {
        return PreDefTasks.prototype[command] !== undefined;
    }
}