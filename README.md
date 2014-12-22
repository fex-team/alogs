alogs

=======

[![Build Status](https://img.shields.io/travis/fex-team/alogs/master.svg)](https://travis-ci.org/fex-team/alogs)
[![NPM version](https://img.shields.io/npm/v/alogs.svg)](http://badge.fury.io/js/alogs)

## 概述

alogs 是一个可以并行多个统计模块的框架

## 使用

### 安装

```
$npm install alogs
```

或者

```
$bower install alogs
```

### 引用

```html
<script>
void function(e,t,n,a,o,i,m){
  e.alogObjectName=o,e[o]=e[o]||function(){(e[o].q=e[o].q||[]).push(arguments)},e[o].l=e[o].l||+new Date,i=t.createElement(n),i.asyn=1,i.src=a,m=t.getElementsByTagName(n)[0],m.parentNode.insertBefore(i,m);
}(window,document,"script","../../alog.min.js","alog");
</script>
```

### 背景

我们会使用或开发各种不同的统计模块对产品的使用情况进行收集，以便衡量产品的健康状况和对产品发展方向进行决策

+ 随着前端交互越来越丰富，统计要分析的维度也越来越多样
+ 经常一个页面中就会并行着多个统计模块：有性能相关的、有点击相关的、有业务相关的
+ alogs 使用一些少量简单的 API 将这些复杂的统计模块统一组织起来

### 解决什么问题？

+ 减少统计模块加载对产品的影响

> alogs 使用异步方式加载统计模块，不堵塞页面正常资源加载；
> 另外值得一提的是，alogs 的模块文件不依赖加载顺序、兼容同步和异步加载。

+ 并行多个统计模块

### alogs 适合什么应用场景？

+ 简单统计

> 直接这页面中调用

+ 复杂统计

> 定义和业务紧密相关的复杂模块

### 代理统计

> 接入第三方统计模块
