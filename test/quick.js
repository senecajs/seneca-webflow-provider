


const Webflow = require("webflow-api");

run()

async function run() {

  const token = '2dccc032ba7e8f273d59453da0142230028f26c957e07af943dedf050d74455c'
  
  // initialize the client with the access token
  const webflow = new Webflow({ token });

  console.log('WEBFLOW', webflow)

  const sites = await webflow.sites();

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




