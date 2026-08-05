"use strict";
const MODULE_NAME = "workflow:kilroy.docs/docs/ui_resize_hook";
const debug = require('debug')(MODULE_NAME);
debug.log = console.info.bind(console);
const Promise = require("bluebird");

function preflight(authData, wfProxy) {
    const wha    = wfProxy.getGlobalValue("webhook_args") || {};
    const scale  = parseFloat(wfProxy.getGlobalValue("scale") || "1") || 1;

    const width  = parseInt(wha.width  || wfProxy.getGlobalValue("width")  || "800", 10) || 800;
    const height = parseInt(wha.height || wfProxy.getGlobalValue("height") || "600", 10) || 600;

    const scaledWidth  = Math.round(width  * scale);
    const scaledHeight = Math.round(height * scale);

    wfProxy.setGlobalValue("width",         String(width));
    wfProxy.setGlobalValue("height",        String(height));
    wfProxy.setGlobalValue("scaled_width",  String(scaledWidth));
    wfProxy.setGlobalValue("scaled_height", String(scaledHeight));

    debug("ui_resize_hook preflight entered alias=%s requested=%sx%s", wfProxy.getGlobalValue("alias") || "", wha.width || "", wha.height || "");
    debug("ui_resize_hook: %dx%d (scaled %dx%d, scale=%s)", width, height, scaledWidth, scaledHeight, scale);
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
