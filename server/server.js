var express = require('express'),
    app = express(),
    http = require('http'),
    server, io;

app.get('/', function(req, res) {
    res.sendFile(__dirname, + 'index.html');
});

server = http.Server(app);
server.listen(5000);

// https://stackoverflow.com/questions/24058157/socket-io-node-js-cross-origin-request-blocked
io = require('socket.io')(server, {
    cors: {
      origin: '*',
    }
  });

var players = {}, unmatched;

function joinGame (socket) {

    players[socket.id] = {

        opponent: unmatched,

        symbol: 'X',

        socket: socket
    };

    if (unmatched) {
        players[socket.id].symbol = 'O';
        players[unmatched].opponent = socket.id;
        unmatched = null;

    } 
    else {
        unmatched = socket.id;
    }
}

function getOpponent (socket) {
    if (!players[socket.id].opponent) {
        return;
    }

    return players[players[socket.id].opponent].socket;
}

io.on('connection', function (socket) {

    joinGame(socket);

    if (getOpponent(socket)) {
        socket.emit('game.begin', {
            symbol: players[socket.id].symbol
        });

        getOpponent(socket).emit('game.begin', {
            symbol: players[getOpponent(socket).id].symbol
        });
    }

    socket.on('make.move', function (data) {
        if (!getOpponent(socket)) {
            return;
        }

        console.log(data);

        socket.emit('move.made', data);
        getOpponent(socket).emit('move.made', data);
    });

    socket.on('disconnect', function () {
        if (getOpponent(socket)) {
            players[getOpponent(socket).id].opponent = undefined;
            getOpponent(socket).emit('opponent.left');
        }
        if(unmatched === socket.id) {
            unmatched = undefined;
        }
        console.log(delete players[socket.id]);
     });
});