var WebSocket = require('ws');
var cheerio = require('cheerio');
var rp = require('request-promise');
var mysql = require('mysql');
var Promise = require("bluebird");

//wow i forgot that you could do this xD
var conf = require("./config.json");

var connection = mysql.createConnection({
	host: conf.host,
	user: conf.user,
	password: conf.password,
	database: conf.database
});
connection.connect();

//fet the current websocket url from the DOM of reddit
function getSocketURL(){
    return new Promise(function(resolve, reject){
        rp('https://reddit.com/place')
        .then(function(body){
            var $ = cheerio.load(body);
            wsurl = JSON.parse($('#config').text().slice(0,-1).substring(8)).place_websocket_url;
            resolve(wsurl)
    	});
    });
}

//check if the message fits our criteria
function isValidMessage(message){
    return (message.x || message.x === 0) && (message.y || message.y === 0) && message.author && (message.color || message.color === 0);
}

//global for keeping track of frams over time
var incommingFrames = 0;

//keep this global so we dont keep making new websocket instances
var ws;

//regisiter the
function createSocketHandler(){
	//ensure that the object is dead before we create another ws instance
	if(ws !== null){
		ws = null;
		delete ws;
	}


	getSocketURL()
	.then( (wsurl) => {
		ws = new WebSocket(wsurl);
		console.log("Connecting to " + wsurl);
		ws.on('message', (input) => {
	        var d = new Date();
	    	//console.log(input);
	        var message = JSON.parse(input).payload;
	        if(isValidMessage(message)) {
                var query = "INSERT INTO place (x, y, username, colour, time) VALUES (" + message.x + "," + message.y + ",'" + message.author + "'," + message.color + ",'" + d.getTime() + "');";
                connection.query(query);
	        }
			incommingFrames++;

		});

		ws.on("close", () => {
	        console.log("We lost connection since the server was destroyed, let's reconnect :)");
	        createSocketHandler();
		});

		ws.on("open", () => {

			setInterval(() => {
				if(incommingFrames <= 0){
					console.log("We havent received packets within 5 seconds, not possible server is broken.")
					createSocketHandler();
				}
				incommingFrames = 0;
			}, 5000);
		});

	});
}

//create the initial socket connection
createSocketHandler();
