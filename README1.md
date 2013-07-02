% ALog 文档
% wangjihu zhaoshuang
% 2013-07-01

ALog
=======

##内容导航
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
只需Require对应的模块，即可添加其统计

##3. ALog适合什么应用场景？

###3-1. 简单统计

直接在页面中调用

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
e.alogObjectName=o,e[o]=e[o]||function(){(e[o].q=e[o].q||[]).push(arguments)},e[o].l=e[o].l||+new Date,i=t.createElement(n),i.asyn=1,i.src=a,m=t.getElementsByTagName(n)[0],m.parentNode.insertBefore(i,m)
}(window,document,"script","http://uxrp.github.io/alog/dist/alog.min.js","alog");
</script>
```

##5. API文档

####ALog概述
ALog分为基础ALog模块和Tracker(追踪器)模块。每个统计模块都会有一个Tracker，Tracker本身包含了一些方法，用来做各个模块的基本任务；基础Alog模块负责调用和处理各个模块的操作，并对其进行管理。

###5-1. ALog模块

####5-1-1. ALog执行方法：alog(trackerMethod, params)

```javascript
/**
 * 执行
 * @param{String} trackerMethod 追踪器的方法 "<trackerName>.<method>"
 * @param{Object…} params 方法
 */
alog('pv.send', 'pageview');
```

####5-1-2. ALog模块定义define：alog('define', 'moduleName', requires, dealFunc)

```javascript
/**
 * 定义模块
 * @param{String} 'define'
 * @param{String} moduleName 模块名
 * @param{Array}[optional] requires 依赖模块名
 * @param{Function} dealFunc 处理函数
 */
alog('define', 'pv', function(){
   var pvTracker = alog.tracker('pv');
   pvTracker.set('ver', 1);
   pvTracker.set('px', window.screen.width + 'x' + window.screen.height);
   return pvTracker;
});
```

####5-1-3. ALog模块引用require：alog('require', ['module1', 'module2'], callback)

```javascript
/**
 * 引用模块
 * @param{String} 'require'
 * @param{Array} 引用的模块
 * @param{Function} callback 回调函数
 */
alog('require', ['pv'], function(pvTracker){
  pvTracker.create({
    postUrl: 'http://localhost/u.gif'
  });
});
```

####. ALog获取/创建追踪器: alog.tracker(moduleName)
```javascript
/**
 * 获取/创建追踪器
 * @param{String}[optional] moduleName 模块名
 */
 //获取alog的tracker
 alog.tracker('default');
 alog.tracker();
 //获取pv模块的tracker
 alog.tracker('pv');
```

####5-1-4. ALog模块绑定事件on：alog.on([element, ]'eventName', dealFunc)

```javascript
/**
 * 绑定事件
 * @param{Element}[optional] element 元素
 * @param{String} eventName 绑定的绑定名称
 * @param{Function} dealFunc 处理函数
 */ 
//自定义事件
function dealClick(e){
  var target = e.target || e.srcElement,
  	  	text = target.innerText || target.textcontent,
  	  	data = e.data;
  	data.target = data.target || target;
  	data.text = data.text || text;
  	alog('default.send', 'event', data);
}
alog.on('click', dealClick);
//DOM事件
function dealBtnClick(){
	alert('click me!');
}
alog.on(document.getElementById("btn"), 'click', dealBtnClick);
```
####5-1-4. ALog模块注销事件un：alog.un([elment, ]'eventName', dealFunc)

```javascript
/**
 * 注销事件
 * @param{Element}[optional] element 元素
 * @param{String} eventName 解绑的事件名称
 * @param{Function} dealFunc 之前绑定事件的函数
 */
//自定义事件注销
alog.un('click', dealClick);
//DOM事件注销
alog.un(document.getElementById("btn"), 'click', dealBtnClick);
```

####5-1-5. ALog派发事件fire: alog.fire('eventName')
```javascript
/**
 * 派发事件
 * @param{String} eventName 事件名称
 */
alog.fire('click', {target: document.getElementById('btn'), data: {}});
```

派发事件

###5-2. ATracker模块

####5-2-1. Tracker创建追踪器create
####两种方法
* moduleTracker.create(fields)
* alog('module.create', fields)

```javascript
/**
 * 创建追踪器实例
 * @param{String} 'module.create' 模块创建追踪器实例
 * @param{Object} fields 字段对象
 */
alog('pv.create', {
  postUrl: 'http://localhost/u.gif'
});
```

####5-2-1. Tracker设置字段set
####两种方法
* moduelTracker.set([name, ]value)
* alog('module.set', [name, ]value)

```javascript
/**
 * 设置字段值
 * @param{String} 'module.set'
 * @param{String}[optional] name 字段名
 * @param{String|Object} value 字段值 
 */
 //name, value
 alog('pv.set', 'page', 'hunter-index');
 //value object
 alog('pv.set', {'page', 'hunter-index'});
```

####5-2-2. Tracker获取字段值get
####两种方法
* moduleTracker.get(name, callback)
* alog('module.get', name, callback)

```javascript
/**
 * 获取字段值
 * @param{String} 'module.get'
 * @param{String} name 字段名
 * @param{Function} callback 回调函数
 */
 alog('pv.get', 'page', function(page){
 	alert(page);
 });
```

####5-2-3. Tracker上报数据send
####两种方法
* moduleTracker.send(dataType, fields)
* alog('module.send', dataType, fields)

```javascript
/**
 * 上报数据
 * @param{String} 'module.send'
 * @param{String} dataType 数据类型
 * @param{Object} fields 上报数据
 */
 alog('pv.send', 'pageview', {
 	'page': 'hunter-index',
 	'title': 'Hunter首页'
 });
```

####5-2-4. Tracker绑定事件on
####两种方法
* moduleTracker.on(eventName, dealFunc)
* alog('module.on', eventName, dealFunc)

```javascript
/**
 * 绑定事件
 * @param{String} 'module.on'
 * @param{String} eventName 事件名称
 * @param{Function} dealFunc 处理函数
 */
 function dealFunc(data){
 	if(data.type == "pageview"){
 		data.ref = document.referrer;
 	}
 }
 alog('pv.on', 'report', dealFunc);
```

绑定事件

####5-2-5. Tacker注销事件un
####两种方法
* moduleTracker.un(eventname, dealFunc)
* alog('module.un', eventName, dealFunc)

```javascript
/**
 * 注销事件
 * @param{String} 'module.on'
 * @param{String} eventName 事件名称
 * @param{Function} dealFunc 处理函数
 */
 alog('pv.un', 'report', dealFunc);
```

####5-2-6. Tracker派发事件fire
####两种方法
* moduleTracker.fire(eventname)
* alog('module.fire', eventName)

```javascript
/**
 * 派发事件
 * @param{String} 'module.fire'
 * @param{String} eventName 事件名称
 */
 alog('pv.fire', 'report', {type: "pageview", title: "Hunter首页"});
```

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

