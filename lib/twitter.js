const dotenv = require('dotenv');
const crypto = require('crypto');
const Twit = require('twit');
const {promisify} = require('util');

dotenv.load();

const twit = new Twit({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token: process.env.TWITTER_ACCESS_TOKEN_KEY,
	access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
	strictSSL: true,
});

module.exports.get = (endpoint, params = {}) => (
	new Promise((resolve, reject) => {
		twit.get(endpoint, params, (error, data) => {
			if (error) {
				reject(error);
			} else {
				resolve(data);
			}
		});
	})
);

module.exports.post = (endpoint, params = {}) => (
	new Promise((resolve, reject) => {
		twit.post(endpoint, params, (error, data) => {
			if (error) {
				reject(error);
			} else {
				resolve(data);
			}
		});
	})
);
