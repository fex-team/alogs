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

* 简单统计: 直接在页面中调用，参看 [pv统计](https://github.com/uxrp/alog/tree/master/examples/pv)
* 复杂统计: 通过define定义统计模块，参看 [speed统计](https://github.com/uxrp/alog/tree/master/examples/speed)
* 代理统计: 接入第三方统计模块，参看 [百度统计](https://github.com/uxrp/alog/tree/master/examples/tongji)

##4. ALog入门

###4-1. 概念

###4-2. 准备工作
+ 页面加载ALog

		<script>
		void function(e,t,n,a,o,i,m){
		e.alogObjectName=o,e[o]=e[o]||function(){(e[o].q=e[o].q||[]).push(arguments)},e[o].l=e[o].l||+new Date,i=t.createElement(n),i.asyn=1,i.src=a,m=t.getElementsByTagName(n)[0],m.parentNode.insertBefore(i,m)
		}(window,document,"script","http://uxrp.github.io/alog/dist/alog.min.js","alog");
		</script>

###4-3. 开始ALog
* 不使用其他统计模块(参看[example-pv](https://github.com/uxrp/alog/tree/master/examples/pv))

		alog('pv.create', {
		    postUrl: 'http://localhost:8080/p.gif',
		    title: document.title
		});
		alog('pv.send', 'pageview');
		
说明：

1. 如果Tracker中没有该模块的tracker，ALog会自动为其创建tracker
2. tracker执行create后才会开始上报(send)数据
3. 采用异步调用模块的方法时，如果是on、un、set、get、create时，自动执行该方法；
   如果是send、fire方法，需要等待该tracker执行create方法后才会执行，否则会放在事件队列里，
   等待执行create方法后，会将事件队列里的时间顺序执行。
4. create的参数为内置配置参数，每次上报都会带上
5. pageview为默认支持参数，其他默认支持参数请参看[tracker.send](./API.md#5-2-3-trackersend)
	
所以如果pv.send和pv.create交换前后位置，那么pv.send将不执行，等pv.create执行后，才会执行之前的send、fire等方法。
			   
* 自定义模块(参看[example-speed](https://github.com/uxrp/alog/tree/master/examples/speed))

	1. 模块定义
		
			void function(winElement, docElement){
			
			    var objectName = winElement.alogObjectName || 'alog';
			    
			    var alog = winElement[objectName] = winElement[objectName] || function(){
			        winElement[objectName].l = winElement[objectName].l || +new Date;
			        (winElement[objectName].q = winElement[objectName].q || []).push(arguments);
			    };
			    
			    //模块名
			    var trackerName = 'speed';
			    
			    //ALog定义模块
			    alog('define', trackerName, function(){
			        //获取模块的tracker
			        var tracker = alog.tracker(trackerName);
			        
			        /**
			         * 该模块的统计功能
			         * 你可以的，靠你了~~
			         */

					...
			         
			    	return tracker;
			    });
			}(window, document);
	2. 引用模块
			
			//设置路径
			alog('set', 'alias', {
				module: 'module.js',//引用当前目录脚本
				hunter: 'http://hunter.baidu.com/hunter.js'//引用外部资源
			});
			
			//引用模块
			alog('require', ['module', 'hunter'], function(moduleTracker, hunterTracker){
				/**
				 * create可以在此处写，也可以写在模块定义里
				 * 写在这里可以添加一些变化的配置变量，你懂的~~~
				 */
				moduleTracker.XXX();
				hunterTracker.XXX();
			});
* 引用第三方统计模块(参看[examle-toji](https://github.com/uxrp/alog/tree/master/examples/tongji))

	1. 模块定义
	
			void function(winElement, docElement){
			
			    var objectName = winElement.alogObjectName || 'alog';
			    
			    var alog = winElement[objectName] = winElement[objectName] || function(){
			        winElement[objectName].l = winElement[objectName].l || +new Date;
			        (winElement[objectName].q = winElement[objectName].q || []).push(arguments);
			    };
	
				function addScript(url, callback) {
			        var script = docElement.createElement("script"),
			            scriptLoaded = 0;
			         
			        // IE和opera支持onreadystatechange
			        // safari、chrome、opera支持onload
			        script.onload = script.onreadystatechange = function () {
			            // 避免opera下的多次调用
			            if (scriptLoaded) {
			                return;
			            };
			             
			            var readyState = script.readyState;
			            if ('undefined' == typeof readyState
			                || readyState == "loaded"
			                || readyState == "complete") {
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
	
				//TODO::设置模块名
				var trackerName = 'module';
			    alog('define', trackerName, function(){
			        var tracker = alog.tracker(trackerName);
			        
			        ...
			        
			        /**
		        	 * *重要*，清空postUrl，该模块将不再上报ALog数据，第三方统计自动执行
		        	 */
		        	tracker.create({
		        		postUrl: null
		        	});
		        	
			        //加载第三方模块
			        //TODO::your job
			        addScript(url, callback);
			        
			        ...
			        
			        return tracker;
			    });
			}(window, document);
	2. 引用模块
	
			alog('set', 'alias', { module: 'module.js' });
			//设置内置变量，每次上报都会带此参数
			alog('module.set', 'id', '123');
			alog('require', 'module');
		
##5. API文档

####ALog概述
ALog分为基础ALog模块和Tracker(追踪器)模块。

* 基础ALog模块: 负责调用和处理各个模块的操作，并对其进行管理。
* Tracker模块: 每个统计模块都会有一个Tracker，Tracker本身包含了一些方法，用来做各个模块的基本任务.

[API文档](./API.md)

##6. 参考文档

google analytics https://developers.google.com/analytics/devguides/platform/

