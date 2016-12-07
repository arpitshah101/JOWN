import * as mongoose from "mongoose";

let Schema = mongoose.Schema;

let stateSchema = new Schema({
	completedAt: {
		type: Date,
	},
	condition: {
		default: "true",
		required: true,
		type: String,
	},
	nextStates: {
		default: [],
		required: true,
		type: [Schema.Types.ObjectId],
	},
	stateId: {
		required: true,
		type: String,
		unique: true,
	},
	stateStatus: {
		// incomplete, active, completed
		// present = active? future = _? past = completed?
		default: "incomplete",
		required: true,
		type: String,
	},
	task: {
		default: "do nothing",
		required: true,
		type: String,
	},
}, { skipVersioning: false });

export interface IState {
	completedAt: Date;
	condition: String;
	nextStates: IState[];
	stateId: String;
	stateStatus: String;
	task: String;
};

export interface IDocument extends mongoose.Document, IState { };

export let model = mongoose.model<IDocument>("State", stateSchema);
