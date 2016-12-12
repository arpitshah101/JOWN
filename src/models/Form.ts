import * as mongoose from "mongoose";
let Schema = mongoose.Schema;

let formSchema = new Schema({
	alias: {
		required: true,
		type: String,
	},
	entities: {
		type: [{
			key: Schema.Types.String,
			type: Schema.Types.String,
		}],
	},
	fileName: {
		default: "404.html",
		required: true,
		type: String,
	},
	groups: {
		default: ["All"],
		required: false,
		type: [String],
	},
	name: {
		required: true,
		type: String,
	},
	workflowId: {
		required: true,
		type: Schema.Types.ObjectId,
	},

}, { skipVersioning: true });

export interface IEntity {
	key: string;
	type: string;
	label?: string;
}

export interface IForm {
	alias: string;
	entities?: IEntity[];
	fileName: string;
	groups?: string[];
	name: string;
	workflowId: mongoose.Types.ObjectId;
};

export interface IDocument extends mongoose.Document, IForm { };

export const model = mongoose.model<IDocument>("Form", formSchema);
