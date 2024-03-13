/* Copyright © 2022 Seneca Project Contributors, MIT License. */

const Pkg = require('../package.json')

const { WebflowClient } = require('webflow-api')

type WebflowProviderOptions = {}

function WebflowProvider(this: any, options: WebflowProviderOptions) {
  const seneca: any = this

  const entityBuilder = this.export('provider/entityBuilder')

  seneca.message('sys:provider,provider:webflow,get:info', get_info)

  async function get_info(this: any, _msg: any) {
    return {
      ok: true,
      name: 'webflow',
      version: Pkg.version,
      sdk: {
        name: 'webflow',
        version: Pkg.dependencies['webflow-api'],
      },
    }
  }

  // TODO: update cmds as per colitem to support new webflow sdk

  const entity = {
    site: {
      cmd: {
        list: {
          action: (undefined as any),
        },

        load: {
          action: (undefined as any)
        },
      },
    },

    collection: {
      cmd: {
        list: {
          action: (undefined as any)
        },

        load: {
          action: (undefined as any)
        },
      },
    },

    colitem: {
      cmd: {
        list: { action: (undefined as any) },

        load: {
          action: (undefined as any),
        }
      },
    },
  }


  entity.collection.cmd.list.action =
    async function list_collection(this: any, entize: any, msg: any) {
      const q = msg.q || {}
      const site_id = q.site_id
      let call = this.shared.sdk.collections.list.bind(this.shared.sdk.collections)
      let args = [site_id, { offset: 0 }]
      let items = await pager(call, args, { optIndex: 1, listField: 'collections' })

      items = items.map((data: any) => entize(data))
      return items
    }


  entity.collection.cmd.load.action =
    async function load_collection(this: any, entize: any, msg: any) {
      let q = msg.q || {}
      let id = q.id
      const args = [id, {}]

      try {
        let res = await this.shared.sdk.collections.get(...args)
        return entize(res)
      }
      catch (e: any) {
        if (404 === e.statusCode) {
          return null
        }

        throw e
      }
    }


  entity.site.cmd.list.action =
    async function list_site(this: any, entize: any, _msg: any) {
      let call = this.shared.sdk.sites.list.bind(this.shared.sdk.sites)
      let args = [{ offset: 0 }]
      let items = await pager(call, args, { optIndex: 0, listField: 'sites' })

      items = items.map((data: any) => entize(data))
      return items
    }


  entity.site.cmd.load.action =
    async function load_site(this: any, entize: any, msg: any) {
      let q = msg.q || {}
      let id = q.id
      const args = [id, {}]

      try {
        let res = await this.shared.sdk.sites.get(...args)
        return entize(res)
      }
      catch (e: any) {
        if (404 === e.statusCode) {
          return null
        }

        throw e
      }
    }

  entity.colitem.cmd.list.action =
    async function list_colitem(this: any, entize: any, msg: any) {
      const q = msg.q || {}
      const collection_id = q.collection_id
      const call = this.shared.sdk.collections.items.listItems
        .bind(this.shared.sdk.collections.items)
      const args = [collection_id, { offset: 0 }]

      try {
        const items = await pager(call, args, { optIndex: 1, listField: 'items' })
        return items.map((item: any) => entize(item))
      }
      catch (e: any) {
        // console.log('ERROR list_colitem', e)
        throw e
      }
    }

  entity.colitem.cmd.load.action =
    async function load_colitem(this: any, entize: any, msg: any) {
      let q = msg.q || {}
      let collection_id = q.collection_id
      let item_id = q.item_id
      const args = [collection_id, item_id, { skipValidation: true }]

      try {
        let res = await this.shared.sdk.collections.items.getItem(...args)
        return entize(res)
      }
      catch (e: any) {
        if (404 === e.statusCode) {
          return null
        }

        throw e
      }
    }

  async function pager(call: Function, args: any[], spec: {
    optIndex: number,
    listField: string
  }) {
    let items = []
    let opts = args[spec.optIndex] || {}
    let offset = opts.offset || 0

    let maxPages = 11 // TODO: option
    let end = false
    for (let pI = 0; pI < maxPages && !end; pI++) {
      // console.log('PAGE', pI, args)
      let res = await call(...args)
      items.push(...res[spec.listField])
      if (res.pagination) {
        offset += res.pagination.limit
        opts.offset = offset
        end = offset > res.pagination.total
        // console.log('N', end, offset, args, res.pagination)
      }
      else {
        end = true
      }
    }

    return items
  }


  entityBuilder(this, {
    provider: {
      name: 'webflow',
    },
    entity
  })

  seneca.prepare(async function(this: any) {
    let res = await this.post(
      'sys:provider,get:keymap,provider:webflow,key:accesstoken'
    )

    let accessToken = res.keymap.accesstoken.value

    this.shared.sdk = new WebflowClient({ accessToken })
  })

  return {
    exports: {
      sdk: () => this.shared.sdk,
    },
  }
}

// Default options.
const defaults: WebflowProviderOptions = {
  // TODO: Enable debug logging
  debug: false,
}

Object.assign(WebflowProvider, { defaults })

export default WebflowProvider

if ('undefined' !== typeof module) {
  module.exports = WebflowProvider
}
