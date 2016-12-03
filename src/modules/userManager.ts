import * as Bluebird from "bluebird";

declare module "mongoose" {
    type Promise<T> = Bluebird<T>;
}

import * as mongoose from "mongoose";
import * as User from "../models/User";

export class UserManager {

    createUser(name: String, email: String, userId: String, password: String, roles: String[]): Bluebird<boolean> {
        
        let overallPromise = this.userExists(userId)
            .then((doc: User.Document) => {
                if (doc) {
                    return Bluebird.resolve(false);
                }
    
                else {
                    let newUser = new User.model({
                        userName: name,
                        userEmail: email,
                        userId: userId,
                        password: password,
                        roles: roles
                    });

                    return newUser.save()
                        .then((doc: User.Document) => true, (reason: any) => false);
                }
            });

        return overallPromise;
        
    }

    deleteUser(userId: String): Bluebird<boolean> {

        let query = User.model.findOneAndRemove(userId).exec()
            .then((doc: User.Document) => {
                return Bluebird.resolve(doc);
            });

        let overallPromise = query.then((doc: User.Document) => {
            if (doc) {
                return Bluebird.resolve(true);
            }
            else {
                return Bluebird.resolve(false);
            }
        });

        return overallPromise;

    }

    modifyUser(userId: String, email: String, password: String, roles: String[]): Bluebird<boolean> {

        let query = {
            userId: userId
        }

        let update = {
            userEmail: email,
            password: password,
            roles: roles
        }

        let overallQuery  = User.model.findOneAndUpdate(query, update, {new: true}).exec();

        let overallPromise = overallQuery
            .then((doc: User.Document) => {
                if (doc) {
                    return Bluebird.resolve(true);
                }
                else {
                    return Bluebird.resolve(false);
                }
            });

        return overallPromise;

    }

    userExists(userId: String): Bluebird<User.Document> {
        
        let query = User.model.findOne({ userId: userId }).exec();
        return query.then((doc: User.Document) => {
            return Bluebird.resolve(doc);
        });

    }

    getNextTenUsers(): [User.User] {
        /*
        implementation
        */
        return null;
    }
}