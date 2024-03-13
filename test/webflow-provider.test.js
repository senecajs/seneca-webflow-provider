/* Copyright © 2022 Seneca Project Contributors, MIT License. */

const Fs = require('node:fs')

const Seneca = require('seneca')
const SenecaMsgTest = require('seneca-msg-test')
const { Maintain } = require('@seneca/maintain')

const WebflowProvider = require('../dist/webflow-provider')
const WebflowProviderDoc = require('../dist/WebflowProvider-doc')

const BasicMessages = require('./basic.messages.js')

// Only run some tests locally (not on Github Actions).
let Config = undefined
if (Fs.existsSync(__dirname + '/local-config.js')) {
  Config = require('./local-config')
}

describe('webflow-provider', () => {
  test('happy', async () => {
    expect(WebflowProvider).toBeDefined()
    expect(WebflowProviderDoc).toBeDefined()

    const seneca = await makeSeneca()

    expect(
      await seneca.post('sys:provider,provider:webflow,get:info')
    ).toMatchObject({
      ok: true,
      name: 'webflow',
    })
  })

  test('messages', async () => {
    const seneca = await makeSeneca()
    await SenecaMsgTest(seneca, BasicMessages)()
  })

  
  test('site-basic', async () => {
    if (!Config) return
    const seneca = await makeSeneca()

    // does this:   const sites = await webflow.sites();
    const list = await seneca.entity('provider/webflow/site').list$()
    expect(list.length > 0).toBeTruthy()

    const site0 = await seneca
      .entity('provider/webflow/site')
          .load$(Config.site0.id)
    expect(site0.shortName).toContain(Config.site0.shortName)
  })

  
  test('collection-basic', async () => {
    if (!Config) return
    const seneca = await makeSeneca()

    const list = await seneca
      .entity('provider/webflow/collection')
          .list$({site_id:Config.site0.id})
    expect(list.length > 0).toBeTruthy()

    
    const collection0 = await seneca
      .entity('provider/webflow/collection')
          .load$(Config.site0.collections.collection0.id)
    // console.log(collection0)
    
    expect(collection0.slug).toContain(
      Config.site0.collections.collection0.slug
    )
  })

  
  test('item-basic', async () => {
    if (!Config) return
    const seneca = await makeSeneca()

    const list = await seneca
      .entity('provider/webflow/colitem')
          .list$({collection_id: Config.site0.collections.collection0.id})
    expect(list.length > 0).toBeTruthy()
    

    let q = {
      collection_id: Config.site0.collections.collection0.id,
      item_id: Config.site0.collections.collection0.items.item0.id,
    }
    
    const item0 = await seneca.entity('provider/webflow/colitem').load$(q)
    // console.log(item0)
    // console.log(q)
    
    expect(item0.id).toContain(
      Config.site0.collections.collection0.items.item0.id
    )
  })

  
  test('maintain', async () => {
    await Maintain()
  })
})

async function makeSeneca() {
  const seneca = Seneca({ legacy: false })
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
    .use(WebflowProvider)

  return seneca.ready()
}
