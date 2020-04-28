"use strict";

const https = require('https');
const _url = require('url');

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

            let urlParse = _url.parse(url);

            let requestOptions = {
                method: method,
                hostname: urlParse.hostname,
                path: urlParse.path,
                protocol: urlParse.protocol,
            };

            function requestCallback(res) {
                let body = "";
                res.setEncoding('utf8');

                res.on('data', (chunk) => {
                    body += chunk;
                });

                res.on('end', () => {
                    body = JSON.parse(body);
                    resolve(body);
                });
            }


            let req = https.request(requestOptions, requestCallback);

            req.on("error", (e) => {
                reject(e.message);
                console.error(`problem with request: ${e.message}`);
            });

            req.end();
        });

    }
});