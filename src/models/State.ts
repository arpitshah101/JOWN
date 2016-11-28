import * as mongoose from 'mongoose';

let Schema = mongoose.Schema;

let stateSchema = new Schema({
    completedAt: {
        type: Date
    },
    condition: {
        type: String,
        required: true,
        default: "true"
    },
    nextStates: {
        type: [Schema.Types.ObjectId],
        required: true,
        default: []
    },
    stateId: {
        type: String,
        required: true,
        unique: true
    },
    stateStatus: {
        type: String,
        required: true,
        // present = active? future = _? past = completed?
        // incomplete, active, completed
        default: 'incomplete'
    },
    task: {
        type: String,
        required: true,
        default: 'do nothing'
    },
}, { versionKey: false });

export interface State {
    completedAt: Date,
    condition: String,
    nextStates: State[],
    stateId: String,
    stateStatus: String,
    task: String
};

export interface Document extends mongoose.Document, State { };

export var model = mongoose.model<Document>('State', stateSchema);