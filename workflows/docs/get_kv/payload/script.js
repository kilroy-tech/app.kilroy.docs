"use strict";
const MODULE_NAME = "workflow:kilroy.docs/docs/get_kv";
const debug = require('debug')(MODULE_NAME);
debug.log = console.info.bind(console);
const Promise = require("bluebird");

function _sanitizeKey(key) {
    const text = (key || "").toString().trim();
    return text.replace(/[^A-Za-z0-9_.-]/g, "_") || "unnamed";
}

function preflight(authData, wfProxy) {
    const wha = wfProxy.getGlobalValue("webhook_args") || {};
    debug("get_kv preflight entered alias=%s", wfProxy.getGlobalValue("alias") || "");
    const requestedKey = _sanitizeKey(wha.key || wha.webwidget_kv_key || "");
    const storedKey = `ww_${requestedKey}`;
    const storedValue = wfProxy.getGlobalValue(storedKey);
    const normalized = {};

    if (storedKey) {
        normalized[storedKey] = storedValue;
        wfProxy.setGlobalValue(storedKey, storedValue);
    }

    wfProxy.setGlobalValue("webwidget_kv_key", storedKey);
    wfProxy.setGlobalValue("webwidget_kv_value", storedValue);
    wfProxy.setGlobalValue("webwidget_kv_exists", storedValue !== undefined);
    wfProxy.setGlobalValue("webwidget_kv_json", JSON.stringify(normalized));
    wfProxy.setGlobalValue("__results__", {
        webwidget_kv_key: storedKey,
        webwidget_kv_value: storedValue,
        webwidget_kv_exists: storedValue !== undefined,
        webwidget_kv_json: JSON.stringify(normalized)
    });

    debug(`get_kv key=${storedKey} exists=${storedValue !== undefined}`);
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