const { ObjectId } = require('mongodb');

// VARIABLE ENV
require('dotenv').config();

var mongoClient = require("mongodb").MongoClient,
    db;


function isObject(obj) {
    return Object.keys(obj).length > 0 && obj.constructor === Object;
}

const emptyFunc = () => { }

class mongoDbClient {
    async connect(dbName, onSuccess = emptyFunc, onFailure = emptyFunc) {
        try {
            var connection = await mongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true });
            this.db = connection.db(dbName);
            // Collections mflix
            this.movieCollection = this.db.collection("movies");
            this.commentsCollection = this.db.collection("comments");
            this.usersCollection = this.db.collection("users");
            // Collections analytics
            this.transactionsCollection = this.db.collection("transactions");
            this.customersCollection = this.db.collection("customers");
            this.accountNumberCollection = this.db.collection("accountNumber");
            this.transactionByDayCollection = this.db.collection("transactionByDay");
            this.rankedTransactionCollection = this.db.collection("rankedTransaction");
            // Collection training
            this.listingAndReviewsCollection = this.db.collection("listingAndReviews");
            // Logging
            console.log("MongoClient Connection successfull.");
            onSuccess();
        }
        catch (ex) {
            console.log("Error caught,", ex);
            onFailure(ex);
        }
    }

    // ======================= //
    // ======== MFLIX ======== //
    // ======================= //
    // MOVIES
    async findTenLastMovies() {
        return await this.movieCollection.aggregate([
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "movie_id",
                    as: "comments"
                }
            }, {
                $sort: { released: -1 }
            }, {
                $limit: 10
            }, {
                $project: { "comments.movie_id": 0 }
            }
        ]).toArray();
    }

    async saveNewMovie(movie = null) {
        if (movie !== null)
            return await this.movieCollection.insertOne(movie);
        else
            return "L'object Movie est null !"
    }

    async findMovieByName(name = null) {
        if (name !== null)
            return await this.movieCollection.findOne({ "title": name });
        else
            return "L'object Movie est null !"
    }

    async deleteMovieByName(name = null) {
        if (name !== null)
            return await this.movieCollection.deleteOne({ "title": name });
        else
            return "L'object Movie est null !"
    }

    async updateMovieByName(name = null, newValues) {
        if (name !== null)
            return await this.movieCollection.updateOne({ "title": name }, { $set: { ...newValues } });
        else
            return "L'object Movie est null !"
    }

    async getRankedMovies() {
        return await this.movieCollection.aggregate([
            {
                '$match': {
                    'released': {
                        '$exists': true
                    },
                    'imdb.rating': {
                        '$type': 'number'
                    }
                }
            }, {
                '$addFields': {
                    'rankValue': {
                        '$divide': [
                            {
                                '$add': [
                                    '$imdb.rating', '$tomatoes.viewer.rating', '$awards.wins'
                                ]
                            }, {
                                '$dateDiff': {
                                    'startDate': '$released',
                                    'endDate': '$$NOW',
                                    'unit': 'year'
                                }
                            }
                        ]
                    }
                }
            }, {
                '$sort': {
                    'rankValue': -1
                }
            }, {
                $limit: 10
            }
        ]).toArray();
    }

    async getRankedMoviesByCommentsNumber() {
        return await this.movieCollection.aggregate([
            {
                '$lookup': {
                    'from': 'comments',
                    'localField': '_id',
                    'foreignField': 'movie_id',
                    'as': 'comments'
                }
            }, {
                '$addFields': {
                    'numberOfComment': {
                        '$size': '$comments'
                    }
                }
            }, {
                '$sort': {
                    'numberOfComment': -1
                }
            },
            { $project: { numberOfComment: 0, "comments.movie_id": 0 } }
        ]).toArray();
    }

    // COMMENTS
    async findTenLastComments() {
        return await this.commentsCollection.aggregate(
            [
                {
                    '$lookup': {
                        'from': 'users',
                        'localField': 'email',
                        'foreignField': 'email',
                        'as': 'user'
                    }
                }, {
                    '$lookup': {
                        'from': 'movies',
                        'localField': 'movie_id',
                        'foreignField': '_id',
                        'as': 'movie'
                    }
                }, {
                    '$unwind': {
                        'path': '$user'
                    }
                }, {
                    '$unwind': {
                        'path': '$movie'
                    }
                }, {
                    '$project': {
                        'movie_id': 0,
                        'email': 0
                    }
                },
                {
                    $sort: {
                        "date": -1
                    }
                }
            ]).limit(10).toArray();
    }

    async getCommentByText(text = null) {
        if (text === null)
            return "Le commentaire est null"
        return await this.commentsCollection.findOne({ text: { $regex: text, $options: "i" } })
    }

    async saveNewComment(comment = null) {
        if (comment === null)
            return "Le commentaire est null"
        return await this.commentsCollection.insertOne(comment);
    }

    async deleteCommentById(id = null) {
        if (id === null)
            return "L'id ne peut pas être null"
        return await this.commentsCollection.deleteOne({ _id: new ObjectId(id) })
    }

    async updateCommentByText(id = null, comment = null) {
        if (id === null || comment === null)
            return "L'id et/ou le commentaire est/sont vide(s)"
        return await this.commentsCollection.updateOne({ _id: new ObjectId(id) }, { $set: { ...comment, date: new Date() } })
    }

    // USERS
    async findTwentyLastUsers() {
        return await this.usersCollection.aggregate([
            {
                '$lookup': {
                    'from': 'comments',
                    'localField': 'email',
                    'foreignField': 'email',
                    'as': 'comments'
                }
            }, {
                '$addFields': {
                    'lastDates': {
                        '$max': '$comments.date'
                    }
                }
            }, {
                '$sort': {
                    'comments.date': -1
                }
            }, {
                $project: {
                    lastDates: 0
                }
            }
        ]).limit(20).toArray()
    }

    async findUserByEmail(email = null) {
        if (email === null)
            return "L'email est vide!"
        return await this.usersCollection.findOne({ "email": email });
    }

    async deleteUserById(id = null) {
        if (id === null)
            return "L'id est vide!"
        return await this.usersCollection.deleteOne({ _id: new ObjectId(id) })
    }

    async updateUserByEmail(email = null, user = null) {
        if (email === null || user === null)
            return "L'e-mail et/ou l'utilisateur est/sont vide(s)"
        return await this.usersCollection.updateOne({ "email": email }, { $set: { ...user } })
    }


    // ======================= //
    // ====== ANALYTICS ====== //
    // ======================= //
    // ACCOUNT
    async createAccountNumber() {
        return await this.customersCollection.aggregate([
            {
                $addFields: {
                    accountSizeArray: {
                        $size: "$accounts",
                    },
                },
            },
            {
                $group: {
                    _id: "$_id",
                    nbAccount: {
                        $sum: "$accountSizeArray",
                    },
                },
            },
            {
                $out: "accountNumber",
            },
        ]).toArray();
    }

    async getAccountNumber() {
        return await this.accountNumberCollection.find({}).toArray();
    }

    // TRANSACTION
    async createTransactionsByDay() {
        return await this.transactionsCollection.aggregate([
            {
                $unwind:
                {
                    path: "$transactions",
                },
            },
            {
                $group:
                {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$transactions.date",
                        },
                    },
                    transactions: {
                        $push: "$transactions",
                    },
                },
            },
            {
                $out: "transactionByDay"
            }
        ]).toArray();
    }

    async getTransactionsByDay() {
        return await this.transactionByDayCollection.find({}).toArray();
    }

    async createRankedTransaction() {
        return await this.customersCollection.aggregate([
            {
                '$lookup': {
                    'from': 'transactions',
                    'localField': 'accounts',
                    'foreignField': 'account_id',
                    'as': 'transactions'
                }
            }, {
                '$unwind': {
                    'path': '$transactions'
                }
            }, {
                '$group': {
                    '_id': '$_id',
                    'nbTransactions': {
                        '$sum': '$transactions.transaction_count'
                    }
                }
            }, {
                $sort: {
                    nbTransactions: -1
                }
            }, {
                $out: "rankedTransaction"
            }
        ]).toArray();
    }

    async getRankedTransaction() {
        return await this.rankedTransactionCollection.find({}).sort({ nbTransactions: -1 }).toArray();
    }

    async getRankingPricePerPiecePerLand() {
        // Récupération du nombre maximum de location dans le pays
        const maxLocation = await this.listingAndReviewsCollection.aggregate([
            {
                '$addFields': {
                    'nbPieces': {
                        '$sum': [
                            '$bedrooms', '$bathrooms', '$beds'
                        ]
                    }
                }
            }, {
                '$addFields': {
                    'diviseurPrice': {
                        '$divide': [
                            '$nbPieces', '$price'
                        ]
                    }
                }
            }, {
                '$group': {
                    '_id': '$address.country_code',
                    'prixMoyen': {
                        '$avg': '$diviseurPrice'
                    },
                    'nbLocations': {
                        '$sum': 1
                    }
                }
            }, {
                '$sort': {
                    'nbLocations': -1
                }
            }, {
                '$limit': 1
            }
        ]).toArray().then(loc => loc[0].nbLocations);

        // Récupération de la liste triée par ranking et accuracy
        return await this.listingAndReviewsCollection.aggregate([
            {
                '$addFields': {
                    'nbPieces': {
                        '$sum': [
                            '$bedrooms', '$bathrooms', '$beds'
                        ]
                    }
                }
            }, {
                '$addFields': {
                    'diviseurPrice': {
                        '$divide': [
                            '$nbPieces', '$price'
                        ]
                    }
                }
            }, {
                '$group': {
                    '_id': '$address.country_code',
                    'prixMoyen': {
                        '$avg': '$diviseurPrice'
                    },
                    'nom_pays': {
                        '$first': '$address.country'
                    },
                    'accuracy': {
                        '$max': 1222
                    },
                    'nbLocations': {
                        '$sum': 1
                    }
                }
            }, {
                '$addFields': {
                    'percentageAccuracy': {
                        '$trunc': [
                            {
                                '$multiply': [
                                    {
                                        '$divide': [
                                            '$nbLocations', 1222
                                        ]
                                    }, 100
                                ]
                            }, 2
                        ]
                    }
                }
            }, {
                '$sort': {
                    'prixMoyen': -1
                }
            }
        ]).toArray();
    }

    async getTheMostDemandedOne() {
        const maxPropertyNumber = await this.listingAndReviewsCollection.aggregate([
            {
                '$group': {
                    '_id': '$property_type',
                    'nbProperty': {
                        '$sum': 1
                    }
                }
            }, {
                '$sort': {
                    'nbProperty': -1
                }
            }, {
                '$limit': 1
            }
        ]
        ).toArray().then(number => number[0].nbProperty);

        return await this.listingAndReviewsCollection.aggregate([
            {
                '$group': {
                    '_id': '$property_type',
                    'nbProperty': {
                        '$sum': 1
                    },
                    'averageAvailabilityYear': {
                        '$avg': '$availability.availability_365'
                    }
                }
            }, {
                '$addFields': {
                    'averageAvailabilityYear': {
                        '$multiply': [
                            {
                                '$divide': [
                                    {
                                        '$avg': '$averageAvailabilityYear'
                                    }, 365
                                ]
                            }, 100
                        ]
                    }
                }
            }, {
                '$sort': {
                    'averageAvailabilityYear': 1
                }
            }
        ]).toArray();
    }

    // CLOSE DB CONNECTION
    async close() {
        return await this.db.close();
    }
}

module.exports = {
    mongoDbClient: mongoDbClient
}
