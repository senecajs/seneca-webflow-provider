const Seneca = require('seneca')

const { WebflowClient } = require('webflow-api')
const accessToken = require('./local-env').WEBFLOW_ACCESSTOKEN

// runDirect()
runSeneca()

async function runDirect() {
  // initialize the client with the access token
  const webflow = new WebflowClient({ accessToken })

  // const col = await webflow.collections.get('62ac4be6f216e4e2796c3a8d')
  // console.log(col)

  const items = await webflow.collections.items.listItems('62ac4be6f216e4e2796c3a8d',{
    // offset: 100
  })
  console.log(items)
  // const items = await col.listItems()
  // console.log(items)

}


async function runSeneca() {
  const seneca = await Seneca({legacy:false})
        .test()
        .use('promisify')
        .use('entity')
        .use('env', {
          file: [__dirname + '/local-env.js;?'],
          var: {
            $WEBFLOW_ACCESSTOKEN: String,
          },
        })
        .use('provider',{
          provider: {
            webflow: {
              keys: {
                accesstoken: { value: '$WEBFLOW_ACCESSTOKEN' },
              },
            },
          },
        })
        .use('..') // webflow-provider
        .ready()

  const cols = await seneca.entity('provider/webflow/collection').list$({
    site_id: '62893b90ef00fa71089d14c6'
  })
  // console.log('cols', cols)

  const col0 = await seneca.entity('provider/webflow/collection')
        .load$('62ac4be6f216e4e2796c3a8d')
  // console.log('col0', col0)

  const sites = await seneca.entity('provider/webflow/site').list$()
  // console.log('sites', sites)

  const site0 = await seneca.entity('provider/webflow/site').load$(sites[0].id)
  // console.log('site0', site0)

  const site1 = await seneca.entity('provider/webflow/site').load$('72893b90ef00fa71089d14c6')
  // console.log('site1', site1)
  
  const items = await seneca.entity('provider/webflow/colitem').list$({
     collection_id: '62ac4be6f216e4e2796c3a8d'
  })
  
  // console.log(items.length)
  // console.log(items[0])

  let q = {
    collection_id: col0.id,
    item_id: items[0].id,
  }
  const item = await seneca.entity('provider/webflow/colitem').load$(q)

  console.log(item)
  console.log(q)
}
