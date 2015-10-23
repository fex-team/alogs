## 5. API 文档

### 5-1. ALog 实例方法

#### 5-1-1. ALog 执行方法：`alog(trackerMethod, params)`

```js
/**
 * ALog执行方法，可调用各个 tracker 事例的方法
 * @param {string} trackerMethod 追踪器的方法 "<trackerName>.<method>"
 * @param {Object} params 方法
 */
alog('pv.send', 'pageview');
```

#### 5-1-2. ALog 模块定义 `define：alog('define', moduleName, requires, dealFunc)`

```js
/**
 * 定义模块
 * @param {string} 'define'
 * @param {string} moduleName 模块名
 * @param {Array=} requires 依赖模块名
 * @param {Function} dealFunc 处理函数
 */
alog('define', 'pv', function(){
   var pvTracker = alog.tracker('pv');
   pvTracker.set('ver', 1);
   pvTracker.set('px', window.screen.width + 'x' + window.screen.height);
   
   //由于模块一般用于统计，而每个统计模块都需要一个 tracker 实例，所以一般返回一个 tracker
   return pvTracker;
   /**
    * 也可以返回一个module
    * return {
    *    'on': function(){},
    *    'un': function(){}
    * }
    */
});
```

#### 5-1-3. ALog 模块引用 `require：alog('require', [moduleName], callback)`

```js
/**
 * 引用模块
 * @param {string} 'require'
 * @param {Array} 引用的模块
 * @param {Function} callback 回调函数
 */
alog('require', ['pv'], function(pvTracker){
    pvTracker.create({
      postUrl: 'http://localhost/u.gif'
    });
});
```

#### 5-1-4. ALog 获取/创建追踪器: `alog.tracker(trackerName)`
    
```js
/**
 * 获取/创建追踪器，如果没有名为trackerName的tracker实例，将自动创建一个名为trackerName的tracker实例
 * @param {string}[optional] trackerName 追踪器名
 */
//获取alog的tracker
alog.tracker();
alog.tracker('default');
//获取pv模块的tracker
alog.tracker('pv');
```

### 5-2. ATracker 模块

Tracker 模块的方法调用有两种方法：

1. 同步方法: `moduleTracker.method(params)`

```js
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
```

2. 异步方法: `alog('moduleTracker.method', params)`

```js        
var btn = document.getElementById('btn');
btn.onclick = function(){
    alog('module.send', 'event', {
        type: 'click',
        target: btn,
        val: btn.value
    });
};
```

上述两种方法都可以做到统计 `ID` 为 `btn` 的元素点击，并上报记录，但区别是：

* 同步方法会在模块加载完，才开始绑定点击事件，所以可能会丢失加载前的点击。同步方法适合用户模块定义内部。
* 异步方法在执行代码后生效，如果使用的模块还没加载完，会先放到事件队列里，等模块加载完成并执行start方法后，会自动执行事件队列里的时间

#### 5-2-1. Tracker 开始上报 create

两种方法

* `moduleTracker.create(fields)` 同步方法(Sync)
* `alog('module.create', fields)` 异步方法(Async)

```js
/**
 * 创建追踪器实例
 * @param {string} 'module.create' 模块创建追踪器实例
 * @param {Object} fields 字段对象
 */
alog('pv.create', {
  postUrl: 'http://localhost/u.gif'
});
```

#### 5-2-1. Tracker 设置上报字段 set

两种方法

* moduelTracker.set([name, ]value) 同步方法(Sync)
* alog('module.set', [name, ]value) 异步方法(Async)

```js
/**
 * 设置上报字段值
 * @param {string} 'module.set'
 * @param {string}[optional] name 字段名
 * @param {string|Object} value 字段值 
 */
//name, value
alog('pv.set', 'page', 'hunter-index');
//value object
alog('pv.set', {'page', 'hunter-index'});
```

#### 5-2-2. Tracker 获取上报字段值 get

两种方法
* moduleTracker.get(name, callback) 同步方法(Sync)
* alog('module.get', name, callback) 异步方法(Async)

```js
/**
 * 获取上报字段值
 * @param {string} 'module.get'
 * @param {string} name 字段名
 * @param {Function} callback 回调函数
 */
alog('pv.get', 'page', function(page){
    alert(page);
});
```

#### 5-2-3. Tracker 上报数据 send

两种方法


* moduleTracker.send(dataType, fields) 同步方法(Sync)
* alog('module.send', dataType, fields) 异步方法(Async)

```js
/**
 * 上报数据
 * @param {string} 'module.send'
 * @param {string} dataType 数据类型
 * @param {Object} fields 上报数据
 */
alog('pv.send', 'pageview', {
    'page': 'hunter-index',
    'title': 'Hunter首页'
});
```

#### 5-2-4. Tracker 注册事件 on

两种方法

* moduleTracker.on(eventName, dealFunc) 同步方法(Sync)
* alog('module.on', eventName, dealFunc) 异步方法(Async)

```js
/**
 * 注册事件
 * @param {string} 'module.on'
 * @param {string} eventName 事件名称
 * @param {Function} dealFunc 处理函数
 */
function dealFunc(data){
    if(data.type == "pageview"){
        data.ref = document.referrer;
    }
}
alog('pv.on', 'report', dealFunc);
````

#### 5-2-5. Tacker 注销事件 un

两种方法

* moduleTracker.un(eventname, dealFunc) 同步方法(Sync)
* alog('module.un', eventName, dealFunc) 异步方法(Async)

```js
/**
 * 注销事件
 * @param {string} 'module.on'
 * @param {string} eventName 事件名称
 * @param {Function} dealFunc 处理函数
 */
alog('pv.un', 'report', dealFunc);
```

#### 5-2-6. Tracker 派发事件 fire

两种方法

* moduleTracker.fire(eventname) 同步方法(Sync)
* alog('module.fire', eventName) 异步方法(Async)

```js
/**
 * 派发事件
 * @param {string} 'module.fire'
 * @param {string} eventName 事件名称
 */
alog('pv.fire', 'report', {type: "pageview", title: "Hunter 首页"});
```

### 5-3. 保留字段

* 上报地址：postUrl
* 引用模块配置: alias
* 协议字段，用于上报字段简写: protocolParameter

### 5-4. Tracker标准事件(自定义方法)

Tracker标准事件是指可通过 `alog('module.on', '标准事件名', dealFunc)` 的方法自定义处理函数，
当模块的tracker执行标准事件时，会自动调用自定义方法。 `module.fire('标准事件名', data)`

* 追踪器创建时触发: start

```js
/**
 *  可用来设置一些页面统一变量
 */
alog('module.on', 'start', function(){
    moduleTracker.set({
        pageId: 'hunter-index',
        title: 'Hunter 首页'
    });
});
```

* 数据上报时派发: send

```js
/**
 * 可用来修改ALog默认上报字段
 */
alog('module.on', 'send', function(data){
    data.t = data.title;
    delete data.title;
    data.r = data.refer;
    delete data.refer;
});
```
