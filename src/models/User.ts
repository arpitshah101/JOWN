import * as mongoose from 'mongoose';

let Schema = mongoose.Schema;

let userSchema = new Schema({
    
    name: {
        type: String,
        required: true
    },
    
    email: {
        type: String,
        required: true
    },

    userId: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    roles: {
        type: [String],
        required: true
    }

}, {versionKey: false});

export interface User {
    name: String,
    email: String,
    userId: String,
    password: String,
    roles: String[]
}

export interface Document extends mongoose.Document, User { }

export var model = mongoose.model<Document>('User', userSchema);