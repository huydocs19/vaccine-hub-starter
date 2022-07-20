const {Client} = require("pg")
const {getDatabaseUri} = require("./config")

const db = new Client({connectionString: getDatabaseUri()})

db.connect((err) => {
    if (err) {
        console.error("Connection Error".red, err.stack)
    } else {
        console.log("Successfully connected to postgres db!".blue)
    }

})

module.exports = db