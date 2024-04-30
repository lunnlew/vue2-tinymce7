const fs = require('fs-extra')

fs.copy('node_modules/tinymce', 'public/tinymce', {
    overwrite: false
})
    .then(() => {
        return fs.copy('deps', 'public', {
            overwrite: true
        })
    })
    .catch(err => console.error(err))