const crypto = require('crypto')

const defaultOnError = (ctx, message) => {
  const log = ctx.log || console
  ctx.status = 401
  log.warn(message)
}

module.exports = ({
  secret,
  publish = () => {},
  deploy = () => {},
  onError = defaultOnError,
  header = 'x-hub-signature'
}) => {
  return (ctx, next) => {
    if (ctx.request.url === '/houston-hook') {
      if (secret) {
        const hmac = crypto.createHmac('sha1', secret)
        hmac.update(ctx.request.rawBody)
        const signature = Buffer.from(`sha1=${hmac.digest('hex')}`)
        const received = Buffer.from(ctx.request.headers[header] || '')
        if (crypto.timingSafeEqual(signature, received)) {
          ctx.status = 200
          if (ctx.request.body.action === 'published') {
            publish(ctx)
          } else {
            deploy(ctx)
          }
        } else {
          onError(ctx, 'Houston webhook request with invalid signature.')
        }
      } else {
        onError(ctx, 'You must pass a secret to the houston middleware.')
      }
    } else {
      next()
    }
  }
}
