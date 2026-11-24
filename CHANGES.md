# Changes

## 0.4.0 2026-11-21

First entry of this change log. Earlier versions are on npm and in the git
history.

* Seneca 4: the peer dependency is `seneca` `^4.0.0` (was
  `>=3||>=4.0.0-rc2`). Seneca 3 users stay on `@seneca/webflow-provider@0.3`.
* The entity peer is `@seneca/entity` `^29.0.0` instead of `seneca-entity`.
  The other peers are `@seneca/provider` `^5.0.0` and `@seneca/env` `^0.6.0`,
  which is now optional: the plugin itself does not use it.
* The `seneca-promisify` peer dependency is removed. Seneca 4 has promises
  built in; do not call `use('promisify')` (D4).
* `@seneca/maintain` is no longer a runtime dependency; only the tests use
  it.
* Node.js 24 or later (`engines.node` `>=24`, was `>=14`).
* When `@seneca/provider` has no `webflow` provider, the plugin fails with
  the `keymap` error, as the other providers do, instead of a `TypeError`.
* Tests load plugins by full name (`@seneca/entity`, `@seneca/env`,
  `@seneca/provider`). Without credentials the site, collection and item
  tests run against a local mock of the Webflow API, with a dummy
  `WEBFLOW_ACCESSTOKEN`; with `test/local-config.js`, or the environment
  variables `WEBFLOW_ACCESSTOKEN`, `WEBFLOW_SITE0_ID`,
  `WEBFLOW_COLLECTION0_ID` and `WEBFLOW_ITEM0_ID`, they call the Webflow
  API. Live calls were not tested on Seneca 4.
* The `maintain` test skips `check_default` in a pull request or tag build
  and `url_pkgjson` on Windows.
* devDependencies: `seneca` `^4.0.0`, `@seneca/entity` `^29.0.0`,
  `@seneca/env` `^0.6.0`, `@seneca/provider` `^5.0.0`, `@seneca/maintain`
  `^0.1.0` and `seneca-msg-test` `^5.0.0`. Removed the unused `node-fetch`
  and `@seneca/doc`.
* README: Seneca 4 install line and a Webflow example, with plugins loaded
  by full name.
* `repository.url` uses `git+https`, `publishConfig` sets public access, and
  the package includes `CHANGES.md`.
