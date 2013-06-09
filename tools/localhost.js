/**
 * @author 王集鹄(wangjihu，http://weibo.com/zswang)
 */
var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var util = require('util');

http.createServer(function(request, response){
    var urlInfo = url.parse(request.url, true);
    response.writeHead(200, {
        'Content-Type': 'text/javascript'
    });
    var filename = path.join('.', urlInfo.pathname), text = '';
    if (/\.js$/i.test(filename) && fs.existsSync(filename)){
        text = fs.readFileSync(filename);
    }
    response.end(text);
}).listen(process.argv[2] || "80");
