/* Copyright © 2022 Seneca Project Contributors, MIT License. */

const Fs = require('node:fs')
const Http = require('node:http')

// Live tests call the Webflow Data API v2. They need a Webflow access token
// and the ids of a site, one of its collections and one of that
// collection's items: test/local-config.js (see local-config-template.js)
// with the token in test/local-env.js, or the environment variables
// WEBFLOW_ACCESSTOKEN, WEBFLOW_SITE0_ID, WEBFLOW_COLLECTION0_ID and
// WEBFLOW_ITEM0_ID. Without them the same tests run against a local mock of
// the Webflow API, and the env plugin gets a dummy token.
let Config = undefined
if (Fs.existsSync(__dirname + '/local-config.js')) {
  Config = require('./local-config')
}
else if (process.env.WEBFLOW_ACCESSTOKEN && process.env.WEBFLOW_SITE0_ID &&
  process.env.WEBFLOW_COLLECTION0_ID && process.env.WEBFLOW_ITEM0_ID) {
  Config = {
    site0: {
      id: process.env.WEBFLOW_SITE0_ID,
      collections: {
        collection0: {
          id: process.env.WEBFLOW_COLLECTION0_ID,
          items: { item0: { id: process.env.WEBFLOW_ITEM0_ID } },
        },
      },
    },
  }
}

const LIVE = null != Config

const MOCK_SITE0_ID = '580e63e98c9a982ac9b8b741'
const MOCK_COLLECTION0_ID = '580e63fc8c9a982ac9b8b745'
const MOCK_ITEM0_ID = '580e64008c9a982ac9b8b754'

if (!LIVE) {
  process.env.WEBFLOW_ACCESSTOKEN ??= 'test-accesstoken'
  Config = {
    site0: {
      id: MOCK_SITE0_ID,
      shortName: 'mock-site',
      collections: {
        collection0: {
          id: MOCK_COLLECTION0_ID,
          slug: 'posts',
          items: { item0: { id: MOCK_ITEM0_ID } },
        },
      },
    },
  }
}

let mock = null

// The plugin has no option for the API host, so the test adds the
// environment option of the SDK (its base URL) to the client that the
// plugin creates. The plugin still passes its own access token.
const mockClients = []
jest.mock('webflow-api', () => {
  const actual = jest.requireActual('webflow-api')
  class WebflowClient extends actual.WebflowClient {
    constructor(options) {
      super(mock ? { ...options, environment: mock.url } : options)
      mockClients.push(this)
    }
  }
  return { ...actual, WebflowClient }
})

const Seneca = require('seneca')
const SenecaMsgTest = require('seneca-msg-test')
const { Maintain } = require('@seneca/maintain')

const WebflowProvider = require('../dist/webflow-provider')
const WebflowProviderDoc = require('../dist/WebflowProvider-doc')

const BasicMessages = require('./basic.messages.js')

beforeAll(async () => {
  if (!LIVE) {
    mock = await makeMockWebflowApi()
  }
})

afterAll(async () => {
  if (mock) {
    await mock.close()
  }
})

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

    await seneca.close()
  })

  test('messages', async () => {
    const seneca = await makeSeneca()
    await SenecaMsgTest(seneca, BasicMessages)()
    await seneca.close()
  })


  test('site-basic', async () => {
    const seneca = await makeSeneca()

    // does this:   const sites = await webflow.sites();
    const list = await seneca.entity('provider/webflow/site').list$()
    expect(list.length > 0).toBeTruthy()

    const site0 = await seneca
      .entity('provider/webflow/site')
      .load$(Config.site0.id)
    expect(site0.id).toEqual(Config.site0.id)
    if (Config.site0.shortName) {
      expect(site0.shortName).toContain(Config.site0.shortName)
    }

    if (mock) {
      // Webflow answers an unknown site with 404, which the plugin turns
      // into a null load.
      expect(await seneca.entity('provider/webflow/site')
        .load$('5f0c0ffee0000000000000b0')).toBeNull()

      expect(mock.calls.map((c) => c.method + ' ' + c.path)).toEqual([
        'GET /v2/sites',
        'GET /v2/sites/' + MOCK_SITE0_ID,
        'GET /v2/sites/5f0c0ffee0000000000000b0',
      ])
    }

    await seneca.close()
  })


  test('collection-basic', async () => {
    const seneca = await makeSeneca()

    const list = await seneca
      .entity('provider/webflow/collection')
      .list$({ site_id: Config.site0.id })
    expect(list.length > 0).toBeTruthy()


    const collection0 = await seneca
      .entity('provider/webflow/collection')
      .load$(Config.site0.collections.collection0.id)

    expect(collection0.id).toEqual(Config.site0.collections.collection0.id)
    if (Config.site0.collections.collection0.slug) {
      expect(collection0.slug).toContain(
        Config.site0.collections.collection0.slug
      )
    }

    if (mock) {
      expect(mock.calls.map((c) => c.method + ' ' + c.path)).toEqual([
        'GET /v2/sites/' + MOCK_SITE0_ID + '/collections',
        'GET /v2/collections/' + MOCK_COLLECTION0_ID,
      ])
    }

    await seneca.close()
  })


  test('item-basic', async () => {
    const seneca = await makeSeneca()

    const list = await seneca
      .entity('provider/webflow/colitem')
      .list$({ collection_id: Config.site0.collections.collection0.id })
    expect(list.length > 0).toBeTruthy()


    let q = {
      collection_id: Config.site0.collections.collection0.id,
      item_id: Config.site0.collections.collection0.items.item0.id,
    }

    const item0 = await seneca.entity('provider/webflow/colitem').load$(q)

    expect(item0.id).toContain(
      Config.site0.collections.collection0.items.item0.id
    )

    if (mock) {
      // Three items with a page size of two: the plugin reads two pages.
      expect(list.map((item) => item.id)).toEqual([
        MOCK_ITEM0_ID, '580e64008c9a982ac9b8b755', '580e64008c9a982ac9b8b756'
      ])
      expect(item0.fieldData.name).toEqual('Mock Item 0')

      expect(mock.calls.map((c) => c.method + ' ' + c.path + c.search))
        .toEqual([
          'GET /v2/collections/' + MOCK_COLLECTION0_ID + '/items?offset=0',
          'GET /v2/collections/' + MOCK_COLLECTION0_ID + '/items?offset=2',
          'GET /v2/collections/' + MOCK_COLLECTION0_ID + '/items/' +
          MOCK_ITEM0_ID,
        ])
    }

    await seneca.close()
  })


  test('maintain', async () => {
    const exclude = []

    // check_default proves the default branch is main by looking for
    // [branch "main"] in .git/config. Only a branch checkout records that
    // section: a pull_request build checks out the merge ref, and the
    // publish build checks out a tag as a detached HEAD. Neither says
    // anything about what the default branch is, so skip rather than fail.
    if ('pull_request' === process.env.GITHUB_EVENT_NAME ||
      'tag' === process.env.GITHUB_REF_TYPE) {
      exclude.push('check_default')
    }

    // url_pkgjson locates package.json by comparing process.cwd() + '/package.json'
    // against a path found with Filehound. On Windows those are the same file
    // spelt with different separators, so the url is never read.
    if ('win32' === process.platform) {
      exclude.push('url_pkgjson')
    }

    await Maintain({ exclude })
  })
})

async function makeSeneca() {
  const seneca = Seneca({ legacy: false })
    .test()
    .use('@seneca/entity')
    .use('@seneca/env', {
      // debug: true,
      file: [__dirname + '/local-env.js;?'],
      var: {
        $WEBFLOW_ACCESSTOKEN: String,
      },
    })
    .use('@seneca/provider', {
      provider: {
        webflow: {
          keys: {
            accesstoken: { value: '$WEBFLOW_ACCESSTOKEN' },
          },
        },
      },
    })
    .use(WebflowProvider)

  await seneca.ready()

  if (mock) {
    mock.calls.length = 0

    // Fail here rather than send a request to Webflow if the plugin ever
    // builds its client some other way.
    if (!mockClients.includes(seneca.export('WebflowProvider/sdk')())) {
      throw new Error('webflow SDK: cannot point the client at the mock API')
    }
  }

  return seneca
}


// A local stand-in for the Webflow Data API v2 calls that the tests make:
// GET /v2/sites, GET /v2/sites/{site_id}, GET /v2/sites/{site_id}/collections,
// GET /v2/collections/{collection_id},
// GET /v2/collections/{collection_id}/items and
// GET /v2/collections/{collection_id}/items/{item_id}. It needs a bearer
// token, as Webflow does. The objects and the error bodies
// ({ code, message }) have the shape of the Webflow API reference, with a
// few fields. Item lists are paged two at a time, to exercise the plugin's
// pager.
async function makeMockWebflowApi() {
  const calls = []

  const PAGE_LIMIT = 2
  const when = '2026-11-21T00:00:00.000Z'

  const sites = {
    [MOCK_SITE0_ID]: {
      id: MOCK_SITE0_ID,
      workspaceId: '580e63e98c9a982ac9b8b740',
      createdOn: when,
      displayName: 'Mock Site',
      shortName: 'mock-site',
      lastPublished: when,
      lastUpdated: when,
      previewUrl: 'https://mock-site.webflow.io',
      timeZone: 'Europe/Dublin',
      customDomains: [],
    },
  }

  const collections = {
    [MOCK_COLLECTION0_ID]: {
      id: MOCK_COLLECTION0_ID,
      displayName: 'Posts',
      singularName: 'Post',
      slug: 'posts',
      createdOn: when,
      lastUpdated: when,
      fields: [
        {
          id: '7f15043107e2fc95644e93807ee25dd6',
          isRequired: true,
          isEditable: true,
          type: 'PlainText',
          slug: 'name',
          displayName: 'Name',
        },
        {
          id: '7f15043107e2fc95644e93807ee25dd7',
          isRequired: true,
          isEditable: true,
          type: 'PlainText',
          slug: 'slug',
          displayName: 'Slug',
        },
      ],
    },
  }

  const items = [0, 1, 2].map((i) => ({
    id: '580e64008c9a982ac9b8b75' + (4 + i),
    cmsLocaleId: '653ad57de882f528b32e810e',
    lastPublished: when,
    lastUpdated: when,
    createdOn: when,
    isArchived: false,
    isDraft: false,
    fieldData: { name: 'Mock Item ' + i, slug: 'mock-item-' + i },
  }))

  const listOf = (map) =>
    Object.values(map).map(({ fields, ...rest }) => rest)

  const server = Http.createServer((req, res) => {
    req.resume()
    req.on('end', () => {
      const url = new URL(req.url || '/', 'http://127.0.0.1')
      const path = url.pathname

      // The token never reaches the record of calls.
      calls.push({ method: req.method, path, search: url.search })

      const send = (status, out) => {
        res.writeHead(status, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(out))
      }

      const notFound = () => send(404, {
        code: 'resource_not_found',
        message: 'Requested resource not found',
        externalReference: null,
        details: [],
      })

      if (req.headers.authorization !==
        'Bearer ' + process.env.WEBFLOW_ACCESSTOKEN) {
        return send(401, {
          code: 'not_authorized',
          message: 'Request not authorized',
          externalReference: null,
          details: [],
        })
      }

      if ('GET' !== req.method) {
        return notFound()
      }

      let m

      if ('/v2/sites' === path) {
        return send(200, { sites: Object.values(sites) })
      }

      if ((m = path.match(/^\/v2\/sites\/([^/]+)$/))) {
        return sites[m[1]] ? send(200, sites[m[1]]) : notFound()
      }

      if ((m = path.match(/^\/v2\/sites\/([^/]+)\/collections$/))) {
        return sites[m[1]] ?
          send(200, { collections: listOf(collections) }) : notFound()
      }

      if ((m = path.match(/^\/v2\/collections\/([^/]+)$/))) {
        return collections[m[1]] ? send(200, collections[m[1]]) : notFound()
      }

      if ((m = path.match(/^\/v2\/collections\/([^/]+)\/items$/))) {
        if (!collections[m[1]]) {
          return notFound()
        }
        const offset = parseInt(url.searchParams.get('offset') || '0', 10)
        return send(200, {
          items: items.slice(offset, offset + PAGE_LIMIT),
          pagination: { limit: PAGE_LIMIT, offset, total: items.length },
        })
      }

      if ((m = path.match(/^\/v2\/collections\/([^/]+)\/items\/([^/]+)$/))) {
        const item = items.find((item) => item.id === m[2])
        return collections[m[1]] && item ? send(200, item) : notFound()
      }

      notFound()
    })
  })

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))

  const port = server.address().port

  return {
    url: `http://127.0.0.1:${port}/v2`,
    calls,
    close: () =>
      new Promise((resolve) => {
        server.closeAllConnections()
        server.close(() => resolve())
      }),
  }
}
