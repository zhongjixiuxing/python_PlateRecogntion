const { minioClient } = require('src/service/minio')

class MinioBll {
  constructor () {
    this.minio = minioClient
  }

  async upload (data) {
    return await this.minio.upload(data)
  }

  /**
   *
   * @param {*} path 源文件路径
   * @param {*} bucket 文件的 bucket
   * @param {*} dst 保存目标路径
   */
  async download (path, bucket, dst) {
    return await this.minio.download(path, bucket, dst)
  }
}

module.exports = { MinioBll, minioBll: new MinioBll() }
