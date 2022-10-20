
### API
```
const UselessFile = require('useless-files-webpack-plugin')

plugins: [
  new UselessFile({
    root: './src', // 项目目录
    output?: './fileList.json', // 输出文件列表
    output?: (files) => deal(files), // 或者回调处理
    clean?: false // 删除文件,
    exclude?: path // 排除文件列表, 格式为文件路径数组
  })
]

```

