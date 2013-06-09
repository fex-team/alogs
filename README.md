alog
====

前端统计框架

## 概述

+ 一套前端采集统计数据的框架，支持异步上报和异步模块管理

## 主要功能

### 异步上报

```javascript
alog('pv.create', {
  postUrl: 'http://localhost/u.gif'
});
alog('pv.send', 'pageview');
```
### 异步加载模块

+ 模块定义

```javascript
alog('define', 'pv', function(){
   var pvTracker = alog.tracker('pv');
   pvTracker.set('ver', 1);
   pvTracker.set('px', window.screen.width + 'x' + window.screen.height);
   return pvTracker;
});
```

+ 模块引用

```javascript
alog('require', ['pv'], function(pvTracker){
  pvTracker.create({
    postUrl: 'http://localhost/u.gif'
  });
});
```

### 事件管理

+ 事件绑定和注销

```javascript
alog('pv.on', 'send', function(data){
  data.uid = $.cookie('userid');
});
```

+ 事件派发

```javascript
alog('pv.fire', 'record', 'click, new Date);
alog('pv.on', 'record', function(event, time){
  console.log(event, time);
});
```

## 参考资料

google analytics https://developers.google.com/analytics/devguides/platform/
