alog代码浅析
==============

##前言

本文主要目的是降低阅读alog代码的难度，节省大家更多时间，因为看完这个文档的话对理解alog的实现还是有一定帮助的。当然，也欢迎各位大神从零探索，获取其中的乐趣

###3个极为重要的object：

之所以在开头点出，因为只有带着这3个object，才能看懂alog代码中的大部分函数

```
alog_listeners = {
	...
}

trackers = {
	...
}

modules = {
	...
}
```

### alog的同步方法与异步方法的区别：

* 同步方法会在模块加载完，才开始绑定点击事件，所以可能会丢失加载前的点击。同步方法适合用户模块定义内部。
* 异步方法在执行代码后生效，如果使用的模块还没加载完，会先放到事件队列里，等模块加载完成并执行start方法后，会自动执行事件队列里的时间。

---

##1. alog入口调用解析

在alog.js代码中，通过

```
var objectName = winElement.alogObjectName || 'alog';
winElement[objectName] = $;
```

将外部的alog调用重定义到$中，也就是实际上调用与$相关的一些方法

接下来看看alog的一些常见的使用方式：

```
alog.method(data);
alog('[trackerName.]method', data);
tracker.method(data);
```

### 第一种：

它会直接调用alog.js里对应的$.method(data);

### 第二种：

在入口函数中

```
$ = function(params){
	...
}
```

会判断传入的第一个参数paramas的内容，并调用对应的方法:

根据参数是 'define'、'require'、或者其它参数，来进行不同的处理：

```
if (params == 'define' || params == 'require'){
	...
}

if (typeof params == 'function'){
	params($);
    return;
}

String(params).replace(/^(?:([\w$_]+)\.)?(\w+)$/, function(all, trackerName, method){
	args[0] = method; 
	command.apply($.tracker(trackerName), args);
});
```

### 第三种：

已经获得了一个tracker对象,例如：

```
var tracker = alog.tracker(trackerName);
```

从而调用alog.js中Tracker的对应方法

##2. alog API方法

### 2-1 alog.method(data)

首先声明这种方式的调用不太多，大多都是调用alog.tracker(trackerName)来获得一个tracker对象

因为在tracker.method(data)这种方式的调用中包装了alog.method(data)的一些方法

#### 2-1-1 alog.tracker(trackerName)

该方法调用alog.js中的getTracker方法:

```
$.tracker = getTracker;
```

然后根据trackerName的不同做出不同的处理：

#####若trackerName为空

从当前trackers对象中，返回trackers['default']
若trackers['default']也为空,则新建一个name='default'的tracker对象并返回

#####若trackerName = '*'

将trackers对象中的所有tracker对象push到一个数组中并返回

#####其它情况：

从当前trackers对象中，返回trackers[trackerName]
若trackers[trackerName]也为空,则新建一个name=trackerName的tracker对象并返回

#### 2-1-2 alog.timestamp()

获取当前时间戳

#### 2-1-3 alog.on(element, eventName, callback)

#####若element是字符串类型:

获取alog_listeners对象中key为element的数组(若未定义则初始化为[])

然后向alog_listeners[eventName]这个数组的最前面插入eventName

#####其它：

对element这个元素监听事件eventName,回调函数为callback:

```
if (element.addEventListener){
	element.addEventListener(eventName, callback, false);
} else if (element.attachEvent){
	element.attachEvent('on' + eventName, callback);
}
```

#### 2-1-4 alog.un(element, eventName, callback)

与on相反

#### 2-1-5 alog.fire(eventName)

首先尝试获取alog_listeners[eventName]这个数组
然后获取其它参数：

```
var args = arguments;
for(var i = 1; i < args.length; i++){
	items.push(args[i]);
}
```

对于alog_listeners[eventName]这个数组的每个元素执行apply方法：

```
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

```
this.fields[name] = value;
```

若name=='protocolParameter',则value还要增添一些默认属性

若name的类型为object，则对name里的每一对key-value：
调用Tracker.prototype.set(key, value)

#### 2-2-2 tracker.get(name, callback)

获取该tracker的fields属性的name属性的值

若存在callback是函数类型的话,将上面的值传给这个callback函数并执行

#### 2-2-3 tracker.fire(eventName)

将该tracker的name值与eventName连接：

```
var items = [this.name + '.' + eventName];
```

再获取其它参数,并调用alog.fire方法：

```
fire.apply(this, items)
```

#### 2-2-4 tracker.on(eventName, callback)

```
$.on(this.name + '.' + eventName, callback);
```

可参考alog.on

#### 2-2-5 tracker.un(eventName, callback)

```
$.un(this.name + '.' + eventName, callback);
```

可参考alog.un

#### 2-2-6 tracker.create(fields)

首先如果fields是一个object类型的话：

```
this.set(fields);
```

可参考tracker.set(name, value)

设置created标记：

```
this.created = new Date;
```

调用fire方法

即获取alog_listeners[this.name + '.create']中的每一个方法

把tracker自身作为参数传给这些方法，并运行该方法：

```
this.fire('create', this);
```

最后依次用shift方法弹出tracker的argsList数组的每一个元素，执行如下方法：

```
while(args = this.argsList.shift()){
	command.apply(this, args);
}
```

tracker的argsList数组中保存的是在tracker实例创建之前，此tracker就已经开始调用了send或者fire方法，此时就把该方法所需的全部参数当成一个数组，保存进argsList数组中。直到create方法调用之后，tracker实例被创建，才依次将这些参数传给对应的方法并执行。

这一块的代码建议配合实例和对应的数组来看，否则屡清楚比较难...

#### 2-2-7 tracker.send(hitType, fieldObject)

将tracker的fields属性和一些数据合,以及fieldObject合并为data
调用this.fire('send', data);
并将数据的字段名简写之后，以创建一个1像素的图像的方式,将tracker.fields.postUrl保存在该图片的src，以此完成数据的发送

### 2-3 alog('[trackerName.]method', data)

这种情况,与tracker.method(data)类似，只不过tracker的方式是同步执行的，而这种方式是异步执行，关于这两种方式的区别，在API文档中有详细说明：

在此只讲2个特殊又重要的方法：define和require,也建议大家好好分析这两个方法

#### 2-3-1 alog('define', trackerName, function(){...})

这个方法从$入口函数开始获取传入参数的trackerName和function:

```
moduleName = args[i];
creator = args[i];
```

如果以trackerName为名的module不存在，
则以trackerName在modules数组中创建一个module，赋予初始值，并执行clearDepend(module)这个方法。

clearDepend方法的作用主要是获取自身module所依赖的各个module2，即require属性

如果这个require的module2存在，则将所依赖的module2的实例对象即instance，作为参数，传到module自身的的creator方法中并运行，creator即在define这个module的时候对应的那个function。

然后执行clearWaiting(module)，因为在这个module被define之前，可能已经存在某个module2来require过这个module，所以现在就相当于通知那个module2，本module已经定义，可以重新执行module2的clearDepend方法

如果require的module2不存在，则加载这个module2：

```
if (!depend.defining){
    loadModules(moduleName);
}
```

并在module2的等待数组waiting中加入module，表示module等待着module2的define方法的执行
```
depend.waiting = depend.waiting || {};
depend.waiting[module.name] = module;
```

#### 2-3-2 alog('require', moduleName)

首先依旧是先获取参数moduleName：

```
case 'string':
	moduleName = args[i];  
	break;
```

但是这里会新建一个临时的模块,newModule名为'#guid',guid未一个自增的数字变量

newModule的require属性对应的则是module

```
if (params == 'require'){
    if (moduleName && !requires) requires = [moduleName];
    moduleName = null;
}

newModule.requires = requires;
```

然后执行对newModule的clearDepend()方法，处理其依赖关系

##3. ALog应用示例
* 简单统计: pv统计，参看 [pv统计](https://github.com/uxrp/alog/tree/master/examples/pv)
* 复杂统计: 自定义模块统计，参看 [speed统计](https://github.com/uxrp/alog/tree/master/examples/speed)
* 代理统计: 接入第三方统计，参看 [百度统计](https://github.com/uxrp/alog/tree/master/examples/tongji)

