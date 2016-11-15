import * as express from 'express';
var bodyParser = require('body-parser');
import * as User from './models/User';

var app = express();

app.use(bodyParser());
app.use(express.static('/public'));
app.use('bower_components', express.static('/bower_components'));

app.get('/', (req: express.Request, res: express.Response) => {
    res.send("Hello World");
});

app.listen(3000, function() {
    console.log("Application running on port 3000");
});