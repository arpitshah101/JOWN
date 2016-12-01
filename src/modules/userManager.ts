import * as Bluebird from "bluebird";

declare module "mongoose" {
    type Promise<T> = Bluebird<T>;
}

import * as mongoose from "mongoose";
import * as User from "../models/User";

let user = User.model;

export class UserManager {

    createUser(name: String, email: String, userId: String, password: String, roles: String[]): any {//void {
        let flag = UserManager.prototype.userExists(userId, password, roles);//.then(function (response, reject) {

        flag.then((doc: boolean) => {
            if (doc) {
                return true;
            }
            else {
                return false;
            }
        });
        
    }
        /*(function (response) {
            if (response === true) {
                console.log("The user already exists.");
            }
            else {

                let u = new user(<User.User>{
                    userName: name,
                    userEmail: email,
                    userId: userId,
                    password: password,
                    roles: roles
                });

                u.save();
                

                /*u.save(function (err) {
                    if (err)
                        console.log("Failed to save new user.");
                    else
                        console.log("Successfully saved new user.");
                });*/
            //}
        //})

            /*if (assert.deepequal(response, true)) {
                ;
            }
            else {
                ;
            }
        });*/

        /*if (flag === true) {
            u.save(function (err) {
                if (err)
                    console.log("failed to save");
            });
        } else {
            console.log("User already existed");
        }*/
    //}

    deleteUser(userId: String): void {
        user.findOneAndRemove({ userId: userId }, function (err) {
            if (err) {
                console.error(err);
            }
            else {
                console.log("User Deleted!");
            }
        });
    }

    modifyUser(originalId: String, name: String, email: String, userId: String, password: String, role: String): void {
        let query = { "userId": originalId };
        let update = {
            userName: { userName: name },
            userEmail: { userEmail: email },
            userId: { userId: userId },
            password: { password: password },
            role: { role: role }
        };

        user.findOneAndUpdate(query, update, { new: true }, function (err, u) {
            if (err) {
                console.error(err);
            }
        });
    }

    userExists(userId: String, password: String, roles: String[]): Bluebird<boolean> {//boolean {
        let query = user.findOne({ userId: userId, password: password, role: roles }).exec();//, function (err, user) {
        query.then((doc: User.Document) => {
            return Bluebird.resolve(doc);
        })

        let overallPromise = query.then((doc: User.Document) => {
            if (doc) {
                return doc.save()
                    .then((doc: User.Document) => true, (reason: any) => false);
            }
            else {

                let doesNotExist = new user();

                return doesNotExist.save()
                    .then((doc: User.Document) => true, (reason: any) => false);
            }
        });

        return overallPromise;
            /*if (err) {
                console.error(err);
                return false;
            }
            if (user) {
                console.log("User exists");
                return true;
            }
        });
        return false;*/
    }

    getNextTenUsers(): [User.User] {
        /*
        implementation
        */
        return null;
    }
}