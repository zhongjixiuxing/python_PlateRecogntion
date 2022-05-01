const { minioBll } = require('./minio')
const path = require('path')
const fs = require('fs')
const spawn = require('child_process').spawnSync
const { customAlphabet } = require('nanoid')
const nanoid = customAlphabet(
  '0123456789AaBbCcEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz',
  12
)

const cachePath = path.resolve(__dirname, '../.cache')
class ImgBll {
  // 替换识别的车牌
  static async replace (payload) {
    const { logoPath, bucket, path, dstBucket, dstPath } = payload
    if (!await ImgBll.checkLogo(logoPath, bucket)) {
      throw new Error('checkLogo error')
    }

    const t = path.split('/')
    const fName = t[t.length - 1]
    const absoluteFName = `${cachePath}/${fName}`

    const localFName = `${cachePath}/${nanoid()}_${fName}`
    try {
      await minioBll.download(path, bucket, absoluteFName)
      const data = {
        src: absoluteFName,
        dst: localFName
      }

      const { output } = spawn('python3', ['/app/replace.py', JSON.stringify(data)], {
        env: {
          PYTHONIOENCODING: 'utf-8',
          DISPLAY: ':1'
        },
        cwd: '/app'
      })

      let isFinished = false
      console.log('python replace output ================== ')
      for (const o of output) {
        if (!o) {
          continue
        }
        const lineText = o.toString()
        if (lineText) {
          console.log('o: ', lineText)
          if (lineText.trim() === localFName) {
            isFinished = true
          }
        }
      }
      console.log('end python replace output ================== ')
      if (!isFinished) {
        throw new Error('python exec error[isFinished]')
      }

      const uploadBody = {
        bucket: dstBucket,
        dst: dstPath,
        url: localFName
      }

      const result = await minioBll.upload(uploadBody)
      return result
    } finally {
      fs.unlinkSync(absoluteFName)
      fs.unlinkSync(localFName)
    }
  }

  // 下载 logo 图片到本地
  static async checkLogo (logoPath, bucket) {
    const temp = logoPath.split('/')
    const logoFileName = `${cachePath}/${temp[temp.length - 1]}`
    if (fs.existsSync(logoFileName)) {
      return true
    }

    return await minioBll.download(logoPath, bucket, logoFileName)
  }

  // 下载文件到本地
  download () {

  }

  // 上传文件到远程
  upload () {

  }
}

module.exports = { ImgBll, imgBll: new ImgBll() }
