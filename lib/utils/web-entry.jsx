var React = require('react');
var Router = require('react-router');
var find = require('lodash/collection/find');
var filter = require('lodash/collection/filter');
var createRoutes = require('create-routes');
var app = require('app');
var first = require('lodash/array/first');

function loadConfig(cb) {
  var stuff = require('config');
  if (module.hot) {
    module.hot.accept(stuff.id, function() {
      return cb();
    });
  }
  return cb();
};

loadConfig(function() {
  return app.loadContext(function(pagesReq) {
    var config, pages, ref, relativePath, router, routes;
    ref = require('config'),
    pages = ref.pages,
    config = ref.config,
    relativePath = ref.relativePath;

    routes = createRoutes(pages, pagesReq);
    // Remove templates files.
    pages = filter(pages, function(page) {
      return page.path != null;
    });

    // Route already exists meaning we're hot-reloading.
    if (router) {
      return router.replaceRoutes([app]);
    } else {
      return router = Router.run([routes], Router.HistoryLocation, function(Handler, state) {
        var page;
        page = find(pages, function(page) {
          return page.path === state.pathname;
        });

        // Let app know the route is changing.
        if (app.onRouteChange) {
          app.onRouteChange(state, page, pages, config);
        }
        return React.render(
          <Handler
            config={config}
            pages={pages}
            page={page}
            state={state}
          />, typeof window !== "undefined" ? document.getElementById("react-mount") : void 0);
      });
    }

  });
});
