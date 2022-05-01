
const minio = require('./minio')

module.exports = {
  app: {
    app_env: process.env.APP_ENV || 'debug',
    port: process.env.APP_PORT || 8080,
    name: process.env.APP_NAME || 'node.js server'
  },
  minios: minio
}
