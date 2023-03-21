// Import du routeur Exress
var express = require('express'),
    router = express.Router();

// Importation de la class
const { mongoDbClient } = require("../../database");

// Création de l'object client Mongo
const dbClient = new mongoDbClient();

(async () => {
    // CONNCTION A LA DATABASE MFLIX
    dbClient.connect("sample_mflix");
})()

// Get last 20 users
router.get("/getUsers", async (req, res) => {
    dbClient.findTwentyLastUsers().then((users) => {
        res.json(users);
    })
})

// Get user by email
router.get("/getUserByEmail/:email", async (req, res) => {
    dbClient.findUserByEmail(req.params.email).then((user) => {
        res.json(user || { "msg": "Aucun utilisateur n'a cette adresse e-mail!" });
    })
})

// Delete user by id
router.delete("/deleteUser/:id", async (req, res) => {
    dbClient.deleteUserById(req.params.id).then((user) => {
        res.json(user.deletedCount > 0 ? { "msg": "Utilisateur supprimé!" } : { "msg": "Aucun utilisateur supprimé!" });
    })
})

// Update user by email
router.put("/updateUser", async (req, res) => {
    dbClient.updateUserByEmail(req.body.email, req.body.updatedUser).then((user) => {
        res.json(user.modifiedCount > 0 ? { "msg": "Utilisateur modifié!" } : { "msg": "Aucun utilisateur correspondant à modifier!" });
    })
})

module.exports = router;
