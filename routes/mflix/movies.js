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

// Get last 10 movies
router.get("/getMovies", async (req, res) => {
    dbClient.findTenLastMovies().then((movies) => {
        res.json(movies);
    })
})

// Add movie to DB
router.post("/addMovie", async (req, res) => {
    const movieObject = req.body;
    movieObject.released = new Date();
    dbClient.saveNewMovie(movieObject).then((movies_inserted) => {
        res.json(movies_inserted);
    })
})

// Get movie by name
router.get("/getMovieByName/:name", async (req, res) => {
    dbClient.findMovieByName(req.params.name).then((movie) => {
        res.json(movie || { "msg": "Aucun film ne porte se nom!" });
    })
})

// Delete movie by name
router.delete("/deleteMovie/:name", async (req, res) => {
    dbClient.deleteMovieByName(req.params.name).then((movie) => {
        res.json(movie.deletedCount > 0 ? { "msg": "Film supprimé!" } : { "msg": "Aucun film supprimé!" });
    })
})

// Update movie by name
router.put("/updateMovie", async (req, res) => {
    dbClient.updateMovieByName(req.body.title, req.body.updatedMovie).then((movie) => {
        res.json(movie.modifiedCount > 0 ? { "msg": "Film modifié!" } : { "msg": "Aucun film correspondant à modifier!" });
    })
})

// Get ranked movies
router.get("/getRankedMovies", async (req, res) => {
    dbClient.getRankedMovies().then((rankedMovies) => {
        res.json(rankedMovies);
    })
})

// Get ranked movies by comments number
router.get("/getRankedMoviesByCommentsNumber", async (req, res) => {
    dbClient.getRankedMoviesByCommentsNumber().then((rankedMovies) => {
        res.json(rankedMovies);
    })
})

module.exports = router;
