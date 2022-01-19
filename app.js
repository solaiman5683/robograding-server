const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const fileUpload = require('express-fileupload');

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
app.use(fileUpload());

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

			// Login a user
			app.post('/users/login', (req, res) => {
				db.collection('users').findOne(
					{ username: req.body.username },
					(err, result) => {
						if (err) {
							res.send(err);
						} else {
							if (result) {
								if (bcrypt.compareSync(req.body.password, result.password)) {
									res.send(result);
								} else {
									res.send('Incorrect password');
								}
							} else {
								res.send('User not found');
							}
						}
					}
				);
			});

			// Update a user Password
			app.put('/users/:id/update', (req, res) => {
				// Check if the password is correct
				db.collection('users').findOne(
					{ _id: new ObjectId(req.params.id) },
					(err, result) => {
						if (err) {
							res.send(err);
						} else {
							if (result) {
								if (bcrypt.compareSync(req.body.password, result.password)) {
									// Encript the new password
									const newPassword = bcrypt.hashSync(req.body.newPassword, 10);
									// Update the password
									db.collection('users').updateOne(
										{ _id: new ObjectId(req.params.id) },
										{ $set: { password: newPassword } },
										(err, result) => {
											if (err) {
												res.send(err);
											} else {
												res.send(result);
											}
										}
									);
								} else {
									res.send('Incorrect password');
								}
							} else {
								res.send('User not found');
							}
						}
					}
				);
			});

			// Add a manual CARD to the database
			app.post('/cards/add', (req, res) => {
				// console.log(req.body);
				const encodedImage = req.files.image.data.toString('base64');
				const image = Buffer.from(encodedImage, 'base64');
				const card = {
					name: req.body.name,
					description: req.body.description,
					image: `data:image/png;base64,${image}`,
					price: req.body.price,
					quantity: req.body.quantity,
				};
				db.collection('cards').insertOne(card, (err, result) => {
					if (err) {
						res.send(err);
					} else {
						res.send(result);
					}
				});
			});
			// Get all the cards
			app.get('/cards', (req, res) => {
				db.collection('cards')
					.find()
					.toArray((err, result) => {
						if (err) {
							res.send(err);
						} else {
							res.send(result);
						}
					});
			});

			// Get a single card
			app.get('/cards/:id', (req, res) => {
				db.collection('cards').findOne(
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

			// Delete a card
			app.delete('/cards/:id', (req, res) => {
				db.collection('cards').deleteOne(
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

			// Create a new order
			app.post('/orders/add', (req, res) => {
				const order = {
					user: req.body.user,
					card: req.body.card,
					quantity: req.body.quantity,
					address: req.body.address,
					total: req.body.total,
					date:
						new Date().toLocaleDateString() +
						' ' +
						new Date().toLocaleTimeString(),
				};
				db.collection('orders').insertOne(order, (err, result) => {
					if (err) {
						res.send(err);
					} else {
						res.send(result);
					}
				});
			});
			// Get all the orders
			app.get('/orders', (req, res) => {
				db.collection('orders')
					.find()
					.toArray((err, result) => {
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
