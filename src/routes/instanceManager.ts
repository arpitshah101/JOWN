import { Request, Response, Router } from "express";
import * as mongoose from "mongoose";

import * as Instance from "../models/Instance";
import * as User from "../models/User";
import * as Workflow from "../models/Workflow";
import { DefParser } from "../modules/defParser";
import { InstanceManager } from "../modules/instanceManager";
import { UserManager } from "../modules/userManager";

let router = Router();

router.get("/getInstances", (req: Request, res: Response, next) => {
	let userObj = {userId: req.query.userId, role: req.query.role};

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
			if (userDoc) {
				return Instance.model.find().elemMatch("members", {user: userDoc._id, role: userObj.role}).exec();
			}
			else {
				return [];
			}
		})
		.then((instances: Instance.IDocument[]) => {
			res.json(instances);
			next();
		});
});

router.get("/getWorkflows", (req: Request, res: Response, next) => {
	let userRole = req.query.role;
	console.log("userRole @ before CHECK: " + userRole);
	if (userRole === "" || typeof(userRole) !== "string") {
		return [];
	}
	console.log("userRole @ after CHECK: " + userRole);

	InstanceManager.getWorkflows(userRole)
		.then((workflows: Workflow.IDocument[]) => {
			if (workflows) {
				res.json(workflows);
			}
			else {
				res.json([]);
			}
		})
		.catch((reason) => {
			console.log(reason);
			res.json({success: false, message: "Could not get all workflows!"});
		})
		.then(() => {
			next();
		});
});

/**
 * 	Expects the data body in the following format:
 * 
 * 	{
 * 		workflowId: string,
 * 		userId: string,
 * 		role: string
 * 	}
 * 
 *  NOTE: YOU DO NOT NEED A WRAPPER OBJECT INSIDE THE DATA BODY FOR THIS POST REQUEST
 * 
 */
router.post("/createNewInstance", (req: Request, res: Response, next) => {
	let workflowName = req.body.workflowName;
	let userId = req.body.userId;
	let role = req.body.role;

	UserManager.getUser({userId})
		.then((user: User.IDocument): mongoose.Types.ObjectId => {
			if (!user) {
				res.json({
					message: `No user found with the userId: ${userId}`,
					success: false,
				});
				next();
			}
			else {
				return user._id;
			}
		})
		.then((userObjectId: mongoose.Types.ObjectId) => {
			return Workflow.model.findOne({name: workflowName}).exec()
				.then((workflow: Workflow.IDocument) => {
					return InstanceManager.createNewInstance(workflow._id, userObjectId, role);
				});
		})
		.then((success: boolean) => {
			if (success) {
				res.json({
					message: `Your new instance has been successfully created.`,
					success: true,
				});
			}
			else {
				res.json({
					message: `We could NOT create a new instance for you. Try again.`,
					success: false,
				});
			}
		})
		.catch((reason) => {
			res.json({
				message: `An error occurred. Please try again.`,
				success: false,
			});
		})
		.then(() => {
			next();
		});
});

router.post("/deleteInstance", (req: Request, res: Response, next) => {
	let instance = req.body.instance;
	let workflowId: mongoose.Types.ObjectId = instance.workflowId;

	InstanceManager.deleteInstance(workflowId)
		.then((success: boolean) => {
			if (success) {
				res.json({
					message: `Instance deleted successfully!`,
					success: true,
				});
			}
			else {
				res.json({
					message: `Unable to delete instance!`,
					success: false,
				});
			}
		})
		.catch((reason) => {
			res.json({
				message: `An error occurred. Please try again.`,
				success: false,
			});
		})
		.then(() => {
			next();
		});
});

router.post("/createNewWorkflow", (req: Request, res: Response, next) => {
	let xml: string = req.body.xml;

	console.log(xml);

	DefParser.parse(xml)
		.then((parsedSuccessfully: boolean) => {
			if (parsedSuccessfully) {
				res.json(parsedSuccessfully);
			}
			else {
				res.json(parsedSuccessfully);
			}
		})
		.catch((reason) => {
			console.log(reason);
			res.json({success: false, message: "Could not create a workflow!"});
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

export let instanceRoutes = router;
