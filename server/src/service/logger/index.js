const winston = require('winston')
const LokiTransport = require('winston-loki')
const { combine } = winston.format
const config = require('config')

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    // label({}),
    winston.format.json()
    // prettyPrint(),
    // winston.format.colorize(),
  ),
  defaultMeta: {}
})

logger._initial = () => {
  logger.add(
    new LokiTransport({
      host: config.loki.host,
      json: true,
      labels: { __app: config.app.name, __version: config.app.name },
      handleExceptions: true
    })
  )

  if (process.env.NODE_ENV !== 'production') {
    const consoleTransport = new winston.transports.Console({
      // format: winston.format.simple(),
      level: config.loki.level || 'debug',
      handleExceptions: true
    })
    logger.add(consoleTransport)
    // logger.remove(consoleTransport)
    // consoleTransport = null
  }
}

module.exports = { logger }
