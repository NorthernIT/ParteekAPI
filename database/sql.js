const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

const port = process.env.DB_PORT;
const host = process.env.DB_HOST;
const dbName = process.env.DB;
const user = process.env.DB_USER;
const pass = process.env.DB_PASSWORD;

let database = null;

let pool = null;

const access = {
    host: host,
    user: user,
    port: port,
    password: pass,
    database: dbName,
};

const accessPool = {
    host: host,
    user: user,
    port: port,
    password: pass,
    database: dbName,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
};

async function connect() {
    console.log("Connecting to DB instance...");
    try {
        database = await mysql.createConnection(access);
        console.log("Connected!");
        return database;
    } catch (error) {
        console.log("Failed to Connect.");
        console.log(error);
    }
}

// Not sure what the reason for this function is
// copied from mich code on webhook
async function getDatabase() {
    console.log("Getting DB instance...");
    if (!database) {
        console.log("Attempting connection");
        return connect();
    } else {
        console.log("DB already connected.");
        return database;
    }
}

async function createPool() {
    console.log("Creating connection pool...");
    try{
        pool = await mysql.createPool(accessPool);
        console.log("Connection pool created!");
        return pool;
    } catch (error) {
        console.log("Failed to create pool.");
        console.log(error);
    }
};

module.exports = {
    connect,
    getDatabase,
    createPool
};

