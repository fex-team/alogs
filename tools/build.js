void function(){
    
    var fs = require('fs');
    var path = require('path');
    var util = require('util');
    var inputFile = process.argv[2];
    var outputFile = process.argv[3];
    var wrap = process.argv[4];
    if (!inputFile || !outputFile) return;
    var body = String(fs.readFileSync(inputFile))
        .replace(/\r\n/g, '\n')
        .replace(/[ \f\t\v]*\/\*\s*debug\s+start\s*\*\/[\s\S]*?\/\*\s*debug\s+end\s*\*\/[ \f\t\v]*/ig, "")
        .replace(/[ \f\t\v]*\/\*\s*background\s+start\s*\*\/[\s\S]*?\/\*\s*background\s+end\s*\*\/[ \f\t\v]*/ig, "")
        .replace(/\/\*(?!\s*compressor)[\s\S]*?\*\//ig, "\n") // 注释
    if (wrap == 'wrap'){
        body = body.replace(/\/\*[\s\S]*?\*\//ig, "\n");
        body = 'void function(){\n\
/* compressor */\n\
' + body + '\n\
        }()';
    }
    var dict = {};
    
    body
        .replace(/([+\s()\[\]]+)(Math|parseInt|encodeURIComponent)\b/g, function(all, space, word){
        if (dict[word]){
            dict[word]++;
        } else {
            dict[word] = 1;
        }
    });
    
    var var_list = [], var_dict = {};
    for (var key in dict){
        // 原始长度 key.length * dict[key]
        // 替换后长度 2 * (dict[key] - 1)
        if (key.length * dict[key] > 2 * dict[key] + key.length){
            var alias = util.format('var_alias_%s', key);
            var_list.push(util.format('%s=%s', alias, key));
            var_dict[key] = alias;
        }
        
    }
    
    body.replace(/\.([a-z]\w*)(?!\w*['"])/ig, function(key){
        if (dict[key]){
            dict[key]++;
        } else {
            dict[key] = 1;
        }
    });
    //*
    var prop_dict = {};
    var str_dict = {};
    for (var key in dict){
        if (var_dict[key]) continue;
        // 原始长度 key.length * dict[key]
        // 替换后长度 3 * dict[key] + key.length
        if (key.length * dict[key] > 3 * dict[key] + key.length){
            var alias = util.format('prop_alias_%s', key.substr(1));
            var_list.push(util.format('%s="%s"', alias, key.substr(1)));
            if (str_dict[key]){
                str_dict[key] ++;
            } else {
                str_dict[key] = 1;
            }
            prop_dict[key] = '[' + alias + ']';
        }
    }
    body.replace(/("|')(\w+)(\1)/g, function(all, $1, key, $2){
        key = '.' + key;
        if (str_dict[key]){
            str_dict[key]++;
        } else {
            str_dict[key] = 1;
        }
    });
    
    for (var key in str_dict){
        if (var_dict[key]) continue;
        if (str_dict[key] < 2) continue;
        var alias = util.format('prop_alias_%s', key.substr(1));
        if (!prop_dict[key]){
            var_list.push(util.format('%s="%s"', alias, key.substr(1)));
            prop_dict[key] = '[' + alias + ']';
        }
    }
    
    body = body
        .replace(/([+\s()\[\]]+)(window|document|Math|parseInt|encodeURIComponent)\b/g, function(all, space, word){
            return var_dict[word] ? space + var_dict[word] : all;
        })
        .replace(/("|')(\w+)(\1)/g, function(all, $1, key, $2){
            if (prop_dict['.' + key]){
                return prop_dict['.' + key].replace(/^\[|\]$/g, '');
            } else {
                return all;
            }
        })
        .replace(/\.([a-z]\w*)(?!\w*['"])/ig, function(key){
            return prop_dict[key] || key;
        })
        .replace(/\/\*\s*compressor\s*\*\//i, 
            'var\n        ' + var_list.join(',\n        ') + ';'
        );
    
    fs.writeFileSync(outputFile, body)
}();