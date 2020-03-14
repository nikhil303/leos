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
 * @description Displays a combined privacy/selection post button to post
 *              a new annotation
 */
// @ngInject
module.exports = {
  controller: function () {
    this.showDropdown = false;
    this.privateLabel = 'Only Me';

    this.publishDestination = function () {
      return this.isShared ? this.group.name : this.privateLabel;
    };

    this.groupCategory = function () {
      return this.group.type === 'open' ? 'public' : 'group';
    };

    this.setPrivacy = function (level) {
      this.onSetPrivacy({level: level});
    };
  },
  controllerAs: 'vm',
  bindings: {
    group: '<',
    canPost: '<',
    isShared: '<',
    onCancel: '&',
    onSave: '&',
    onSetPrivacy: '&',
  },
  template: require('../templates/publish-annotation-btn.html'),
};
