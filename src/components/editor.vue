<template>
  <div class="tinymce-container">
    <textarea :id="editorId"></textarea>
  </div>
</template>

<script>
import { load } from "nano-loader";
import * as cheerio from "cheerio";

// 将十六进制字符串转为字节数组
function hexToBytes(hex) {
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return bytes;
}

// 将字节数组转为Base64字符串
function bytesToBase64(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// 将十六进制转为Base64
function hexToBase64(hex) {
  const bytes = hexToBytes(hex);
  return bytesToBase64(bytes);
}

export default {
  name: "vue2-tinymce",
  props: {
    value: {
      type: String,
      default: "",
    },
    // 编辑器ID
    editorId: {
      type: String,
      default: () => {
        return `vue2-tinymce-${Date.now()}`;
      },
    },
    // 语言 see https://www.tiny.cloud/get-tiny/language-packages/
    language: {
      type: String,
      default: "zh_CN",
    },
    // base_url
    base_url: {
      type: String,
      default: "/tinymce/",
    },
    // 插件
    plugins: {
      type: String,
      default: () => {
        return [
          // "quickbars",
          "table",
          "advtable",
          // "autoresize",
          "wordcount",
          "powerpaste",
          "fullscreen",
          "link",
          "lists",
          "advlist",
          "image",
          "media",
          // "mediaembed",
          "formatpainter",
          "code",
          "preview",
          "searchreplace",
          "visualblocks",
          "insertdatetime",
          "anchor",
          "charmap",
          "indent2em",
          // "importword",
        ].join(" ");
      },
    },
    // 字体
    font_family_formats: {
      type: String,
      default: () => {
        return "宋体=SimSun; 微软雅黑=Microsoft Yahei; 新宋体=NSimSun; 黑体=SimHei; 楷体=KaiTi; 仿宋=FangSong; 微软正黑体=Microsoft JhengHei; Andale Mono=andale mono,times; Arial=arial,helvetica,sans-serif; Arial Black=arial black,avant garde; Book Antiqua=book antiqua,palatino; Comic Sans MS=comic sans ms,sans-serif; Courier New=courier new,courier; Georgia=georgia,palatino; Helvetica=helvetica; Impact=impact,chicago; Symbol=symbol; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monaco; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms,geneva; Verdana=verdana,geneva; Webdings=webdings; Wingdings=wingdings,zapf dingbats";
      },
    },
    // 字体大小
    font_size_formats: {
      type: String,
      default: () => {
        return "8px 10px 12px 14px 16px 18px 20px 22px 24px 26px 28px 36px 48px 72px";
      },
    },
    // 行高
    line_height_formats: {
      type: String,
      default: () => {
        return "0.25 0.5 1 1.1 1.2 1.3 1.4 1.5 2 2.5 3 3.5 4 5 6";
      },
    },
    // 菜单栏
    menubar: {
      type: String,
      default: () => {
        return "file edit view insert format tools table";
      },
    },
    // 工具栏
    toolbar: {
      type: String,
      default: () => {
        return "undo redo | fontfamily fontsize styles formatpainter removeformat | bold italic underline strikethrough | forecolor backcolor | align bullist numlist | lineheight outdent indent | indent2em | link unlink | uploadbtn | code preview fullscreen";
      },
    },
    // 工具栏-展示
    toolbar_mode: {
      type: String,
      default: () => {
        return "wrap";
      },
    },
    // 文件选择
    file_picker_callback: {
      type: Function,
    },
    // 图片上传
    images_upload_handler: {
      type: Function,
      default: function (blobInfo) {
        console.error("need define images_upload_handler");
        return Promise.reject("need define images_upload_handler");
      },
    },
  },
  data() {
    return {
      tinymce: null,
      editor: null,
      tmpImages: [],
    };
  },
  mounted() {
    load(this.resolveResUrl("tinymce.min.js")).then(() => {
      this.onLoaded(window.tinymce);
    });
  },
  watch: {
    value(val) {
      if (this.editor) {
        this.editor.setContent(val);
      }
    },
  },
  methods: {
    getOptions() {
      const { value, ...options } = { ...(this.$props || {}) };
      const that = this;
      if (options.plugins && options.plugins.includes("quickbars")) {
        options.quickbars_insert_toolbar ||=
          "quicktable image media codesample";
        options.quickbars_image_toolbar ||= "alignleft aligncenter alignright";
        options.quickbars_selection_toolbar ||=
          "bold italic underline | blocks | bullist numlist | blockquote quicklink";
      }
      if (options.plugins && options.plugins.includes("autoresize")) {
        options.autoresize_bottom_margin ||= 20;
        options.min_height ||= 300;
        options.resize ||= "both";
      }
      if (options.plugins && options.plugins.includes("powerpaste")) {
        options.powerpaste_allow_local_images ||= true;
        options.powerpaste_word_import ||= "prompt";
        options.powerpaste_html_import ||= "prompt";
        options.paste_data_images ||= true;
        options.paste_merge_formats ||= false;
        options.powerpaste_keep_unsupported_src ||= true;
        options.paste_preprocess ||= (editor, data) => {
          console.log(data.mode, data.source);
          // 对于word导入，修改 powerpaste 附近 Word input required for rtf data， 跳过 PowerPaste error code: RTF03 错误，才能留下占位图片
          if (data.source == "msoffice") {
            // console.log(data.content);
            const $ = cheerio.load(data.content);
            $("img[data-image-src]").each((i, element) => {
              let src = $(element).attr("data-image-src");
              if (src.startsWith("file:///")) {
                // 替换占位符
                $(element).attr(
                  "style",
                  `background:url(${this.resolveResUrl(
                    "localimage.png"
                  )}) no-repeat center center;border:1px solid #ddd`
                );

                // 有识别到的wps-rtf图片
                if (this.tmpImages[i]) {
                  $(element).attr("src", this.tmpImages[i]);
                }
              }
            });
            data.content = $.html();
            this.tmpImages = [];
          }
        };
      }
      if (
        options.plugins &&
        (options.plugins.includes("image") || options.plugins.includes("media"))
      ) {
        options.file_picker_types ||= "file image media";
        options.file_picker_callback ||= function (cb, value, meta) {
          if (
            meta.filetype == "file" ||
            meta.filetype == "image" ||
            meta.filetype == "media"
          ) {
            const input = document.createElement("input");
            input.setAttribute("type", "file");
            input.setAttribute(
              "accept",
              meta.filetype == "image"
                ? "image/*"
                : meta.filetype == "media"
                ? "video/*"
                : "*/*"
            );
            input.addEventListener("change", (e) => {
              const file = e.target.files[0];
              const reader = new FileReader();
              reader.addEventListener("load", () => {
                const id = "blobid" + new Date().getTime();
                const blobCache = tinymce.activeEditor.editorUpload.blobCache;
                const base64 = reader.result.split(",")[1];
                const blobInfo = blobCache.create(id, file, base64);
                blobCache.add(blobInfo);
                that.images_upload_handler
                  ? that
                      .images_upload_handler(blobInfo)
                      .then((url) => {
                        cb(url, { title: file.name });
                      })
                      .catch((err) => {
                        throw new Error("上传失败");
                      })
                  : cb(blobInfo.blobUri(), { title: file.name });
              });
              reader.readAsDataURL(file);
            });
            input.click();
          }
        };
      }

      options.license_key ||= "gpl";
      options.language ||= this.language;
      options.language_url ||= this.resolveResUrl(
        `langs/${options.language}.js`
      );
      options.plugins ||= "";
      options.toolbar_mode ||= "wrap";
      options.branding ||= true;
      options.promotion ||= true;

      return options;
    },
    onLoaded(tinymce) {
      if (!tinymce) {
        console.error("tinymce not loaded");
        return;
      }
      this.tinymce = tinymce;
      const options = this.getOptions();
      tinymce
        .init({
          selector: `#${this.editorId}`,
          setup: (editor) => {
            let that = this;

            editor.addCommand("uploadbtn", (ui, v) => {
              this.showUploadDialog(tinymce, editor, ui, v);
            });
            editor.ui.registry.addButton("uploadbtn", {
              text: "上传图片",
              onAction: () => {
                this.showUploadDialog(tinymce, editor, true);
              },
            });
            editor.on("init", (e) => {
              this.$emit("ready", e.target);
              editor.setContent(this.value);
            });
            editor.on("input", (e) => {
              this.$emit("editorInput", e);
            });
            editor.on("change", (e) => {
              this.$emit("editorChange", e);
            });
            editor.on("click", function (e) {
              if (e.target.nodeName == "IMG" && !e.target.src) {
                // tinymce.activeEditor.execCommand("mceImage");
                tinymce.activeEditor.execCommand("uploadbtn", true, {
                  w: e.target.width,
                  h: e.target.height,
                });
              }
            });
            editor.on("paste", function (event) {
              var items = (
                event.clipboardData || event.originalEvent.clipboardData
              ).items;
              for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item.type === "text/html") {
                  //
                  // item.getAsString(function (rtfContent) {
                  //   console.log(rtfContent);
                  // });
                } else if (item.type === "text/rtf") {
                  // 处理wps的图片
                  item.getAsString(function (rtfContent) {
                    // console.log(rtfContent);
                    // 正则表达式来匹配图片
                    const imageRegex =
                      /{\\pict(?:.*?){\\[jpegblip|pngblip|gifblip](?:.*?)}}/gs;
                    let matches;
                    const images = [];
                    while ((matches = imageRegex.exec(rtfContent)) !== null) {
                      let str = matches[0];
                      // 41 = 7 + 1 + 32 + 1
                      const base64Data = hexToBase64(
                        str.slice(str.indexOf("blipuid") + 41, -2)
                      );
                      images.push("data:image/png;base64," + base64Data);
                    }
                    that.tmpImages.push(...images);
                  });
                }
              }
            });
          },
          ...options,
        })
        .then((editors) => {
          // this.$emit("ready", editors.length == 1 ? editors[0] : editors);
        });
    },
    resolveResUrl(url) {
      return this.base_url + url;
    },
    showUploadDialog(tinymce, editor, ui, v = {}) {
      this.$emit("uploadBtn", editor, ui, v, (imgList) => {
        if (Array.isArray(imgList)) {
          imgList.forEach((item) => {
            tinymce.activeEditor.selection.setContent(
              `<p><img style="display: block; margin-left: auto; margin-right: auto;" src="${item.url}" alt="" width="${item.width}" height="${item.height}" /></p>`
            );
          });
        }
      });
    },
  },
};
</script>

<style>
.tinymce-container textarea {
  display: none;
}
</style>
