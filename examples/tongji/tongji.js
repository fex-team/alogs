void function(winElement, docElement){
    // 压缩代码相关
    /* compressor */

    var objectName = winElement.alogObjectName || 'alog';
    
    var alog = winElement[objectName] = winElement[objectName] || function(){
        winElement[objectName].l = winElement[objectName].l || +new Date;
        (winElement[objectName].q = winElement[objectName].q || []).push(arguments);
    };

    winELement._hmt = winELement._hmt || [];

    function addScript(url, callback) {
        var script = docElement.createElement("script"),
            scriptLoaded = 0;
         
        // IE和opera支持onreadystatechange
        // safari、chrome、opera支持onload
        script.onload = script.onreadystatechange = function () {
            // 避免opera下的多次调用
            if (scriptLoaded) {
                return;
            };
             
            var readyState = script.readyState;
            if ('undefined' == typeof readyState
                || readyState == "loaded"
                || readyState == "complete") {
                scriptLoaded = 1;
                try {
                    callback();
                } finally {
                    script.onload = script.onreadystatechange = null;
                    script.parentNode.removeChild(script);
                }
            }
        };

        script.asyn = 1;
        script.src = url;
        var lastScript = docElement.getElementsByTagName("script")[0];
        lastScript.parentNode.insertBefore(script, lastScript);
    }
    var trackerName = 'tongji';
    alog('define', trackerName, function(){
        var tracker = alog.tracker(trackerName);
        tracker.create({
            postUrl: null
        });
        addScript( "//hm.baidu.com/hm.js?" + tracker.get('id'), function() {
            console.log('hello world.');
        });
        return tracker;
    });
    
}(window, document);