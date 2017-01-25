/**
 * Created by aryzhavskij on 1/24/17.
 */


const Memcache = require('memcached'),
    memcache = new Memcache('localhost:11211');

/**
 * Достает айдишку пользователя из урла
 * @param req
 * @returns {*}
 */
function getUserId(req) {
    return req.url.split('/')[2];
}

/**
 * Встановлюємо звязок з сервером memcached
 */
memcache.connect( 'localhost:11211', function( err, conn ){
    if( err ) {
        console.log("Error ==> connection");
    }else {
        console.log("Connected");
    }
});

module.exports = {
    /**
     * @example curl -v -X GET "http://127.0.0.1:3000/users/2/purchases"
     */
    getAction: function (req, res) {
        let userId = getUserId(req);

        memcache.get(userId, function(error, val){
            if (error) {
                res.end('Error ==> get memcached');
                console.log("Error");
            } else {
                if(!val){
                    console.log("No such key");
                    res.end("Error");
                }else {
                    console.log("User purchase " + val);
                    res.end(val.toString());
                }
            }
        });
    },

    /**
     * @example curl -v -X POST "http://127.0.0.1:3000/users/2/purchases" -d '{"count":10}'
     * @param req
     * @param res
     */
    postAction: function (req, res) {
        let userId = getUserId(req);

        try {
            let body = '';
                req.on('data', function (chunk) {
                body += chunk.toString();
            });
            req.on("end", function () {
                let purchase = JSON.parse(body);
                console.log("user purchase = " + purchase.count);


                memcache.add(userId, purchase.count, 10, function (err) {
                    if (err) {
                        console.log("Error in add");
                        res.end("Error");

                    } else {
                        console.log("Set success");
                        res.end("Ok");
                    }
                });
                console.log("added to memcached");

            })
        } catch (e) {
            res.end('Cannot parse request body');
        }

    },

    /**
     * @example curl -v -X DELETE "http://127.0.0.1:3000/users/3"
     */
    deleteAction: function (req, res) {
        let userId = getUserId(req);
        if (userId) {
            let isKeyExist = true;

            memcache.get(userId, function(error, val){
                if (error) {
                    res.end('Error ==> get memcached');
                    console.log("Error");
                } else {
                    if(!val){
                        isKeyExist = false;
                        console.log("No such key");

                        res.end("Error ==> No such key");
                    }
                }
            });

            if(isKeyExist) {
                memcache.del(userId, function (err) {
                    if (err) {
                        console.log("Some error happend");
                        res.end("Error");
                    } else {
                        res.end("Ok");
                    }
                });
            }
        } else {
            res.end("Invalid userId");
        }
    }
};