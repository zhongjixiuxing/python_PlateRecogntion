const base64Info = process.env.MINIO_CFG_BASE64
if (!base64Info) {
  throw new Error('Missing MINIO_CFG_BASE64 env')
}

const t = Buffer.from(base64Info, 'base64')
module.exports = JSON.parse(t.toString())
