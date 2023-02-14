/* Copyright © 2022 Seneca Project Contributors, MIT License. */

const Pkg = require('../package.json')

const Webflow = require('Webflow')

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

  entityBuilder(this, {
    provider: {
      name: 'webflow',
    },
    entity: {
      site: {
        cmd: {
          list: {
            action: async function (this: any, entsize: any, msg: any) {},
          },

          load: {
            action: async function (this: any, entsize: any, msg: any) {},
          },

          save: {
            action: async function (this: any, entsize: any, msg: any) {},
          },
        },
      },

      webhook: {
        cmd: {
          list: {
            action: async function (this: any, entsize: any, msg: any) {},
          },

          load: {
            action: async function (this: any, entsize: any, msg: any) {},
          },

          save: {
            action: async function (this: any, entsize: any, msg: any) {},
          },

          remove: {
            action: async function (this: any, entsize: any, msg: any) {},
          },
        },
      },

      collection: {
        cmd: {
          list: {
            action: async function (this: any, entsize: any, msg: any) {},
          },

          load: {
            action: async function (this: any, entsize: any, msg: any) {},
          },
        },
      },

      item: {
        cmd: {
          list: {
            action: async function (this: any, entsize: any, msg: any) {},
          },

          load: {
            action: async function (this: any, entsize: any, msg: any) {},
          },

          save: {
            action: async function (this: any, entsize: any, msg: any) {},
          },

          remove: {
            action: async function (this: any, entsize: any, msg: any) {},
          },
        },
      },

      product_SKU: {
        cmd: {
          list: {
            action: async function (this: any, entsize: any, msg: any) {},
          },

          load: {
            action: async function (this: any, entsize: any, msg: any) {},
          },

          save: {
            action: async function (this: any, entsize: any, msg: any) {},
          },
        },
      },

      order: {
        cmd: {
          list: {
            action: async function (this: any, entsize: any, msg: any) {},
          },

          load: {
            action: async function (this: any, entsize: any, msg: any) {},
          },

          save: {
            action: async function (this: any, entsize: any, msg: any) {},
          },
        },
      },

      inventory: {
        cmd: {
          list: {
            action: async function (this: any, entsize: any, msg: any) {},
          },

          save: {
            action: async function (this: any, entsize: any, msg: any) {},
          },
        },
      },

      settings: {
        cmd: {
          list: {
            action: async function (this: any, entsize: any, msg: any) {},
          },
        },
      },

      user: {
        cmd: {
          list: {
            action: async function (this: any, entsize: any, msg: any) {},
          },

          load: {
            action: async function (this: any, entsize: any, msg: any) {},
          },

          save: {
            action: async function (this: any, entsize: any, msg: any) {},
          },

          remove: {
            action: async function (this: any, entsize: any, msg: any) {},
          },
        },
      },
    },
  })

  seneca.prepare(async function (this: any) {
    let res = await this.post('sys:provider,get:keymap,provider:webflow')

    if (!res.ok) {
      throw this.fail('keymap')
    }

    let src = res.keymap.name.value + ':' + res.keymap.key.value
    let auth = Buffer.from(src).toString('base64')

    this.shared.headers = {
      Authorization: 'Basic ' + auth,
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
    },
  }
}

// Default options.
const defaults: WebflowProviderOptions = {
  // NOTE: include trailing /
  url: 'https://integration-api.webflow.com/raas/v2/',

  // Use global fetch by default - if exists
  fetch: 'undefined' === typeof fetch ? undefined : fetch,

  entity: {
    order: {
      save: {
        // Default fields
      },
    },
  },

  // TODO: Enable debug logging
  debug: false,
}

Object.assign(WebflowProvider, { defaults })

export default WebflowProvider

if ('undefined' !== typeof module) {
  module.exports = WebflowProvider
}
