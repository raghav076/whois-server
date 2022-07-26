const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const env = require('env').config();
const { getWhois, extractDomain } = require('./src/getWhois');

const app = express();
const jsonParser = bodyParser.json();
app.use(jsonParser);

const corsOption = {
    origin: '*',
    optionSuccessStatus: 200,
};

app.use(cors(corsOption));

const server = http.createServer(app);

app.get('/whois', extractDomain, getWhois);
app.get('/', (req, res) => res.json('Hello World!'));

// app.use('/', (req, res) => res.sendFile(path.resolve(__dirname, 'client', 'index.html')));

const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log('server running on port ', port);
})
