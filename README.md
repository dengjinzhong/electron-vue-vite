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

## 开发环境 Vite 插件
主进程的代码写好之后，只有编译过之后才能被 Electron 加载，我们是通过 Vite 插件的形式来完成这个编译工作和加载工作的，如下代码所示：
```js

export const devPlugin = () => {
  return {
    name: "dev-plugin",
    configureServer(server) {
      require("esbuild").buildSync({
        entryPoints: ["./src/main/mainEntry.js"],
        bundle: true,
        platform: "node",
        outfile: "./dist/mainEntry.js",
        external: ["electron"],
      });
      server.httpServer.once("listening", () => {
        let { spawn } = require("child_process");
        let addressInfo = server.httpServer.address();
        let httpAddress = `http://${addressInfo.address}:${addressInfo.port}`;
        let electronProcess = spawn(require("electron").toString(), ["./dist/mainEntry.js", httpAddress], {
          cwd: process.cwd(),
          stdio: "inherit",
        });
        electronProcess.on("close", () => {
          server.close();
          process.exit();
        });
      });
    },
  };
};
```
这个 Vite 插件的代码编写好后，在 vite.config.ts 文件中引入一下就可以使用了，如下代码所示：
```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { devPlugin } from "./plugins/devPlugin";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [devPlugin(), vue()]
})

```

## 渲染进程集成内置模块
首先我们修改一下主进程的代码，打开渲染进程的一些开关，允许渲染进程使用 Node.js 的内置模块，如下代码所示：
```js
import { app, BrowserWindow } from "electron";
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";
let mainWindow;

app.whenReady().then(() => {
  let config = {
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
      contextIsolation: false,
      webviewTag: true,
      spellcheck: false,
      disableHtmlFullscreenWindowResize: true,
    },
  };
  mainWindow = new BrowserWindow(config);
  mainWindow.webContents.openDevTools({ mode: "undocked" });
  mainWindow.loadURL(process.argv[2]);
});
```

## 设置 Vite 模块别名与模块解析钩子
首先我们为工程安装一个 Vite 组件：vite-plugin-optimizer。
```shell
npm i vite-plugin-optimizer -D
```
getReplacer 方法是我们为 vite-plugin-optimizer 插件提供的内置模块列表。代码如下所示：
```js
export const getReplacer = () => {
  let externalModels = ["os", "fs", "path", "events", "child_process", "crypto", "http", "buffer", "url", "better-sqlite3", "knex"];
  let result = {};
  for (let item of externalModels) {
    result[item] = () => ({
      find: new RegExp(`^${item}$`),
      code: `const ${item} = require('${item}');export { ${item} as default }`,
    });
  }
  result["electron"] = () => {
    let electronModules = ["clipboard", "ipcRenderer", "nativeImage", "shell", "webFrame"].join(",");
    return {
      find: new RegExp(`^electron$`),
      code: `const {${electronModules}} = require('electron');export {${electronModules}}`,
    };
  };
  return result;
};
```
然后修改 vite.config.ts 的代码，让 Vite 加载这个插件，如下代码所示：
```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { devPlugin, getReplacer } from "./plugins/devPlugin";
import optimizer from "vite-plugin-optimizer";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [optimizer(getReplacer()),devPlugin(), vue()]
})

```
再次运行你的应用，看看现在渲染进程是否可以正确加载内置模块了呢？你可以通过如下代码在 Vue 组件中做这项测试：
```js
//src\App.vue
import fs from "fs";
import { ipcRenderer } from "electron";
import { onMounted } from "vue";
onMounted(() => {
  console.log(fs.writeFileSync);
  console.log(ipcRenderer);
});
```





## 开发插件进行 Electron 应用打包

#### 编译结束钩子函数
