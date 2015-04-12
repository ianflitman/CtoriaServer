/**
 * Created by ian on 11.04.15.
 */
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');

var http = require("http");
var url = require('url');

var videopath = '/home/ian/Documents/Jane/mp4/web/';

var writeFfmpegConcatFile = function(playlist){
    console.dir(playlist);
    var txtContent = "";
    for(var a =0; a < playlist.length; a++){
        txtContent += 'file   ' + '\'' + videopath + playlist[a] + '.mp4' +'\'' + '\n';
    }

    fs.writeFile('./concatFiles/concat.txt', txtContent, function(err,data){
        if(err)throw err;
        console.log('concat file created');
        createMovie()
    })
};

var createMovie = function(){

};

var app = express();
app.use(bodyParser.json());
app.post('/writeMovie', function(req,res){
        writeFfmpegConcatFile(req.body['playlist']);
        res.send("test");
    }
);

var server = app.listen(3333, function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log('Sample server listing at http://%s:%s', host, port);
});

app.get('/', function(req, res){
    res.send("Hello World, fuckers");
    res.status(res.status).send(res.body);

});

/*var server = http.createServer(app);


http.createServer(function(request, response) {
    response.writeHead(200, {"Content-Type": "text/plain"});

    response.write("Hello World");
    var reqResource = url.parse(request.url).pathname;
    response.write("\nResource: " + reqResource);
    response.write(request.headers.toString());
    var keyname = request.body.key;
    console.log(keyname);

    //response.write(request.body);
    response.end();
    console.log(request.headers);

}).listen(8899, '127.0.0.1');*/
