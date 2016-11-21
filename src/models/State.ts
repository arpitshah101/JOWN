import * as mongoose from 'mongoose';

let Schema = mongoose.Schema;

let stateSchema = new Schema({
    condition: {
        type: String,
        required: true,
        default: "true"
    },
    status: {
        type: String,
        required: true
    },
    task: {
        type: String,
        required: true
    },
    nextStates: {
        type: [Schema.Types.ObjectId],
        required: true,
        default: []
    },
    stateId: {
        type: Number,
        required: true
    }
}, {versionKey: false});

export interface State {
    condition: String,
    status: String,
    task: String,
    nextStates: State[],
    stateId: number    
}

export interface Document extends mongoose.Document, State { }

export var model = mongoose.model<Document>('State', stateSchema);