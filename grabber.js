const fs = require('fs');
const chp = require('child_process');
const http = require('http');
const EventEmitter = require('events');

class AllDone extends EventEmitter { }

const allDone = new AllDone();

let counter = 1;

if (fs.existsSync("./ctkeeper.txt")) {
    counter = parseInt(fs.readFileSync("./ctkeeper.txt", { encoding: "utf-8" }), 10);
} else {
    fs.writeFileSync("./ctkeeper.txt", "1");
}


let hour = parseInt(chp.execSync(`date +"%H"`, { timeout: 1000, killSignal: "SIGKILL" }).toString().match(/[0-9]+/g), 10);
let dow = parseInt(chp.execSync(`date +"%u"`, { timeout: 1000, killSignal: "SIGKILL" }).toString().match(/[0-9]+/g), 10);
let timestamp = parseInt(chp.execSync(`date +"%s"`, { timeout: 1000, killSignal: "SIGKILL" }).toString().match(/[0-9]+/g), 10);
let maxflag = 0;

allDone.on('finish', (number) => {
    if (number >= maxflag) {
        counter = (counter % 4) + 1;
        fs.writeFileSync("./ctkeeper.txt", counter);
        fs.appendFileSync("./NodeLog", `Pull Complete ${hour} ${timestamp} in ${counter}\n`);
    };
});
//console.log(hour, dow, timestamp);

let dirtyflag = 0;

if ((hour >= 7) && (hour <= 21)) {
    if (dow <= 4 || (dow >= 5 && dow <= 6 && hour <= 19) || (dow = 7 && hour >= 9)) {
        // Fresh
	maxflag += 1;
        let freshpath = `/home/owner/Desktop/CSC424-Project/Set${counter}/Fresh/FR${timestamp}.jpg`;
        http.get("http://freshfoodslivecam.usm.edu/axis-cgi/jpg/image.cgi?resolution=1280x720", (incoming) => {
            var chunks = [];

            incoming.on("data", function (chunk) {
                chunks.push(chunk);
            });

            incoming.on("end", function (chunk) {
                var body = Buffer.concat(chunks);
                fs.writeFileSync(freshpath, body);
                dirtyflag += 1;
                allDone.emit("finish", dirtyflag);
            });

            incoming.on("error", function (error) {
                console.error(error);
            });
        })
    }
}
if (hour >= 7) {
    if (dow <= 4 || (dow = 5 && hour <= 19) || (dow = 6 && hour >= 10 && hour <= 18) || (dow = 7 && hour >= 12)) {
        // Starbucks
	maxflag += 1;
        let starbpath = `/home/owner/Desktop/CSC424-Project/Set${counter}/Starbucks/SB${timestamp}.jpg`;
        http.get("http://starbuckslivecam.usm.edu/axis-cgi/jpg/image.cgi?resolution=1280x720", (incoming) => {
            var chunks = [];

            incoming.on("data", function (chunk) {
                chunks.push(chunk);
            });

            incoming.on("end", function (chunk) {
                var body = Buffer.concat(chunks);
                fs.writeFileSync(starbpath, body);
                dirtyflag += 1;
                allDone.emit("finish", dirtyflag);
            });

            incoming.on("error", function (error) {
                console.error(error);
            });
        })
    }
}
