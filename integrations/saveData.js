const { genAPIKey } = require("./apiAuth");

async function SaveUser(data,pool) {
    // TODO: Save new users to DB
    return new Promise((resolve, reject) => {
        console.log("Insert User - Querying DB...");
        let apiKey = genAPIKey(); 
        pool.query(
            "INSERT INTO `testUsers` SET ?",
            {
                name: data.name,
                email: data.email,
                api_key: apiKey,
            },
            function(err, results, fields) {
                if(err) {
                    return reject({
                        err: true,
                        serverMessage: err,
                    });
                } else {
                    return resolve({
                        err: false,
                        message: `Your api key is ${apiKey} please keep it safe.`,
                    });
                }
            }
        );
    });
}

async function checkApiKey(apiKey,pool) {
    // TODO: check if given API key exists
    return new Promise((resolve,reject) => {
        console.log("Querying DB for key...");

        pool.query(
            "SELECT COUNT(*) as count FROM `testUsers` WHERE api_key = ?",
            [apiKey],
            function (err, results) {
                if (err) {
                    return reject({
                        err: true,
                        serverMessage: err,
                    });
                } else {
                    const count = results[0].count;
                    const exists = count > 0;
                    return resolve({
                        err: false,
                        keyExists: exists,
                    });
                }
            }
        );
    });

}

async function SavePayload(data,pool) {
    // TODO: Save new rawpayloads to DB
    return new Promise((resolve, reject) => {
        console.log("Insert data entry - Querying DB...");

        pool.query(
            "INSERT INTO `testData` SET ?",
            {
                rawPayload: data.rawPayload,
            },
            function (err, results,fields) {
                if (err) {
                    return reject({
                        err: true,
                        serverMessage: err,
                    });
                } else {
                    return resolve({
                        err: false,
                        message: results,
                    });
                }
            }
        );
    });
}

async function GetPayload(pool) {
    // TODO: get all payloads in DB
    return new Promise((resolve, reject) => {
        console.log("Getting Data - Querying DB...");

        pool.query(
            "SELECT * FROM `testData`",
            function (err, results) {
                if (err) {
                    return reject({
                        err: true,
                        serverMessage: err,
                    });
                } else {
                    return resolve({
                        err: false,
                        message: results,
                    });
                }
            }
        );
    });
}

module.exports = {
    SaveUser,
    SavePayload,
    checkApiKey,
    GetPayload,
}