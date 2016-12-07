import * as Bluebird from "bluebird";
import { exec } from "child_process";
import * as mongoose from "mongoose";
import { PreDefTasks } from "./preDefTasks";

export class TaskRunner {

	public run(command: string) {
		let cmd: string[] = this.tokenizeCommand(command);
		let cmdName = cmd[0];
		let args = cmd.slice(1);
		if (this.checkIfPreDef(cmdName)) {
			// pass args arr for execution
			return Bluebird.resolve(PreDefTasks.prototype[cmdName](args));
		}
		let execFunc = Bluebird.promisify(exec);
		let childProcess = execFunc(command);
		return childProcess.then((stdout: string) => {
			return 0;
		}, (error) => {
			return 1;
		});
	}

	/**
	 * Tokenizes commands into an ordered array of strings.
	 */
	public tokenizeCommand(command: string) {
		return command.match(/("(.*?)")|('(.*?)')|([^\s]+)/g);
	}

	/**
	 * Checks if command is a function name in PreDefTasks class
	 */
	public checkIfPreDef(command: string): boolean {
		return PreDefTasks.prototype[command] !== undefined;
	}
}
