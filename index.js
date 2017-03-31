var mysql = require('mysql');
var connection = mysql.createConnection({
        host: '192.168.0.100',
        user: 'reddit',
        password: 'reddit',
        database: 'reddit'
});

var WebSocket = require('ws');
var ws = new WebSocket('<<WEBSOCKET URL>');

connection.connect();


ws.on('message', function(input) {
        var d = new Date();
        var message = JSON.parse(input).payload;
        console.dir(message);
        if(message.x && message.y && message.author && message.color) {
        var query = "INSERT INTO place (x, y, username, colour, time) VALUES (" + message.x + "," + message.y + ",'" + message.author + "'," + message.color + ",'" + d.getTime() + "');";
        connection.query(query);
        }
});
