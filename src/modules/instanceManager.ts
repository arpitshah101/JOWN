import * as Bluebird from "bluebird";
import * as mongoose from "mongoose";

import * as Event from "../models/Event";
import * as Form from "../models/Form";
import * as FormData from "../models/FormData";
import * as Instance from "../models/Instance";
import * as State from "../models/State";
import * as User from "../models/User";
import * as Workflow from "../models/Workflow";

import { ConditionParser } from "../modules/conditionParser";
import { TaskRunner } from "../modules/taskRunner";

export class InstanceManager {

	/**
	 * Creates a new workflow instance and processes any events that have the "START" condition
	 * 
	 * @static
	 * @param {mongoose.Types.ObjectId} workflowId - _id of the workflow blueprint that needs to be instantiated
	 * @param {string} userId - valid userId to indicate the creating user account
	 * 
	 * @memberOf InstanceManager
	 */
	public static createNewInstance(workflowId: mongoose.Types.ObjectId, creator: mongoose.Types.ObjectId, role: string) {
		return new Bluebird<boolean>((resolve, reject) => {
			let newInstance = new Instance.model({
				creator,
				events: [],
				members: [{user: creator, role}],
				workflowId,
			});
			newInstance.save()
				.then((instance: Instance.IDocument) => {
					// find all events for the workflow
					newInstance = instance;
					return Event.model.find({ workflowId }).exec();
				})
				.then((events: Event.IDocument[]) => {
					// create new event listeners for this instance
					let origEvents = events;
					let eventList: mongoose.Types.ObjectId[] = [];
					for (let event of origEvents) {
						eventList.push(event._id);
					}
					newInstance.events = eventList;
					return newInstance.save();
					// return Bluebird.all(events.map((event: Event.IDocument) => event.save()));
				})
				.then((instance: Instance.IDocument) => {
					// create form data instances
					return Workflow.model.findOne({ _id: workflowId }).exec();
				})
				.then((workflow: Workflow.IDocument) => {
					return Form.model.find({ _id: { $in: workflow.forms } }).exec();
				})
				.then((forms: Form.IDocument[]) => {
					return this.createFormDataInstances(forms, newInstance._id);
				})
				.then((formDatas: FormData.IDocument[]) => {
					// get all events
					return Bluebird.all(
						Bluebird.map(newInstance.events, (eventId: mongoose.Types.ObjectId) => Event.model.findById(eventId)));
				})
				.then((events: Event.IDocument[]) => {
					for (let event of events) {
						if (event.condition === "START") {
							this.processTransitions(event.transitions, newInstance._id);
						}
					}
					resolve(true);
				})
				.catch((reason) => {
					console.error(reason);
					newInstance.remove();
				});
		});
	}

	public static deleteInstance(instanceId: mongoose.Types.ObjectId) {
		return new Bluebird<boolean>((resolve, reject) => {
			Instance.model.findOneAndRemove({instanceId}).exec()
				.then((doc: Instance.IDocument) => {
					if (doc) {
						resolve(true);
					}
					else {
						resolve(false);
					}
				})
				.catch((reason: any) => {
					console.error(reason);
					reject(reason);
				});
		});
	}

	/**
	 * Changes the status of the workflow instance corresponding to the instanceId provided.
	 * If status is not "active" or "archived" then defaults to "active".
	 * 
	 * @static
	 * @param {mongoose.Types.ObjectId} instanceId - _id for the target workflow instance
	 * @param {string} status - either "active" or "archived"
	 * @returns {Bluebird<boolean>} - success flag if the operation is successful - else promise is rejected
	 * 
	 * @memberOf InstanceManager
	 */
	public static changeStatus(instanceId: mongoose.Types.ObjectId, status: string = "active"): Bluebird<boolean> {
		return new Bluebird<boolean>((resolve, reject) => {
			status = status.toLowerCase();
			if (status !== "archived" && status !== "active") {
				status = "active";
			}

			Instance.model.findOne({ _id: instanceId }).exec()
				.then((instance: Instance.IDocument) => {
					if (instance) {
						instance.status = status;
						resolve(true);
					}
					else {
						reject("No workflow instance found with the provided instanceId.");
					}
				});
		});
	}

	/**
	 * Wrapper function to retrieve any workflow instance given an instanceId.
	 * 
	 * @static
	 * @param {any} queryObj - query object for mongoose/MongoDB query
	 * @returns {Bluebird<Instance.IDocument>} - either Instance document or undefined when none found. 
	 * 
	 * @memberOf InstanceManager
	 */
	public static getInstance(queryObj): Bluebird<Instance.IDocument> {
		return Instance.model.findOne(queryObj).exec();
	}

	/**
	 * Wrapper function to retrieve the workflow corresponding to the given instance.
	 * 
	 * @static
	 * @param {mongoose.Types.ObjectId} instanceId - _id for the target workflow instance
	 * @returns {Bluebird<Workflow.IDocument>} - either Workflow document or undefined when none found.
	 * 
	 * @memberOf InstanceManager
	 */
	public static getWorkflow(instanceId: mongoose.Types.ObjectId): Bluebird<Workflow.IDocument> {
		return new Bluebird<Workflow.IDocument>((resolve, reject) => {
			Instance.model.findOne({ _id: instanceId }).exec()
				.then((instance: Instance.IDocument) => {
					if (!instance) {
						reject("No workflow instance found with the provided instanceId.");
					}
					else {
						resolve(Workflow.model.findOne({ _id: instance.workflowId }).exec());
					}
				});
		});
	}

	/**
	 * Function to retrieve the available workflows for a role
	 */
	public static getWorkflows(role: string): Bluebird<Workflow.IDocument[]> {
		console.log("getWorkflows @@@@ :" + role);
		return new Bluebird<Workflow.IDocument[]>((resolve, reject) => {
			console.log("getWorkflows @@ :" + role);
			Workflow.model.find({groups: role}).exec()
			.then((workflow: Workflow.IDocument[]) => {
				if(!workflow) {
					reject("No workflows found for the provided role.");
				}
				else {
					resolve(workflow);
				}
			});
		});

	}

	public static deleteWorkflow(name: string) {
		return new Bluebird<boolean>((resolve, reject) => {
			Workflow.model.findOneAndRemove({name}).exec()
				.then((doc: Workflow.IDocument) => {
					if (doc) {
						resolve(true);
					}
					else {
						resolve(false);
					}
				})
				.catch((reason: any) => {
					console.error(reason);
					reject(reason);
				});
		});
	}

	public static addInstanceMember(instance: Instance.IDocument, userDoc: User.IDocument,
		role: string): Bluebird<Instance.IDocument> {
		console.log(`Adding the user ${userDoc.userId} as a member of an instance`);
		// verify that the user is a member of the instance. if not, add the user
		let alreadyAdded = instance.members.some((member: Instance.IMember) => {
			if (member.user.equals(userDoc._id)) {
				// check if role also included
				return userDoc.roles.some((r: string) => r === member.role);
			}
			return false;
		});

		console.log(`\t${instance.members}`);

		if (!alreadyAdded) {
			instance.members.push(<Instance.IMember> {
				user: userDoc._id,
				role,
			});
			console.log(`\tAdded user to instance`);
			console.log(`\t${instance.members}`);
			return instance.save();
		}
		console.log(`\tThe user was already added with the given role & userId`);
		return Bluebird.resolve(instance);
	}

	/**
	 * Wrapper function to get a State document based on ObjectId
	 * 
	 * @static
	 * @param {mongoose.Types.ObjectId} stateId
	 * @returns {Bluebird<State.IDocument>}
	 * 
	 * @memberOf InstanceManager
	 */
	public static getState(stateId: mongoose.Types.ObjectId): Bluebird<State.IDocument> {
		return State.model.findById(stateId).exec();
	}

	public static getActiveInstances(): Bluebird<Instance.IDocument[]> {
		return Instance.model.find({status: "active"}).exec();
	}

	public static processEvents(instanceId: mongoose.Types.ObjectId): void {
		this.getInstance({_id: instanceId})
			.then((instance: Instance.IDocument) => {
				return Bluebird.all(
					instance.events.map(
						(eventId: mongoose.Types.ObjectId) => Event.model.findById(eventId),
					));
			})
			.then((events: Event.IDocument[]) => {
				if (!events) {
					console.log(`No events to parse at the moment...`);
					return;
				}
				console.log(`Found the following events:\n\t${JSON.stringify(events)}`);
				Bluebird.each(events, (event: Event.IDocument) => {
					if (event.condition !== "START") {
						console.log(`Parsing the event: ${event}`);
						ConditionParser.prototype.parseAndEvaluate(event.condition, instanceId)
							.then((value: boolean) => {
								if (value) {
									this.processTransitions(event.transitions, instanceId);
								}
							});
					}
				});
			});
	}

	public static getActiveStates(instanceId: mongoose.Types.ObjectId): Bluebird<State.IDocument[]> {
		return new Bluebird<State.IDocument[]>((resolve, reject) => {
			Instance.model.findById(instanceId)
				.then((instance: Instance.IDocument) => {
					return Bluebird.map(instance.activeStates, (stateId: mongoose.Types.ObjectId) => State.model.findById(stateId));
				})
				.then((states: State.IDocument[]) => {
					if (states) {
						resolve(states);
					}
					else {
						resolve([]);
					}
				});
		});
	}

	public static processActiveState(state: State.IDocument, instanceId: mongoose.Types.ObjectId) {
		/**
		 * if state.condition is true:
		 * 		process action
		 * 		remove self state from instance's active states
		 * 		process transitions
		 */
		console.log(`Processing the active state: ${JSON.stringify(state)}`);
		ConditionParser.prototype.parseAndEvaluate(state.condition, instanceId)
			.then((value: boolean) => {
				console.log(`Active state ${state.name} condition ${state.condition} was evaluated to ${value}`);
				if (value) {
					// process action
					TaskRunner.run(state.action, instanceId);
					this.deactivateState(state._id, instanceId);
					this.processTransitions(state.transitions, instanceId);
				}
			});
	}

	private static deactivateState(stateId: mongoose.Types.ObjectId, instanceId: mongoose.Types.ObjectId) {
		Instance.model.findOne(instanceId).exec()
			.then((instance: Instance.IDocument) => {
				console.log(`Deactivating state: ${stateId}`);
				let index = instance.activeStates.indexOf(stateId);
				if (index > -1) {
					instance.activeStates.splice(index, 1);
					console.log(`Instance after removing a state: ${JSON.stringify(instance)}`);
					instance.save()
						.catch((reason) => {
							//
						});
				}
			});
	}

	/**
	 * Creates the form data instances corresponding to all forms in a workflow blueprint.
	 * Returns a list of all the FormData documents created.
	 * 
	 * @private
	 * @static
	 * @param {Form.IDocument[]} forms - all the form blueprints which need to be instantiated
	 * @param {mongoose.Types.ObjectId} instanceId - _id for the target workflow instance
	 * @returns - a promise resolving to a list of FormData documents that are successfully created 
	 * 
	 * @memberOf InstanceManager
	 */
	private static createFormDataInstances(forms: Form.IDocument[],
		instanceId: mongoose.Types.ObjectId): Bluebird<FormData.IDocument[]> {

		let formDataSaves: Array<Bluebird<FormData.IDocument>> = [];
		for (let form of forms) {
			let formData = new FormData.model({
				alias: form.alias,
				data: {},
				instanceId,
				name: form.name,
				status: "incomplete",
			});
			formDataSaves.push(formData.save());
		}
		return Bluebird.all(formDataSaves);
	}

	private static processTransitions(transitions: Event.ITransition[], instanceId: mongoose.Types.ObjectId): void {
		let instanceDoc: Instance.IDocument;
		this.getInstance({ _id: instanceId })
			.then((instance: Instance.IDocument): Bluebird<State.IDocument[]> => {
				instanceDoc = instance;
				return Bluebird.map(transitions, (transition: Event.ITransition) => {
					return new Bluebird<State.IDocument>((resolve, reject) => {
						ConditionParser.prototype.parseAndEvaluate(transition.condition, instanceId)
							.then((value: boolean) => {
								if (value) {
									console.log(`transition ${JSON.stringify(transition)} evaluated to ${value}\n`);
									State.model.findOne({ name: transition.dest, workflowId: instance.workflowId }).exec()
										.then((state: State.IDocument) => {
											resolve(state);
										});
								}
								else {
									resolve(undefined);
								}
							});
					});
				});
			})
			.then((states: State.IDocument[]) => {
				console.log(`Adding the following states to the active list:\n${JSON.stringify(states)}\n`);
				for (let state of states) {
					if (state && instanceDoc.activeStates.indexOf(state._id) < 0) {
						console.log(`Actually adding state ${state}`);
						instanceDoc.activeStates.push(state._id);
					}
				}
			})
			.then(() => {
				instanceDoc.save();
			});
	}
}
