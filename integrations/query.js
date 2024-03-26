const { genAPIKey } = require("./apiAuth");

async function SaveUser(data,pool) {
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

async function getUserData(apiKey, pool) {
    // TODO get user name and email if apiKey exists 
    return new Promise((resolve, reject) => {
        console.log("Getting user Data - Querying DB...");

        pool.query(
            "SELECT `name`, `email` FROM `testUsers` WHERE api_key = ?",
            [apiKey],
            function (err, results) {
                if (err) {
                    return reject({
                        err: true,
                        serverMessage: err,
                    });
                } else {
                    const keyExists = results.length > 0;
                    if (keyExists) {
                        return resolve({
                            err: false,
                            keyExists: keyExists,
                            name: results[0].name,
                            email: results[0].email,
                        });
                    } else {
                        return resolve({
                            err: false,
                            keyExists: keyExists,
                        });
                    }
                }
            }
        );
    });
}

async function processPayload(data,pool) {
    return new Promise((resolve,reject) => {
        console.log("Sending data to dragino table ...");

        pool.query(
            "INSERT INTO `testDraginoData` SET ?",
            {
                BatV: data.BatV,
                TempC_DS: data.TempC_DS,
                TempC_SHT: data.TempC_SHT,
                Hum_SHT: data.Hum_SHT,
            },
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
    getUserData,
    processPayload,
}