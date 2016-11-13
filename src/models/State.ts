import * as mongoose from 'mongoose';

let Schema = mongoose.Schema;

let stateSchema = new Schema({

    condition: {
        type: String,
        required: true
    },

    status: {
        type: String,
        required: true
    },

    action: {
        type: String,
        required: true
    },

    nextStates: {
        type: [Schema.Types.ObjectId],
        required: true
    },

    stateId: {
        type: Number,
        required: true
    }

}, {versionKey: false});

export interface State {
    condition: String,
    status: String,
    action: String,
    nextStates: State[],
    stateId: number    
}

export interface Document extends mongoose.Document, State { }

export var model = mongoose.model<Document>('State', stateSchema);