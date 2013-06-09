void function(){
    
    var fs = require('fs');
    var path = require('path');
    var util = require('util');
    var inputFile = process.argv[2];
    var outputFile = process.argv[3];
    var names = process.argv[4];
    if (!inputFile || !outputFile) return;
    var content = String(fs.readFileSync(inputFile)).replace(/\r\n/ig, "\n");
    names = names.split(/[,|\s]+/);
    for (var i = names.length - 1; i >= 0; i--){
        var regex = eval("(" + 
            String(/[ \f\t\v]*\/\*\s*#name#\s+start\s*\*\/[\s\S]*?\/\*\s*#name#\s+end\s*\*\/[ \f\t\v]*/ig).replace(/#name#/g, names[i])
        + ")");
        content = content.replace(regex, '');
    }
    fs.writeFileSync(outputFile, content);    
}();