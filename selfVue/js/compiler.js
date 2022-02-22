class Compiler {
    constructor(vm) {
        this.el = vm.$el
        this.vm = vm
        this.compile(this.el)
    }
    // 编译模板，处理文本节点和元素节点
    compile(el) {
        let childNodes = el.childNodes
        // childNodes是一个伪数组，需要使用 Array.from 转换一下
        Array.from(childNodes).forEach(node => {
            if (this.isTextNode(node)) {
                // 如果是文本节点,处理文本节点
                this.compileText(node)
            } else if (this.isElementNode(node)) {
                // 如果是元素节点，处理元素节点
                this.compileElement(node)
            }
            // 判断node节点，是否有子节点，如果有子节点，要递归调用 compile
            if (node.childNodes && node.childNodes.length) {
                this.compile(node)
            }
        })
    }
    // 编译元素节点，处理指令
    compileElement(node) {
        // 只实现 v-test 和 v-model
        // console.log(node.attributes)
        // 遍历所有的属性节点
        Array.from(node.attributes).forEach(attr => {
            // 判断是否是指令
            let attrName = attr.name
            if (this.isDirective(attrName)) {
                // 因为指令特别的多，如果使用 if 判断，维护起来会特别的麻烦。所以使用如下方法
                attrName = attrName.substr(2)
                let key = attr.value
                // 可以省去复杂的 if 判断，更高效，便捷
                this.update(node, key, attrName)
            }
        })
    }
    // 处理指令功能，调用对应的指令方法
    update(node, key, attrName) {
        let updateFn = this[attrName + 'Updater']
        // updateFn && updateFn(node, this.vm[key])
        updateFn && updateFn.call(this, node, this.vm[key], key)
    }
    // 处理 v-text 指令
    textUpdater(node, value, key) {
        node.textContent = value
        // 每一个指令中创建一个 watcher，观察数据的变化
        new Watcher(this.vm, key, newValue => {
            node.textContent = newValue
        })
    }
    // 处理 v-model 指令
    modelUpdater(node, value, key) {
        node.value = value
        // 每一个指令中创建一个 watcher，观察数据的变化
        new Watcher(this.vm, key, newValue => {
            node.value = newValue
        })
        // 双向绑定
        node.addEventListener('input', () => {
            this.vm[key] = node.value
        })
    }
    // 编译文本节点，处理差值表达式
    compileText(node) {
        // console.dir(node)
        // 匹配 {{ msg }} 格式，提取内容
        let reg = /\{\{(.+?)\}\}/
        let value = node.textContent
        if (reg.test(value)) {
            let key = RegExp.$1.trim()
            node.textContent = value.replace(reg, this.vm[key])
            // 创建watcher对象，当数据改变更新视图
            new Watcher(this.vm, key, newValue => {
                node.textContent = value.replace(reg, newValue)
            })
        }
    }
    // 判断元素属性是否是指令
    isDirective(attrName) {
        return attrName.startsWith('v-')
    }
    // 判断节点是否是文本节点
    isTextNode(node) {
        return node.nodeType === 3
    }
    // 判断节点是否是元素节点
    isElementNode(node) {
        return node.nodeType === 1
    }
}