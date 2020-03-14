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

var features = require('../features');
var events = require('../../events');
var bridgeEvents = require('../../../shared/bridge-events');

describe('h:features - sidebar layer', function () {

  var fakeBridge;
  var fakeLog;
  var fakeRootScope;
  var fakeSession;
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    fakeBridge = {
      call: sinon.stub(),
    };

    fakeLog = {
      warn: sinon.stub(),
    };

    fakeRootScope = {
      eventCallbacks: {},

      $broadcast: sandbox.stub(),

      $on: function(event, callback) {
        this.eventCallbacks[event] = callback;
      },
    };

    fakeSession = {
      load: sinon.stub(),
      state: {
        features: {
          'feature_on': true,
          'feature_off': false,
        },
      },
    };
  });

  afterEach(function(){
    sandbox.restore();
  });

  describe('flagEnabled', function () {
    it('should retrieve features data', function () {
      var features_ = features(fakeLog, fakeRootScope, fakeBridge, fakeSession);
      assert.equal(features_.flagEnabled('feature_on'), true);
      assert.equal(features_.flagEnabled('feature_off'), false);
    });

    it('should return false if features have not been loaded', function () {
      var features_ = features(fakeLog, fakeRootScope, fakeBridge, fakeSession);
      // simulate feature data not having been loaded yet
      fakeSession.state = {};
      assert.equal(features_.flagEnabled('feature_on'), false);
    });

    it('should trigger a refresh of session data', function () {
      var features_ = features(fakeLog, fakeRootScope, fakeBridge, fakeSession);
      features_.flagEnabled('feature_on');
      assert.calledOnce(fakeSession.load);
    });

    it('should return false for unknown flags', function () {
      var features_ = features(fakeLog, fakeRootScope, fakeBridge, fakeSession);
      assert.isFalse(features_.flagEnabled('unknown_feature'));
    });
  });

  it('should broadcast feature flags to annotation layer based on load/user changes', function(){

    assert.notProperty(fakeRootScope.eventCallbacks, events.USER_CHANGED);
    assert.notProperty(fakeRootScope.eventCallbacks, events.FRAME_CONNECTED);

    features(fakeLog, fakeRootScope, fakeBridge, fakeSession);

    assert.property(fakeRootScope.eventCallbacks, events.USER_CHANGED);
    assert.property(fakeRootScope.eventCallbacks, events.FRAME_CONNECTED);

    // respond to user changing by broadcasting the feature flags
    assert.notCalled(fakeBridge.call);

    fakeRootScope.eventCallbacks[events.USER_CHANGED]();

    assert.calledOnce(fakeBridge.call);
    assert.calledWith(fakeBridge.call, bridgeEvents.FEATURE_FLAGS_UPDATED, fakeSession.state.features);

    // respond to frame connections by broadcasting the feature flags
    fakeRootScope.eventCallbacks[events.FRAME_CONNECTED]();

    assert.calledTwice(fakeBridge.call);
    assert.calledWith(fakeBridge.call, bridgeEvents.FEATURE_FLAGS_UPDATED, fakeSession.state.features);
  });
});
