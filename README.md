![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js][] plugin

# @seneca/webflow-provider

| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
|---|---|

## Install

Requires Seneca 4 and Node.js 24 or later.

```sh
$ npm install seneca@^4 @seneca/entity @seneca/provider @seneca/env @seneca/webflow-provider
```

## Quick Example

```js
// Setup - get the key value (<SECRET>) separately from a vault or
// environment variable.
const seneca = Seneca()
  .use('@seneca/entity')
  // Get API keys using the @seneca/env plugin
  .use('@seneca/env', {
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
  .use('@seneca/webflow-provider')

await seneca.ready()

const sites = await seneca.entity('provider/webflow/site').list$()

const collections = await seneca
  .entity('provider/webflow/collection')
  .list$({ site_id: '<webflow-site-id>' })

const item = await seneca.entity('provider/webflow/colitem').load$({
  collection_id: '<webflow-collection-id>',
  item_id: '<webflow-item-id>',
})

console.log('ITEM', item.fieldData.name)
```

## More Examples

See [test/](test/) for usage examples.

## Motivation



## Support

If you're using this module and need help, you can:

- Post a [github issue][]
- Tweet to [@senecajs][]

## API



## Contributing

The [Senecajs org][] encourages open participation. If you feel you can help in any way, be it with documentation, examples, extra testing, or new features please get in touch.

### Running tests

```sh
npm run test
```

## Background



[![build](https://github.com/senecajs/seneca-tangocard-provider/actions/workflows/build.yml/badge.svg)](https://github.com/senecajs/seneca-tangocard-provider/actions/workflows/build.yml)
[![Coverage Status](https://coveralls.io/repos/github/senecajs/seneca-tangocard-provider/badge.svg?branch=main)](https://coveralls.io/github/senecajs/seneca-tangocard-provider?branch=main)
[![Known Vulnerabilities](https://snyk.io/test/github/senecajs/seneca-tangocard-provider/badge.svg)](https://snyk.io/test/github/senecajs/seneca-tangocard-provider)
[![DeepScan grade](https://deepscan.io/api/teams/5016/projects/19462/branches/505954/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=5016&pid=19462&bid=505954)
[![Maintainability](https://api.codeclimate.com/v1/badges/f76e83896b731bb5d609/maintainability)](https://codeclimate.com/github/senecajs/seneca-tangocard-provider/maintainability) -->
