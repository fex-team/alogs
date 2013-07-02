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
   * [基础ALog模块](#5-1-)
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
+ 页面加载ALog

		<script>
		void function(e,t,n,a,o,i,m){
		e.alogObjectName=o,e[o]=e[o]||function(){(e[o].q=e[o].q||[]).push(arguments)},e[o].l=e[o].l||+new Date,i=t.createElement(n),i.asyn=1,i.src=a,m=t.getElementsByTagName(n)[0],m.parentNode.insertBefore(i,m)
		}(window,document,"script","http://uxrp.github.io/alog/dist/alog.min.js","alog");
		</script>

##5. API文档

####ALog概述
ALog分为基础ALog模块和Tracker(追踪器)模块。

* 基础ALog模块: 负责调用和处理各个模块的操作，并对其进行管理。
* Tracker模块: 每个统计模块都会有一个Tracker，Tracker本身包含了一些方法，用来做各个模块的基本任务.

###5-1. 基础ALog模块

####5-1-1. ALog执行方法：alog(trackerMethod, params)

	/**
	 * 执行
	 * @param{String} trackerMethod 追踪器的方法 "<trackerName>.<method>"
	 * @param{Object} params 方法
	 */
	alog('pv.send', 'pageview');

####5-1-2. ALog模块定义define：alog('define', 'moduleName', requires, dealFunc)

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

####5-1-3. ALog模块引用require：alog('require', ['module1', 'module2'], callback)

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

####5-1-4. ALog获取/创建追踪器: alog.tracker(moduleName)
	/**
	 * 获取/创建追踪器
	 * @param{String}[optional] moduleName 模块名
	 */
	 //获取alog的tracker
	 alog.tracker();
	 alog.tracker('default');
	 //获取pv模块的tracker
	 alog.tracker('pv');


###5-2. ATracker模块
Tracker模块的方法调用有两种方法：

1. 同步方法: moduleTracker.method(params)
		
		alog('require', ['module'], function(moduleTracker){
			var btn = document.getElementById('btn');
			btn.onclick = function(){
				moduleTracker.send('event', {
					type: 'click',
					target: btn,
					val: btn.value
				});
			}
		});

2. 异步方法: alog('moduleTracker.method', params)
		
		var btn = document.getElementById('btn');
		btn.onclick = function(){
			alog('module.send', 'event', {
				type: 'click',
				target: btn,
				val: btn.value
			});
		}

上述两种方法都可以做到统计ID为btn的元素点击，并上报记录，但区别是：

* 同步方法会在模块加载完，才开始绑定点击事件，所以可能会丢失加载前的点击。同步方法适合用户模块定义内部。
* 异步方法在执行代码后生效，如果使用的模块还没加载完，会先放到事件队列里，等模块加载完成后，会自动执行事件队列里的时间

####5-2-1. Tracker创建追踪器create
####两种方法
* moduleTracker.create(fields) 同步方法(Sync)
* alog('module.create', fields) 异步方法(Async)

		/**
		 * 创建追踪器实例
		 * @param{String} 'module.create' 模块创建追踪器实例
		 * @param{Object} fields 字段对象
		 */
		alog('pv.create', {
		  postUrl: 'http://localhost/u.gif'
		});

####5-2-1. Tracker设置上报字段set
####两种方法
* moduelTracker.set([name, ]value) 同步方法(Sync)
* alog('module.set', [name, ]value) 异步方法(Async)

		/**
		 * 设置上报字段值
		 * @param{String} 'module.set'
		 * @param{String}[optional] name 字段名
		 * @param{String|Object} value 字段值 
		 */
		 //name, value
		 alog('pv.set', 'page', 'hunter-index');
		 //value object
		 alog('pv.set', {'page', 'hunter-index'});

####5-2-2. Tracker获取上报字段值get
####两种方法
* moduleTracker.get(name, callback) 同步方法(Sync)
* alog('module.get', name, callback) 异步方法(Async)

		/**
		 * 获取上报字段值
		 * @param{String} 'module.get'
		 * @param{String} name 字段名
		 * @param{Function} callback 回调函数
		 */
		 alog('pv.get', 'page', function(page){
		 	alert(page);
		 });

####5-2-3. Tracker上报数据send
####两种方法
* moduleTracker.send(dataType, fields) 同步方法(Sync)
* alog('module.send', dataType, fields) 异步方法(Async)

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
 
####5-2-4. Tracker绑定事件on
####两种方法
* moduleTracker.on(eventName, dealFunc) 同步方法(Sync)
* alog('module.on', eventName, dealFunc) 异步方法(Async)

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

绑定事件

####5-2-5. Tacker注销事件un
####两种方法
* moduleTracker.un(eventname, dealFunc) 同步方法(Sync)
* alog('module.un', eventName, dealFunc) 异步方法(Async)

		/**
		 * 注销事件
		 * @param{String} 'module.on'
		 * @param{String} eventName 事件名称
		 * @param{Function} dealFunc 处理函数
		 */
		 alog('pv.un', 'report', dealFunc);
 
####5-2-6. Tracker派发事件fire
####两种方法
* moduleTracker.fire(eventname) 同步方法(Sync)
* alog('module.fire', eventName) 异步方法(Async)

		/**
		 * 派发事件
		 * @param{String} 'module.fire'
		 * @param{String} eventName 事件名称
		 */
		 alog('pv.fire', 'report', {type: "pageview", title: "Hunter首页"});

###5-3. 保留字段
* 上报地址：postUrl
* 引用模块配置: alias
* 协议字段，用于简写: protocolParameter

###5-4. Tracker标准事件(自定义方法)
Tracker标准事件是指可通过alog('module.on', '标准事件名', dealFunc)的方法自定义处理函数，
当模块的tracker执行标准事件时，会自动调用自定义方法。(module.fire('标准事件名', data))

* 追踪器创建时触发: create

		/**
		 *  可用来设置一些页面统一变量
		 */
		 alog('module.on', 'create', function(){
		 	moduleTracker.set({
		 		pageId: 'hunter-index',
		 		title: 'Hunter首页'
		 	});
		 });

* 数据上报时派发: send

		/**
		 * 可用来修改ALog默认上报字段
		 */
		alog('module.on', 'send', function(data){
			data.t = data.title;
			delete data.title;
			data.r = data.refer;
			delete data.refer;
		});

##6. 参考文档

google analytics https://developers.google.com/analytics/devguides/platform/

