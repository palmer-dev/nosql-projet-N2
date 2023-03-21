// Import du routeur Exress
var express = require('express'),
    router = express.Router();

// Importation de la class
const { mongoDbClient } = require("../../database");

// Création de l'object client Mongo
const dbClient = new mongoDbClient();

(async () => {
    // CONNCTION A LA DATABASE MFLIX
    dbClient.connect("sample_airbnb");
})()

// Get the cheapest destination comparing the number of rooms
router.get("/getRankingPricePerPiecePerLand", async (req, res) => {
    dbClient.getRankingPricePerPiecePerLand().then(land => { res.json(land) });
})

// Get the most demanded type of property, according to the availability in a year
router.get("/getTheMostDemandedTypeOfProperty", async (req, res) => {
    dbClient.getTheMostDemandedOne().then(property => { res.json(property) });
})

module.exports = router