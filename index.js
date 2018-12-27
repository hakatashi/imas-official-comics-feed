const fastify = require('fastify');
const {Feed} = require('feed');
const mongo = require('./lib/mongo.js');
const scrapers = require('./lib/scrapers.js');

const getCategoryName = (category) => {
	if (category === 'cg') {
		return 'シンデレラガールズ劇場';
	}
	if (category === 'cg-wide') {
		return 'シンデレラガールズ劇場わいど☆';
	}
	if (category === 'ml') {
		return 'ミリシタ4コマ';
	}
	if (category === 'sc') {
		return 'シャイニーカラーズWeb4コマ';
	}
	return '';
}

const app = fastify();

const getFeed = async ({path, category, format, reply}) => {
	const db = await mongo();
	const lastUpdateDocuments = await db.find().sort({updatedAt: -1}).limit(1).toArray();
	const lastUpdate = lastUpdateDocuments[0].updatedAt;
	if (!lastUpdate || lastUpdate < Date.now() - 10 * 60 * 1000) {
		await scrapers();
	}

	const entries = await db.find({
		...(category === null ? {} : {type: category}),
	}).sort({date: -1}).limit(30).toArray();

	const feed = new Feed({
		title: 'アイドルマスター公式マンガ更新情報非公式フィード',
		description: 'アイドルマスターシリーズの公式マンガ (4コマなど) の更新情報を垂れ流すフィードです。',
		id: `https://imas-official-comics-feed.herokuapp.com${path}`,
		link: `https://imas-official-comics-feed.herokuapp.com${path}`,
		image: '',
		favicon: '',
		copyright: '',
		updated: new Date(entries[0].date),
		generator: 'https://github.com/hakatashi/imas-official-comics-feed',
		author: {
			name: 'Koki Takahashi',
			email: 'hakatasiloving@gmail.com',
			link: 'https://github.com/hakatashi',
		},
	});

	for (const entry of entries) {
		const categoryName = getCategoryName(entry.type);
		feed.addItem({
			title: categoryName + entry.title,
			id: entry.link,
			link: entry.link,
			description: '',
			content: entry.images.map((image) => `<p><img src="${image}"></p>`).join(''),
			date: new Date(entry.date),
			image: entry.images[0],
		});
	}

	if (format === 'atom') {
		reply.type('application/atom+xml');
		return feed.atom1();
	}

	if (format === 'rss') {
		reply.type('application/rss+xml');
		return feed.rss2();
	}

	if (format === 'json') {
		reply.type('application/json');
		return JSON.parse(feed.json1());
	}
};

app.get('/', (request, reply) => getFeed({path: '/', category: null, format: 'atom', reply}));
app.get('/all.atom', (request, reply) => getFeed({path: '/', category: null, format: 'atom', reply}));
app.get('/all.rss', (request, reply) => getFeed({path: '/all.rss', category: null, format: 'rss', reply}));
app.get('/all.json', (request, reply) => getFeed({path: '/all.json', category: null, format: 'json', reply}));
app.get('/cg.atom', (request, reply) => getFeed({path: '/cg.atom', category: 'cg', format: 'atom', reply}));
app.get('/cg.rss', (request, reply) => getFeed({path: '/cg.rss', category: 'cg', format: 'rss', reply}));
app.get('/cg.json', (request, reply) => getFeed({path: '/cg.rss', category: 'cg', format: 'json', reply}));
app.get('/cg-wide.atom', (request, reply) => getFeed({path: '/cg-wide.atom', category: 'cg-wide', format: 'atom', reply}));
app.get('/cg-wide.rss', (request, reply) => getFeed({path: '/cg-wide.rss', category: 'cg-wide', format: 'rss', reply}));
app.get('/cg-wide.json', (request, reply) => getFeed({path: '/cg-wide.rss', category: 'cg-wide', format: 'json', reply}));
app.get('/ml.atom', (request, reply) => getFeed({path: '/ml.atom', category: 'ml', format: 'atom', reply}));
app.get('/ml.rss', (request, reply) => getFeed({path: '/ml.rss', category: 'ml', format: 'rss', reply}));
app.get('/ml.json', (request, reply) => getFeed({path: '/ml.rss', category: 'ml', format: 'json', reply}));
app.get('/sc.atom', (request, reply) => getFeed({path: '/sc.atom', category: 'sc', format: 'atom', reply}));
app.get('/sc.rss', (request, reply) => getFeed({path: '/sc.rss', category: 'sc', format: 'rss', reply}));
app.get('/sc.json', (request, reply) => getFeed({path: '/sc.rss', category: 'sc', format: 'json', reply}));

app.listen(process.env.PORT || 3000, '0.0.0.0');
