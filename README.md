ALog
=======

## 内容导航
 * [概述](#1-)
 * [ALog解决什么问题？](#2-)
    * [减少统计模块加载对产品的影响](#2-1-)
    * [并行多个统计模块](#2-2-)
 * [ALog适合什么应用场景？](#3-)
    * [简单统计](#3-1-)
    * [复杂统计](#3-2-)
    * [代理统计](#3-3-)
 * [ALog入门](#4-)
    * [概念](#4-1-)
    * [准备工作](#4-2-)
 * [API文档](#5-)
    * [ALog模块](#5-1-)
    * [ATracker模块](#5-2-)
    * [保留字段](#5-3-)
 * [参考文档](#6-)

##1. 概述
我们会使用或开发各种不同的统计模块对产品的使用情况进行收集，以便衡量产品的健康状况和对产品发展方向进行决策

随着前端交互越来越丰富，统计要分析的维度也越来越多样

经常一个页面中就会并行着多个统计模块：有性能相关的、有点击相关的、有业务相关的

ALog使用一些少量简单的API将这些复杂的统计模块统一组织起来


##2. ALog解决什么问题？

###2-1. 减少统计模块加载对产品的影响

ALog使用异步方式加载统计模块，不堵塞页面正常资源加载；

另外值得一提的是，ALog的模块文件不依赖加载顺序、兼容同步和异步加载。

###2-2. 并行多个统计模块

##3. ALog适合什么应用场景？

###3-1. 简单统计

直接这页面中调用

###3-2. 复杂统计

通过define定义统计模块

###3-3. 代理统计

接入第三方统计模块

##4. ALog入门

###4-1. 概念

###4-2. 准备工作
+ 页面加载的方式

```html
<script>
void function(e,t,n,a,o,i,m){
e.alogObjectName=o,e[o]=e[o]||function(){(e[o].q=e[o].q||[]).push(arguments)},e[o].l=e[o].l||+new Date,i=t.createElement(n),i.async=!0,i.src=a,m=t.getElementsByTagName(n)[0],m.parentNode.insertBefore(i,m)
}(window,document,"script","http://uxrp.github.io/alog/dist/alog.min.js","alog");
</script>
```

##5. API文档

###5-1. ALog模块

####5-1-1. alog()

```javascript
/**
 * 执行
 * @param{String} trackerMethod 追踪器的方法 "<trackerName>.<method>"
 * @param{Object…} params 方法
 */
function alog(trackerMethod, params)
```

####5-1-2. define()

```javascript
alog('define', 'pv', function(){
   var pvTracker = alog.tracker('pv');
   pvTracker.set('ver', 1);
   pvTracker.set('px', window.screen.width + 'x' + window.screen.height);
   return pvTracker;
});
```

####5-1-3. require()

```javascript
alog('require', ['pv'], function(pvTracker){
  pvTracker.create({
    postUrl: 'http://localhost/u.gif'
  });
});
```

####5-1-4. on()

绑定事件

```javascript
function record(e){
 
}
alog('speed.on', 'record', function(e){
  var buffer = this.get('buffer');
  buffer.push('e');
});
```
####5-1-4. un()

注销事件

####5-1-5. fire()

派发事件

###5-2. ATracker模块

####5-2-1. create()

创建追踪器实例

```javascript
alog('pv.create', {
  postUrl: 'http://localhost/u.gif'
});
alog('pv.send', 'pageview');

```

####5-2-1. set()

设置字段值

####5-2-2. get()

获取字段值

####5-2-3. send()

上报数据

####5-2-4. on()

绑定事件

####5-2-5. un()

注销事件

####5-2-6. fire()

派发事件

###5-3. 保留字段

####5-3-1. postUrl

上报地址

####5-3-2. protocolParameter

协议字段，用于简写

###5-4. 标准事件

####5-4-1. create

追踪器创建时触发

####5-4-2. send

数据上报时派发

##6. 参考文档

google analytics https://developers.google.com/analytics/devguides/platform/
