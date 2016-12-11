import * as mongoose from "mongoose";

let Schema = mongoose.Schema;

let instanceSchema = new Schema({
	activeStates: [Schema.Types.ObjectId],
	created: Date,
	creator: Schema.Types.ObjectId,
	events: [Schema.Types.ObjectId],
	members: [Schema.Types.ObjectId],
	status: String,
	workflowId: Schema.Types.ObjectId,
}, { skipVersioning: true });

export interface IInstance {
	activeStates: mongoose.Types.ObjectId[];
	created: Date;
	creator: mongoose.Types.ObjectId;
	events: mongoose.Types.ObjectId[];
	members: mongoose.Types.ObjectId[];
	status: string;
	workflowId: mongoose.Types.ObjectId;
}

export interface IDocument extends mongoose.Document, IInstance { };

export const model = mongoose.model<IDocument>("Form", instanceSchema);
