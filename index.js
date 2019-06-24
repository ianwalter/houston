const token = require('token')

const defaultOnError = (ctx, message) => {
  const log = ctx.log || console
  ctx.status = 401
  log.warn(message)
}

module.export = ({
  secret,
  deploy,
  onError = defaultOnError,
  header = 'x-hub-signature'
}) => {
  return (ctx, next) => {
    if (ctx.request.url === '/houston-hook') {
      if (secret) {
        if (token.verify(secret, ctx.request.headers[header] || '')) {
          ctx.status = 200
          deploy(ctx.request.body)
        } else {
          await onError(ctx, 'Houston webhook request with invalid signature.')
        }
      } else {
        onError(ctx, 'You must pass a secret to the houston middleware.')
      }
    }
    next()
  }
}
