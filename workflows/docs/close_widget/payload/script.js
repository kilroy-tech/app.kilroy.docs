"use strict";
const MODULE_NAME = "workflow:kilroy.docs/docs/close_widget";
const debug = require('debug')(MODULE_NAME);
debug.log = console.info.bind(console);
const Promise = require("bluebird");

function preflight(authData, wfProxy) {
    debug("close_widget preflight entered alias=%s", wfProxy.getGlobalValue("alias") || "");
    wfProxy.setGlobalValue("webwidget_close_event", "WIDGET_CLOSING");
    wfProxy.setGlobalValue("webwidget_lifecycle_state", "WIDGET_CLOSING");
    debug("close_widget lifecycle updated alias=%s state=WIDGET_CLOSING", wfProxy.getGlobalValue("alias") || "");
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
