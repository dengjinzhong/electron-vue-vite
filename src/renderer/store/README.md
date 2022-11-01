# Pinia
我们一般都会考虑统筹管理一个上了规模的 Vue 项目的数据状态，对于基于 Vue2.x 创建的前端项目来说，Vuex 是个不错的选择；但对于使用 Vue3.x 创建前端项目来说，可能 Pinia 才是更好的选择。

相对于 Vuex 来说，Pinia 有以下几方面的优势。

* Pinia 没有mutations，相应的工作都在actions中完成，而且actions直接支持异步函数。
* Pinia 完美支持 TypeScript，Vuex 在这方面做得不是很好。
* Pinia 对开发工具支持很好，尤其是 VS Code，智能提示很完善，这方面 Vuex 做得不是很好。Pinia 对调试工具（vue-devtools）也支持得很好。 不需要再使用名称空间来控制 store，也不需要再考虑 store 的嵌套问题。
* Pinia 性能优于 Vuex。
## 为项目引入 Pinia
使用如下命令为项目安装 Pinia 依赖：
```shell
npm install pinia -D
```
安装完成后，修改渲染进程的入口文件，使其加载 Pinia 插件
```js
import { createApp } from "vue";
import { createPinia } from "pinia";

createApp(App).use(createPinia()).mount("#app");
```

## 创建 Store
