import * as bodyParser from "body-parser";
import * as express from "express";

import * as Bluebird from "bluebird";

declare module "mongoose" {
	type Promise<T> = Bluebird<T>;
}
import * as mongoose from "mongoose";
(<any> mongoose).Promise = Bluebird;
import * as routes from "./routes/";

let app = express();

mongoose.connect("mongodb://localhost:27017/jown-test");

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());
app.use(express.static("/public"));
app.use("bower_components", express.static("/bower_components"));

app.get("/", (req: express.Request, res: express.Response) => {
	res.send("Hello World");
});

app.use("/user", routes.userRoutes);

app.listen(3000, () => {
	console.log("Application running on port 3000");
});
