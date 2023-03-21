// Import du routeur Exress
var express = require('express'),
    router = express.Router();

router.use(require('./accounts'));
router.use(require('./transactions'));

module.exports = router