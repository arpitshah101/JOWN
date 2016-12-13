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

let app = express();

mongoose.connect("mongodb://localhost:27017/jown-test");

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.use("/bower_components", express.static(__dirname.substr(0, __dirname.lastIndexOf("/")) + "/bower_components"));
app.use("/node_modules", express.static(__dirname.substr(0, __dirname.lastIndexOf("/")) + "/node_modules"));

app.use("/users", routes.userRoutes);
app.use("/instances", routes.instanceRoutes);

function checkEventListeners() {
	//
}


app.listen(3000, () => {
	setInterval(checkEventListeners, 10000);
	console.log("Application running on port 3000");
});
