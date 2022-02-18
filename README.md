# vue响应式原理模拟

## 目标：
- 模拟一个最小版本的vue
- 实际项目中出问题的原理层面的解决
    - 给Vue实例新增一个成员是否是响应式的？
    - 给属性重新赋值成对象，是否是响应式的？

## 准备工作
- 数据驱动
- 响应式的核心原理
- 发布订阅模式和观察者模式

### 数据驱动
- 数据响应式、双向绑定、数据驱动
- 数据响应式：
    数据模型仅仅是普通的 JS 对象，而当我们修改数据时，视图会进行更新，避免了繁琐的DOM操作，提高开发效率
- 双向绑定
    - 数据改变，视图改变；视图改变，数据也随之改变
    - 我们可以使用 v-model 在表单元素上创建双向数据绑定
- 数据驱动是 Vue 最独特的特性之一
    - 开发过程中仅需要关注数据本身，不需要关心数据是如何渲染到视图

### 响应式的核心原理
#### Vue 2.x
- [Vue 2.x深入响应式原理](https://cn.vuejs.org/v2/guide/reactivity.html)
- [MDN-Object.defineProperty](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)
- 浏览器兼容IE8以上(不兼容IE8)

#### Vue 3.x
- [MDN-Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- 直接监听对象，而非属性
- ES6中新增，IE不支持，性能由浏览器进行优化，比defineProperty要好

### 发布订阅模式和观察者模式

#### 发布/订阅模式
- 发布/订阅模式
    - 订阅者
    - 发布者
    - 信号中心
    > 我们假定，存在一个“信号中心”，某个任务执行完成，就向信号中心“发布”(publish)一个信号，其他任务可以向信号中心“订阅”(subscribe)这个信号，从而知道什么时候自己可以开始执行。**这就叫做“发布/订阅模式”(publish-subscribe pattern)**

- Vue 的自定义事件
    - [Vue 2.x 自定义事件](https://cn.vuejs.org/v2/guide/components-custom-events.html)
    ```js
    let vm = new Vue()
    vm.$on('dataChange', () => {
        console.log('dataChange')
    })
    vm.$on('dataChange', () => {
        console.log('dataChange1')
    })
    vm.$emit('dataChange')
    ```
    - 兄弟组件通信过程
    ```js
    // eventBus.js
    // 事件中心
    let eventHub = new Vue()
    // ComponentA.vue
    // 发布者
    addTodo: function () {
        // 发布消息(事件)
        eventHub.$emit('add-todo', { text: this.newTodoText })
        this.newTodoText = ''
    }
    // ComponentB.vue
    // 订阅者
    created: function () {
        // 订阅消息(事件)
        eventHub.$on('add-todo', this.addTodo)
    }
    ```

#### 观察者模式
- 观察者(订阅者)  -- Watcher
    - update()：当事件发生时，具体要做的事情
- 目标(发布者) -- Dep
    - subs 数组：存储所有的观察者
    - addSub()：添加观察者
    - notify()：当事件发生，调用所有观察者的 update() 方法
- 没有事件中心

总结
- **观察者模式**是由具体目标调度，比如当事件触发，Dep就会去调用观察者的方法，所以观察者模式的订阅着与发布者之间是存在依赖的。
- **发布/订阅模式**由统一的调度中心调用，因此发布者和订阅者不需要知道对方的存在。

## Vue响应式原理模拟

### 整体分析
- Vue基础结构
- 打印 Vue 实例观察
- 整体结构

- Vue
    - 把 data 中的成员注入到 Vue 实例，并且把 data 中的成员转成 getter/setter
- Observer
    - 能够对数据对象的所有属性进行监听，如有变动可拿到最新值并通知 Dep
- Compiler
    - 解析每个元素中的指令/插值表达式，并替换成相应的数据
- Dep
    - 添加观察者(watcher)，当数据变化通知所有观察者
- Watcher
    - 数据变化更新视图

### Vue
`selfVue/js/myVue.js`
- 功能
    - 负责接收初始化的参数(选项)
    - 负责把 data 中的属性注入到 Vue 实例，转换成 getter/setter
    - 负责调用 observer 监听 data 中所有属性的变化
    - 负责调用 compiler 解析指令/插值表达式

- 结构
    ```
    名称：Vue
    属性：
        $options
        $el
        $data
    方法：
        _proxyData()
    ```

### Observer
`selfVue/js/observer.js`
- 功能
    - 负责把 data 选项中的属性转换成响应式数据
    - data 中的某个属性也是对象，把该属性转换成响应式数据
    - 数据变化发送通知

- 结构
    ```
    名称：Observer
    方法：
        walk(data)
        defineReactive(data,key,value)
    ```

### Compiler
`selfVue/js/compiler.js`
- 功能
    - 负责编译模板，解析指令/插值表达式
    - 负责页面的首次渲染
    - 当数据变化后重新渲染视图

- 结构
    ```
    名称：Compiler
    属性：
        el
        vm
    方法：
        compile(el)
        compileElement(node)
        compileText(node)
        isDirective(attrName)
        isTextNode(node)
        isElementNode(node)
    ```

### Dep(Dependency)
`selfVue/js/dep.js`
- 功能
    - 收集依赖， 添加观察者（watcher）
    - 通知所有观察者
- 结构
    ```
    名称：Dep
    属性：
        subs
    方法：
        addSub(sub)
        notify()
    ```

### Watcher
- 功能
    - 当数据变化触发依赖，dep通知所有的 Watcher 实例更新视图
    - 自身实例化的时候往 dep 对象中添加自己
- 结构
    ```
    名称：Watcher
    属性：
        vm
        key
        cb(callback)
        oldValue
    方法：
        update()
    ```


