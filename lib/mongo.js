const {MongoClient} = require('mongodb');
const dotenv = require('dotenv');

dotenv.load();

const getCollection = new Promise((resolve, reject) => {
	MongoClient.connect(process.env.MONGODB_URI, {useNewUrlParser: true}, async (error, client) => {
		const db = client.db();
		const collection = db.collection('entries');
		await collection.createIndex({id: 1}, {unique: true});
		resolve(collection);
	});
});

module.exports = () => getCollection;
