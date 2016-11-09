import * as express from 'express';

import * as User from './models/User';

var app = express();

app.use(express.static('/public'));
app.use('bower_components', express.static('/bower_components'));

app.get('/', (req: express.Request, res: express.Response) => {
    res.send("Hello World");
});

app.listen(3000, function() {
    console.log("Application running on port 3000");
});