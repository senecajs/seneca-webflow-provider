/* Copyright © 2022 Seneca Project Contributors, MIT License. */

import * as Fs from 'fs'



const Seneca = require('seneca')
const SenecaMsgTest = require('seneca-msg-test')

import TangocardProvider from '../src/tangocard-provider'
import TangocardProviderDoc from '../src/TangocardProvider-doc'

const BasicMessages = require('./basic.messages.js')


// Only run some tests locally (not on Github Actions).
let Config = undefined
if (Fs.existsSync(__dirname + '/local-config.js')) {
  Config = require('./local-config')
}


describe('tangocard-provider', () => {

  test('happy', async () => {
    expect(TangocardProvider).toBeDefined()
    expect(TangocardProviderDoc).toBeDefined()

    const seneca = await makeSeneca()

    expect(await seneca.post('sys:provider,provider:tangocard,get:info'))
      .toMatchObject({
        ok: true,
        name: 'tangocard',
      })
  })


  test('messages', async () => {
    const seneca = await makeSeneca()
    await (SenecaMsgTest(seneca, BasicMessages)())
  })


  /*
  test('board-basic', async () => {
    if (!Config) return;
    const seneca = await makeSeneca()

    const list = await seneca.entity("provider/tangocard/board").list$()
    expect(list.length > 0).toBeTruthy()

    const board0 = await seneca.entity("provider/tangocard/board")
      .load$(Config.board0.id)
    expect(board0.name).toContain('Welcome Board')

    board0.desc = 'DESC:' + Math.random()
    let board0r = await board0.save$()
    expect(board0r.id).toEqual(board0.id)
    expect(board0r.desc).toEqual(board0.desc)

    const board0u = await seneca.entity("provider/tangocard/board")
      .load$(Config.board0.id)
    expect(board0u.name).toContain('Welcome Board')
    expect(board0u.desc).toEqual(board0r.desc)

  })
  */
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
        $TANGOCARD_KEY: String,
        $TANGOCARD_NAME: String,
        $TANGOCARD_CUSTID: String,
        $TANGOCARD_ACCID: String,
      }
    })
    .use('provider', {
      provider: {
        tangocard: {
          keys: {
            key: { value: '$TANGOCARD_KEY' },
            name: { value: '$TANGOCARD_NAME' },
            cust: { value: '$TANGOCARD_CUSTID' },
            acc: { value: '$TANGOCARD_ACCID' },
          }
        }
      }
    })
    .use(TangocardProvider)

  return seneca.ready()
}

