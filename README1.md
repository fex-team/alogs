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

[API文档](./API.md)

##6. 参考文档

google analytics https://developers.google.com/analytics/devguides/platform/

