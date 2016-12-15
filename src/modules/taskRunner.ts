import * as Bluebird from "bluebird";
import { exec } from "child_process";
import * as mongoose from "mongoose";
import { PreDefTasks } from "./preDefTasks";

export class TaskRunner {

	public static run(command: string): Bluebird<any> {
		let cmd: string[] = this.tokenizeCommand(command);
		let cmdName: string = cmd[0];
		let args: string[] = cmd.slice(1);
		if (this.checkIfPreDef(cmdName)) {
			// pass args arr for execution
			return Bluebird.resolve(PreDefTasks.prototype[cmdName](args));
		}
		let execFunc = Bluebird.promisify(exec);
		let childProcess = execFunc(command);
		return childProcess.then((stdout: string): number => {
			return 0;
		}, (error): number => {
			return 1;
		});
	}

	/**
	 * Tokenizes commands into an ordered array of strings.
	 */
	public static tokenizeCommand(command: string): string[] {
		return command.match(/("(.*?)")|('(.*?)')|([^\s]+)/g);
	}

	/**
	 * Checks if command is a function name in PreDefTasks class
	 */
	public static checkIfPreDef(command: string): boolean {
		return PreDefTasks[command] !== undefined;
	}
}
