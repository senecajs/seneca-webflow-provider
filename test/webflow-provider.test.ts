/* Copyright © 2022 Seneca Project Contributors, MIT License. */

import Webflow from 'webflow-api'

const token = require('./local-env-template').WEBFLOW_TOKEN
const webflow = new Webflow({ token })

describe('webflow-provider', () => {
  test('access', async () => {
    expect(webflow).toBeDefined()
  })

  test('site', async () => {
    expect(webflow).toBeDefined()

    const [site] = await webflow.sites()
    expect(site).toMatchObject({
      _id: '62893b90ef00fa71089d14c6',
      name: 'voxgig.com',
    })
  })

  test('collections', async () => {
    expect(webflow).toBeDefined()
    // Cannot redeclare site
    // const [site] = await webflow.sites()
    // Without redeclaration, site is unknown
    // expect(site).toBeDefined()

    const [site4col] = await webflow.sites()
    expect(site4col).toBeDefined()

    const collections = await site4col.collections()
    expect(collections).toMatchObject([
      { _id: '62ac4be6f216e4e2796c3a8d', name: 'Podcast Episodes' },
      { _id: '63638ffb30032c83f39f2076', name: 'Podcast Categories' },
    ])
  })

  test('items', async () => {
    expect(webflow).toBeDefined()
    // Same redeclaration issues

    const [site4col] = await webflow.sites()
    expect(site4col).toBeDefined()
    const col4items = await site4col.collections()
    expect(col4items).toBeDefined()

    // Pod Episodes
    const epitems = await col4items[0].items()
    const sampleEp = epitems[Math.floor(Math.random() * epitems.length)]
    expect(sampleEp).toHaveProperty('episode-number')
    expect(sampleEp).toHaveProperty('show-notes')
    expect(sampleEp).toHaveProperty('uuid')

    // Pod Categories
    const catitems = await col4items[1].items()
    const sampleCat = catitems[Math.floor(Math.random() * catitems.length)]
    expect(sampleCat).toHaveProperty('description')
  })
})
