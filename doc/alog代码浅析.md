alog详细解析
==============

## 前言

本文主要目的是降低阅读 alog 代码的难度，节省大家更多时间，因为看完这个文档的话对理解 alog 的实现还是有一定帮助的。当然，也欢迎各位大神从零探索，获取其中的乐趣

### 3个极为重要的 object：

之所以在开头点出，因为只有带着这 3 个 object，才能看懂 alog 代码中的大部分函数

```javascript
alog_listeners = {
	...
}
// alog_listeners 一个样例
alog_listeners['eventName'] = [
	callback1,
	callback2,
	//other callbacks
]


trackers = {
	...
}
// trackers 一个样例
trackers['trackerName'] = {
	name: 'trackerName',
	fields: {
        protocolParameter: {
            postUrl: null,
            protocolParameter: null
        },
        //other properties
    },
    argsList: [...],
    alog: $,
    //other properties
}

modules = {
	...
}
// modules 一个样例
modules['moduleName'] = {
	name: 'moduleName',
	requires: [...],
	creator: function(){...},
	defining: ture,
	defined: ture,
	instance: ...,
	waiting: {...}
}
```

### alog 的同步方法与异步方法的区别：

* 同步方法会在模块加载完，才开始绑定点击事件，所以可能会丢失加载前的点击。同步方法适合用户模块定义内部。
* 异步方法在执行代码后生效，如果使用的模块还没加载完，会先放到事件队列里，等模块加载完成并执行 create 方法后，会自动执行事件队列里的事件。

### alog 中 tracker 与 module 的区别与联系

虽然 tracker 和 module 看起来很相似，而且在定义 module 和创建 tracker 的时候，使用的都是同样的名称，但是它们还是不同的概念：
	
##### 1. module 不是必需的

当在执行的统计非常简单的时候，例如 PV 的统计，则可以完全不需要使用 module 而直接完成对应功能：

```javascript
alog('pv.create', {
    postUrl: 'http://localhost/v.gif'
});
alog('pv.send', 'pageview');
```

但是当需要进行一些复杂的统计时，例如 speed 统计、 exception 统计，则使用 module 会带来很大的方便。

而 tracker 是必需的， alog 通过 tracker 来进行 set 、 get 、 on 、 fire 、 send 等方法。

##### 2. 在 module 中调用 tracker

```javascript
alog('define', moduleName, function(){...});
```

function return 的可以是一个 tracker 实例， 而这个实例就会作为 module 的 instance 属性保存下来。而且在 module 中，实例 tracker 执行了各种需要的操作：

```javascript
alog('define', trackerName, function(){
    var tracker = alog.tracker(trackerName);
    var timestamp = alog.timestamp; // 获取时间戳的函数，相对于alog被声明的时间
    tracker.on('record', function(url, time){
        var data = {};
        data[url] = timestamp(time);
        tracker.send('timing', data);
    });
	tracker.set('protocolParameter', {
        // 配置字段，不需要上报
	    headend: null,
	    bodyend: null,
	    domready: null
	});
	tracker.create({
	    postUrl: 'http://localhost:8080/t.gif'
	});
	tracker.send('pageview', {
		ht: timestamp(tracker.get('headend')),
		lt: timestamp(tracker.get('bodyend')),
		drt: timestamp(tracker.get('domready'))
	});
	return tracker;
});
```

##### 3. 在 tracker 中加载 module

在函数 loadModules 中，通过 moduleName 获取对应的文件，这个操作则是保存在一个名为 'default' 的 tracker 的 fields 属性中，即会在 loadModules 操作之前执行对应的 set 操作：

```javascript

var modulesConfig = defaultTracker.get('alias') || {};
var scriptUrl = modulesConfig[moduleName] || (moduleName + '.js');


alog('set', 'alias', {
    speed: 'speed.js'
});
```


---

## 1. alog入口调用解析

在alog.js代码中，通过

```javascript
var objectName = winElement.alogObjectName || 'alog';
winElement[objectName] = $;
```

将外部的 alog 调用重定义到 $ 中，也就是实际上调用与 $ 相关的一些方法

接下来看看 alog 的一些常见的使用方式：

```javascript
alog.method(data);
alog('[trackerName.]method', data);
tracker.method(data);
```

### 第一种：

它会直接调用 alog.js 里对应的 `$.method(data);`

### 第二种：

在入口函数中

```javascript
$ = function(params) {
  ...
}
```

会判断传入的第一个参数 paramas 的内容，并调用对应的方法:

根据参数是 'define'、'require'、或者其它参数，来进行不同的处理：

```javascript
if (params == 'define' || params == 'require') {
  ...
}

if (typeof params == 'function') {
	params($);
    return;
}

String(params).replace(/^(?:([\w$_]+)\.)?(\w+)$/, function(all, trackerName, method) {
	args[0] = method; 
	command.apply($.tracker(trackerName), args);
});
```

### 第三种：

已经获得了一个 tracker 对象,例如：

```javascript
var tracker = alog.tracker(trackerName);
```

从而调用 alog.js 中 Tracker 的对应方法

##2. alog API方法

### 2-1 alog.method(data)

首先声明这种方式的调用不太多，大多都是调用 alog.tracker(trackerName) 来获得一个 tracker 对象

因为在 tracker.method(data) 这种方式的调用中包装了 alog.method(data) 的一些方法

#### 2-1-1 alog.tracker(trackerName)

该方法调用 alog.js 中的 getTracker 方法:

```javascript
$.tracker = getTracker;
```

然后根 据trackerName 的不同做出不同的处理：

##### 若trackerName为空

从当前 trackers 对象中，返回 trackers['default']
若 trackers['default'] 也为空，则新建一个 name='default' 的 tracker 对象并返回

##### 若trackerName = '*'

将 trackers 对象中的所有 tracker 对象 push 到一个数组中并返回

#####其它情况：

从当前 trackers 对象中，返回 trackers[trackerName]
若 trackers[trackerName] 也为空，则新建一个 name=trackerName 的 tracker 对象并返回

#### 2-1-2 alog.timestamp()

获取当前时间戳

#### 2-1-3 alog.on(element, eventName, callback)

##### 若element是字符串类型:

获取alog_listeners对象中key为element的数组(若未定义则初始化为[])

然后向alog_listeners[eventName]这个数组的最前面插入eventName

##### 其它：

对element这个元素监听事件eventName,回调函数为callback:

```javascript
if (element.addEventListener) {
  element.addEventListener(eventName, callback, false);
} else if (element.attachEvent) {
  element.attachEvent('on' + eventName, callback);
}
```

#### 2-1-4 alog.un(element, eventName, callback)

与on相反

#### 2-1-5 alog.fire(eventName)

首先尝试获取alog_listeners[eventName]这个数组
然后获取其它参数：

```javascript
var args = arguments;
for(var i = 1; i < args.length; i++){
	items.push(args[i]);
}
```

对于alog_listeners[eventName]这个数组的每个元素执行apply方法：

```javascript
listener = alog_listeners[eventName]
var i = listener.length;
	while (i--){
	if (listener[i].apply(this, items)){
		result++;
	}
}
```

### 2-2 tracker.method(data)

这种则是在代码中用的比较普遍的一种调用方式

#### 2-2-1 tracker.set(name, value)

若name的类型是string，则将tracker对象的fields属性的name属性，赋值为value：

```javascript
this.fields[name] = value;
```

若name=='protocolParameter',则value还要增添一些默认属性

若name的类型为object，则对name里的每一对key-value：
调用Tracker.prototype.set(key, value)

#### 2-2-2 tracker.get(name, callback)

获取该tracker的fields属性的name属性的值

若存在callback是函数类型的话,将上面的值传给这个callback函数并执行

#### 2-2-3 tracker.fire(eventName)

将该 tracker 的 name 值与 eventName 连接：

```javascript
var items = [this.name + '.' + eventName];
```

再获取其它参数,并调用alog.fire方法：

```javascript
fire.apply(this, items)
```

#### 2-2-4 tracker.on(eventName, callback)

```javascript
$.on(this.name + '.' + eventName, callback);
```

可参考 alog.on

#### 2-2-5 tracker.un(eventName, callback)

```javascript
$.un(this.name + '.' + eventName, callback);
```

可参考alog.un

#### 2-2-6 tracker.create(fields)

首先如果 fields 是一个 object 类型的话：

```javascript
this.set(fields);
```

可参考 tracker.set(name, value)

设置 created 标记：

```javascript
this.created = new Date;
```

调用 fire 方法

即获取 alog_listeners[this.name + '.create'] 中的每一个方法

把 tracker 自身作为参数传给这些方法，并运行该方法：

```javascript
this.fire('create', this);
```

最后依次用 shift 方法弹出 tracker 的 argsList 数组的每一个元素，执行如下方法：

```javascript
while(args = this.argsList.shift()) {
  command.apply(this, args);
}
```

tracker 的 argsList 数组中保存的是在 tracker 实例创建之前，此 tracker 就已经开始调用了 send 或者 fire 方法，此时就把该方法所需的全部参数当成一个数组，保存进 argsList 数组中。直到 create 方法调用之后，tracker 实例被创建，才依次将这些参数传给对应的方法并执行。

这一块的代码建议配合实例和对应的数组来看，否则屡清楚比较难...

#### 2-2-7 tracker.send(hitType, fieldObject)

将 tracker 的 fields 属性和一些数据合,以及 fieldObject 合并为 data
调用 `this.fire('send', data);`
并将数据的字段名简写之后，以创建一个1像素的图像的方式，将 tracker.fields.postUrl 保存在该图片的 src，以此完成数据的发送

### 2-3 alog('[trackerName.]method', data)

这种情况，与 `tracker.method(data)` 类似，只不过 tracker 的方式是同步执行的，而这种方式是异步执行，关于这两种方式的区别，在 API 文档中有详细说明：

在此只讲2个特殊又重要的方法：define 和 require 也建议大家好好分析这两个方法

#### 2-3-1 alog('define', trackerName, function(){...})

这个方法从$入口函数开始获取传入参数的 trackerName 和 function:

```javascript
moduleName = args[i];
creator = args[i];
```

如果以 trackerName 为名的 module 不存在，
则以 trackerName 在 modules 数组中创建一个 module，赋予初始值，并执行 clearDepend(module) 这个方法。

clearDepend 方法的作用主要是获取自身 module 所依赖的各 个module2，即 require 属性

如果这个 require 的 module2 存在，则将所依赖的 module2 的实例对象即 instance，作为参数，传到 module 自身的的 creator 方法中并运行，creator 即在 define 这个 module 的时候对应的那个 function。

然后执行 clearWaiting(module)，因为在这个 module 被 define 之前，可能已经存在某个 module2 来 require 过这个 module，所以现在就相当于通知那个 module2，本 module 已经定义，可以重新执行 module2 的 clearDepend 方法

如果 require 的 module2 不存在，则加载这个 module2：

```javascript
if (!depend.defining) {
  loadModules(moduleName);
}
```

并在 module2 的等待数组 waiting 中加入 module，表示 module 等待着 module2 的 define 方法的执行

```javascript
depend.waiting = depend.waiting || {};
depend.waiting[module.name] = module;
```

#### 2-3-2 alog('require', moduleName)

首先依旧是先获取参数 moduleName：

```javascript
case 'string':
  moduleName = args[i];  
  break;
```

但是这里会新建一个临时的模块 newModule 名为 '#guid'，guid 为一个自增的数字变量

newModule 的 require 属性对应的则是 module

```javascript
if (params == 'require') {
  if (moduleName && !requires) requires = [moduleName];
  moduleName = null;
}

newModule.requires = requires;
```

然后执行对 newModule 的 clearDepend() 方法，处理其依赖关系

## 3. ALog应用示例

* 简单统计: pv统计，参看[pv统计](https://github.com/uxrp/alog/tree/master/examples/pv)
* 复杂统计: 自定义模块统计，参看[speed统计](https://github.com/uxrp/alog/tree/master/examples/speed)
* 代理统计: 接入第三方统计，参看[百度统计](https://github.com/uxrp/alog/tree/master/examples/tongji)

