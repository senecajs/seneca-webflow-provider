const Seneca = require('seneca')

Seneca({ legacy: false })
  .test()
  .use('@seneca/entity')
  .use('@seneca/env', {
    // debug: true,
    file: [__dirname + '/local-env.js;?'],
    var: {
      $WEBFLOW_ACCESSTOKEN: String,
    },
  })
  .use('@seneca/provider', {
    provider: {
      webflow: {
        keys: {
          accesstoken: { value: '$WEBFLOW_ACCESSTOKEN' },
        },
      },
    },
  })
  .use('../')
  .ready(async function () {
    const seneca = this

    console.log(await seneca.post('sys:provider,provider:webflow,get:info'))

    const list = await seneca.entity('provider/webflow/site').list$()
    console.log(list.slice(0, 3))
  })
