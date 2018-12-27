const twitter = require('./twitter.js');
const mongo = require('./mongo.js');
const {get, words} = require('lodash');

module.exports = async () => {
	const db = await mongo();
	const tweets = await twitter.get('statuses/user_timeline', {
		screen_name: 'imassc_official',
		count: 200,
	});
	const comicTweets = tweets.filter((tweet) => tweet.text.includes('4コマ') && tweet.text.includes('第'));
	const entries = comicTweets.map((tweet) => ({
		id: tweet.id_str,
		type: 'sc',
		text: tweet.text,
		title: words(tweet.text, /(\S+?)『(.+?)』/)[0] || '',
		images: get(tweet, ['entities', 'media'], []).map((medium) => `${medium.media_url_https}:large`),
		date: new Date(tweet.created_at).getTime(),
		link: `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`,
	}));
	const bulk = db.initializeUnorderedBulkOp();
	for (const entry of entries) {
		bulk.find({id: entry.id}).upsert().replaceOne(entry);
	}
	await bulk.execute();
	console.log(`Saved ${entries.length} entries`);
};
