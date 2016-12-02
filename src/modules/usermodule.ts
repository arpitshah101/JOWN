import * as mongoose from "mongoose";
import * as User from "../models/User";

let user = User.model;

export class UserModule {

    createUser(name: String, email: String, userId: String, password: String, roles: String[]): void {
        let u = new user(<User.User>{
            userName: name,
            userEmail: email,
            userId: userId,
            password: password,
            roles: roles
        });

        let flag = UserModule.prototype.userExists(u.userId, u.password, u.roles);
        if (flag === true) {
            u.save(function (err) {
                if (err)
                    console.log("failed to save");
            });
        } else {
            console.log("User already existed");
        }
    }

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
            name: { name: name },
            email: { email: email },
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

    userExists(userId: String, password: String, roles: String[]): boolean {
        user.findOne({ userId: userId, password: password, role: roles }, function (err, user) {
            if (err) {
                console.error(err);
                return false;
            }
            if (user) {
                console.log("User exists");
                return true;
            }
        });
        return false;
    }

    getUserIterator(): IterableIterator<User.User> {
        /*
        implementation
        */
        return null;
    }
}