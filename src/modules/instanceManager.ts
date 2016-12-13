import * as Bluebird from "bluebird";
import * as mongoose from "mongoose";

import * as Event from "../models/Event";
import * as Form from "../models/Form";
import * as FormData from "../models/FormData";
import * as Instance from "../models/Instance";
import * as Workflow from "../models/Workflow";

export class InstanceManager {

	/**
	 * 
	 * 
	 * @static
	 * @param {mongoose.Types.ObjectId} workflowId
	 * @param {string} userId
	 * 
	 * @memberOf InstanceManager
	 */
	public static createNewInstance(workflowId: mongoose.Types.ObjectId, creator: mongoose.Types.ObjectId) {
		return new Bluebird((resolve, reject) => {
			let newInstance = new Instance.model({
				creator,
				members: [creator],
				workflowId,
			});
			newInstance.save()
				.then((instance: Instance.IDocument) => {
					// find all events for the workflow
					newInstance = instance;
					return Event.model.find({ workflowId, instanceId: null }).exec();
				})
				.then((events: Event.IDocument[]) => {
					// create new event listeners for this instance
					let origEvents = events;
					for (let event of origEvents) {
						delete event._id;
						event.instanceId = newInstance._id;
					}
					return Bluebird.all(events.map((event: Event.IDocument) => event.save()));
				})
				.then((events: Event.IDocument[]) => {
					// create form data instances
					return Workflow.model.findOne({_id: workflowId}).exec();
				})
				.then((workflow: Workflow.IDocument) => {
					return Form.model.find({ _id : { $in : workflow.forms } }).exec();
				})
				.then((forms: Form.IDocument[]) => {
					return this.createFormDataInstances(forms, newInstance._id);
				})
				.then((formDatas: FormData.IDocument[]) => {
					// Execute any START condition listeners
				});
		});
	}

	public static changeStatus() {
		//
	}
	public static getInstance() {
		//
	}

	public static getWorkflowId() {
		//
	}

	private static createFormDataInstances(forms: Form.IDocument[], instanceId: mongoose.Types.ObjectId) {
		let formDataSaves: Array<Bluebird<FormData.IDocument>> = [];
		for (let form of forms) {
			let formData = new FormData.model({
				alias: form.alias,
				data: {},
				instanceId,
				name: form.name,
				status: FormData.FormStatus.INCOMPLETE,
			});
			formDataSaves.push(formData.save());
		}
		return Bluebird.all(formDataSaves);
	}
}
