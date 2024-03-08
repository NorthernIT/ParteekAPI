"use strict"

const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json())

app.set('view engined', 'ejs')
app.set('views', 'views')

app.use(express.urlencoded({ extended: false }))

const PORT = process.env.PORT || 1313;

app.get("/", (req,res) => {
    console.log("Get request to / made");
    res.send("Hello World!");
});

app.get('/register', (req, res) => {
    res.render('register.ejs');
});

app.get("/send-message", (req,res) => {
    console.log("Get request to /send-message made");
    res.render('index.ejs');
});

app.post("/", (req,res) => {
    console.log("post made!");
    res.send("post made!")
});

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