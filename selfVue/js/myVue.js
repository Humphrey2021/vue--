class Vue {
    constructor (options) {
        // 1. 通过属性保存选项的数据
        this.$options = options || {}
        this.$data = options.data || {}
        this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el
        // 2. 把data中的成员转换成 getter 和setter，注入到vue实例中
        this._proxyData(this.$data)
        // 3. 调用 observer 对象，监听数据的变化
        new Observer(this.$data)
        // 4. 调用 compiler 对象，解析执行的差值表达式
    }
    _proxyData (data) {
        // 遍历data中的所有属性
        Object.keys(data).forEach(key => {
            // 把data中的属性注入到vue的实例中
            Object.defineProperty(this, key, {
                enumerable: true,
                configurable: true,
                get() {
                    return data[key]
                },
                set(newVal) {
                    if (newVal === data[key]) return
                    data[key] = newVal
                }
            })
        })
    }
}