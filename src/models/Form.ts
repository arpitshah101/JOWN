import * as mongoose from "mongoose";
import * as User from "./User";

let Schema = mongoose.Schema;

let formSchema = new Schema({

	editor: {
		required: true,
		type: [User],
	},

	formName: {
		required: true,
		type: String,
	},

	savedAt: {
		default: Date.now, // Assuming "now" is at creation of the instance
		required: true,
		type: Date,
	},
	status: {
		required: true,
		type: String,
	},

	workflowId: {
		required: true, // Or handled by mongoDB?
		type: Number,
	},

}, { skipVersioning: false });

export interface IForm {
	formName: String;
	status: String;
	edit: User.IUser[]; // VSC tells me "cant find name User" but user is imported at top. What gives?
	savedAt: Date;
};

export interface IDocument extends mongoose.Document, IForm { };

export let model = mongoose.model<IDocument>("Form", formSchema);
