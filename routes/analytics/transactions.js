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

// ======== TRANSACTION BY DAY ======== //
// Create collection with transaction by day
router.post("/createTransactionsByDay", async (req, res) => {
    dbClient.createTransactionsByDay().then((transaction) => {
        res.json(transaction);
    })
})

// Get collection with transaction by day
router.get("/getTransactionsByDay", async (req, res) => {
    dbClient.getTransactionsByDay().then((transaction) => {
        res.json(transaction);
    })
})

// ======== RANKED TRANSACTION ======== //
// Create collection with ranked transactions
router.post("/createRankedTransaction", async (req, res) => {
    dbClient.createRankedTransaction().then((transaction) => {
        res.json(transaction);
    })
})

// Get collection with transaction by day
router.get("/getRankedTransaction", async (req, res) => {
    dbClient.getRankedTransaction().then((transaction) => {
        res.json(transaction);
    })
})
module.exports = router;
