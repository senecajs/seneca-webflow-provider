const Webflow = require('webflow-api')
import { WEBFLOW_TOKEN } from './local-env-template'

run()

async function run() {
  // initialize the client with the access token
  const webflow = new Webflow({ WEBFLOW_TOKEN })

  console.log('WEBFLOW', webflow)

  const sites = await webflow.sites()

  console.log('SITES', sites)

  // // fully loaded
  // const webflow = new Webflow({
  //   token: "[ACCESS TOKEN]",
  //   version: "1.0.0",
  //   mode: "cors",
  //   headers: {
  //     "User-Agent": "My Webflow App / 1.0"
  //   }
  // });
}
