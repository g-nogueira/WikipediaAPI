"use strict";

const https = require('https');

module.exports = new (class HttpWrapper {

    constructor() {
    }

    get(url) {
        return this.httpExecute('GET', url);
    }
    post(url, data) {
        return this.httpExecute('POST', url, data);
    }
    put(url, data) {
        return this.httpExecute('PUT', url, data);
    }
    delete(url) {
        return this.httpExecute('DELETE', url);
    }

    httpExecute(method, url, data) {
        return new Promise((resolve, reject) => {

            let body = "";
            let options = {
                method: method
            };

            let req = https.request(url, options, (res) => {
                console.log(`STATUS: ${res.statusCode}`);
                console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

                res.setEncoding('utf8');

                res.on('data', (chunk) => {
                    console.log(`BODY: ${chunk}`);
                    body += chunk;
                });

                res.on('end', () => {
                    body = JSON.parse(body);
                    console.log(`END: ${body}`);
                    resolve(body);
                });
            });

            req.on('error', (e) => {
                reject(e.message);
                console.error(`problem with request: ${e.message}`);
            });

            req.end();
        });
    }
});