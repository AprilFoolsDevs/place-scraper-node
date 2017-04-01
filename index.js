var WebSocket = require('ws');
var cheerio = require('cheerio');
var request = require('request');
var mysql = require('mysql');
var connection = mysql.createConnection({
	host: '192.168.0.100',
	user: 'reddit',
	password: 'redditsips',
	database: 'reddit'
});
connection.connect();

request('https://reddit.com/place', function (error, response, body) {
	var $ = cheerio.load(body);
	//Get the config in the HTML
	//Cut 8 from front, 1 from end
	//Parse this as JSON
	//Find the websocket URL and set it as wsurl
	wsurl = JSON.parse($('#config').text().slice(0,-1).substring(8)).place_websocket_url;
	console.log(wsurl);
	var ws = new WebSocket(wsurl);

	ws.on('message', function(input) {
		var d = new Date();
		var message = JSON.parse(input).payload;
		console.dir(message);
		if((message.x || message.x === 0) && (message.y || message.y === 0) && message.author && (message.color || message.color === 0)) {
			var query = "INSERT INTO place (x, y, username, colour, time) VALUES (" + message.x + "," + message.y + ",'" + message.author + "'," + message.color + ",'" + d.getTime() + "');";
			connection.query(query);
		}
	});
});
