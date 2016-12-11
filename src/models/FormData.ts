import * as mongoose from "mongoose";

let Schema = mongoose.Schema;

let formDataSchema = new Schema({
	alias: String,
	assignedTo: Schema.Types.ObjectId,
	data: Schema.Types.Mixed,
	instanceId: {
		required: true,
		type: Schema.Types.ObjectId,
	},
	lastEdit: Date,
	name: String,
	status: String,
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

export interface IDocument extends mongoose.Document, IFormData { };

export const model = mongoose.model<IDocument>("FormData", formDataSchema);