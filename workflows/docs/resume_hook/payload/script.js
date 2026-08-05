"use strict";
const MODULE_NAME = "workflow:kilroy.docs/docs/resume_hook";
const debug = require('debug')(MODULE_NAME);
debug.log = console.info.bind(console);
const Promise = require("bluebird");

function preflight(authData, wfProxy) {
    const wha = wfProxy.getGlobalValue("webhook_args") || {};
    const resolvedAlias = "kilroy.docs.docs";

    const url         = "/apps/kilroy.docs/index.html";
    const description = (wha.description || wha.title || "Web Widget").toString();
    const guid        = (wha.guid        || String(Date.now())).toString();
    const width       = parseInt(wha.width  || "1000", 10) || 1000;
    const height      = parseInt(wha.height || "800", 10) || 800;
    let   scale       = parseFloat(wha.scale || "1");
    if (isNaN(scale) || scale <= 0 || scale > 1) scale = 1;

    const scaledWidth  = Math.round(width  * scale);
    const scaledHeight = Math.round(height * scale);

    debug("resume_hook preflight entered alias=%s guid=%s", resolvedAlias, guid);

    wfProxy.setGlobalValue("url",           url);
    if (resolvedAlias) {
        wfProxy.setGlobalValue("alias", resolvedAlias);
        wfProxy.setGlobalValue("pd_alias", resolvedAlias);
    }
    wfProxy.setGlobalValue("description",   description);
    wfProxy.setGlobalValue("guid",          guid);
    wfProxy.setGlobalValue("width",         String(width));
    wfProxy.setGlobalValue("height",        String(height));
    wfProxy.setGlobalValue("scale",         String(scale));
    wfProxy.setGlobalValue("scaled_width",  String(scaledWidth));
    wfProxy.setGlobalValue("scaled_height", String(scaledHeight));
    wfProxy.setGlobalValue("webwidget_lifecycle_state", "WIDGET_OPEN");
    wfProxy.setGlobalValue("webwidget_close_event", "");

    debug("resume_hook: url=%s desc=%s %dx%d scale=%s", url, description, scaledWidth, scaledHeight, scale);
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
