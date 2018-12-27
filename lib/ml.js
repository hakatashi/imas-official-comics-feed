const twitter = require('./twitter.js');
const mongo = require('./mongo.js');
const {get} = require('lodash');

module.exports = async () => {
	const db = await mongo();
	const tweets = await twitter.get('statuses/user_timeline', {
		screen_name: 'imasml_theater',
		count: 200,
	});
	const now = Date.now();
	const comicTweets = tweets.filter((tweet) => get(tweet, ['entities', 'hashtags'], []).some(({text}) => text === 'ミリシタ4コマ'));
	const entries = comicTweets.map((tweet) => ({
		id: tweet.id_str,
		type: 'ml',
		text: tweet.text,
		title: '',
		images: get(tweet, ['entities', 'media'], []).map((medium) => `${medium.media_url_https}:large`),
		date: new Date(tweet.created_at).getTime(),
		link: `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`,
		updatedAt: now,
	}));
	const bulk = db.initializeUnorderedBulkOp();
	for (const entry of entries) {
		bulk.find({id: entry.id}).upsert().replaceOne(entry);
	}
	await bulk.execute();
	console.log(`ml: Saved ${entries.length} entries`);
};
