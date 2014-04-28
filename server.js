/**
 * Module dependencies.
 */

var express = require('express'),
    path = require('path'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server, {log: true});

app.configure(function(){
    app.set('port', process.env.PORT || 8080);
    app.set('views', __dirname + '/views');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(redirectUnmatched);
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

function redirectUnmatched(req, res) {
  res.redirect('/');
}

app.get('/', function(req, res){
    res.sendfile('index.html', {root: app.get('views')});
});

function StreamControl(socket, streamOptions){
    Twit = require('twit');
    twitConfig = require('./twit.json');

    this.stream = null;
    this.interval = null;
    this.pool = [];
    this.socket = socket;
    this.streamer = new Twit(twitConfig);
    this.streamOptions = streamOptions;

    this.start = function(){

        this.stream = this.streamer.stream('statuses/filter', this.streamOptions);
        (this.stream).on('tweet', function (tweet) {
          (this.pool).push(tweet);
        }.bind(this));
        this.getFromPool();

    };

    this.getFromPool = function(){
        this.interval = setInterval(function(){
            var tweet = (this.pool).shift();
            if(typeof tweet != 'undefined'){
                (this.socket).emit('news', tweet);
            }
        }.bind(this), 5000);
    };

    this.stop = function(){
        if(this.stream){
            (this.stream).stop();
            this.pool = [];
            clearInterval(this.interval);
        }
    };

    this.restart = function(){
        this.stop();
        this.start();
    };

    this.addChannel = function(channels){
        (this.streamOptions).track = channels;
    };

    this.log = function(){
        console.log(this.socket.id, this.streamOptions);
    };
}

io.sockets.on('connection', function (socket) {
    var streamOptions = {
        track: ['#Apple']
    };
    var stream = new StreamControl(socket, streamOptions);
    stream.start();

    socket.on('disconnect', function(){

    }).on('addChanel', function(data){
        stream.addChannel(data.channels);
        stream.restart();
    });
});

app.start = app.listen = function(){
    return server.listen.apply(server, arguments);
};
app.start(app.get('port'));
