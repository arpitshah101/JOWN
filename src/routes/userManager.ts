import { Request, Response, Router } from "express";
import * as mongoose from "mongoose";

import * as User from "../models/User";
import { UserManager } from "../modules/userManager";

let router = Router();

router.post("/createUser", (req: Request, res: Response, next) => {
	console.log("Received a create user request");
	let name: string = req.body.name;
	let email: string = req.body.email;
	let userId: string = req.body.userId;
	let password: string = req.body.password;
	let roles: string[] = req.body.roles;

	if (!(name && email && userId && password && roles) || roles.length < 1) {
		res.json({result: false, message: `Insufficient information provided. Try again.`});
		next();
		return;
	}

	UserManager.createUser(name, email, userId, password, roles)
		.then((result) => {
			if (result === true) {
				res.json({result: true, message: `An account with the username ${userId} was created successfully!`});
			}
			else {
				res.json({result: false, message: `User could not be created!`});
			}
		})
		.catch((reason) => {
			console.log(reason);
			res.json({result: false, message: "User couldn't be created"});
		})
		.then(() => {
			next();
		});
});

router.post("/verifyUser", (req: Request, res: Response, next) => {
	let userId: string = req.body.userId;
	let password: string = req.body.password;
	let role: string = req.body.role;

	if (!(userId && password && role)) {
		res.json({result: false, message: `Insufficient information provided. Try again.`});
		next();
		return;
	}

	UserManager.userExists(userId)
		.then((doc: User.IDocument) => {
			if (doc) {
				console.log(`User ${userId} exists!`);
				res.json({result: true});
			}
			else {
				console.log(`User ${userId} DOES NOT exist.`);
				res.json({result: false});
			}
		})
		.catch(next)
		.then(next);
});

function deleteUser(req: Request, rep: Response, next) {
	let userId = req.params("userId");

	let result = UserManager.prototype.deleteUser(userId);

	result.then( (response) => {
		if (response === true) {
			console.log("User " + userId + " deleted successfully!");
		}
		else {
			console.log("User could not be deleted!");
		}
	})
	.then(next);

}

function getNextTenUsers(req: Request, rep: Response, next) {
	let created = req.params("created");

	let result = UserManager.prototype.getNextTenUsers(created);

	result.then( (response) => {
		if (response !== null) {
			console.log("Successfully got the next 1-10 users!");
		}
		else {
			console.log("Could not get the next 1-10 users!");
		}
	})
	.then(next);

}

function getUserCount(req: Request, rep: Response, next) {

	let result = UserManager.prototype.getUserCount();

	result.then( (response) => {
		if (response > 0) {
			console.log("There are 1 or more users!");
		}
		else {
			console.log("There are no users!");
		}
	})
	.then(next);

}

function modifyUser(req: Request, rep: Response, next) {
	let email = req.params("email");
	let userId = req.params("userId");
	let password = req.params("password");
	let roles = req.params("roles");

	let result = UserManager.prototype.modifyUser(userId, email, password, roles);

	result.then( (response) => {
		if (response === true) {
			console.log("User " + userId + " successfully modified!");
		}
		else {
			console.log("User could not be modified!");
		}
	})
	.then(next);

}

export const userRoutes = router;
