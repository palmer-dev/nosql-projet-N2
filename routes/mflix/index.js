// Import du routeur Exress
var express = require('express'),
    router = express.Router();

router.use(require('./movies'));
router.use(require('./comments'));
router.use(require('./users'));

module.exports = router