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

var types = require('../types');

var TextQuoteAnchor = types.TextQuoteAnchor;
var TextPositionAnchor = types.TextPositionAnchor;

// These are primarily basic API tests for the anchoring classes. Tests for
// anchoring a variety of HTML and PDF content exist in `html-test` and
// `pdf-test`.
describe('types', function () {
  var container;

  before(function () {
    container = document.createElement('div');
    container.innerHTML = [
      'Four score and seven years ago our fathers brought forth on this continent,',
      'a new nation, conceived in Liberty, and dedicated to the proposition that',
      'all men are created equal.',
    ].join(' ');
    document.body.appendChild(container);
  });

  after(function () {
    container.remove();
  });

  describe('TextQuoteAnchor', function () {
    describe('#toRange', function () {
      it('returns a valid DOM Range', function () {
        var quoteAnchor = new TextQuoteAnchor(container, 'Liberty');
        var range = quoteAnchor.toRange();
        assert.instanceOf(range, Range);
        assert.equal(range.toString(), 'Liberty');
      });

      it('throws if the quote is not found', function () {
        var quoteAnchor = new TextQuoteAnchor(container, 'five score and nine years ago');
        assert.throws(function () {
          quoteAnchor.toRange();
        });
      });
    });

    describe('#toPositionAnchor', function () {
      it('returns a TextPositionAnchor', function () {
        var quoteAnchor = new TextQuoteAnchor(container, 'Liberty');
        var pos = quoteAnchor.toPositionAnchor();
        assert.instanceOf(pos, TextPositionAnchor);
      });

      it('throws if the quote is not found', function () {
        var quoteAnchor = new TextQuoteAnchor(container, 'some are more equal than others');
        assert.throws(function () {
          quoteAnchor.toPositionAnchor();
        });
      });
    });
  });
});
