import * as mongoose from "mongoose";

let Schema = mongoose.Schema;

let workflowSchema = new Schema({
	created: {
		default: Date.now,
		required: true,
		type: Date,
	},
	forms: {
		default: [],
		type: [Schema.Types.ObjectId],
	},
	groups: {
		default: ["All"],
		required: true,
		type: [String],
	},
	name: {
		required: true,
		type: String,
		unique: true,
	},
}, {skipVersioning: true});

export interface IWorkflow {
	created: Date;
	forms: Object;
	groups: String[];
	name: String;
};

export interface IDocument extends mongoose.Document, IWorkflow { };

export const model = mongoose.model<IDocument>("Workflow", workflowSchema);
