"use strict";
/* Copyright © 2022 Seneca Project Contributors, MIT License. */
Object.defineProperty(exports, "__esModule", { value: true });
const Pkg = require('../package.json');
const { WebflowClient } = require('webflow-api');
function WebflowProvider(options) {
    const seneca = this;
    const entityBuilder = this.export('provider/entityBuilder');
    seneca.message('sys:provider,provider:webflow,get:info', get_info);
    async function get_info(_msg) {
        return {
            ok: true,
            name: 'webflow',
            version: Pkg.version,
            sdk: {
                name: 'webflow',
                version: Pkg.dependencies['webflow-api'],
            },
        };
    }
    // TODO: update cmds as per colitem to support new webflow sdk
    const entity = {
        site: {
            cmd: {
                list: {
                    action: undefined,
                },
                load: {
                    action: undefined
                },
            },
        },
        collection: {
            cmd: {
                list: {
                    action: undefined
                },
                load: {
                    action: undefined
                },
            },
        },
        colitem: {
            cmd: {
                list: { action: undefined },
                load: {
                    action: undefined,
                }
            },
        },
    };
    entity.collection.cmd.list.action =
        async function list_collection(entize, msg) {
            const q = msg.q || {};
            const site_id = q.site_id;
            let call = this.shared.sdk.collections.list.bind(this.shared.sdk.collections);
            let args = [site_id, { offset: 0 }];
            let items = await pager(call, args, { optIndex: 1, listField: 'collections' });
            items = items.map((data) => entize(data));
            return items;
        };
    entity.collection.cmd.load.action =
        async function load_collection(entize, msg) {
            let q = msg.q || {};
            let id = q.id;
            const args = [id, {}];
            try {
                let res = await this.shared.sdk.collections.get(...args);
                return entize(res);
            }
            catch (e) {
                if (404 === e.statusCode) {
                    return null;
                }
                throw e;
            }
        };
    entity.site.cmd.list.action =
        async function list_site(entize, _msg) {
            let call = this.shared.sdk.sites.list.bind(this.shared.sdk.sites);
            let args = [{ offset: 0 }];
            let items = await pager(call, args, { optIndex: 0, listField: 'sites' });
            items = items.map((data) => entize(data));
            return items;
        };
    entity.site.cmd.load.action =
        async function load_site(entize, msg) {
            let q = msg.q || {};
            let id = q.id;
            const args = [id, {}];
            try {
                let res = await this.shared.sdk.sites.get(...args);
                return entize(res);
            }
            catch (e) {
                if (404 === e.statusCode) {
                    return null;
                }
                throw e;
            }
        };
    entity.colitem.cmd.list.action =
        async function list_colitem(entize, msg) {
            const q = msg.q || {};
            const collection_id = q.collection_id;
            const call = this.shared.sdk.collections.items.listItems
                .bind(this.shared.sdk.collections.items);
            const args = [collection_id, { offset: 0 }];
            try {
                const items = await pager(call, args, { optIndex: 1, listField: 'items' });
                return items.map((item) => entize(item));
            }
            catch (e) {
                // console.log('ERROR list_colitem', e)
                throw e;
            }
        };
    entity.colitem.cmd.load.action =
        async function load_colitem(entize, msg) {
            let q = msg.q || {};
            let collection_id = q.collection_id;
            let item_id = q.item_id;
            const args = [collection_id, item_id, {}];
            try {
                let res = await this.shared.sdk.collections.items.getItem(...args);
                return entize(res);
            }
            catch (e) {
                if (404 === e.statusCode) {
                    return null;
                }
                throw e;
            }
        };
    async function pager(call, args, spec) {
        let items = [];
        let opts = args[spec.optIndex] || {};
        let offset = opts.offset || 0;
        let maxPages = 11; // TODO: option
        let end = false;
        for (let pI = 0; pI < maxPages && !end; pI++) {
            // console.log('PAGE', pI, args)
            let res = await call(...args);
            items.push(...res[spec.listField]);
            if (res.pagination) {
                offset += res.pagination.limit;
                opts.offset = offset;
                end = offset > res.pagination.total;
                // console.log('N', end, offset, args, res.pagination)
            }
            else {
                end = true;
            }
        }
        return items;
    }
    entityBuilder(this, {
        provider: {
            name: 'webflow',
        },
        entity
    });
    seneca.prepare(async function () {
        let res = await this.post('sys:provider,get:keymap,provider:webflow,key:accesstoken');
        let accessToken = res.keymap.accesstoken.value;
        this.shared.sdk = new WebflowClient({ accessToken });
    });
    return {
        exports: {
            sdk: () => this.shared.sdk,
        },
    };
}
// Default options.
const defaults = {
    // TODO: Enable debug logging
    debug: false,
};
Object.assign(WebflowProvider, { defaults });
exports.default = WebflowProvider;
if ('undefined' !== typeof module) {
    module.exports = WebflowProvider;
}
//# sourceMappingURL=webflow-provider.js.map