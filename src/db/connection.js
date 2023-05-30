const monk = require('monk');

let dbUrl = process.env.DB_URL;

console.log(">CALLLED", dbUrl)
const db = monk(dbUrl);
module.exports = db;