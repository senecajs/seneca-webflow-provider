const Webflow = require('webflow-api')
const token = require('./local-env').WEBFLOW_ACCESSTOKEN

run()

async function run() {
  // initialize the client with the access token
  const webflow = new Webflow({ token })

  // const site = await webflow.sites()
  const site = await webflow.site({ siteId: '62893b90ef00fa71089d14c6' })
  const collection = await site.collections()
  // const [epItem] = await collection[0].items()
  // const [catItem] = await collection[1].items()
  // const items = await collection[0].items({ itemId: '[ITEM ID]' })

  // console.log('WEBFLOW', webflow)
  console.log('SITES', site)
  console.log('COLLECTIONS', collection)
  // console.log('EP ITEM', epItem)
  // console.log('CAT ITEM', catItem)
  // console.log('ITEMS LENGTH', items.length)
}
