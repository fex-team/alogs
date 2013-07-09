ALog
=======

##内容导航
* [什么是ALog?](#1-)
* [如何使用ALog?](#2-)
* [ALog API](#3-)
* [ALog进阶开发](#4-)
	* [基本概念](#4-1-)
	* [如何定义模块](#4-2-)
	* [注意事项](#4-3-)
* [ALog应用示例](#5-)
* [参考文档](#6-)
 
##1. 什么是ALog ?
ALog(all log)是前端数据采集的统一解决方案。

##2. 如何使用ALog ?
1. 页面引入ALog

		<script>
		void function(e,t,n,a,o,i,m){
		e.alogObjectName=o,e[o]=e[o]||function(){(e[o].q=e[o].q||[]).push(arguments)},e[o].l=e[o].l||+new Date,i=t.createElement(n),i.asyn=1,i.src=a,m=t.getElementsByTagName(n)[0],m.parentNode.insertBefore(i,m)
		}(window,document,"script","http://uxrp.github.io/alog/dist/alog.min.js","alog");
		</script>

2. 加载你需要的模块并初始化
		
		//设置使用模块的路径
		alog('set', 'alias', {
			//以当前页面为基准，如不设置，默认引用./moduleName.js
			moduleName: modulePath
		});
		
		//require你需要的模块
		alog('require', moduleName);
		
**注：对于有些统计模块，各个页面的统计配置项会有差别，对于这种模块，无法统一写在模块定义中，所以需要在引用的时候初始化。**
		
		alog('require', [moduleName], function(module){
		
			//设置模块上报地址&采集配置信息
			module.start({
				postUrl: 'http://localhost/x.gif',
				pv: 0, //不采集PV
				click: 1 //采集元素点击
			});
		});

**如果你要做的只是引用现有的模块，那么你需要了解的就到此就结束了。**

=======================
=======================

**如果你想开发自己的统计模块，那么请跟我继续。**


##3. ALog API
[API文档](./API.md)

##4. ALog进阶开发
###4.1 基本概念
* ALog代码中包含 **alog实例对象** 和 **Tracker(追踪器)类** 两部分
* 每个统计模块都需要创建一个 **tracker实例** ，tracker负责该统计模块的 **各项基本配置(set, get方法)**、 **数据采集(on, un, fire方法)** 和 **数据上报(report方法)**
* **alog实例对象** 作为 **控制中心** ，统一管理各个tracker实例，
* tracker的方法调用方式
	* 同步方法(Sync):  tracker.method(data)  ——  一般在模块定义内部使用
	* 异步方法(Async):  alog('trackerName.method', data)  ——  一般在模块外部使用
	
###4.2 如何定义模块
如果我现在有这样一个统计需求：

这是一个用户体验调研的页面，用户可以通过设置字体、字体大小、行间距等选择自己喜欢的样式阅读文档，我想统计一下用户的设置情况。

我需要为他写个模块，命名为form.js

	void function(winElement, docElement){
		/****alog为异步加载，避免模块加载前未加载alog****/
		var objectName = winElement.alogObjectName || 'alog';
	    var alog = winElement[objectName] = winElement[objectName] || function(){
	        winElement[objectName].l = winElement[objectName].l || +new Date;
	        (winElement[objectName].q = winElement[objectName].q || []).push(arguments);
	    };
	
		//定义模块名、追踪器名
		var moduleName = trackerName = 'form';
		alog('define', moduleName, function(){
				//定义要采集的数据项
			var params = ['fontFamily', 'fontSize', 'lineHeight', 'lineWidth', 'paraHeight'],
				//获取一个自己的追踪器实例
				tracker = alog.getTracker(trackerName);
			
			//除了用户设置的信息，我还需要了解用户的设备情况
			//通过set，可以统一设置上报参数
			tracker.set({
				'clientWidth': docElement.clientWidth,
				'clientHeight': docElement.clientHeight
			});
				
			...
			//表单提交同时，上报数据
			addEvent(form, 'submit', function(data){
				...
				//验证数据
				...
				
				//收集采集信息
				var paramObj = {};
				params.forEach(function(item, index){
					paramObj[item] = data[item] || '';
				});
				
				//上报数据
				tracker.send('form', paramObj);
			});
			
			//对了，突然觉得我上报的字段有点长，如何缩短点呢
			//protocolParameter特定用法，用来转换上报参数，最后上报数据时执行
			tracker.set('protocolParameter', {
				'fontFamily': 'ff',
				'fontSize': 'fs',
				'lineHeight': 'lh',
				'lineWidth': 'lw',
				'paraHeight': 'ph'
			});

			//我又想在上报的时候，修改某些特定的值
			//send标准事件，会在tracker的send方法最后上报之前执行，此时protocolParameter还没有生效，
			tracker.on('send', function(data){
				if(data.fontSize == 'default'){
					data.fontSize = '12';
				}
				if(data.fontFamily == 'default'){
					data.fontFamily = '宋体';
				}
			});
			…
			
			//返回追踪器
			return tracker;
		});
	})(window, document);

OK，这样模块就定义好了，接下来如何引用该模块我想你懂的。

###4.3 注意事项
1. 必须要定义模块才能使用么？
	
		不是的，就像example-pv里的代码所写，下面几行代码已经完成了PV统计，简单吧:)
		alog('pv.start', {
			postUrl: 'http://localhost/v.gif'
		});
		alog('pv.send', 'pageview');
		当调用alog('trackerName.method')时，如果发现没有trackerName，
		那么会自动创建一个tracker，名为trackerName
		但是这种用法仅建议在做非常简单的统计时使用，否则建议使用模块定义的方法
2. 你以为不执行tracker.start就能上报么？
	
		这样是不行的
		因为tracker需要知道数据上报地址，一般在start方法中设置上报地址(postUrl)
		那么如果不执行tracker.start会有什么影响呢?
		* 同步方法调用send、fire，则直接return
		* 异步方法调用send、fire，则放在事件队列里，等待tracker执行start方法后，依次将事件队列里的方法执行
3. alog的define定义的是module，为啥返回的是tracker？module和tracker是什么关系？

		alog的define、require就是CommonJS规范里的定义和引用模块，
		只是因为每个统计模块都需要tracker，并return tracker，所以一个module可以是一个tracker实例，
		这可能会使你误解，但其实alog也是可以这样定义模块的
		alog('define', 'module', function(){
			var exports = {};
			...
			exports.on = function(){}
			exports.un = function(){}
			...
			return exports;
		});
4. 模块定义中Copy的这段代码是必须的么？
	
		var objectName = winElement.alogObjectName || 'alog';
	    var alog = winElement[objectName] = winElement[objectName] || function(){
	        winElement[objectName].l = winElement[objectName].l || +new Date;
	        (winElement[objectName].q = winElement[objectName].q || []).push(arguments);
	    };
	    
	    不是的。因为alog是异步加载的，有可能执行改代码时alog还没加载完，导致alog还不是一个函数而出错。
	    这里把调用alog的信息存储在一个队列里，待alog加载完成后，自动执行队列里的方法。
	    所以如果你把模块脚本和alog打包在一起的话，该段代码就可以不要了。
5. 我想要修改上报数据的字段名可不可以？

		protocolParameter —— 协议参数
		通过tracker的set方法设置
		tracker.set('protocolParameter', {
			"url": 'u',
			'title': 't'
		});


##5. ALog应用示例
* 简单统计: pv统计，参看 [pv统计](https://github.com/uxrp/alog/tree/master/examples/pv)
* 复杂统计: 自定义模块统计，参看 [speed统计](https://github.com/uxrp/alog/tree/master/examples/speed)
* 代理统计: 接入第三方统计，参看 [百度统计](https://github.com/uxrp/alog/tree/master/examples/tongji)


##6. 参考文档

google analytics https://developers.google.com/analytics/devguides/platform/

