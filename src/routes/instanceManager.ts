import { Request, Response, Router } from "express";
import * as mongoose from "mongoose";

import * as Instance from "../models/Instance";
import * as User from "../models/User";
import { UserManager } from "../modules/userManager";

let router = Router();

router.get("/getInstances", (req: Request, res: Response, next) => {
	let userObj = {userId: req.params.userId, role: req.params.role};

	let missingFields = verifyFields(["userId", "role"], userObj);
	if (missingFields.length > 0) {
		res.json({
			message: `Missing the following fields: ${missingFields}`,
			success: false,
		});
		next();
		return;
	}

	User.model.findOne({userId: userObj.userId}).exec()
		.then((userDoc: User.IDocument) => {
			return Instance.model.find().elemMatch("members", {user: userDoc._id, role: userObj.role}).exec();
		})
		.then((instances: Instance.IDocument[]) => {
			res.json(instances);
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

export let instanceRoutes = router;
