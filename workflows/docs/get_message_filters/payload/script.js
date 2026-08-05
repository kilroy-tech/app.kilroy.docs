"use strict";
const MODULE_NAME = "workflow:kilroy.docs/docs/get_message_filters";
const Promise = require("bluebird");

function _normalizeFilters(raw) {
    if (Array.isArray(raw)) {
        return raw.map((value) => String(value).trim()).filter(Boolean);
    }
    if (typeof raw === "string") {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed.map((value) => String(value).trim()).filter(Boolean);
        } catch (_err) {}
    }
    return [];
}

function preflight(authData, wfProxy) {
    const storedArray = _normalizeFilters(wfProxy.getGlobalValue("webwidget_message_filters") || []);
    const storedJson = wfProxy.getGlobalValue("webwidget_message_filters_json");
    const filters = storedArray.length ? storedArray : _normalizeFilters(storedJson);
    const filtersJson = JSON.stringify(filters);

    wfProxy.setGlobalValue("webwidget_message_filters", filters);
    wfProxy.setGlobalValue("webwidget_message_filters_json", filtersJson);
    wfProxy.setGlobalValue("webwidget_message_filters_count", filters.length);
    wfProxy.setGlobalValue("__results__", {
        webwidget_message_filters: filters,
        webwidget_message_filters_json: filtersJson,
        webwidget_message_filters_count: filters.length
    });

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