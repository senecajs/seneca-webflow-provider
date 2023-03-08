const Webflow = require('webflow-api')
const token = require('./local-env').WEBFLOW_ACCESSTOKEN

run()

async function run() {
  // initialize the client with the access token
  const webflow = new Webflow({ token })

  const col = await webflow.collection({
    collectionId: '',
  })
  const colItems = await col.items()
  console.log(colItems)
}
