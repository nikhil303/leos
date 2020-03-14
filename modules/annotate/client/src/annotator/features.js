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
'use strict';

const events = require('../shared/bridge-events');

let _features = {};

const _set = (features) => {
  _features = features || {};
};


module.exports = {

  init: function(crossframe) {
    crossframe.on(events.FEATURE_FLAGS_UPDATED, _set);
  },

  reset: function() {
    _set({});
  },

  flagEnabled: function(flag) {
    if (!(flag in _features)) {
      console.warn('looked up unknown feature', flag);
      return false;
    }
    return _features[flag];
  },

};
