const twitter = require('./twitter.js');
const mongo = require('./mongo.js');
const {get, noop} = require('lodash');

module.exports = async () => {
	const db = await mongo();
	const tweets = await twitter.get('statuses/user_timeline', {
		screen_name: 'imasml_theater',
		count: 200,
	});
	const comicTweets = tweets.filter((tweet) => get(tweet, ['entities', 'hashtags'], []).some(({text}) => text === 'ミリシタ4コマ'));
	const entries = comicTweets.map((tweet) => ({
		id: tweet.id_str,
		images: get(tweet, ['entities', 'media'], []).map((medium) => medium.media_url_https),
	}));
	await db.insertMany(entries, {ordered: false}).catch(noop);
	const docs = await db.find({});
	docs.forEach((doc) => {console.log(doc);})
};

module.exports();