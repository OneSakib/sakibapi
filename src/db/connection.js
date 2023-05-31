const monk = require('monk');

let dbUrl = process.env.DB_URL;

const db = monk(dbUrl);
module.exports = db;