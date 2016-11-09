import * as mongoose from 'mongoose';

// Type definition for User
interface User {
    name: String,
    email: String,
    userId: String,
    password: String,
    roles: String[],
    findByName: Function,
    [anyProp: string]: any
}

var Schema = mongoose.Schema;

// Creating schema for User to be saved into MongoDB
var userSchema = new Schema({
    name: String,
    email: String,
    userId: { type: String, index: true},
    password: String,
    roles: {type: [String], lowercase: true}
});

userSchema.set("toJSON", {virtuals: true});
userSchema.set("toObject", {virtuals: true});

var User = mongoose.model('User', userSchema);

userSchema.statics.findByName = (name: string) => User.find({ name: name });

userSchema.methods.setPassword = function(pwd: string): void {
    // Actually encrypt password and save it
    (<User>this).password = pwd;
}

module.exports = User;