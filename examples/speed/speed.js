(function(winElement, docElement) {
    // 压缩代码相关
    /* compressor */

    var objectName = winElement.alogObjectName || 'alog';

    var alog = winElement[objectName] = winElement[objectName] || function() {
        winElement[objectName].l = winElement[objectName].l || +new Date;
        (winElement[objectName].q = winElement[objectName].q || []).push(arguments);
    };
    var trackerName = 'speed';
    alog('define', trackerName, function() {
        var tracker = alog.tracker(trackerName);
        var timestamp = alog.timestamp; // 获取时间戳的函数，相对于alog被声明的时间
        tracker.on('record', function(url, time) {
            var data = {};
            data[url] = timestamp(time);
            tracker.send('timing', data);
        });
        tracker.set('protocolParameter', {
            // 配置字段，不需要上报
            headend: null,
            bodyend: null,
            domready: null
        });
        tracker.create({
            postUrl: 'http://localhost:8080/t.gif'
        });
        tracker.send('pageview', {
            ht: timestamp(tracker.get('headend')),
            lt: timestamp(tracker.get('bodyend')),
            drt: timestamp(tracker.get('domready'))
        });
        return tracker;
    });

})(window, document);
