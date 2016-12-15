import * as mongoose from "mongoose";

let Schema = mongoose.Schema;

let formDataSchema = new Schema({
	alias: Schema.Types.String,
	assignedTo: Schema.Types.ObjectId,
	data: {
		default: {},
		type: Schema.Types.Mixed,
	},
	instanceId: {
		required: true,
		type: Schema.Types.ObjectId,
	},
	lastEdit: Schema.Types.Date,
	name: Schema.Types.String,
	status: {
		default: "incomplete",
		type: Schema.Types.String,
	},
}, { skipVersioning : true });

export interface IFormData {
	alias: string;
	assignedTo: mongoose.Types.ObjectId;
	data: { [key: string]: any };
	instanceId: mongoose.Types.ObjectId;
	lastEdited: Date;
	name: string;
	status: string;
}

export enum FormStatus {
	INCOMPLETE,
	COMPLETE,
}

export interface IDocument extends mongoose.Document, IFormData { };

export const model = mongoose.model<IDocument>("FormData", formDataSchema);
