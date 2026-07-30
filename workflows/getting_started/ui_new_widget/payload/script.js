/**
 * kilroy.docs/manager/ui_new_widget.js - preflight/postflight functions for kilroy.docs/manager/ui_new_widget
 * @module kilroy.docs/manager/ui_new_widget
 * @file kilroy.docs/manager/ui_new_widget preflight/postflight implementation
 * @author system
 * @copyright Copyright ©2025, Concluent Systems, LLC. All rights reserved.
 */
"use strict";
const MODULE_NAME = "workflow:kilroy.docs/manager/ui_new_widget";
const debug = require('debug')(MODULE_NAME);
debug.log = console.info.bind(console); //https://github.com/visionmedia/debug#readme
const Promise = require("bluebird"); // jshint ignore:line
const appRoot = global.REBAR_NAMESPACE.__base; //require ('app-root-path');

//-----------------------------------------------------

function preflight(authData, wfProxy) {
	//called before the workflow steps run
    debug ("preflight");
	return Promise.resolve({success: true});
}

//-----------------------------------------------------

function begin (authData, wfProxy, step, theForm) {
	//called to load/preconfigure/define a form by ID passed in step.args.formID
    debug ("begin formID:" + step.args.formID);
    return new Promise( function(resolve, reject){
        try {
			var formObj = theForm; //any form from the workflow def is passed here
			var formData = wfProxy.getGlobalValue ("formData"); // key/value object overriding field defaults
            var formErrors = wfProxy.getGlobalValue('formErrors'); // errors from a previous form submission

			// do work here to pre-populate fields, or to generate dynamic forms, etc.
			let settings = {};
			wfProxy.loadAppSettings (authData, "kilroy.docs")
			.then (data=>{
			    settings = data.settings;
			    debug (`Settings: ${JSON.stringify (settings)}`);
			    if (step.args.formID == "picker") {
    			    let panel = new wfProxy.formGen.Panel ("Widget Templates", "Select a template, customize, and launch");
    			    let pairs = [{"name":"-", "value":"-"}]; //put an empty entry in the list in case there are no templates saved yet
    			    for (const [k,v] of Object.entries (settings)) {
    			        let p = {"name": `${k}: ${v.desc}`, "value":k};
    			        debug (`pair: ${JSON.stringify (p)}`);
    			        pairs.push (p);
    			    };
    			    //kilroy.ui only understands pairs_as_string, so create accordingly
    			    pairs = JSON.stringify (pairs);
    			    let drop = new wfProxy.formGen.Dropdown ("template", "Templates", pairs);
    			    drop.pairs_as_string = true;
    			    
    			    panel.addSection (
            		    new wfProxy.formGen.Section ().addField (
            		        drop
            		    )
            		);
            		let form = new wfProxy.formGen.Form ().addPanel (panel);
                    formObj = form.value;
                    //debug (`form: ${JSON.stringify (formObj, null, 4)}`);
			    }
			    //always return the form, even if we didn't muck with it
                return resolve({
                    success: true,
                    args: {
                        form: formObj,
                        formValues: formData,
                        formErrors: formErrors
                    }
                });
			})
        } catch(err){
            debug ("begin err: " + err);
            return reject(err);
        }
    });
}

//-----------------------------------------------------

function end (authData, wfProxy, step, formData) {
	// called to postprocess form data, persist it, etc. before returning results to workflow
    var result = {
            success: true,
            path: wfProxy.PATH_SUCCESS,
            args: formData
        };
    debug ("end: " + step.args.formID);
    
    //do whatever field validation, database saves, etc. required, then return result
    
    return Promise.resolve(result);
}

//-----------------------------------------------------

function postflight(authData, wfProxy) {
    debug ("postflight");
    return Promise.resolve({success: true});
}


//-----------------------------------------------------

function terminate (authData, wfProxy) {
	//perform any cleanup or rollback required if a workflow is terminated without completing
	try {
		debug ("terminate");
		return Promise.resolve ({success: true});
	}
	catch (err) {
		debug ("terminate exception : " + JSON.stringify (err));
		return Promise.resolve ({success: false});
	}
}

module.exports = {
    preflight: preflight,
    postflight: postflight,
    begin: begin,
    end: end,
    terminate: terminate
};

