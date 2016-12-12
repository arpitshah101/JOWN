import * as mongoose from "mongoose";

let Schema = mongoose.Schema;

let userSchema = new Schema({
	created: {
		default: new Date(Date.now()),
		required: true,
		type: Date,
	},
	password: {
		required: true,
		type: String,
	},
	roles: {
		required: true,
		type: [String],
	},
	userEmail: {
		required: true,
		type: String,
		unique: true,
	},
	userId: {
		required: true,
		type: String,
		unique: true,
	},
	userName: {
		required: true,
		type: String,
	},
	workflowInstances: {
		type: [Number],
	},
}, { skipVersioning: true });

export interface IUser {
	userName: string;
	userEmail: string;
	userId: string;
	password: string;
	roles: string[];
	created: Date;
	workflowInstances: [Object];
};

export interface IDocument extends mongoose.Document, IUser { };

export let model = mongoose.model<IDocument>("User", userSchema);
