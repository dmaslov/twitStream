var express = require('express'),
    path = require('path'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server, {log: true}),
    cacheControl = {};

app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('partial', path.join(__dirname, 'views', 'partial'));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.compress());

app.configure('production', function(){
    cacheControl = {maxAge: 86400000};
})
.configure('development', function(){
    app.use(express.errorHandler());
});

app.use(express.static(path.join(__dirname, 'public'), cacheControl));


app.get('/', function(req, res){
    res.sendfile('index.html', {root: app.get('views')});
})
.get('/partial/:partialName', function(req, res){
    res.sendfile(req.params['partialName'], {root: app.get('partial')});
})
.get('*', function(req, res){
    res.redirect('/');
});

function StreamControl(socket, streamOptions){
    Twit = require('twit');
    twitConfig = require('./twit.json');

    this.stream = null;
    this.interval = null;
    this.timeout = null;
    this.pool = [];
    this.socket = socket;
    this.streamer = new Twit(twitConfig);
    this.streamOptions = streamOptions;

    this.start = function(){

        this.stream = this.streamer.stream('statuses/filter', this.streamOptions);

        (this.stream)
        .on('tweet', function (tweet) {
            (this.pool).push(tweet);

        }.bind(this))
        .on('connect', function () {

        })
        .on('connected', function () {
            (this.socket).emit('twitter.connected', {});

        }.bind(this))
        .on('reconnect', function (req, res, connectInterval) {
            (this.socket).emit('twitter.reconnecting', connectInterval);

        }.bind(this))
        .on('error', function (error) {
            console.log(error);
        });

        this.getFromPool();

        if(this.timeout !== null){
            clearTimeout(this.timeout);
        }
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
        if(this.stream !== null){
            (this.stream).stop();
            this.stream = null;
            this.pool = [];
            if(this.interval !== null){
                clearInterval(this.interval);
            }
        }
    };

    this.restart = function(){
        this.stop();
        this.timeout = setTimeout(function(){
            this.start();
        }.bind(this), 3000);
    };

    this.addChannel = function(channels){
        (this.streamOptions).track = channels;
    };

    this.log = function(){
        console.log(this.socket.id, this.streamOptions);
    };
}

io.sockets.on('connection', function (socket) {
    var stream = new StreamControl(socket, {track: ['Apple']});

    socket
    .on('disconnect', function(){

    })
    .on('addChanel', function(data){
        stream.addChannel(data.params);
        stream.restart();
    })
    .on('error', function(error){
        console.log(error);
        console.log(error.stack);
    });
});

process.on('uncaughtException', function (exception) {
    // handle or ignore error
    console.log(exception);
});

app.start = app.listen = function(){
    return server.listen.apply(server, arguments);
};
app.start(app.get('port'));
