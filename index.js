
const fs = require('fs')
const glob = require('glob')
const path = require('path')
const shelljs = require('shelljs')

class CleanUnusedFilesPlugin {
  constructor (options) {
    this.opts = options
  }
  apply (compiler) {
    let _this = this
    compiler.plugin('after-emit', function (compilation, done) {
      _this.findUnusedFiles(compilation, _this.opts)
      done()
    })
  }

/**
 * 获取依赖的文件
 */
  getDependFiles (compilation) {
    return new Promise((resolve, reject) => {
      const dependedFiles = [...compilation.fileDependencies].reduce(
        (acc, usedFilepath) => {
          if (!~usedFilepath.indexOf('node_modules')) {
            acc.push(usedFilepath)
          }
          return acc
        },
        []
      )
      resolve(dependedFiles)
    })
  }

/**
 * 获取项目目录所有的文件
 */
  getAllFiles (pattern) {
    return new Promise((resolve, reject) => {
      glob(pattern, {
        nodir: true
      }, (err, files) => {
        if (err) {
          throw err
        }
        const out = files.map(item => path.resolve(item))
        resolve(out)
      })
    })
  }

  dealExclude (path, unusedList) {
    const file = fs.readFileSync(path, 'utf-8')
    const files = JSON.parse(file) || []
    const result = unusedList.filter(unused => {
      return !files.some(item => ~unused.indexOf(item))
    })
    return result
  }

  async findUnusedFiles (compilation, config = {}) {
    const { root = './src', clean = false, output = './unused-files.json', exclude = false } = config
    const pattern = root + '/**/*'
    try {
      const allChunks = await this.getDependFiles(compilation)
      const allFiles = await this.getAllFiles(pattern)
      let unUsed = allFiles
        .filter(item => !~allChunks.indexOf(item))
      if (exclude && typeof exclude === 'string') {
        unUsed = this.dealExclude(exclude, unUsed)
      }
      if (typeof output === 'string') {
        fs.writeFileSync(output, JSON.stringify(unUsed, null, 4))
      } else if (typeof output === 'function') {
        output(unUsed)
      }
      if (clean) {
        unUsed.forEach(file => {
          shelljs.rm(file)
          console.log(`remove file: ${file}`)
        })
      }
      return unUsed
    } catch (err) {
      throw (err)
    }
  }
}

module.exports = CleanUnusedFilesPlugin
