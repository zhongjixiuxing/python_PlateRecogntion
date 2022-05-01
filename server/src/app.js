const Koa = require('koa')
const bodyparser = require('koa-bodyparser')
const config = require('config')
const Router = require('@anxing131/q-router')
const path = require('path')
const router = new Router({})
router.addApis(path.resolve(__dirname, './apis'), config.routePrefix || '')

const app = new Koa()

app.use(bodyparser())
app.use(router.routes)

module.exports = app
