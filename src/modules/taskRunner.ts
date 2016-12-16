import * as Bluebird from "bluebird";
import { exec } from "child_process";
import * as mongoose from "mongoose";
import { DataManager } from "./dataManager";
import { PreDefTasks } from "./preDefTasks";

export class TaskRunner {

	public static run(command: string, instanceId: mongoose.Types.ObjectId): Bluebird<any> {
		let cmd: string[] = this.tokenizeCommand(command);
		let cmdName: string = cmd[0];
		let args: string[] = cmd.slice(1);
		if (this.checkIfPreDef(cmdName)) {
			// pass args arr for execution
			// return Bluebird.resolve(PreDefTasks[cmdName](args, instanceId));
			if (cmdName === "assign") {
				return Bluebird.resolve(PreDefTasks.assign(instanceId, args[0], args[1], args[2]));
			}
			else if (cmdName === "email") {
				// console.log(`email command arguments: ${JSON.stringify(args)}`);
				return Bluebird.reduce(args.slice(1), (message: string, current: string) => {
					return new Bluebird<string>((resolve, reject) =>  {
						if (current.charAt(0) === "+") {
							DataManager.getDataFromFormExp(current.substring(1), instanceId)
								.then((value: string) => {
									message += value;
									resolve(message);
								});
						}
						else {
							message += current.substring(1, current.length - 2);
							resolve(message);
						}
					});
				}, "")
				.then((message: string) => {
					return Bluebird.resolve(PreDefTasks.email(args[0], message, instanceId));
				});
			}
			else if (cmdName === "save") {
				return Bluebird.resolve(PreDefTasks.save(args[0], args[1], instanceId));
			}
			else {
				return Bluebird.resolve(0);
			}
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
