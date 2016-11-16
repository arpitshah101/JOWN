import { Request, Router, Response　} from 'express';
import * as mongoose from 'mongoose';

import { DataManager } from '../modules/datamanager';

var router = Router();




//this function returns a boolean 
//variable to indicates if file/form is saved successfully.
function isSuccess() : boolean{
    let isSucc: boolean=false;
    /*
        Implementation
    */
    return isSucc;
}

//this function will be used for both saveToFile and saveFormData
function saveData(req: Request,res: Response){
    let data = (<any>req).body;
    let saveFlag:boolean=isSuccess();
    if(saveFlag==false){
        console.log("Fail to save file");
    }else{
        console.log("successfully saved file");
        }
}


//retrive list of form data based on instance id
function getData(req:Request, res:Response){
    /*
      Implementation
    */
    let instanceId = req.params['instanceId'];
    let result = DataManager.prototype.getData(instanceId);
    res.json(result);
}

//retrive form based on instance id
function getForm(req:Request, res:Response){
    /*
      Implementation
    */
    let instanceID = req.params['instanceID'];
}


router.post('/savefile',saveData);
router.post('/saveform',saveData);
router.get('/getdata/:instanceId',getData);
router.get('/getForm/:instanceId',getForm);