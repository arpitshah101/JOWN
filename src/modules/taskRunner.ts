import * as mongoose from 'mongoose';

import { PreDefTasks } from './preDefTasks';

export class TaskRunner {

    run(command: string) {
        let result = 1;
        let cmd: string[] = this.tokenizeCommand(command);
        let cmdName = cmd[0];
        let args = cmd.slice(1);
        if (this.checkIfPreDef(cmdName)) {
            // pass args arr for execution
            result = PreDefTasks.prototype[cmdName](args);
        }
        return result;
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