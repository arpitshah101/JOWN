import * as mongoose from "mongoose";
import * as Form from "./Form";
import * as State from "./State";
import * as User from "./User";

let Schema = mongoose.Schema;

let workflowSchema = new Schema({
	created: {
		default: Date.now,
		required: true,
		type: Date,
	},

	formList: {
		required: true,
		type: [Schema.Types.ObjectId],
	},

	owner: {
		required: true,
		type: [User], // Or userIds?
	},

	stateList: {
		required: true,
		type: [Schema.Types.ObjectId],
	},

	workflowId: {
		required: true,
		type: Number,
		unique: true,
	},

	workflowName: {
		required: true,
		type: String,
	},

}, {skipVersioning: false});


export interface IWorkflow {
	workflowId: Number;
	workflowName: String;
	owner: User.IUser[];
	created: Date;
	stateList: State.IState[];
	formList: Form.IForm[];
};

export interface IDocument extends mongoose.Document, IWorkflow { };

let model = mongoose.model<IDocument>("Workflow", workflowSchema);
