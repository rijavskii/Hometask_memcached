/**
 * Created by aryzhavskij on 1/24/17.
 */

"use strict";

const fs = require("fs"),
    databaseFile = __dirname + '/../database/users.json';

/**
 * Достает айдишку пользователя из урла
 * @param req
 * @returns {*}
 */
function getUserId(req) {
    return req.url.split('/').pop();
}

module.exports = {
    /**
     * @example curl -v -X GET "http://127.0.0.1/users"
     */
    getAction: function (req, res) {
        fs.readFile(databaseFile, function (err, content) {
            if (err) {
                res.end("Cannot read file");
            } else {
                res.end(content.toString());
            }
        });
    },
    /**
     * @example curl -v -X POST "http://127.0.0.1:3000/users" -d '{"name":"Vasya"}'
     * @param req
     * @param res
     */
    postAction: function (req, res) {
        fs.readFile(databaseFile, function (err, content) {
            if (err) {
                res.end('Error --> Cannot parse file');
            } else {
                let users = [];
                try {
                    users = JSON.parse(content.toString());
                } catch (e) {
                    console.log('Is not a valid JSON');
                }
                try {
                    let body = '';
                    req.on('data', function (chunk) {
                        body += chunk.toString();
                    });
                    req.on("end", function () {
                        let userId = users.push(JSON.parse(body)) - 1;
                        fs.writeFile(databaseFile, JSON.stringify(users, null, '  '), function (err) {
                            if (err) {
                                res.end('Error --> Cannot write to file');
                            } else {
                                res.end(String(userId));
                            }
                        });
                    })
                } catch (e) {
                    res.end('Cannot parse request body');
                }
            }
        });

    },
    /**
     * @example curl -v -X PUT "http://127.0.0.1:3000/users/2" -d '{"name":"Aleksey"}'
     */
    putAction: function (req, res) {
        let userId = getUserId(req);
        if (userId) {
            let body = '';
            req.on("data", function (chunk) {
                body += chunk.toString();
            });
            req.on("end", function () {
                fs.readFile(databaseFile, function (err, content) {
                    if (err) {
                        res.end("Cannot read file");
                    } else {
                        let users = [];
                        try {
                            users = JSON.parse(content.toString());
                        } catch (e) {
                            console.log("Invalid JSON")
                        }
                        users.splice(Number(userId), 1, JSON.parse(body));
                        fs.writeFile(databaseFile, JSON.stringify(users, null, 2), function (err) {
                            if (err) {
                                res.end("Cannot write file");
                            } else {
                                res.end("Ok");
                            }

                        });
                    }
                })
            })
        } else {
            res.end("Invalid userId");
        }

    },
    /**
     * @example curl -v -X DELETE "http://127.0.0.1:3000/users/3"
     */
    deleteAction: function (req, res) {
        let userId = getUserId(req);
        if (userId) {
            fs.readFile(databaseFile, function (err, content) {
                if (err) {
                    res.end("Cannot read file");
                } else {
                    let users = [];
                    try {
                        users = JSON.parse(content.toString());
                    } catch (e) {
                        console.log("Invalid JSON");
                    }
                    delete users[Number(userId)];
                    fs.writeFile(databaseFile, JSON.stringify(users, null, '  '), function (err) {
                        if (err) {
                            res.end("Cannot write file");
                        } else {
                            res.end("Ok");
                        }
                    })
                }
            });
        } else {
            res.end("Invalid userId");
        }
    }
};