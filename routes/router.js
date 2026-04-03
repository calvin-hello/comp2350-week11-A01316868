const router = require('express').Router();
const database = include('databaseConnection');
const { ObjectId } = require('mongodb');
const Joi = require('joi');
//const dbModel = include('databaseAccessLayer');
//const dbModel = include('staticData');

// const userModel = include('models/web_user');
// const petModel = include('models/pet');

const crypto = require('crypto');
const {v4: uuid} = require('uuid');

const passwordPepper = "SeCretPeppa4MySal+";

router.get('/', async (req, res) => {
	console.log("page hit");
	try {
		const userCollection = database.db('lab_example').collection('users');
		const users = await userCollection.find().project({first_name: 1, last_name: 1, email:
		1, _id: 1}).toArray();
		
		if (users === null) {
			res.render('error', {message: 'Error connecting to MySQL'});
			console.log("Error connecting to userModel");
		}
		else {
			console.log(users);
			res.render('index', {allUsers: users});
		}
	}
	catch(ex) {
		res.render('error', {message: 'Error connecting to MySQL'});
		console.log("Error connecting to MySQL");
		console.log(ex);
	}
});

router.get('/pets', async (req, res) => {
	try {
		console.log("page hit");

		const petCollection = database.db('lab_example').collection('pets');
		const pets = await petCollection.find().toArray();

		res.render('pets', { allPets: pets });
	}
	catch (ex) {
		res.render('error', { message: 'Error connecting to Database' });
		console.log(ex);
	}
});


router.get('/showPets', async (req, res) => {
	try {
		console.log("page hit");

		const userId = req.query.id;

		const schema = Joi.string().length(24).required();
		const validationResult = schema.validate(userId);

		if (validationResult.error) {
			console.log(validationResult.error);
			return res.render('error', { message: 'Invalid user ID' });
		}

		const userCollection = database.db('lab_example').collection('users');
		const petCollection = database.db('lab_example').collection('pets');

		const userObjectId = new ObjectId(userId);

		const user = await userCollection.findOne({ _id: userObjectId });

		if (!user) {
			return res.render('error', { message: 'User not found' });
		}

		const pets = await petCollection.find({ user_id: userObjectId }).toArray();

		console.log(pets);

		res.render('pets', {
			allPets: pets,
			owner: user,
			user_id: userId
		});
	} catch (ex) {
		console.log(ex);
		res.render('error', { message: 'Error connecting to Database' });
	}
});

router.get('/deleteUser', async (req, res) => {
	try {
		console.log("delete user");

		const userCollection = database.db('lab_example').collection('users');
		let userId = req.query.id;

		//validation 
		const schema = Joi.string().length(24).required(); // Mongo ObjectId = 24 chars

		const validationResult = schema.validate(req.query.id);

		if (validationResult.error != null) {
			console.log(validationResult.error);
			return res.render('error', { message: 'Invalid ID' });
		}

		if (userId) {
			await userCollection.deleteOne({ _id: new ObjectId(userId) });
		}

		res.redirect("/");
	}
	catch (ex) {
		res.render('error', {message: 'Error connecting to Database'});
		console.log("Error connecting to Database");
		console.log(ex);
	}
});

router.post('/addUser', async (req, res) => {
	try {
		console.log("form submit");
		//user input validation
		const schema = Joi.object({
			first_name: Joi.string().alphanum().min(2).max(50).required(),
			last_name: Joi.string().alphanum().min(2).max(50).required(),
			email: Joi.string().email().max(150).required(),
			password: Joi.string().min(8).max(30).required()
		});

		const validationResult = schema.validate(req.body);

		if (validationResult.error != null) {
			console.log(validationResult.error);
			return res.render('error', { message: 'Invalid user input' });
		}
		const userCollection = database.db('lab_example').collection('users');

		const password_salt = crypto.createHash('sha512');
		password_salt.update(uuid());

		const saltHex = password_salt.digest('hex');

		const password_hash = crypto.createHash('sha512');
		password_hash.update(req.body.password + passwordPepper + saltHex);

		const hashHex = password_hash.digest('hex');

		await userCollection.insertOne({
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			email: req.body.email,
			password_salt: saltHex,
			password_hash: hashHex
		});

		res.redirect("/");
	}
	catch (ex) {
		res.render('error', {message: 'Error connecting to Database'});
		console.log("Error connecting to Database");
		console.log(ex);
	}
});

router.post('/addPet', async (req, res) => {
	try {
		const schema = Joi.object({
			user_id: Joi.string().length(24).required(),
			pet_name: Joi.string().min(1).max(50).required(),
			pet_type: Joi.string().min(1).max(50).required()
		});

		const validationResult = schema.validate(req.body);

		if (validationResult.error != null) {
			console.log(validationResult.error);
			return res.render('error', { message: 'Invalid pet input' });
		}

		const petCollection = database.db('lab_example').collection('pets');

		await petCollection.insertOne({
			name: req.body.pet_name,
			pet_type: req.body.pet_type,
			user_id: new ObjectId(req.body.user_id)
		});

		res.redirect('/showPets?id=' + req.body.user_id);
	}
	catch (ex) {
		res.render('error', { message: 'Error connecting to Database' });
		console.log(ex);
	}
});
/*
router.get('/', (req, res) => {
	console.log("page hit");
	database.getConnection(function (err, dbConnection) {
		if (err) {
			res.render('error', {message: 'Error connecting to MySQL'});
			console.log("Error connecting to mysql");
			console.log(err);
		}
		else {
			
			dbModel.getAllUsers((err, result) => {
				if (err) {
					res.render('error', {message: 'Error reading from MySQL'});
					console.log("Error reading from mysql");
					console.log(err);
				}
				else { //success
					res.render('index', {allUsers: result});

					//Output the results of the query to the Heroku Logs
					console.log(result);
				}
			});
			dbConnection.release();
		}
	});
});
*/

/*
router.post('/addUser', (req, res) => {
	console.log("form submit");
	database.getConnection(function (err, dbConnection) {
		if (err) {
			res.render('error', {message: 'Error connecting to MySQL'});
			console.log("Error connecting to mysql");
			console.log(err);
		}
		else {
			console.log(req.body);
			dbModel.addUser(req.body, (err, result) => {
				if (err) {
					res.render('error', {message: 'Error writing to MySQL'});
					console.log("Error writing to mysql");
					console.log(err);
				}
				else { //success
					res.redirect("/");

					//Output the results of the query to the Heroku Logs
					console.log(result);
				}
			});
			
			dbConnection.release();
		}
	});

});
*/

/*
router.get('/deleteUser', (req, res) => {
	console.log("delete user");
	database.getConnection(function (err, dbConnection) {
		if (err) {
			res.render('error', {message: 'Error connecting to MySQL'});
			console.log("Error connecting to mysql");
			console.log(err);
		}
		else {
			console.log(req.query);

			let userId = req.query.id;
			if (userId) {
				dbModel.deleteUser(userId, (err, result) => {
					if (err) {
						res.render('error', {message: 'Error writing to MySQL'});
						console.log("Error writing to mysql");
						console.log(err);
					}
					else { //success
						res.redirect("/");

						//Output the results of the query to the Heroku Logs
						console.log(result);
					}
				});
			}
			else {
				res.render('error', {message: 'Error on Delete'});
			}
		
			dbConnection.release();
		}
	});
});
*/

module.exports = router;
