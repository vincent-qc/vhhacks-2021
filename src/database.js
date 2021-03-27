const postgres = require('postgres');

// Should autoconnect since we set the relevant environment variables.
const sql = postgres();
module.exports = sql;
