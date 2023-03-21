const express = require('express')

// Create express server
const app = express();

// Database Name
const mflix = 'sample_mflix';

// === ROUTES === //

var routes = require('./routes');

app.use("/", routes);

// Import my test routes into the path '/test'
app.listen(3000, () => { console.log("Listenning on port 3000 -> http://localhost:3000") })
