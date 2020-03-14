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

// Selectors that calculate the annotation counts displayed in tab headings
// and determine which tab an annotation should be displayed in.

var countIf = require('./util/array-util').countIf;
var metadata = require('./annotation-metadata');
var uiConstants = require('./ui-constants');

/**
 * Return the tab in which an annotation should be displayed.
 *
 * @param {Annotation} ann
 */
function tabForAnnotation(ann) {
  if (metadata.isOrphan(ann)) {
    return uiConstants.TAB_ORPHANS;
  } else if (metadata.isPageNote(ann)) {
    return uiConstants.TAB_NOTES;
  } else {
    return uiConstants.TAB_ANNOTATIONS;
  }
}

/**
 * Return true if an annotation should be displayed in a given tab.
 *
 * @param {Annotation} ann
 * @param {number} tab - The TAB_* value indicating the tab
 */
function shouldShowInTab(ann, tab) {
  if (metadata.isWaitingToAnchor(ann)) {
    // Until this annotation anchors or fails to anchor, we do not know which
    // tab it should be displayed in.
    return false;
  }
  return tabForAnnotation(ann) === tab;
}

/**
 * Return the counts for the headings of different tabs.
 *
 * @param {Annotation[]} annotations - List of annotations to display
 */
function counts(annotations) {
  var counts = {
    notes: countIf(annotations, metadata.isPageNote),
    annotations: countIf(annotations, metadata.isAnnotation),
    orphans: countIf(annotations, metadata.isOrphan),
    anchoring: countIf(annotations, metadata.isWaitingToAnchor),
  };

  return counts;
}

module.exports = {
  counts: counts,
  shouldShowInTab: shouldShowInTab,
  tabForAnnotation: tabForAnnotation,
};
