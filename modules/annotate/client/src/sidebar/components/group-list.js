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

var { isThirdPartyUser } = require('../util/account-id');
var isThirdPartyService = require('../util/is-third-party-service');
var serviceConfig = require('../service-config');
const memoize = require('../util/memoize');
const groupOrganizations = memoize(require('../util/group-organizations'));

// @ngInject
function GroupListController($window, analytics, groups, settings, serviceUrl) {
  this.groups = groups;

  this.createNewGroup = function() {
    $window.open(serviceUrl('groups.new'), '_blank');
  };

  this.focusedIcon = function() {
    const focusedGroup = this.groups.focused();
    return focusedGroup && (
      focusedGroup.organization.logo || this.thirdPartyGroupIcon
    );
  };

  this.focusedIconClass = function() {
    const focusedGroup = this.groups.focused();
    return (focusedGroup && focusedGroup.type === 'private') ? 'group' : 'public';
  };

  this.isThirdPartyUser = function () {
    return isThirdPartyUser(this.auth.userid, settings.authDomain);
  };

  this.leaveGroup = function (groupId) {
    var groupName = groups.get(groupId).name;
    var message = 'Are you sure you want to leave the group "' +
      groupName + '"?';
    if ($window.confirm(message)) {
      analytics.track(analytics.events.GROUP_LEAVE);
      groups.leave(groupId);
    }
  };

  this.orgName = function (groupId) {
    const group = this.groups.get(groupId);
    return group && group.organization && group.organization.name;
  };

  this.groupOrganizations = function () {
    return groupOrganizations(this.groups.all());
  };

  this.viewGroupActivity = function () {
    analytics.track(analytics.events.GROUP_VIEW_ACTIVITY);
  };

  this.focusGroup = function (groupId) {
    analytics.track(analytics.events.GROUP_SWITCH);
    groups.focus(groupId);
  };

  /**
   * Show the share link for the group if it is not a third-party group
   * AND if the URL needed is present in the group object. We should be able
   * to simplify this once the API is adjusted only to return the link
   * when applicable.
   */
  this.shouldShowActivityLink = function (groupId) {
    const group = groups.get(groupId);
    return group.links && group.links.html && !this.isThirdPartyService;
  };

  var svc = serviceConfig(settings);
  if (svc && svc.icon) {
    this.thirdPartyGroupIcon = svc.icon;
  }

  this.isThirdPartyService = isThirdPartyService(settings);
}

module.exports = {
  controller: GroupListController,
  controllerAs: 'vm',
  bindings: {
    auth: '<',
  },
  template: require('../templates/group-list.html'),
};
