/* Copyright © 2022 Seneca Project Contributors, MIT License. */


const Pkg = require('../package.json')


type TangocardProviderOptions = {
  url: string
  fetch: any
  entity: Record<string, any>
  debug: boolean
}


function TangocardProvider(this: any, options: TangocardProviderOptions) {
  const seneca: any = this

  const entityBuilder = this.export('provider/entityBuilder')


  seneca
    .message('sys:provider,provider:tangocard,get:info', get_info)


  const makeUrl = (suffix: string, q: any) => {
    let url = options.url + suffix
    if (q) {
      if ('string' === typeof q) {
        url += '/' + encodeURIComponent(q)
      }
      else if ('object' === typeof q && 0 < Object.keys(q).length) {
        url += '?' + Object
          .entries(q)
          .reduce(((u: any, kv: any) =>
            (u.append(kv[0], kv[1]), u)), new URLSearchParams())
          .toString()

      }
    }
    return url
  }

  const makeConfig = (config?: any) => seneca.util.deep({
    headers: {
      ...seneca.shared.headers
    }
  }, config)


  const getJSON = async (url: string, config?: any) => {
    let res = await options.fetch(url, config)

    if (200 == res.status) {
      let json: any = await res.json()
      return json
    }
    else {
      let err: any = new Error('TangocardProvider ' + res.status)
      err.tangocardResponse = res
      throw err
    }
  }


  const postJSON = async (url: string, config: any) => {
    config.body = 'string' === typeof config.body ? config.body :
      JSON.stringify(config.body)

    config.headers['Content-Type'] = config.headers['Content-Type'] ||
      'application/json'

    config.method = config.method || 'POST'

    let res = await options.fetch(url, config)

    if (200 <= res.status && res.status < 300) {
      let json: any = await res.json()
      return json
    }
    else {
      let err: any = new Error('TangocardProvider ' + res.status)
      try {
        err.body = await res.json()
      }
      catch (e: any) {
        err.body = await res.text()
      }
      err.status = res.status
      throw err
    }
  }


  async function get_info(this: any, _msg: any) {
    return {
      ok: true,
      name: 'tangocard',
      version: Pkg.version,
    }
  }


  entityBuilder(this, {
    provider: {
      name: 'tangocard'
    },
    entity: {
      customer: {
        cmd: {
          list: {
            action: async function(this: any, entize: any, msg: any) {
              let json: any = await getJSON(makeUrl('customers', msg.q), makeConfig())
              let customers = json
              let list = customers.map((data: any) => entize(data))
              return list
            },
          }
        }
      },
      brand: {
        cmd: {
          list: {
            action: async function(this: any, entize: any, msg: any) {
              let json: any = await getJSON(makeUrl('catalogs', msg.q), makeConfig())
              let brands = json.brands
              let list = brands.map((data: any) => entize(data))
              return list
            },
          }
        }
      },
      order: {
        cmd: {
          list: {
            action: async function(this: any, entize: any, msg: any) {
              let json: any = await getJSON(makeUrl('orders', msg.q), makeConfig())
              let orders = json.orders
              let list = orders.map((data: any) => entize(data))

              // TODO: ensure seneca-transport preserves array props
              list.page = json.page

              return list
            },
          },
          save: {
            action: async function(this: any, entize: any, msg: any) {
              let body = this.util.deep(
                this.shared.primary,
                options.entity.order.save,
                msg.ent.data$(false)
              )

              console.log('TANGO SAVE ORDER')
              console.dir(body)

              let json: any = await postJSON(makeUrl('orders', msg.q), makeConfig({
                body
              }))

              console.log('TANGO SAVE ORDER RES')
              console.dir(json)

              let order = json
              order.id = order.referenceOrderID
              return entize(order)
            },
          }
        }
      }
    }

    // save: {
    //   action: async function(this: any, entize: any, msg: any) {
    //     let ent = msg.ent
    //     try {
    //       let res
    //       if (ent.id) {
    //         // TODO: util to handle more fields
    //         res = await this.shared.sdk.updateBoard(ent.id, {
    //           desc: ent.desc
    //         })
    //       }
    //       else {
    //         // TODO: util to handle more fields
    //         let fields = {
    //           name: ent.name,
    //           desc: ent.desc,
    //         }
    //         res = await this.shared.sdk.addBoard(fields)
    //       }

    //       return entize(res)
    //     }
    //     catch (e: any) {
    //       if (e.message.includes('invalid id')) {
    //         return null
    //       }
    //       else {
    //         throw e
    //       }
    //     }
    //   }
    // }
  })



  seneca.prepare(async function(this: any) {
    let res =
      await this.post('sys:provider,get:keymap,provider:tangocard')

    if (!res.ok) {
      throw this.fail('keymap')
    }

    let src = res.keymap.name.value + ':' + res.keymap.key.value
    let auth = Buffer.from(src).toString('base64')

    this.shared.headers = {
      Authorization: 'Basic ' + auth
    }

    this.shared.primary = {
      customerIdentifier: res.keymap.cust.value,
      accountIdentifier: res.keymap.acc.value,
    }

  })


  return {
    exports: {
      makeUrl,
      makeConfig,
      getJSON,
      postJSON,
    }
  }
}


// Default options.
const defaults: TangocardProviderOptions = {

  // NOTE: include trailing /
  url: 'https://integration-api.tangocard.com/raas/v2/',

  // Use global fetch by default - if exists
  fetch: ('undefined' === typeof fetch ? undefined : fetch),

  entity: {
    order: {
      save: {
        // Default fields
      }
    }
  },

  // TODO: Enable debug logging
  debug: false
}


Object.assign(TangocardProvider, { defaults })

export default TangocardProvider

if ('undefined' !== typeof (module)) {
  module.exports = TangocardProvider
}
