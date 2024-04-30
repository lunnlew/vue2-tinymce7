module.exports = {
    "presets": [
        ["@vue/cli-plugin-babel/preset"],
        ["@babel/preset-env", {
            "modules": false,
            "targets": {
                "browsers": [
                    "> 1%",
                    "last 2 versions",
                ]
            }
        }]
    ],
    "plugins": []
}