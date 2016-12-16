import * as path from "path";

import * as bodyParser from "body-parser";
import * as express from "express";

import * as Bluebird from "bluebird";

import * as mongoose from "mongoose";
declare module "mongoose" {
	type Promise<T> = Bluebird<T>;
}
(<any> mongoose).Promise = Bluebird;

import * as routes from "./routes/";

import { ConditionParser, InstanceManager } from "./modules";

import * as Instance from "./models/Instance";
import * as State from "./models/State";

let app = express();

mongoose.connect("mongodb://localhost:27017/jown-test");

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.use("/bower_components", express.static(__dirname.substr(0, __dirname.lastIndexOf("/")) + "/bower_components"));
app.use("/node_modules", express.static(__dirname.substr(0, __dirname.lastIndexOf("/")) + "/node_modules"));

app.use("/users", routes.userRoutes);
app.use("/instances", routes.instanceRoutes);
app.use("/data", routes.dataRoutes);

function checkActiveInstances() {
	/**
	 * for each instance that is active:
	 * 		process events
	 * 		process states as s:
	 * 			if s.condition == true:
	 * 				execute action
	 * 				processTransitions(s.transitions)
	 */

	InstanceManager.getActiveInstances()
		.each((instance: Instance.IDocument) => {
			InstanceManager.processEvents(instance._id);
			InstanceManager.getActiveStates(instance._id)
				.then((states: State.IDocument[]) => {
					for (let state of states) {
						console.log("this happens");
						InstanceManager.processActiveState(state, instance._id);
					}
				});
		});
}

app.listen(3000, () => {
	setInterval(checkActiveInstances, 1500);
	console.log("Application running on port 3000");
});
