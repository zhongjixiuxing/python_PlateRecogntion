const { Client, CopyConditions } = require('minio')
const { createHash } = require('crypto')
const path = require('path')
const _ = require('lodash')
const config = require('config')

class MinioClient {
  // static clients = new Map()

  md5 (buffer) {
    if (!Buffer.isBuffer(buffer)) buffer = Buffer.from(String(buffer))
    return createHash('md5').update(buffer).digest('hex')
  }

  /**
   *
   * @param stream
   * @returns Buffer
   */
  streamToBuffer (stream) {
    return new Promise((resolve, reject) => {
      const buffers = []
      stream.on('error', reject)
      stream.on('data', (data) => buffers.push(data))
      stream.on('end', () => resolve(Buffer.concat(buffers)))
    })
  }

  getBasenameFromUrl (urlStr) {
    const url = new URL(urlStr)
    return path.basename(url.pathname)
  }

  /**
   * upload file to bucket by url
   *
   * @param data
   */
  async upload (data) {
    const { client, cfg } = MinioClient.getClient(data.bucket)
    // upload to bucket
    await client.fPutObject(data.bucket, data.dst, data.url)

    // return uploaded infos
    return await client.statObject(cfg.bucket, data.dst)
  }

  /**
   * 下载制定文件指定路径
   * @param {*} */
  async download (path, bucket, dst) {
    const { client } = MinioClient.getClient(bucket)
    await client.fGetObject(bucket, path, dst)
    return true
  }

  /**
   *
   * @param source
   * @param target
   */
  async copy (source, target) {
    const conds = new CopyConditions()
    conds.setMatchETag(source.md5)

    const { client, cfg } = MinioClient.getClient('asset')
    const { cfg: tempBucketCfg } = MinioClient.getClient('external')

    const result = await client.copyObject(
      cfg.bucket,
      `${target.s3Name}`,
      `/${tempBucketCfg.bucket}/${tempBucketCfg.bucket}/${source.s3Name}`,
      conds
    )

    return result
  }

  async statObject (bucket, path) {
    const { client } = MinioClient.getClient('asset')
    return await client.statObject(bucket, path)
  }

  static getClient (name) {
    if (MinioClient.clients.has(name)) {
      return MinioClient.clients.get(name)
    }

    const cfg = _.find(config.minios, (c) => c.bucket === name)
    if (!cfg) {
      throw new Error(`Not exist Minio.${name} bucket`)
    }
    const client = new Client(cfg)
    MinioClient.clients.set(name, { client, cfg })

    return { client, cfg }
  }

  /**
   * get put object presigned (external network).
   *
   * @param bucket storage bucket
   * @param name file name
   * @param expiry presigned expiry time(second)
   * @returns
   */
  async getPresignedPutObjectPublic (bucket, name, expiry = 3600) {
    const { client } = MinioClient.getClient('external')
    return client.presignedPutObject(bucket, name, expiry)
  }

  async getPresignedGetObjectPublic (bucket, name, expiry = 3600 * 12) {
    const { client } = MinioClient.getClient('external')
    return client.presignedGetObject(bucket, name, expiry)
  }
}

MinioClient.clients = new Map()

module.exports = { MinioClient, minioClient: new MinioClient() }
