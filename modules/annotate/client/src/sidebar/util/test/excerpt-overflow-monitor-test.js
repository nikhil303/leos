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

var ExcerptOverflowMonitor = require('../excerpt-overflow-monitor');

describe('ExcerptOverflowMonitor', function () {
  var contentHeight;
  var ctrl;
  var monitor;
  var state;

  beforeEach(function () {
    contentHeight = 0;

    state = {
      enabled: true,
      animate: true,
      collapsedHeight: 100,
      collapse: true,
      overflowHysteresis: 20,
    };

    ctrl = {
      getState: function () { return state; },
      contentHeight: function () { return contentHeight; },
      onOverflowChanged: sinon.stub(),
    };

    monitor = new ExcerptOverflowMonitor(ctrl, function (callback) {
      callback();
    });
  });

  context('when enabled', function () {
    it('overflows if height > collaped height + hysteresis', function () {
      contentHeight = 200;
      monitor.check();
      assert.calledWith(ctrl.onOverflowChanged, true);
    });

    it('does not overflow if height < collapsed height', function () {
      contentHeight = 80;
      monitor.check();
      assert.calledWith(ctrl.onOverflowChanged, false);
    });

    it('does not overflow if height is in [collapsed height, collapsed height + hysteresis]', function () {
      contentHeight = 110;
      monitor.check();
      assert.calledWith(ctrl.onOverflowChanged, false);
    });
  });

  context('when not enabled', function () {
    beforeEach(function () {
      state.enabled = false;
    });

    it('does not overflow if height > collapsed height + hysteresis', function () {
      contentHeight = 200;
      monitor.check();
      assert.calledWith(ctrl.onOverflowChanged, false);
    });
  });

  context('#contentStyle', function () {
    it('sets max-height if collapsed and overflowing', function () {
      contentHeight = 200;
      monitor.check();
      assert.deepEqual(monitor.contentStyle(), {'max-height': '100px'});
    });

    it('sets max height to empty if not overflowing', function () {
      contentHeight = 80;
      monitor.check();
      assert.deepEqual(monitor.contentStyle(), {'max-height': ''});
    });

    it('sets max-height if overflow state is unknown', function () {
      // Before the initial overflow check, the state is unknown
      assert.deepEqual(monitor.contentStyle(), {'max-height': '100px'});
    });
  });

  context('#check', function () {
    it('calls onOverflowChanged() if state changed', function () {
      contentHeight = 200;
      monitor.check();

      ctrl.onOverflowChanged = sinon.stub();
      contentHeight = 250;
      monitor.check();
      assert.notCalled(ctrl.onOverflowChanged);
    });
  });
});
