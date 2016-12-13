import * as mongoose from "mongoose";

let Schema = mongoose.Schema;

let eventSchema = new Schema({
	condition: {
		default: "true",
		required: true,
		type: String,
	},
	instanceId: {
		default: null,
		type: Schema.Types.ObjectId,
	},
	name: {
		required: true,
		type: String,
	},
	transitions: {
		default: [],
		required: true,
		type: [Schema.Types.Mixed],
	},
	workflowId: {
		required: true,
		type: Schema.Types.ObjectId,
	},
}, { skipVersioning: true });

export interface ITransition {
	condition: string;
	dest: string;
}

export interface IEvent {
	condition: string;
	instanceId: mongoose.Types.ObjectId;
	name: string;
	transitions: ITransition[];
	workflowId: mongoose.Types.ObjectId;
}

export interface IDocument extends mongoose.Document, IEvent { };

export const model = mongoose.model<IDocument>("Event", eventSchema);
