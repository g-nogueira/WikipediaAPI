const http = require('http');
const url = require('url');
const wikipediaAPI = require('./WikipediaAPI');


const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    var urlParts = url.parse(req.url, true);
    var query = urlParts.query;

    if (urlParts.pathname == "/test") {
        wikipediaAPI.searchResults(query.title, wikipediaAPI.request.language.english);
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello, World!\n');
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});