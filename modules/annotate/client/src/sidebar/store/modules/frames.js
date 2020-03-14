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

var util = require('../util');

function init() {
  return {
    // The list of frames connected to the sidebar app
    frames: [],
  };
}

var update = {
  CONNECT_FRAME: function (state, action) {
    return {frames: state.frames.concat(action.frame)};
  },

  DESTROY_FRAME: function (state, action) {
    return {
      frames: state.frames.filter(f => f !== action.frame),
    };
  },

  UPDATE_FRAME_ANNOTATION_FETCH_STATUS: function (state, action) {
    var frames = state.frames.map(function (frame) {
      var match = (frame.uri && frame.uri === action.uri);
      if (match) {
        return Object.assign({}, frame, {
          isAnnotationFetchComplete: action.isAnnotationFetchComplete,
        });
      } else {
        return frame;
      }
    });
    return {
      frames: frames,
    };
  },
};

var actions = util.actionTypes(update);

/**
 * Add a frame to the list of frames currently connected to the sidebar app.
 */
function connectFrame(frame) {
  return {type: actions.CONNECT_FRAME, frame: frame};
}

/**
 * Remove a frame from the list of frames currently connected to the sidebar app.
 */
function destroyFrame(frame) {
  return {type: actions.DESTROY_FRAME, frame: frame};
}

/**
 * Update the `isAnnotationFetchComplete` flag of the frame.
 */
function updateFrameAnnotationFetchStatus(uri, status) {
  return {
    type: actions.UPDATE_FRAME_ANNOTATION_FETCH_STATUS,
    isAnnotationFetchComplete: status,
    uri: uri,
  };
}

/**
 * Return the list of frames currently connected to the sidebar app.
 */
function frames(state) {
  return state.frames;
}

function searchUrisForFrame(frame) {
  var uris = [frame.uri];

  if (frame.metadata && frame.metadata.documentFingerprint) {
    uris = frame.metadata.link.map(function (link) {
      return link.href;
    });
  }

  if (frame.metadata && frame.metadata.link) {
    frame.metadata.link.forEach(function (link) {
      if (link.href.startsWith('doi:')) {
        uris.push(link.href);
      }
    });
  }

  return uris;
}

/**
 * Return the set of URIs that should be used to search for annotations on the
 * current page.
 */
function searchUris(state) {
  return state.frames.reduce(function (uris, frame) {
    return uris.concat(searchUrisForFrame(frame));
  }, []);
}

module.exports = {
  init: init,
  update: update,

  actions: {
    connectFrame: connectFrame,
    destroyFrame: destroyFrame,
    updateFrameAnnotationFetchStatus: updateFrameAnnotationFetchStatus,
  },

  selectors: {
    frames,
    searchUris,
  },
};
