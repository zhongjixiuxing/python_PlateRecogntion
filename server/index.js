require('app-module-path').addPath(__dirname)
require('dotenv').config()
const config = require('config')

const app = require('src/app')
app.listen(config.app.port, function () {
  console.debug(`Server listen on ${config.app.port}`)
})
