"use strict"

const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

const API = require("./integrations/apiAuth");

// Eventually will not need:
const { users, payloads} = require("./integrations/initialData");

const { createPool } = require("./database/sql");
const { SaveUser, checkApiKey, SavePayload, GetPayload } = require('./integrations/saveData');

const app = express();
app.use(bodyParser.json())
dotenv.config();

app.set('view engined', 'ejs')
app.set('views', 'views')

app.use(express.urlencoded({ extended: false }))

let connectionPool = null;

async function initPool() {
    connectionPool = await createPool();
}

initPool();

const PORT = process.env.PORT || 1313;

// Basic get and post to root:
app.get("/", (req,res) => {
    console.log("Get request to / made");
    res.send("Hello World!");
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