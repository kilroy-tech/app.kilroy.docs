"use strict";
const MODULE_NAME = "workflow:kilroy.docs/docs/set_kv";
const debug = require('debug')(MODULE_NAME);
debug.log = console.info.bind(console);
const Promise = require("bluebird");

function _sanitizeKey(key) {
    const text = (key || "").toString().trim();
    return text.replace(/[^A-Za-z0-9_.-]/g, "_") || "unnamed";
}

function _normalizePairs(wha) {
    if (wha && typeof wha.kv === "object" && !Array.isArray(wha.kv)) {
        return Object.keys(wha.kv).reduce((acc, key) => {
            acc[key] = wha.kv[key];
            return acc;
        }, {});
    }

    if (Array.isArray(wha && wha.kv)) {
        return wha.kv.reduce((acc, entry) => {
            if (!entry || typeof entry !== "object") return acc;
            if (entry.key === undefined || entry.key === null) return acc;
            acc[entry.key] = entry.value;
            return acc;
        }, {});
    }

    if (wha && wha.key !== undefined && wha.key !== null) {
        return { [wha.key]: wha.value };
    }

    if (wha && wha.webwidget_kv_key !== undefined && wha.webwidget_kv_key !== null) {
        return { [wha.webwidget_kv_key]: wha.webwidget_kv_value };
    }

    return {};
}

function preflight(authData, wfProxy) {
    const wha = wfProxy.getGlobalValue("webhook_args") || {};
    debug("set_kv preflight entered alias=%s", wfProxy.getGlobalValue("alias") || "");
    const kvPairs = _normalizePairs(wha);
    const normalized = {};
    let lastKey = "";
    let lastValue = undefined;

    Object.keys(kvPairs).forEach((key) => {
        const safeKey = `ww_${_sanitizeKey(key)}`;
        const value = kvPairs[key];
        normalized[safeKey] = value;
        wfProxy.setGlobalValue(safeKey, value);
        lastKey = safeKey;
        lastValue = value;
    });

    wfProxy.setGlobalValue("webwidget_kv_key", lastKey);
    wfProxy.setGlobalValue("webwidget_kv_value", lastValue);
    wfProxy.setGlobalValue("webwidget_kv_json", JSON.stringify(normalized));
    wfProxy.setGlobalValue("__results__", {
        webwidget_kv_key: lastKey,
        webwidget_kv_value: lastValue,
        webwidget_kv_json: JSON.stringify(normalized)
    });

    debug(`set_kv keys=${Object.keys(normalized).join(",")} count=${Object.keys(normalized).length}`);
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