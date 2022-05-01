const { ImgBll } = require('src/blls/img')

/**
 * replace api endpoint
 */
const api = async ctx => {
  const { _data } = ctx.state
  const result = await ImgBll.replace(_data)
  ctx.body = { err: 0, data: { result } }
}
api.route = ['post', '/img/replace']
api.before = [
]
api.validator = {
  type: 'object',
  properties: {
    bucket: { type: 'string' },
    path: { type: 'string' },
    logoPath: { type: 'string' },
    dstBucket: { type: 'string' },
    dstPath: { type: 'string' }
  },
  required: ['bucket', 'path', 'dstBucket', 'dstPath', 'logoPath'],
  target: 'request.body',
  additionalProperties: false,
  ajvOptions: {
    removeAdditional: true,
    $data: true
  }
}
module.exports = api
