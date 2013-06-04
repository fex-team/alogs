void function(winElement, docElement){
    // 压缩代码相关
    /* compressor */

    var objectName = winElement.alogObjectName || 'alog';
    
    var alog = winElement[objectName] = winElement[objectName] || function(){
        winElement[objectName].l = winElement[objectName].l || +new Date;
        (winElement[objectName].q = winElement[objectName].q || []).push(arguments);
    };
    var trackerName = 'speed';
    alog('define', trackerName, function(){
        var tracker = alog.tracker(trackerName);
        var timestamp = alog.timestamp;
        tracker.set('protocolParameter', {
            headend: null,
            bodyend: null,
            domready: null
        });
        tracker.create({
            postUrl: 'http://localhost:8080/t.gif'
        });
        tracker.send('timing', {
            he: timestamp(tracker.get('headend')),
            be: timestamp(tracker.get('bodyend')),
            dr: timestamp(tracker.get('domready'))
        });
        return tracker;
    });
    
}(window, document);