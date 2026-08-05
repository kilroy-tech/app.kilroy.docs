"use strict";
const MODULE_NAME = "workflow:kilroy.docs/docs/init_hook";
const debug = require('debug')(MODULE_NAME);
debug.log = console.info.bind(console);
const Promise = require("bluebird");

function preflight(authData, wfProxy) {
    const wha = wfProxy.getGlobalValue("webhook_args") || {};

    // This docs pdclass is a singleton and always targets the docs landing page.
    const alias       = "kilroy.docs.docs";
    const url         = "/apps/kilroy.docs/index.html";
    const description = (wha.description || wha.title || "Web Widget").toString();
    const guid        = (wha.guid        || String(Date.now())).toString();
    const width       = parseInt(wha.width  || "1000", 10) || 1000;
    const height      = parseInt(wha.height || "800", 10) || 800;
    let   scale       = parseFloat(wha.scale || "1");
    if (isNaN(scale) || scale <= 0 || scale > 1) scale = 1;

    const scaledWidth  = Math.round(width  * scale);
    const scaledHeight = Math.round(height * scale);

    const ownerUserId = (wha.owner_user_id || "").toString();
    debug("init_hook preflight entered alias=%s guid=%s", alias, guid);

    if (alias) {
        wfProxy.setGlobalValue("alias", alias);
        wfProxy.setGlobalValue("pd_alias", alias);
    }
    wfProxy.setGlobalValue("url",           url);
    wfProxy.setGlobalValue("description",   description);
    wfProxy.setGlobalValue("guid",          guid);
    wfProxy.setGlobalValue("width",         String(width));
    wfProxy.setGlobalValue("height",        String(height));
    wfProxy.setGlobalValue("scale",         String(scale));
    wfProxy.setGlobalValue("scaled_width",  String(scaledWidth));
    wfProxy.setGlobalValue("scaled_height", String(scaledHeight));
    wfProxy.setGlobalValue("owner_user_id", ownerUserId);
    wfProxy.setGlobalValue("webwidget_lifecycle_state", "WIDGET_OPEN");
    if (ownerUserId) wfProxy.setGlobalValue("wfCurrentUserId", ownerUserId);

    return Promise.resolve({ success: true });
}

function begin(authData, wfProxy, step, theForm) {
    return new Promise(function(resolve, reject) {
        try {
            return resolve({ success: true, args: { form: theForm, formValues: wfProxy.getGlobalValue("formData"), formErrors: wfProxy.getGlobalValue("formErrors") } });
        } catch(err) { return reject(err); }
    });
}

function end(authData, wfProxy, step, formData) {
    return Promise.resolve({ success: true, path: wfProxy.PATH_SUCCESS, args: formData });
}

function postflight(authData, wfProxy) {
    return Promise.resolve({ success: true });
}

function terminate(authData, wfProxy) {
    try { return Promise.resolve({ success: true }); }
    catch(err) { return Promise.resolve({ success: false }); }
}

module.exports = { preflight, postflight, begin, end, terminate };
