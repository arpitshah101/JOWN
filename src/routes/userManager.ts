import { Request, Response, Router } from "express";
import * as mongoose from "mongoose";

import * as Group from "../models/Group";
import * as User from "../models/User";
import { UserManager } from "../modules/userManager";

let router = Router();

router.post("/createUser", (req: Request, res: Response, next) => {
	console.log("Received a create user request");

	let userObj: any = req.body.userObj;
	let name: string = userObj.name;
	let email: string = userObj.email;
	let userId: string = userObj.userId;
	let password: string = userObj.password;
	let roles: string[] = userObj.roles;
	let fields: string[] = ["name", "email", "userId", "password", "roles"];
	let missingFields: string[] = verifyFields(fields, userObj);

	UserManager.createUser(name, email, userId, password, roles)
		.then( (response) => {
			if (response === true) {
				res.json({success: true, message: `An account with the username ${userId} was created successfully!`});
			}
			else {
				res.json({success: false, message: `User could not be created!`});
			}
		})
		.catch((reason) => {
			console.log(reason);
			res.json({success: false, message: "User could not be created!"});
		})
		.then(() => {
			next();
		});
});

router.post("/verifyUser", (req: Request, res: Response, next) => {
	console.log("Received a verify user request");

	let userObj: any = req.body.userObj;
	let userId: string = userObj.userId;
	let password: string = userObj.password;
	let role: string = userObj.role;
	let fields: string[] = ["userId", "password", "role"];
	let missingFields: string[] = verifyFields(fields, userObj);

	if (missingFields.length > 0) {
		console.log(missingFields);
		res.json({success: false, message: `Insufficient/incorrect information provided. Try again.`});
		next();
		return;
	}

	UserManager.userExists(userId, password, role)
		.then((doc: User.IDocument) => {
			if (doc) {
				console.log(`User ${userId} exists!`);
				res.json({success: true});
			}
			else {
				console.log(`User ${userId} DOES NOT exist.`);
				res.json({success: false});
			}
		})
		.catch((reason) => {
			console.log(reason);
			res.json({success: false, message: "User DOES NOT exist!"});
		})
		.then(() => {
			next();
		});
});

router.get("/allRoles", (req: Request, res: Response, next) => {
	Group.model.find()
		.then((groups: Group.IDocument[]) => {
			let results: string[] = [];
			for (let group of groups) {
				results.push(group.name);
			}
			res.json(results);
		})
		.catch((reason) => {
			console.log(reason);
			res.json({success: false, message: "Could not retrieve list of roles!"});
		})
		.then(() => {
			next();
		});
});

router.post("/deleteUser", (req: Request, res: Response, next) => {
	console.log("Received a delete user request");

	let userObj: any = req.body.userObj;
	let userId = userObj.userId;
	let fields: string[] = ["userId"];
	let missingFields: string[] = verifyFields(fields, userObj);

	if (missingFields.length > 0) {
		console.log(missingFields);
		res.json({success: false, message: `Insufficient/incorrect information provided. Try again.`});
		next();
		return;
	}

	UserManager.deleteUser(userId)
		.then( (response) => {
			if (response === true) {
				res.json({success: true, message: `User ${userId} was deleted successfully!`});
			}
			else {
				res.json({success: false, message: `User ${userId} could not be deleted!`});
			}
		})
		.catch((reason) => {
			console.log(reason);
			res.json({success: false, message: "User could not be deleted!"});
		})
		.then(() => {
			next();
		});
});

function getNextTenUsers(req: Request, rep: Response, next) {
	let created = req.params("created");

	let result = UserManager.getNextTenUsers(created);

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

router.get("/getUserCount", (req: Request, res: Response, next) => {
	UserManager.getUserCount()
		.then( (response) => {
			res.json({success: true, count: response});
		})
		.catch((reason) => {
			console.log(reason);
			res.json({success: false, message: "Could not get user count!"});
		})
		.then(() => {
			next();
		});
});

router.post("/modifyUser", (req: Request, res: Response, next) => {
	console.log("Received a delete user request");

	let userObj: any = req.body.userObj;
	let userId = userObj.userId;
	let email = userObj.email;
	let password = userObj.password;
	let roles = userObj.roles;
	let fields: string[] = ["userId"];
	let missingFields: string[] = verifyFields(fields, userObj);

	if (missingFields.length > 0) {
		console.log(missingFields);
		res.json({success: false, message: `Insufficient/incorrect information provided. Try again.`});
		next();
		return;
	}

	UserManager.modifyUser(userId, email, password, roles)
		.then( (response) => {
			if (response === true) {
				res.json({success: true, message: `User ${userId} successfully modified!`});
			}
			else {
				res.json({success: false, message: `Unable to modify user ${userId}!`});
			}
		})
		.catch((reason) => {
			console.log(reason);
			res.json({success: false, message: "Unable to modify user!"});
		})
		.then(() => {
			next();
		});

});

function verifyFields(fields: string[], obj: any): string[] {
	let missingFields: string[] = [];
	for (let field of fields) {
		if (!obj[field]) {
			missingFields.push(field);
		}
	}
	return missingFields;
}

export const userRoutes = router;
