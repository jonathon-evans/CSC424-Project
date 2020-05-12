const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const qs = require('querystring');
const mysql = require('mysql');
const { username, passwd } = require('./secret');

const port = process.argv[2] || 9000;

const mimeType = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
    '.doc': 'application/msword',
    '.eot': 'application/vnd.ms-fontobject',
    '.ttf': 'application/x-font-ttf',
};

let pool = mysql.createPool({
    connectionLimit: 100,
    host: "127.0.0.1",
    user: username,
    password: passwd,
    database: "linetracker"
});

function whitelist(dir, repstr, filelist) {
    let files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach((file) => {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = whitelist(path.join(dir, file), repstr, filelist);
        }
        else {
            filelist.push(path.join(dir, file));
        }
    });
    filelist.forEach((filepath, index) => {
        filelist[index] = filepath.replace(repstr, '/');
    })
    return filelist;
};

const validPaths = whitelist('./build/', 'build/');
const freshpath = whitelist('./ImgDB/FR', '/');
const starbpath = whitelist('./ImgDB/SB', '/')

console.log("Valid Paths:");
console.log(validPaths);
console.log(freshpath[0], starbpath[0]);

http.createServer((req, res) => {

    const parsedUrl = url.parse(req.url);
    let query = qs.decode(parsedUrl.query);
    //console.log(parsedUrl.query)

    res.setHeader('Access-Control-Allow-Origin', '*');

    // Avoid https://en.wikipedia.org/wiki/Directory_traversal_attack
    // e.g curl --path-as-is http://localhost:9000/../fileInDanger.txt

    const sanitizePath = path.normalize(decodeURI(parsedUrl.pathname)).replace(/^(\.\.[\/\\])+/, '');
    let pathname = path.join(__dirname, '/build/', sanitizePath);

    if (sanitizePath === "/") {
        fs.readFile(path.join(__dirname, "/build/index.html"), (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end(`Error getting the file: ${err}.`);
            } else {
                res.setHeader('Content-type', 'text/html');
                res.statusCode = 200;
                res.end(data);
            }
        });
    }
    else if (sanitizePath === "/favicon.ico") {
        fs.exists('./build/favicon.png', (exist) => {
            if (!exist) {
                res.statusCode = 404;
                res.end(`Favicon not found!`);
                return;
            }

            fs.readFile('./build/favicon.png', (err, data) => {
                if (err) {
                    res.statusCode = 500;
                    res.end(`Error getting the favicon.`);
                }
                else {
                    res.setHeader('Content-type', 'image/png');
                    res.end(data);
                }
            });
        });
    }
    else if (sanitizePath === "/ml5demo") {
        fs.readFile(path.join(__dirname, "/ml5demo.html"), (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end(`Error getting the file: ${err}.`);
            } else {
                res.setHeader('Content-type', 'text/html');
                res.statusCode = 200;
                res.end(data);
            }
        });
    }
    else if (sanitizePath === "/api/timestamp") {
        let ts = { fresh: 90000000, starb: 90000000 };
        let rand = parseInt(crypto.randomBytes(1).toString('hex'), 16) % freshpath.length;
        let rpath = freshpath[rand];
        ts.fresh = (rpath.match(/[0-9]{8,10}/))[0];
        rand = parseInt(crypto.randomBytes(1).toString('hex'), 16) % starbpath.length;
        rpath = starbpath[rand];
        ts.starb = (rpath.match(/[0-9]{8,10}/))[0];
        res.setHeader('Content-type', mimeType['.json']);
        res.end(JSON.stringify(ts));
    }
    else if (sanitizePath === "/api/fresh") {
        let rand = parseInt(crypto.randomBytes(1).toString('hex'), 16) % freshpath.length;
        let imagepath = path.join(__dirname, freshpath[rand]);
        fs.readFile(imagepath, (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end(`Error getting the file: ${err}.`);
            } else {
                res.setHeader('Content-type', mimeType['.jpg']);
                res.setHeader('Img', freshpath[rand].replace('ImgDB\/FR\/', '').replace('.jpg', ''));
                res.statusCode = 200;
                res.end(data);
            }
        });
    }
    else if (sanitizePath === "/api/starb") {
        let rand = parseInt(crypto.randomBytes(1).toString('hex'), 16) % starbpath.length;
        let imagepath = path.join(__dirname, starbpath[rand]);
        fs.readFile(imagepath, (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end(`Error getting the file: ${err}.`);
            } else {
                res.setHeader('Content-type', mimeType['.jpg']);
                res.setHeader('Img', starbpath[rand].replace('ImgDB\/SB\/', '').replace('.jpg', ''));
                res.statusCode = 200;
                res.end(data);
            }
        });
    }
    else if (sanitizePath === "/api/results") {
        if (typeof query === 'undefined') {
            console.log("Query Undef")
            res.statusCode = 400;
            res.end("Bad Query");
        }
        else if (typeof query.time === 'undefined') {
            console.log("Query Time Undef")
            res.statusCode = 400;
            res.end("Bad Query");
        }
        else if (/[^0-9]/.test(query.time) || !(/^((FR)|(SB))$/.test(query.loc))) {
            console.log("Bad Format or Location")
            res.statusCode = 400;
            res.end("Bad Query");
        }
        else if (query.time.length > 12 || parseInt(query.time) < 90000000 || parseInt(query.time) > 2147483647) {
            console.log("Size Error")
            res.statusCode(403)
            res.end("Unauthorized Value");
        }

        else if (typeof query.span === 'undefined') {

            console.log("Requesting Connection")
            pool.getConnection((error, connection) => {
                if (error) {
                    console.log("Connection Failed")
                    res.statusCode = 500;
                    res.end("Server Error");
                    return;
                }
                if (query.loc === "FR") {
                    var location = "fresh"
                }
                else {
                    var location = "starb"
                }
                connection.query(`SELECT * FROM ${location} WHERE time=${query.time}`, (error, results, fields) => {
                    connection.release();
                    if (error) {
                        console.log(`Query: SELECT * FROM ${location} WHERE time=${query.time} Failed`)
                        res.statusCode = 500;
                        res.end("Server Error");
                        return;
                    }
                    res.statusCode = 200;
                    res.setHeader('Content-type', mimeType['.json'])
                    res.end(JSON.stringify(results))
                });
            });
        }

        else if (query.span === "daily" || query.span === "weekly" || query.span === "monthly") {
            res.statusCode = 501;
            res.end()
        }

        else if (query.span === "hourly") {
            let basetime = parseInt(query.time);
            let basedate = new Date(basetime * 1000);
            basedate.setMinutes(0, 0, 0);
            let avgs = {};
            let resolved = 0;

            console.log("Requesting Connection");
            pool.getConnection((error, connection) => {
                if (error) {
                    console.log("Connection Failed")
                    res.statusCode = 500;
                    res.end("Server Error");
                    return;
                }

                if (query.loc === "FR") {
                    var location = "fresh"
                }
                else {
                    var location = "starb"
                }
                for (let i = 0; i < 11; i++) {
                    let cur = basedate.valueOf() - 3600000 * i;
                    connection.query(`SELECT class FROM ${location} WHERE time > ${(cur - 3600000) / 1000} and time <= ${cur / 1000}`, (error, results, fields) => {
                        //console.log("Cur", cur / 1000, results);
                        if (error) {
                            console.log(`Query: SELECT * FROM ${location} WHERE time=${cur} Failed`)
                            res.statusCode = 500;
                            res.end("Server Error");
                            return;
                        }
                        let tempavg = 0;
                        let nonzeros = 0;
                        for (i of results) {
                            tempavg += i.class;
                            if (i.class != 0) {
                                nonzeros++;
                            }
                        }
                        tempavg /= (nonzeros != 0) ? nonzeros : 1;
                        avgs[`${cur / 1000}`] = tempavg;
                        resolved++;
                    });
                };

                // HACK: This is bad but it works.
                function timer(ms) {
                    return new Promise(res => setTimeout(res, ms));
                }
                // Ditto.
                async function load() {
                    while (true) {
                        if (resolved >= 11) {
                            res.statusCode = 200;
                            res.setHeader('Content-type', mimeType['.json'])
                            res.end(JSON.stringify(avgs))
                            connection.release();
                            break;
                        }
                        await timer(1000);
                        console.log(resolved);
                    }
                }
                load();
            });
        }

        else {
            console.log("Uncaught Error")
            res.statusCode = 600;
            res.end("Unknown Error");
        }
    }
    else if (validPaths.includes(sanitizePath)) {
        fs.exists(pathname, (exist) => {
            if (!exist) {
                res.statusCode = 404;
                res.end(`File ${sanitizePath} not found!`);
                return;
            }

            if (fs.statSync(pathname).isDirectory()) {
                pathname += '/index.html';
            }

            fs.readFile(pathname, (err, data) => {
                if (err) {
                    res.statusCode = 500;
                    res.end(`Error getting the file: ${err}.`);
                } else {
                    let ext = path.parse(pathname).ext;
                    res.setHeader('Content-type', mimeType[ext] || 'text/plain');
                    res.end(data);
                }
            });
        });
    }
    else if (/^\/api\/ImgDB\//.test(sanitizePath)) {
        let imgpath = path.basename(sanitizePath)///\/((FR)|(SB))[0-9]{8,10}\.jpg/.exec(sanitizePath);
        let loc = imgpath.slice(0, 2);
        let temppath = path.join(`ImgDB/${loc}`, imgpath);

        //console.log(temppath)
        if (loc !== "FR" && loc !== "SB") {
            console.log("Bad Location")
            res.statusCode = 400;
            res.end("Bad Query");
            return;
        }
        else if (!(starbpath.includes(temppath) || freshpath.includes(temppath))) {
            res.statusCode = 404;
            res.end(`File ${imgpath} not found.`);
            return;
        }
        else {
            pathname = path.join(__dirname, `/ImgDB/${loc}`, imgpath);
            fs.exists(pathname, (exist) => {
                if (!exist) {
                    res.statusCode = 404;
                    res.end(`File ${imgpath} not found!`);
                    return;
                }

                fs.readFile(pathname, (err, data) => {
                    if (err) {
                        res.statusCode = 500;
                        res.end(`Error getting the file: ${err}.`);
                    } else {
                        res.setHeader('Content-type', 'image/jpeg');
                        res.end(data);
                    }
                });
            });
        }
    }
    else {
        res.statusCode = 308;
        res.setHeader('Location', '/')
        res.end();
        //return;
    }


}).listen(parseInt(port));

/*
const opts = {
        key: fs.readFileSync('/etc/letsencrypt/live/linetracker.live/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/linetracker.live/fullchain.pem')
}

http2.createServer((req,res)=>{
        const parsedUrl = url.parse(req.url);
        res.statusCode = 308;
        res.setHeader('Location', path.join('https://www.linetracker.live', parsedUrl.pathname));
        res.end();
}).listen(80);

*/

console.log(`Server listening on port ${port}`);
