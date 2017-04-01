var WebSocket = require('ws');
var cheerio = require('cheerio');
var rp = require('request-promise');
var mysql = require('mysql');
var Promise = require("bluebird");
var fs = require("fs");

var conf = JSON.parse(fs.readFileSync("config.json"));

var connection = mysql.createConnection(conf);
connection.connect();

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

function isValidMessage(message){
	return ((message.x || message.x === 0) && (message.y || message.y === 0) && message.author && (message.color || message.color === 0));
}

function createSocketHandler(){

	getSocketURL()
	.then( (wsurl) => {
		var ws = new WebSocket(wsurl);
		console.log("Connecting to " + wsurl);
		ws.on('message', function(input) {
			var d = new Date();
			var message = JSON.parse(input).payload;

			if(isValidMessage(message)) {
				var query = "INSERT INTO place (x, y, username, color, time) VALUES (" + message.x + "," + message.y + ",'" + message.author + "'," + message.color + ",'" + d.getTime() + "');";
				connection.query(query);
			}

		});

		ws.on('close', function close() {
			console.log("We lost connection since the server was destroyed, let's reconnect :)");
			createSocketHandler();
		});

	});
}

createSocketHandler();
