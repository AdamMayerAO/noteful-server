require('dotenv').config();
module.exports = {
    "migrationsDirectory": "migrations",
    "driver": "pg", 
    "connectionString": process.env.DATABASE_URL,
    // ssl: {
    //     required: true,
    //     rejectUnauthorized: false
    //   }
}