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

/**
 * Return all `<iframe>` elements under `container` which are annotate-able.
 *
 * @param {Element} container
 * @return {HTMLIFrameElement[]}
 */
function findFrames(container) {
  const frames = Array.from(container.getElementsByTagName('iframe'));
  return frames.filter(shouldEnableAnnotation);
}

// Check if the iframe has already been injected
function hasHypothesis(iframe) {
  return iframe.contentWindow.__hypothesis_frame === true;
}

// Inject embed.js into the iframe
function injectHypothesis(iframe, scriptUrl, config) {
  const configElement = document.createElement('script');
  configElement.className = 'js-hypothesis-config';
  configElement.type = 'application/json';
  configElement.innerText = JSON.stringify(config);

  const src = scriptUrl;
  const embedElement = document.createElement('script');
  embedElement.className = 'js-hypothesis-embed';
  embedElement.async = true;
  embedElement.src = src;

  iframe.contentDocument.body.appendChild(configElement);
  iframe.contentDocument.body.appendChild(embedElement);
}

// Check if we can access this iframe's document
function isAccessible(iframe) {
  try {
    return !!iframe.contentDocument;
  } catch (e) {
    return false;
  }
}

/**
 * Return `true` if an iframe should be made annotate-able.
 *
 * To enable annotation, an iframe must be opted-in by adding the
 * "enable-annotation" attribute and must be visible.
 *
 * @param  {HTMLIFrameElement} iframe the frame being checked
 * @returns {boolean}   result of our validity checks
 */
function shouldEnableAnnotation(iframe) {
  // Ignore the Hypothesis sidebar.
  const isNotClientFrame = !iframe.classList.contains('h-sidebar-iframe');

  // Require iframes to opt into annotation support.
  //
  // Eventually we may want annotation to be enabled by default for iframes that
  // pass certain tests. However we need to resolve a number of issues before we
  // can do that. See https://github.com/hypothesis/client/issues/530
  const enabled = iframe.hasAttribute('enable-annotation');

  return isNotClientFrame && enabled;
}

function isDocumentReady(iframe, callback) {
  if (iframe.contentDocument.readyState === 'loading') {
    iframe.contentDocument.addEventListener('DOMContentLoaded', function() {
      callback();
    });
  } else {
    callback();
  }
}

function isLoaded(iframe, callback) {
  if (iframe.contentDocument.readyState !== 'complete') {
    iframe.addEventListener('load', function() {
      callback();
    });
  } else {
    callback();
  }
}

module.exports = {
  findFrames: findFrames,
  hasHypothesis: hasHypothesis,
  injectHypothesis: injectHypothesis,
  isAccessible: isAccessible,
  isLoaded: isLoaded,
  isDocumentReady: isDocumentReady,
};
