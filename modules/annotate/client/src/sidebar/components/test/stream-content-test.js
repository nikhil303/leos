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

var angular = require('angular');
var EventEmitter = require('tiny-emitter');

class FakeRootThread extends EventEmitter {
  constructor() {
    super();
    this.thread = sinon.stub();
  }
}

describe('StreamContentController', function () {
  var $componentController;
  var $rootScope;
  var fakeRoute;
  var fakeRouteParams;
  var fakeAnnotationMapper;
  var fakeStore;
  var fakeQueryParser;
  var fakeRootThread;
  var fakeSearchFilter;
  var fakeApi;
  var fakeStreamer;
  var fakeStreamFilter;


  before(function () {
    angular.module('h', [])
      .component('streamContent', require('../stream-content'))
      .config(($compileProvider) => $compileProvider.preAssignBindingsEnabled(true));
  });

  beforeEach(function () {
    fakeAnnotationMapper = {
      loadAnnotations: sinon.spy(),
    };

    fakeStore = {
      clearAnnotations: sinon.spy(),
      setAppIsSidebar: sinon.spy(),
      setCollapsed: sinon.spy(),
      setForceVisible: sinon.spy(),
      setSortKey: sinon.spy(),
      subscribe: sinon.spy(),
    };

    fakeRouteParams = {id: 'test'};

    fakeQueryParser = {
      populateFilter: sinon.spy(),
    };

    fakeRoute = {
      reload: sinon.spy(),
    };

    fakeSearchFilter = {
      generateFacetedFilter: sinon.stub(),
      toObject: sinon.stub().returns({}),
    };

    fakeApi = {
      search: sinon.spy(function () {
        return Promise.resolve({rows: [], total: 0});
      }),
    };

    fakeStreamer = {
      open: sinon.spy(),
      close: sinon.spy(),
      setConfig: sinon.spy(),
      connect: sinon.spy(),
    };

    fakeStreamFilter = {
      resetFilter: sinon.stub().returnsThis(),
      setMatchPolicyIncludeAll: sinon.stub().returnsThis(),
      getFilter: sinon.stub(),
    };

    fakeRootThread = new FakeRootThread();

    angular.mock.module('h', {
      $route: fakeRoute,
      $routeParams: fakeRouteParams,
      annotationMapper: fakeAnnotationMapper,
      store: fakeStore,
      api: fakeApi,
      queryParser: fakeQueryParser,
      rootThread: fakeRootThread,
      searchFilter: fakeSearchFilter,
      streamFilter: fakeStreamFilter,
      streamer: fakeStreamer,
    });

    angular.mock.inject(function (_$componentController_, _$rootScope_) {
      $componentController = _$componentController_;
      $rootScope = _$rootScope_;
    });
  });

  function createController() {
    return $componentController('streamContent', {}, {
      search: {
        query: sinon.stub(),
        update: sinon.stub(),
      },
    });
  }

  it('calls the search API with `_separate_replies: true`', function () {
    createController();
    assert.equal(fakeApi.search.firstCall.args[0]._separate_replies, true);
  });

  it('passes the annotations and replies from search to loadAnnotations()', function () {
    fakeApi.search = function () {
      return Promise.resolve({
        'rows': ['annotation_1', 'annotation_2'],
        'replies': ['reply_1', 'reply_2', 'reply_3'],
      });
    };

    createController();

    return Promise.resolve().then(function () {
      assert.calledOnce(fakeAnnotationMapper.loadAnnotations);
      assert.calledWith(fakeAnnotationMapper.loadAnnotations,
        ['annotation_1', 'annotation_2'], ['reply_1', 'reply_2', 'reply_3']);
    });
  });

  context('when a $routeUpdate event occurs', function () {
    it('reloads the route if the query changed', function () {
      fakeRouteParams.q = 'test query';
      createController();
      fakeRouteParams.q = 'new query';
      $rootScope.$broadcast('$routeUpdate');
      assert.called(fakeStore.clearAnnotations);
      assert.calledOnce(fakeRoute.reload);
    });

    it('does not reload the route if the query did not change', function () {
      fakeRouteParams.q = 'test query';
      createController();
      $rootScope.$broadcast('$routeUpdate');
      assert.notCalled(fakeStore.clearAnnotations);
      assert.notCalled(fakeRoute.reload);
    });
  });
});
