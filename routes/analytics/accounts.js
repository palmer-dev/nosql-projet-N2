// Import du routeur Exress
var express = require('express'),
    router = express.Router();

// Importation de la class
const { mongoDbClient } = require("../../database");

// Création de l'object client Mongo
const dbClient = new mongoDbClient();

(async () => {
    // CONNCTION A LA DATABASE MFLIX
    dbClient.connect("sample_analytics");
})()

// Create collection with the count of account of users
router.post("/createAccountNumber", async (req, res) => {
    dbClient.createAccountNumber().then((account) => {
        res.json(account);
    })
})

// Get collection with the count of account of users
router.get("/getAccountNumber", async (req, res) => {
    dbClient.getAccountNumber().then((account) => {
        res.json(account);
    })
})

module.exports = router;
