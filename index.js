"use strict"

const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

const API = require("./integrations/apiAuth"); // Not being used in this file

const { createPool } = require("./database/sql");
const { draginoDecoder, convertHexStringToArray } = require("./integrations/decoders");
const { SaveUser, checkApiKey, SavePayload, GetPayload, getUserData, processPayload } = require('./integrations/query');

const app = express();
app.use(bodyParser.json())
dotenv.config();

app.set('view engined', 'ejs')
app.set('views', 'views')

app.use(express.urlencoded({ extended: true }))

let connectionPool = null;

async function initPool() {
    connectionPool = await createPool();
}

initPool();

const PORT = process.env.PORT || 1313;

// Basic get and post to root:
app.get("/", (req,res) => {
    console.log("Get request to / made");
    res.render('home.ejs');
});

app.post("/", (req,res) => {
    console.log("post made!");
    res.send("post made!")
});

// Register new user page
app.get('/register', (req, res) => {
    res.render('register.ejs');
});

// new POST to register new user to DB:
app.post('/register', async (req,res) =>{
    await SaveUser(req.body, connectionPool).then(
        (result) => {
            if (result.err) {
                res.status(400).json({
                    message: result.message,
                });
            } else {
                console.log("successfully added user");
                res.status(200).send(result.message);
            }
        },
        (error) => {
            console.log(error);
            res.status(400).json(error);
        }
    );
});

// Post for converting payload to actual data:
// TODO: add authentication
app.post('/processPayload', async (req, res) => {
    let apiKey = req.header("x-api-key");
    let keyExists = false;
    await checkApiKey(apiKey,connectionPool).then(
        (result) => {
            if (result.err) {
                res.status(400).json({
                    message: result.message,
                });
            } else {
                console.log("Check successful");
                keyExists = result.keyExists;
            }
        },
        (error) => {
            console.log(error);
            res.status(400).json(error);
        }
    );
    
    if(keyExists){
        let bytes = await convertHexStringToArray(req.body.bytes);
        let data = await draginoDecoder(bytes,req.body.port);
        await processPayload(data,connectionPool).then(
            (result) => {
                if(result.err) {
                    res.status(400).json({
                        message: result.message,
                    });
                } else {
                    res.status(200).send("Added Successfully!");
                }
            },
            (error) => {
                console.log(error);
                res.status(400).json(error);
            }
        );
    } else {
        res.status(403).send({ error: { code: 403, message: "You're not allowed." }});
    }
});

/* Code for getting user data when apiKey provided:
 - can be from web client or postman
 - key must be in body for postman not header
 - we are not authenticating just getting name and email */
app.get('/getUserData', async (req,res) => {
    let apiKey;
    if(req.body && req.body.apiKey){
        apiKey = req.body.apiKey
    } else {
        apiKey = req.query.apiKey;
    }

    await getUserData(apiKey,connectionPool).then(
        (result) => {
            if (result.err) {
                res.status(400).json({
                    message: result.message,
                });
            } else {
                if (result.keyExists) {
                    res.status(200).send(`Hello ${result.name}, your email is: ${result.email}!`);
                } else {
                    res.send("No user found with such key");
                }
            }
        },
        (error) => {
            console.log(error);
            res.status(400).json(error);
        }
    );
});

// NEW Get rawpayload data with DB:
app.get('/api/payload', async (req,res) => {
    let apiKey = req.header("x-api-key");
    let keyExists = false;
    await checkApiKey(apiKey,connectionPool).then(
        (result) => {
            if (result.err) {
                res.status(400).json({
                    message: result.message,
                });
            } else {
                console.log("Check successful");
                keyExists = result.keyExists;
            }
        },
        (error) => {
            console.log(error);
            res.status(400).json(error);
        }
    );

    if(keyExists) {
        await GetPayload(connectionPool).then(
            (result) => {
                if (result.err) {
                    res.status(400).json({
                        message: result.message
                    });
                } else {
                    console.log("Data sent successfully");
                    res.status(200).send(result.message);
                }
            },
            (error) => {
                console.log(error);
                res.status(400).json(error);
            }
        );

    } else {
        //Reject request if API key doesn't match
        res.status(403).send({ error: { code: 403, message: "You're not allowed." } });
    }
});

// NEW POST new payload data with DB:
app.post('/api/payload', async (req,res) => {
    let apiKey = req.header("x-api-key");
    let keyExists = false;
    await checkApiKey(apiKey,connectionPool).then(
        (result) => {
            if (result.err) {
                res.status(400).json({
                    message: result.message,
                });
            } else {
                console.log("Check successful");
                keyExists = result.keyExists;
            }
        },
        (error) => {
            console.log(error);
            res.status(400).json(error);
        }
    );

    if(keyExists) {
        await SavePayload(req.body,connectionPool).then(
            (result) => {
                if (result.err) {
                    res.status(400).json({
                        message: result.message,
                    });
                } else {
                    res.status(200).send("Successfully added to DB!");
                }
            },
            (error) => {
                console.log(error);
                res.status(400).json(error);
            }
        );
    } else {
        //Reject request if API key doesn't match
        res.status(403).send({ error: { code: 403, message: "You're not allowed." } });
    }
});


// render page to send basic message to slack
app.get("/send-message", (req,res) => {
    console.log("Get request to /send-message made");
    res.render('index.ejs');
});

// Webhook to send a message to slack once client provides data
app.post("/send-message", (req,res) => {
    console.log("POST request made to /send-message");
    console.log(req.body.name);
    axios.post('https://hooks.slack.com/services/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',{
        text: `Hello Slack, ${req.body.name} sent this message through POST request to an API using a server client with email: ${req.body.email}!`
    }).then(() => {
        res.render('again.ejs')
    }).catch(() =>{
        res.send("Failed POST")
    })
});

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});