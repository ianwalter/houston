require('systemd')
require('dotenv').config()
const Koa = require('koa')
const pino = require('koa-pino-logger')

// Use pino for logging.
const loggerMiddleware = pino()
const { logger } = loggerMiddleware

//
const port = process.env.LISTEN_PID > 0 ? 'systemd' : 10101
const secret = process.env.HOUSTON_SECRET

// Error out if the environment variable containing the webhook secret is not
// set.
if (!secret) {
  logger.fatal('You must set the HOUSTON_SECRET environment variable.')
  process.exit(1)
}

// Create the server instance.
const server = new Koa()

// Have the server use pino to log request/responses.
server.use(loggerMiddleware)

// Handle deployment requests.
server.use(ctx => (ctx.body = 'Hello World'))

// Have the server listen on a port.
server.listen(port)

// Alert the user that the server has started.
logger.info(`We have lift off on port ${port}! 🚀`)
