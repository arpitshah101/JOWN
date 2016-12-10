import { Request, Response, Router } from "express";
import * as mongoose from "mongoose";

import { UserManager } from "../modules/userManager";

let router = Router();

function createUser(req: Request, rep: Response) {
	let name = req.params("name");
	let email = req.params("email");
	let userId = req.params("userId");
	let password = req.params("password");
	let roles = req.params("roles");
	let created = req.params("created");

	let result = UserManager.prototype.createUser(name, email, userId, password, roles, created);

	result.then(function (response) {
		if (response === true) {
			console.log("User " + userId + " created successfully!");
		}
		else {
			console.log("User could not be created!");
		}
	});

}
