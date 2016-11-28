import * as mongoose from 'mongoose';
import * as User from './User';

let Schema = mongoose.Schema;

let formSchema = new Schema({

	workflowId: {
		type: Number
		required: true //Or handled by mongoDB?
	},
	
    formName: {
        type: String,
        required: true
    },

    status: {
        type: String,
        required: true
    },
	
	editor: {
		type: [User] //NEEDS TO BE IMPORTED SOMEHOW! import * as User from '/User.ts'? or userId?
		required: true
	},
	
	savedAt: {
		type: Date
		required: true
		default: Date.now //Assuming "now" is at creation of the instance

}, {versionType: false});


export interface Form {
    name: String,
    status: String,
	edit: [User],
	savedAt: Date
};

export interface Document extends mongoose.Document, Form { };

export var model = mongoose.model<Document>('Form', formSchema);