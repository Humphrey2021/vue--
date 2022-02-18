class Observer {
    constructor(data) {
        this.walk(data)
    }
    walk(data) {
        // 1. 判断data是否是对象
        if (!data || typeof data !== 'object') return
        // 2. 遍历data对象的所有属性
        Object.keys(data).forEach(key => {
            this.defineReactive(data, key, data[key])
        })
    }
    defineReactive(obj, key, value) {
        const _this = this
        // 负责收集依赖，并发送通知
        let dep = new Dep()
        // 如果value是对象，把val内部的属性转换成响应式数据
        this.walk(value)
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get() {
                // 收集依赖
                Dep.target && dep.addSub(Dep.target)

                // 不可以直接使用，因为obj[key]也会触发get方法，就会导致死递归了。报错
                // return obj[key]
                // 此处发生了闭包，所以不会被释放
                return value
            },
            set(newVal) {
                if (newVal === value) return
                value = newVal
                _this.walk(newVal)
                // 发送通知
                dep.notify()
            }
        })
    }
}