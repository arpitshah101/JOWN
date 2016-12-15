import { Request, Response, Router } from "express";
import * as mongoose from "mongoose";

import * as FormData from "../models/FormData";
import * as Instance from "../models/Instance";
import { DataManager } from "../modules/dataManager";

let router = Router();

router.post("/getFormData", (req: Request, res: Response, next: Function) => {
	let instanceId: mongoose.Types.ObjectId = mongoose.Types.ObjectId(req.params("instanceId"));
	let formAlias: string = req.params.formAlias;

	if (!req.params.instanceId || !req.params.formAlias) {
		res.json({
			message: "Insufficient information provided.",
			success: false,
		});
		next();
		return;
	}

	DataManager.getFormData(instanceId, formAlias)
		.then((formDataDoc: FormData.IDocument) => {
			res.json(formDataDoc);
		})
		.catch((reason) => {
			res.json({
				errStack: reason,
				message: "Failed to find any form data corresponding to the provided information.",
				success: false,
			});
		})
		.then(() => {
			next();
		});
});

router.post("/saveFormData", (req: Request, res: Response, next: Function) => {
	let instanceId: mongoose.Types.ObjectId = mongoose.Types.ObjectId(req.body.instanceId);
	let formAlias: string = req.body.formAlias;
	let data: any = req.body.data;

	let missingFields: string[] = verifyFields(["instanceId", "formAlias", "data"], {instanceId, formAlias, data});
	if (missingFields.length > 0) {
		res.json({
			message: `Insufficient information provided. Missing the following information: ${missingFields}`,
			success: false,
		});
		next();
		return;
	}

	DataManager.saveFormData(instanceId, formAlias, data)
		.then((success: boolean) => {
			res.json({
				message: "Successfully saved the form data.",
				success: true,
			});
		})
		.catch((reason) => {
			res.json({
				errStack: reason,
				message: "Failed to save the form data corresponding to the provided information.",
				success: false,
			});
		})
		.then(() => {
			next();
		});
});

router.get("/getInstanceData", (req: Request, res: Response, next: Function) => {
	let instanceIdStr: string = req.params.instanceId;
	if (!instanceIdStr) {
		res.json({
			message: "Insufficient information provided.",
			success: false,
		});
		next();
		return;
	}

	let instanceId: mongoose.Types.ObjectId = mongoose.Types.ObjectId(req.params.instanceId);

	DataManager.getInstanceData(instanceId)
		.then((instanceDoc: Instance.IDocument) => {
			res.json(instanceDoc);
		})
		.catch((reason) => {
			res.json({
				errStack: reason,
				message: "Failed to find any workflow instance corresponding to the provided instanceId.",
				success: false,
			});
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

export const dataRoutes = router;
