"use strict"

const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

const API = require("./integrations/apiAuth");

const { users, payloads} = require("./integrations/initialData");
const { createPool } = require("./database/sql");

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

// POST to register new user
app.post('/register', (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let user = API.createUser(name,email,req);
    res.send(`User created here is your API key, keep it safe: ${user.api_key}`);
});

// Get rawpayload data
app.get('/api/payload', API.authenticateKey, (req, res) => {
    let today = new Date().toISOString().split('T')[0];
    console.log(today);
    res.send({
        data:payloads,
    });
});

// POST new payload data
app.post('/api/payload', API.authenticateKey, (req, res) => {
    let newPayload = {
        _id: Date.now(),
        rawPayload: req.body.rawPayload,
    };
    payloads.push(newPayload);
    res.status(201).send({
        data: newPayload,
    });
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