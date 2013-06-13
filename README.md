alog
====

前端统计框架

## 概述

+ 一套前端采集统计数据的框架，支持异步上报和异步模块管理

+ 页面加载的方式

```html
<script>
void function(e,t,n,a,o,i,m){
e.alogObjectName=o,e[o]=e[o]||function(){(e[o].q=e[o].q||[]).push(arguments)},e[o].l=e[o].l||+new Date,i=t.createElement(n),i.asyn=1,i.src=a,m=t.getElementsByTagName(n)[0],m.parentNode.insertBefore(i,m)
}(window,document,"script","http://uxrp.github.io/alog/dist/alog.min.js","alog");
</script>
```
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
function record(e){
  
}
alog('speed.on', 'record', function(e){
  var buffer = this.get('buffer');
  buffer.push('e');
});
```

+ 事件派发

## 参考资料

google analytics https://developers.google.com/analytics/devguides/platform/
