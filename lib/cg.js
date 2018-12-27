const mongo = require('./mongo.js');
const axios = require('axios');
const xml2js = require('xml2js');
const {get, last} = require('lodash');

const match = (string, regex) => {
	let matches = null;
	const ret = [];
	while ((matches = regex.exec(string))) {
		ret.push(matches[1]);
	}
	return ret;
};

module.exports = async () => {
	const db = await mongo();
	const {data} = await axios.get('http://cggekijo.blog.fc2.com/?xml');
	const xml = await new Promise((resolve, reject) => {
		xml2js.parseString(data, {
			explicitRoot: false,
			explicitArray: false,
		}, (error, xml) => {
			if (error) {
				reject(error);
			} else {
				resolve(xml);
			}
		});
	});
	const comicEntries = xml.item.filter(({title}) => title.includes('劇場'));
	const entries = comicEntries.map((entry) => {
		const titleTokens = entry.title.split(' ').slice(1);
		const images = match(entry['content:encoded'], /src="(.+?)"/g);
		if (entry.title.includes('わいど')) {
			images.push(images[0].replace(/1(s?\..+)$/, '2$1'));
			images.push(images[0].replace(/1(s?\..+)$/, '3$1'));
		}
		return {
			id: entry.link,
			type: entry.title.includes('わいど') ? 'cg-wide' : 'cg',
			text: '',
			title: titleTokens[0] + (titleTokens[1] ? `『${titleTokens[1]}』` : ''),
			images,
			date: new Date(entry['dc:date']).getTime(),
			link: entry.link,
		};
	});
	const bulk = db.initializeUnorderedBulkOp();
	for (const entry of entries) {
		bulk.find({id: entry.id}).upsert().replaceOne(entry);
	}
	await bulk.execute();
	console.log(`Saved ${entries.length} entries`);
};

module.exports()	;
