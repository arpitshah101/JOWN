import * as fs from "fs";
import * as util from "util";

import * as Bluebird from "bluebird";
import * as mongoose from "mongoose";
import * as parser from "xml-parser";

import * as Event from "../models/Event";
import * as Form from "../models/Form";
import * as State from "../models/State";
import * as Workflow from "../models/Workflow";

type IEntity = Form.IEntity;

// tslint:disable:no-string-literal

export class DefParser {

	public static parse(xml: string): Bluebird<any> {

		return new Bluebird<any>((resolve, reject) => {
			let parsedTree: parser.Document = parser(xml);

			let workflowNode: parser.Node = parsedTree.root.children[0];
			let workflowName: string = workflowNode.attributes["name"];

			let workflow = new Workflow.model({
				name: workflowName,
			});
			workflow.save()
			.then((doc: Workflow.IDocument) => {
				workflow = doc;
			})
			.catch((reason: mongoose.NativeError) => {
				let messageMatch = reason.message.match("insertDocument.+duplicate\\skey\\serror.*");
				if (reason.name === "MongoError" && messageMatch && messageMatch.length > 0) {
					reject(`A workflow already exists with the name '${workflow.name}'`);
				}
				else {
					reject(reason);
				}
			})
			.then(() => {
				let promises: Array<Bluebird<any>> = [];
				for (let child of workflowNode.children) {
					switch (child.name) {
						case "event":
							promises.push(this._parseEvent(child, workflow._id));
							break;
						case "form":
							promises.push(this._parseForm(child, workflow._id));
							break;
						case "groups":
							promises.push(this._parseGroups(child));
							break;
						case "state":
							promises.push(this._parseState(child, workflow._id));
							break;
						default:
					}
				}

				return Bluebird.all(promises);
			})
			.then((results: any[]) => {
				let forms: mongoose.Types.ObjectId[] = [];
				let groups: string[];

				for (let result of results) {

					// console.log(`${typeof result} : ${Array.isArray(result)} : ${result}\n`);
					// console.log(`${mongoose.Types.ObjectId.isValid(result)}`);

					if (Array.isArray(result) && !groups) {
						groups = result;
					}
					else if (mongoose.Types.ObjectId.isValid(result)) {
						forms.push(result);
					}
				}

				workflow.forms = forms;
				workflow.groups = groups;
				return workflow.save();
			})
			.then((doc: Workflow.IDocument) => {
				if (doc) {
					resolve(true);
				}
				else {
					reject(`Workflow didn't save correctly...`);
				}
			})
			.catch((reason) => {
				// console.log(reason);
				reject(reason);
			});
		});
		// parseString(xml, (err, result) => {
		// 	console.log(util.inspect(result.jown.workflow, false, null));
		// });
	}

	private static _parseForm(entityNode: parser.Node, workflowId: mongoose.Types.ObjectId) {
		let name: string = entityNode.attributes["name"];
		let alias: string = entityNode.attributes["alias"];
		let fileName: string = entityNode.attributes["fileName"];

		let entities: IEntity[] = [];

		for (let child of entityNode.children) {
			if (child.name === "entity") {
				let entity: IEntity = this._parseEntity(entityNode);
				if (entity) {
					entities.push(entity);
				}
			}
			else {
				console.log(`non-entity tag detected directly inside form: ${entityNode.attributes["name"]} @ ${child.name}`);
			}
		}
		let form = <Form.IForm> {
			alias,
			name,
			fileName,
			entities,
			workflowId,
		};

		return this._registerForm(form);
	}

	private static _parseEntity(entityNode: parser.Node): IEntity {
		let entity: IEntity = {key : null, type: null};

		for (let i = 0; i < entityNode.children.length && (!entity.key || !entity.type); i++) {
			let child: parser.Node = entityNode.children[i];
			switch (child.name) {
				case "key":
					entity.key = child.content;
					break;
				case "type":
					entity.type = child.content;
					break;
				default:
			}
		}
		if (entity.key && entity.type) {
			return entity;
		}
		return null;
	}

	private static _checkIfValidEntity(node: parser.Node): boolean {
		let key: boolean = false;
		let type: boolean = false;
		for (let child of node.children) {
			switch (child.name) {
				case "key":
					key = true;
					break;
				case "type":
					type = true;
					break;
				default:
			}
			if (key && type) {
				// return true as soon as both are confirmed
				return true;
			}
		}
		return false;
	}

	private static _parseEvent(eventNode: parser.Node, workflowId: mongoose.Types.ObjectId): Bluebird<null> {
		let name: string = eventNode.attributes["id"];
		let transitions: Array<{condition: string, dest: string}> = [];

		let event = <Event.IEvent> {
			// condition: null,
			name,
			transitions,
			workflowId,
		};

		for (let child of eventNode.children) {
			switch (child.name) {
				case "condition":
					if (!event[child.name]) {
						event[child.name] = child.content;
					}
					break;
				case "transitions":
					for (let transition of child.children) {
						if (transition.name === "transition") {
							transitions.push(this._constructTransition(transition));
						}
					}
					break;
				case "transition":
					transitions.push(this._constructTransition(child));
					break;
				default:
			}
		}

		// atempts to save/register to database
		return this._registerEvent(event);
	}

	private static _parseState(stateNode: parser.Node, workflowId: mongoose.Types.ObjectId): Bluebird<null> {
		let name: string = stateNode.attributes["id"];
		let transitions: Array<{condition: string, dest: string}> = [];

		let state = <State.IState> {
			condition: "true",
			name,
			transitions,
			workflowId,
		};

		for (let child of stateNode.children) {
			switch (child.name) {
				case "action":
				case "condition":
					if (!state[child.name]) {
						state[child.name] = child.content;
					}
					break;
				case "transitions":
					for (let transition of child.children) {
						if (transition.name === "transition") {
							transitions.push(this._constructTransition(transition));
						}
					}
				case "transition":
					transitions.push(this._constructTransition(child));
					break;
				default:
			}
		}

		// atempts to save/register to database
		return this._registerState(state);
	}

	private static _parseGroups(groupsNode: parser.Node): Bluebird<string[]> {
		return new Bluebird<string[]>((resolve, reject) => {
			let groups: string[] = [];
			for (let child of groupsNode.children) {
				if (child.name === "group") {
					groups.push(child.content);
				}
			}
			resolve(groups);
		});
	}

	private static _constructTransition(node: parser.Node): { condition: string, dest: string} {
		// console.log(`${JSON.stringify(node.children)}`);
		let transition: { condition: string, dest: string} = { condition: null, dest: null};
		for (let i = 0; i < node.children.length && (!transition.condition  || !transition.dest); i++) {
			let child: parser.Node = node.children[i];
			switch (child.name) {
				case "condition":
				case "dest":
					if (!transition[child.name]) {
						transition[child.name] = child.content;
					}
					break;
				default:
			}
		}
		return transition;
	}

	private static _registerForm(form: Form.IForm): Bluebird<mongoose.Types.ObjectId> {
		return new Bluebird<mongoose.Types.ObjectId>((resolve, reject) => {
			let formDoc = new Form.model(form);
			formDoc.save()
				.then((doc: Form.IDocument) => {
					resolve(doc._id);
				})
				.catch((reason) => {
					reject(reason);
				});
		});
	}

	private static _registerEvent(event: Event.IEvent): Bluebird<null> {
		return new Bluebird<null>((resolve, reject) => {
			let eventDoc = new Event.model(event);
			eventDoc.save()
				.then(() => {
					resolve(null);
				})
				.catch((reason) => {
					reject(reason);
				});
		});
	}

	private static _registerState(state: State.IState): Bluebird<null> {
		return new Bluebird<null>((resolve, reject) => {
			let stateDoc = new State.model(state);
			stateDoc.save()
				.then(() => {
					resolve(null);
				})
				.catch((reason) => {
					console.log(`failed to save state to database`);
					reject(reason);
				});
		});
	}
}
