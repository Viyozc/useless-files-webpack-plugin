### API
```
const UselessFile = require('useless-files-webpack-plugin')

plugin: [
  new UselessFile({
    root: './src',
    out: './fileList.json',
    out: (files) => deal(files),
    remove: false
  })
]

```