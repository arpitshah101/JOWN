import * as mongoose from 'mongoose';

let Schema = mongoose.Schema;

let stateSchema = new Schema({

	stateId: {
		type: Number,
		required: true,
		unique: true
	},
	
    condition: {
        type: String, //Should this be an array?
    },

    stateStatus: { //Would prefer to call this "status" but gets marked as keyword to me
        type: String,
        required: true,
		default: 'future' 	//Not sure what to call states. We need for future, present and past.
							// present = active? future = _? past = completed?
    },
	
	completedAt: {
		type: Date
	},
	
    action: {
        type: String,
        required: true
    },

    nextStates: {
        type: [Schema.Types.ObjectId],
        required: true
    },
	
}, {versionKey: false});


export interface State {
	stateId: Number,
    condition: String,
    stateStatus: String,
	completedAt: Date,
    action: String,
    nextStates: State[], 
};

export interface Document extends mongoose.Document, State { };

export var model = mongoose.model<Document>('State', stateSchema);