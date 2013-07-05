ALog
=======

##内容导航
* [概述](#1-)
* [ALog解决什么问题？](#2-)
   * [减少统计模块加载对产品的影响](#2-1-)
   * [并行多个统计模块](#2-2-)
* [ALog应用场景+示例](#3-)
* [ALog入门](#4-)
   * [概念](#4-1-)
   * [准备工作](#4-2-)
   * [开始ALog](#4-3-)
* [API文档](#5-)
* [你不知道的ALog](#6-)
* [参考文档](#7-)
 
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

* 简单统计: pv统计，参看 [pv统计](https://github.com/uxrp/alog/tree/master/examples/pv)
* 复杂统计: 自定义模块统计，参看 [speed统计](https://github.com/uxrp/alog/tree/master/examples/speed)
* 代理统计: 接入第三方统计，参看 [百度统计](https://github.com/uxrp/alog/tree/master/examples/tongji)

##4. ALog入门

###4-1. 概念
* ALog代码中包含 **alog实例** 和 **Tracker(追踪器)类** 两部分
* 每个统计模块都需要创建一个 **tracker实例** (可以理解为一个统计模块就是一个tracker实例)，tracker负责该统计模块的 **各项基本配置**、 **数据采集** 和 **数据上报**
* **alog实例** 作为 **控制中心** ，统一管理各个tracker实例，
* 调用tracker自身函数的方法 (Tracker类的方法请参看[API-Tracker部分]())
	* 同步方法(Sync):  tracker.method(data)  ——  一般在模块定义内部使用
	* 异步方法(Async):  alog('trackerName.method', data)  ——  一般在模块外部使用

###4-2. 准备工作
+ 页面引入ALog代码

		<script>
		void function(e,t,n,a,o,i,m){
		e.alogObjectName=o,e[o]=e[o]||function(){(e[o].q=e[o].q||[]).push(arguments)},e[o].l=e[o].l||+new Date,i=t.createElement(n),i.asyn=1,i.src=a,m=t.getElementsByTagName(n)[0],m.parentNode.insertBefore(i,m)
		}(window,document,"script","http://uxrp.github.io/alog/dist/alog.min.js","alog");
		</script>

###4-3. 开始ALog
* 统计PV
		
		//简单统计，页面直接写统计代码
		//首先定义PV统计模块，此处的pv为moduleName
		alog('define', 'pv', function(){
			//此处的pv为trackerName，一般一个模块就是一个统计任务，
			//每个统计任务都需要有一个tracker用来上报数据
			//所以一般一个module就是一个tracker
			var pvTracker = alog.getTracker('pv');
			
			return pvTracker;
		});
		
		//引用PV统计模块
		alog('require', ['pv'], function(pvTracker){
			//开始统计，并设置上报地址
			pvTracker.start({
				postUrl: "http://localhost/v.gif"
			});
			
			//发送pv统计，send('pageview', [page[, title]])为默认支持格式
			pvTracker.send("pageview", 'http://www.baidu.com', '百度首页');
		});
		
================

* 统计页面链接点击

	第一步：定义统计模块
	
		//复杂统计，可以把模块定义写在一个文件里
		//定义Click统计模块，并保存为click.js
		void function(winElement, docElement){
				/*********ALog基本配置，照抄即可**********/
			    var objectName = winElement.alogObjectName || 'alog';
			    var alog = winElement[objectName] = winElement[objectName] || function(){
			        winElement[objectName].l = winElement[objectName].l || +new Date;
			        (winElement[objectName].q = winElement[objectName].q || []).push(arguments);
			    };
			    /************照抄结束*************/
			    
			    
			    //定义统计模块名
			    var trackerName = 'click';
			    
			    //定义统计模块
			    alog('define', trackerName, function(){
			        //获取模块的tracker
			        var tracker = alog.tracker(trackerName);
			        ...
			        addEvent(document, 'click', function(e){
			        	var target = e.target || e.srcElement,
			        		nodeName = target.nodeName.toLowerCase();
			        	/**
			        	 * 不要怀疑代码的真实性，
			        	 * 因为它就是假的。。。。
			        	 */
			        	if(nodeName === 'a'){
			        		var path = Path.getPath(target),
			        			url = target.getAttribute('href'),
			        			text = target.innerText || target.textContent;
			        			
			        		//tracker实例上报数据
			        		tracker.send('event', {
			        			type: 'click',
			        			path: path,
			        			url: url,
			        			text: text
			        		});
			        	}
			        });
			        ...
			    	return tracker;
			    });
			}(window, document);

	第二步：引用统计模块
	
			//设置统计模块路径，以执行代码的页面为基础
			alog('set', 'alias', {
				'click', './click.js'
			});
			
			//引用模块
			alog('require', ['click'], function(clickTracker){
				//开始统计，设置上报地址
				//同时指出当前页面地址和标题，用于区分页面
				clickTracker.start({
					postUrl: 'http://localhost/v.gif',
					page: location.href,
					title: document.title
				});
			});

===============

* 其他统计示例
	* [example-pv](https://github.com/uxrp/alog/tree/master/examples/pv) 未创建tracker，特殊用法，参看 [你不知道的ALog]()
	* [example-speed](https://github.com/uxrp/alog/tree/master/examples/speed)
	* [examle-tongji](https://github.com/uxrp/alog/tree/master/examples/tongji) 


##5. API文档
[API文档](./API.md)

##6. 你不知道的ALog
1. 必须要定义模块才能使用么？
	
		不是的，就像example-pv里的代码所写，下面几行代码已经完成了PV统计，简单吧:)
		alog('pv.start', {
			postUrl: 'http://localhost/v.gif'
		});
		alog('pv.send', 'pageview');
		当调用alog('trackerName.method')时，如果发现没有trackerName，
		那么会自动创建一个tracker，名为trackerName
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



##7. 参考文档

google analytics https://developers.google.com/analytics/devguides/platform/

