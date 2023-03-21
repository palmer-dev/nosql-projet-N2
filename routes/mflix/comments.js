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

// Get last 10 comments
router.get("/getComments", async (req, res) => {
    dbClient.findTenLastComments().then((comments) => {
        res.json(comments);
    })
})

// Get comment by text
router.get("/getComment/:text", async (req, res) => {
    dbClient.getCommentByText(req.params.text).then((comment) => {
        res.json(comment || { "msg": "Aucun commentaire ne contient ce texte !" });
    })
})

// Add comment to DB
router.post("/addComment", async (req, res) => {
    const commentObject = req.body;
    commentObject.date = new Date();
    dbClient.saveNewComment(commentObject).then((comments_inserted) => {
        res.json(comments_inserted);
    })
})

// Delete comment by text
router.delete("/deleteComment/:id", async (req, res) => {
    dbClient.deleteCommentById(req.params.id).then((comment) => {
        res.json(comment.deletedCount > 0 ? { "msg": "Commentaire supprimé!" } : { "msg": "Aucun commentaire supprimé!" });
    })
})

// Update comment by text
router.put("/updateComment", async (req, res) => {
    dbClient.updateCommentByText(req.body.id, req.body.updatedComment).then((comment) => {
        res.json(comment.modifiedCount > 0 ? { "msg": "Commentaire modifié!" } : { "msg": "Aucun commentaire correspondant à modifier!" });
    })
})

module.exports = router;
