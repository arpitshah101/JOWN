import * as mongoose from 'mongoose';

let Schema = mongoose.Schema;

let userSchema = new Schema({
    
    userName: {
        type: String,
        required: true
    },
    
    userEmail: {
        type: String,
        required: true,
		unique: true
    },

    userId: {
        type: String,
        required: true,
		unique: true
    },

    password: {
        type: String,
        required: true
    },

    roles: { // is this best kept track off in this way in mongodb? or function like keeping different tables in sql?
        type: [String],
        required: true
    },
	
	created: {
		type: Date,
		default: Date.now,
        required: true
	},
	
	workflowInstances: {
		type: [Number]
	}

}, {skipVersioning: false});


export interface User {
    userName: String,
    userEmail: String,
    userId: String,
    password: String,
    roles: String[],
	created: Date,
	workflowInstances: [Number]
};

export interface Document extends mongoose.Document, User { };

export var model = mongoose.model<Document>('User', userSchema);