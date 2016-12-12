import * as mongoose from "mongoose";

let Schema = mongoose.Schema;

let groupSchema = new Schema({
	members: {
		default: [],
		type: [Schema.Types.ObjectId],
	},
	name: {
		required: true,
		type: Schema.Types.String,
		unique: true,
	},
	public: {
		default: false,
		type: Schema.Types.Boolean,
	},
}, { skipVersioning: true });

export interface IGroup {
	members: mongoose.Types.ObjectId[];
	name: String;
	public: boolean;
};

export interface IDocument extends mongoose.Document, IGroup { };

export let model = mongoose.model<IDocument>("Group", groupSchema);
