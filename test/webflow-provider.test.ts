/* Copyright © 2022 Seneca Project Contributors, MIT License. */

import * as Fs from 'fs'

const Seneca = require('seneca')
const SenecaMsgTest = require('seneca-msg-test')

import WebflowProvider from '../src/webflow-provider'
import WebflowProviderDoc from '../src/WebflowProvider-doc'

const BasicMessages = require('./basic.messages.js')

// Only run some tests locally (not on Github Actions).
let Config: undefined = undefined
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
    expect(site0.name).toContain(Config.site0.name)
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
