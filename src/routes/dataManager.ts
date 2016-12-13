import { Request, Response, Router } from "express";
import * as mongoose from "mongoose";

import { DataManager } from "../modules/dataManager";

let router = Router();

// retrive list of form data based on instance id
function getData(req: Request, res: Response) {
    /*
      Implementation
    */
	let instanceId = req.params["instanceId"];
	let result = DataManager.getData(instanceId);
	res.json(result);
}

// retrive form based on instance id
// function getForm(req: Request, res: Response) {
    /*
      Implementation
    */
	/*let instanceID = req.params["instanceID"];
}*/

router.post ("/saveData", (req: Request, res: Response, next) => {
	console.log("Received a save data request");

	let dataObj: any = req.body.dataObj;
	let instanceId: string = req.body.instanceId;
	let formName: string = req.body.formName;

	DataManager.saveData(instanceId, formName, dataObj)
		.then( (response) => {
			if (response === true) {
				res.json({success: true, message: `Successfully saved data to ${formName} with instanceId ${instanceId}!`});
			}
			else {
				res.json({success: false, message: `Data could not be saved!`});
			}
		})
		.catch((reason) => {
			console.log(reason);
			res.json({success: false, message: `Data could not be saved!`});

		})
		.then(() => {
			next();
		});
});

export const dataRoutes = router;
