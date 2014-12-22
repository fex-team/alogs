void
function(winElement, docElement) {
    // 压缩代码相关
    /* compressor */

    var objectName = winElement.alogObjectName || 'alog';

    var alog = winElement[objectName] = winElement[objectName] || function() {
        winElement[objectName].l = winElement[objectName].l || +new Date;
        (winElement[objectName].q = winElement[objectName].q || []).push(arguments);
    };

    winElement._hmt = winElement._hmt || [];

    function addScript(url, callback) {
        var script = docElement.createElement("script"),
            scriptLoaded = 0;

        // IE和opera支持onreadystatechange
        // safari、chrome、opera支持onload
        script.onload = script.onreadystatechange = function() {
            // 避免opera下的多次调用
            if (scriptLoaded) {
                return;
            };

            var readyState = script.readyState;
            if ('undefined' == typeof readyState || readyState == "loaded" || readyState == "complete") {
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
    alog('define', trackerName, function() {
        var tracker = alog.tracker(trackerName);
        addScript("http://hm.baidu.com/hm.js?" + tracker.get('id'), function() {
            tracker.create({
                postUrl: null
            });
            tracker.on('send', function(data) {
                if (window._hmt && (data.t == 'event' || data.hitType == 'event')) {
                    //http://tongji.baidu.com/open/api/more?p=guide_trackEvent
                    //category：要监控的目标的类型名称，通常是同一组目标的名字，比如"视频"、"音乐"、"软件"、"游戏"等等。该项必选。
                    //action：用户跟目标交互的行为，如"播放"、"暂停"、"下载"等等。该项必选。
                    //opt_label：事件的一些额外信息，通常可以是歌曲的名称、软件的名称、链接的名称等等。该项可选。
                    //opt_value：事件的一些数值信息，比如权重、时长、价格等等，在报表中可以看到其平均值等数据。该项可选。
                    window._hmt.push(['_trackEvent', data['eventCategory'], data['eventAction'] || '', data['eventLabel'] || 0]);
                }
            });
        });
        return tracker;
    });

}(window, document);
