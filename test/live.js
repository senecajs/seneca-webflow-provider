const Seneca = require('seneca')

Seneca({ legacy: false })
  .test()
  .use('promisify')
  .use('entity')
  .use('env', {
    // debug: true,
    file: [__dirname + '/local-env.js;?'],
    var: {
      $WEBFLOW_ACCESSTOKEN: String,
    },
  })
  .use('provider', {
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
