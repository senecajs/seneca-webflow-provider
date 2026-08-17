![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js][] plugin

# @seneca/webflow-provider

| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
|---|---|

## Install

```sh
$ npm install @seneca/webflow-provider @seneca/env
```

## Quick Example

<!-- ```js
// Setup - get the key value (<SECRET>) separately from a vault or
// environment variable.
Seneca()
  // Get API keys using the seneca-env plugin
  .use('env', {
    var: {
      $TANGOCARD_APIKEY: String,
      $TANGOCARD_USERTOKEN: String,
    },
  })
  .use('provider', {
    provider: {
      tangocard: {
        keys: {
          apikey: { value: '$TANGOCARD_APIKEY' },
          usertoken: { value: '$TANGOCARD_USERTOKEN' },
        },
      },
    },
  })
  .use('tangocard-provider')

let board = await seneca
  .entity('provider/tangocard/board')
  .load$('<tangocard-board-id>')

Console.log('BOARD', board)

board.desc = 'New description'
board = await board.save$()

Console.log('UPDATED BOARD', board)
``` -->

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
