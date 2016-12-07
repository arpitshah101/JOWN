import * as mongoose from "mongoose";

let Schema = mongoose.Schema;

let dataSchema = new Schema({
	data: {
		default: {},
		required: true,
		type: {},
	},
	formName: {
		default: null,
		type: String,
	},
	instanceId: {
		required: true,
		type: String,
	},
}, { skipVersioning: true });

export interface IData {
	data: any;
	formName: string;
	instanceId: string;
}

export interface IDocument extends mongoose.Document, IData { }

export let model = mongoose.model<IDocument>("Data", dataSchema);
