import * as mongoose from "mongoose";

let Schema = mongoose.Schema;

let stateSchema = new Schema({
	action: {
		default: "noop",
		required: true,
		type: String,
	},
	completedAt: {
		type: Date,
	},
	condition: {
		default: "true",
		required: true,
		type: String,
	},
	name: {
		required: true,
		type: String,
	},
	stateStatus: {
		default: 0,
		type: Number,
	},
	transitions: {
		default: [],
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

export interface IState {
	action: string;
	completedAt?: Date;
	condition: string;
	name: string;
	stateStatus: StateStatus;
	transitions: ITransition[];
	workflowId: mongoose.Types.ObjectId;
}

export enum StateStatus {
	INACTIVE,
	PENDING,
	COMPLETE,
}

export interface IDocument extends mongoose.Document, IState { };

export const model = mongoose.model<IDocument>("State", stateSchema);
