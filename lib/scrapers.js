const cg = require('./cg.js');
const ml = require('./ml.js');
const sc = require('./sc.js');

module.exports = () => Promise.all([cg(), ml(), sc()]);
