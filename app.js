const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

// Dotenv Config
require('dotenv').config();

// Define the port to run on
const PORT = process.env.PORT || 3000;

// Create a new express application instance
const app = express();

// Configure the app to use bodyParser()
// This will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configure the app to use cors
app.use(cors());

// Connect to the database


// MongoDB connection
MongoClient.connect(
	process.env.MONGO_DB,
	{ useNewUrlParser: true },
	(err, client) => {
		if (err) {
			return console.log(err);
		} else {
			const db = client.db('test-db');
			console.log('Connected to MongoDB');
			// Express routes
			app.get('/', (req, res) => {
				res.send('Hello World!');
			});

			// Get all the users
			app.get('/users', (req, res) => {
				db.collection('users')
					.find()
					.toArray((err, result) => {
						if (err) {
							res.send(err);
						} else {
							res.send(result);
						}
					});
			});
			// Get a single user
			app.get('/users/:id', (req, res) => {
				db.collection('users').findOne(
					{ _id: new ObjectId(req.params.id) },
					(err, result) => {
						if (err) {
							res.send(err);
						} else {
							res.send(result);
						}
					}
				);
			});
			// Create a new user
			app.post('/users/signup', (req, res) => {
				// Encript the password
				const password = bcrypt.hashSync(req.body.password, 10);
				// Create a new user
				const user = {
					name: req.body.name,
					username: req.body.username,
					email: req.body.email,
					password: password,
				};
				db.collection('users').insertOne(user, (err, result) => {
					if (err) {
						res.send(err);
					} else {
						res.send(result);
					}
				});
			});

			app.listen(PORT, () => {
				console.log(`Listening on ${PORT}`);
			});
		}
	}
);
