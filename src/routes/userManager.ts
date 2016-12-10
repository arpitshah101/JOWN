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

function deleteUser(req: Request, rep: Response) {
	let userId = req.params("userId");

	let result = UserManager.prototype.deleteUser(userId);

	result.then(function (response) {
		if (response === true) {
			console.log("User " + userId + " deleted successfully!");
		}
		else {
			console.log("User could not be deleted!");
		}
	});

}

function getNextTenUsers(req: Request, rep: Response) {
	let created = req.params("created");

	let result = UserManager.prototype.getNextTenUsers(created);

	result.then(function (response) {
		if (response !== null) {
			console.log("Successfully got the next 1-10 users!");
		}
		else {
			console.log("Could not get the next 1-10 users!");
		}
	});

}

function getUserCount(req: Request, rep: Response) {

	let result = UserManager.prototype.getUserCount();

	result.then(function (response) {
		if (response > 0) {
			console.log("There are 1 or more users!");
		}
		else {
			console.log("There are no users!");
		}
	});

}

function modifyUser(req: Request, rep: Response) {
	let email = req.params("email");
	let userId = req.params("userId");
	let password = req.params("password");
	let roles = req.params("roles");

	let result = UserManager.prototype.modifyUser(userId, email, password, roles);

	result.then(function (response) {
		if (response === true) {
			console.log("User " + userId + " successfully modified!");
		}
		else {
			console.log("User could not be modified!");
		}
	});

}

function userExists(req: Request, rep: Response) {
	let userId = req.params("userId");

	let result = UserManager.prototype.userExists(userId);

	result.then(function (response) {
		if (response !== null) {
			console.log("User " + userId + " exists!");
		}
		else {
			console.log("User does not exist!");
		}
	});

}
