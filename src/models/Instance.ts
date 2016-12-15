import * as mongoose from "mongoose";

let Schema = mongoose.Schema;

let instanceSchema = new Schema({
	activeStates: {
		default: [],
		types: [Schema.Types.ObjectId],
	},
	created: {
		default: Date.now(),
		type: Date,
	},
	creator: Schema.Types.ObjectId,
	events: {
		default: [],
		types: [Schema.Types.ObjectId],
	},
	members: {
		default: [],
		types: [Schema.Types.Mixed],
	},
	status: {
		default: "active",
		type: String,
	},
	workflowId: Schema.Types.ObjectId,
}, { skipVersioning: true });

export interface IInstance {
	activeStates: mongoose.Types.ObjectId[];
	created: Date;
	creator: mongoose.Types.ObjectId;
	events: mongoose.Types.ObjectId[];
	members: IMember[];
	status: string;
	workflowId: mongoose.Types.ObjectId;
}

export interface IMember {
	user: mongoose.Types.ObjectId;
	role: string;
}

export interface IDocument extends mongoose.Document, IInstance { };

export const model = mongoose.model<IDocument>("Instance", instanceSchema);
