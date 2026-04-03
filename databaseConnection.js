const MongoClient = require("mongodb").MongoClient;
const is_hosted = process.env.IS_HOSTED || false;
const hostedURI = "mongodb+srv://theMongoAdmin:accidentalLoginSteps@cluster0.4ulcc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
const localURI = "mongodb://127.0.0.1/?authSource=admin&retryWrites=true&w=majority"

if (is_hosted) {
	var database = new MongoClient(hostedURI);
}
else {
	var database = new MongoClient(localURI);
}

module.exports = database;


// const mysql = require('mysql2/promise');

// const is_hosted = process.env.IS_HOSTED || false;

// const dbConfigHosted = {
// 	host: "us-cdbr-east-03.cleardb.com",
// 	user: "b1ab7fb2ee03bc",
// 	password: "2a484a2d",
// 	database: "heroku_3d208ad4bd6f421",
// 	multipleStatements: false,
// 	namedPlaceholders: true
// };

// const dbConfigLocal = {
// 	host: "localhost",
// 	user: "root",
// 	password: "Password",
// 	database: "lab_example",
// 	multipleStatements: false,
// 	namedPlaceholders: true
// };

// if (is_hosted) {
// 	var database = mysql.createPool(dbConfigHosted);
// }
// else {
// 	var database = mysql.createPool(dbConfigLocal);
// }

// module.exports = database;
		