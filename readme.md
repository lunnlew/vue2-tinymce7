## 说明

增强 WPS 的图文混合粘贴功能，针对 WORD 或者 WPS 复制后进行粘贴的可能无法处理本地图片文件，自动加上占位图片，以便于手动点击上传

## 安装

```sh
npm install --save vue2-tinymce7
```

## 全局导入

```js
import Vue2Tinymce7Component from "vue2-tinymce7";
Vue.use(Vue2TinymceComponent);
```

## 局部导入

```js
import { Vue2Tinymce } from "vue2-tinymce7";
```

## 组件使用

```html
<Vue2Tinymce
  :value="value"
  :base_url="'/tinymce/'"
  @ready="onReady"
  @inputChange="onInputChange"
  @editorChange="onEditorChange"
>
</Vue2Tinymce>
```

## 开发

```sh
# 安装
npm install
# 构建库
npm run build-lib
# 运行示例
npm run serve
```
