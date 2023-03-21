var express = require('express'),
    router = express.Router();
var bodyParser = require('body-parser');

const mflixRoutes = require("./mflix");
const analyticsRoutes = require("./analytics");
const trainingRoutes = require("./training");

// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
router.use(bodyParser.json())

router.use("/mflix", mflixRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/training", trainingRoutes);

module.exports = router;