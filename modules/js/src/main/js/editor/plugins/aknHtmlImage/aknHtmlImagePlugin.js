/*
 * Copyright 2019 European Commission
 *
 * Licensed under the EUPL, Version 1.2 or – as soon they will be approved by the European Commission - subsequent versions of the EUPL (the "Licence");
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 *     https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and limitations under the Licence.
 */
; // jshint ignore:line
define(function aknHtmlImagePluginModule(require) {
    "use strict";

    // load module dependencies
    var pluginTools = require("plugins/pluginTools");

    var pluginName = "aknHtmlImage";
    var pluginDefinition = {};

    pluginTools.addPlugin(pluginName, pluginDefinition);

    var transformationConfig = {
        akn:  "img",
        html: "img",
        attr: [{
            akn: "xml:id",
            html: "id"
        }, {
            akn : "leos:origin",
            html : "data-origin"
        }, {
            akn: "src",
            html: "src"
        }, {
            akn: "alt",
            html: "alt"
        }, {
            akn: "width",
            html: "width"
        }, {
            akn: "height",
            html: "height"
        }, {
            akn: "style",
            html: "style"
        }]
    };


    // return plugin module
    var pluginModule = {
        name: pluginName
    };

    pluginTools.addTransformationConfigForPlugin(transformationConfig, pluginName);
    
    return pluginModule;
});