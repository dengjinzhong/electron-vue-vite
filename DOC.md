# Electron + Vue 3 + Vite
## 初始化 Vue 项目
执行命令，根据具体需要来选择模板，这里我选择 vue + javascript
```shell
npm create vite@latest electron-vue-vite
```
接着安装所有依赖以及 Electron 开发依赖，安装完依赖后项目根目录下的 package.json 文件如下：
```json
{
  "name": "electron-vite",
  "private": true,
  "version": "0.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^3.2.0",
    "electron": "^21.2.0",
    "vite": "^3.2.0",
    "vue": "^3.2.41"
  }
}
```
> * 这里将默认 "type": "module" 去除了
> * 把 vue 从 dependencies 配置节移至了 devDependencies 配置节。这是因为在 Vite 编译项目的时候，Vue 库会被编译到输出目录下，输出目录下的内容是完整的，没必要把 Vue 标记为生产依赖；而且在我们将来制作安装包的时候，还要用到这个 package.json 文件，它的生产依赖里不应该有没用的东西，所以我们在这里做了一些调整。

## 主进程
创建好项目之后，我们创建主进程的入口程序：`src\main\mainEntry.js`
```js
//src\main\mainEntry.js
import { app, BrowserWindow } from "electron";

let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({});
  mainWindow.loadURL(process.argv[2]);
});
```

在这段代码里，我们在 app ready 之后创建了一个简单的 BrowserWindow 对象。
app 是 Electron 的全局对象，用于控制整个应用程序的生命周期。
在 Electron 初始化完成后，app 对象的 ready 事件被触发，这里我们使用 app.whenReady() 这个 Promise 方法来等待 ready 事件的发生。

mainWindow 被设置成一个全局变量，这样可以避免主窗口被 JavaScript 的垃圾回收器回收掉。另外，窗口的所有配置都使用了默认的配置。

这个窗口加载了一个 Url 路径，这个路径是以命令行参数的方式传递给应用程序的，而且是命令行的第三个参数。

app 和 BrowserWindow 都是 Electron 的内置模块，这些内置模块是通过 ES Module 的形式导入进来的，我们知道 Electron 的内置模块都是通过 CJS Module 的形式导出的，这里之所以可以用 ES Module 导入，是因为我们接下来做的主进程编译工作帮我们完成了相关的转化工作。
