'use strict';

const path = require('path')
const pathExists = require('path-exists')
const fse = require('fs-extra')
const pkgDir = require('pkg-dir').sync
const npmisntall = require('npminstall')

const { getDefaultRegistry, getNpmLatestVersion } = require('@icream-cli/get-npm-info')
const formatPath = require('@icream-cli/format-path')
const { isObject } = require('@icream-cli/utils')

class Package {
  constructor(options) {

    if (!options) {
      throw new Error('Package类options参数不能为空')
    }

    if (!isObject(options)) {
      throw new Error('Package类options参数必须为object类型')
    }

    // package 目标路径
    this.targetPath = options.targetPath

    // 本地缓存 路径
    this.storeDir = options.storeDir

    // package的名称
    this.packageName = options.packageName

    // package的版本
    this.packageVersion = options.packageVersion

    // package的缓存目录前缀
    this.cacheFilePathPrefix = this.packageName.replace('/', '_')

  }

  async prepare() {

    if (this.storeDir && !pathExists(this.storeDir)) {
      fse.mkdirpSync(this.storeDir)
    }

    if (this.packageVersion === 'latest') {
      this.packageVersion = await getNpmLatestVersion(this.packageName)
    }
  }

  get cacheFilePath() {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`)
  }

  getSpecificCacheFilePath(packageVersion) {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`)
  }

  // 判断 Package 是否存在
  async exists() {
    if (this.storeDir) {
      await this.prepare()
      return pathExists(this.cacheFilePath)
    } else {
      return pathExists(this.targetPath)
    }
  }

  // 安装 Package
  async install() {
    await this.prepare()

    npmisntall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registory: getDefaultRegistry(),
      pkgs: [
        {
          name: this.packageName,
          version: this.packageVersion
        }
      ]
    })
  }

  // 更新 Package
  async update() {
    await this.prepare()

    const latestPackageVersion = await getNpmLatestVersion(this.packageName)
    const latestFilePath = this.getSpecificCacheFilePath(latestPackageVersion)

    if (!pathExists(latestFilePath)) {
      await npmisntall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registory: getDefaultRegistry(),
        pkgs: [
          {
            name: this.packageName,
            version: latestPackageVersion
          }
        ]
      })
      this.packageVersion = latestPackageVersion
    }

  }



  // 获取入口文件路径
  getRootFilePath() {

    function _getRootFile(targetPath) {
      const dir = pkgDir(targetPath)
      if (dir) {
        const pkgFile = require(path.resolve(dir, 'package.json'))
        if (pkgFile && pkgFile.main) {
          return formatPath(path.resolve(dir, pkgFile.main))
        }
      }
      return null
    }

    if (this.storeDir) {
      return _getRootFile(this.cacheFilePath)
    } else {
      return _getRootFile(this.targetPath)
    }

  }

}

module.exports = Package;
