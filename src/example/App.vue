<template>
  <div>
    <Vue2Tinymce
      :value="value"
      :images_upload_handler="images_upload_handler"
      :base_url="'/tinymce/'"
      @ready="onReady"
      @uploadBtn="onUploadBtn"
      @editorChange="onChange"
    >
    </Vue2Tinymce>
    <el-dialog
      ref="dialog"
      title="上传文件"
      :visible.sync="dialogVisible"
      width="500px"
      @closed="closeFn"
      :close-on-click-modal="false"
    >
      <template v-if="dialogVisible">
        <el-upload
          class="upload-demo"
          drag
          action="https://jsonplaceholder.typicode.com/posts/"
          multiple
          :before-upload="beforeUploadPic"
          :on-success="successFn"
          :on-remove="removeHandle"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">
            将文件拖到此处，或
            <em>点击上传</em>
          </div>
          <div class="el-upload__tip" slot="tip">
            请上传"png", "jpg", "jpeg"格式文件！且不超过5m
          </div>
        </el-upload>
        <div class="lock">
          <div v-for="(item, index) in fileList" :key="index" class="lock-item">
            <el-input
              type="number"
              v-model="fileList[index].width"
              class="input"
            ></el-input>
            <span>X</span>
            <el-input
              type="number"
              v-model="fileList[index].height"
              class="input"
            ></el-input>
          </div>
        </div>
        <div style="text-align: center">
          <el-button @click="closeFn">取消</el-button>
          <el-button @click="onSubmit" type="primary">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "Editor",
  data() {
    return {
      editor: null,
      value: "",
      uploadCallback: null,
      dialogVisible: false,
      fileList: [],
      options: {},
    };
  },
  methods: {
    onReady(editor) {
      this.editor = editor;
      console.log(this.editor);
    },
    onChange(e) {},

    beforeUploadPic(file) {
      if (file.size / 1024 / 1024 > 5) {
        this.$message({
          message: "请上传小于5M的文件！",
          type: "error",
        });
        return false;
      }
      var str = file.name.split(".")[file.name.split(".").length - 1];
      if (["png", "jpg", "jpeg", "PNG", "JPG", "JPEG"].indexOf(str) < 0) {
        this.$message({
          message: `请上传"png", "jpg", "jpeg"格式文件！`,
          type: "error",
        });
        return false;
      }

      return true;
    },
    successFn(res, files) {
      this.fileList.push({
        ...res,
        ...{ width: this.options.w || 800, height: this.options.h || 550 },
      });
    },
    removeHandle(res) {
      this.fileList = this.fileList.filter(
        (item) => item.url != res.response.url
      );
      console.log("res", res, this.fileList);
    },
    onUploadBtn(editor, ui, v, callback) {
      console.log(editor, ui, v, callback);
      this.options = v || {};
      this.uploadCallback = callback;
      this.dialogVisible = true;
    },
    closeFn() {
      this.dialogVisible = false;
      this.fileList = [];
    },
    onSubmit() {
      if (this.fileList.length == 0) {
        this.$message({
          type: "warning",
          message: "请上传图片",
        });
      } else {
        this.uploadCallback(this.fileList);
        this.dialogVisible = false;
      }
    },
    images_upload_handler(blobInfo) {
      let file = blobInfo.blob();
      return new Promise((resolve, reject) => {
        if (file.size > 1024 * 1024 * 2) {
          reject("图片大小不能超过2M");
        } else {
          resolve(blobInfo.blobUri());
        }
      });
    },
  },
};
</script>
<style scoped>
.upload-demo {
  text-align: center;
}
.el-upload,
.el-upload-dragger {
  width: 462px;
}
</style>
