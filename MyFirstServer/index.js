/**
 * Created by aryzhavskij on 1/24/17.
 */

'use strict'

const http = require('http');

let server = http.createServer(function (req, res) {
    if(req.url.split("/").pop() === "purchases") {
        try {
            require(`./controllers/${req.url.split("/").pop()}Controller`)[`${req.method.toLocaleLowerCase()}Action`](req, res);
        } catch (e) {
            console.log(e);
            res.end("Error");
        }
    }else{
        try {
            require(`./controllers/${req.url.split("/")[1]}Controller`)[`${req.method.toLocaleLowerCase()}Action`](req, res);
        } catch (e) {
            console.log(e);
            res.end("Error");
        }
    }

});

server.listen(3000);