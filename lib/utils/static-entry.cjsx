React = require 'react'
Router = require 'react-router'
find = require 'lodash/collection/find'
filter = require 'lodash/collection/filter'
createRoutes = require 'create-routes'
HTML = require 'html'
app = require 'app'
{pages, config} = require 'config'

routes = {}
app.loadContext (pagesReq) ->
  routes = createRoutes(pages, pagesReq)

  # Remove templates files.
  pages = filter(pages, (page) -> page.path?)

module.exports = (locals, callback) ->
  Router.run [routes], locals.path, (Handler, state) ->
    page = find pages, (page) -> page.path is state.pathname
    body = React.renderToString(<Handler config={config} pages={pages} page={page} state={state}/>)
    html = "<!DOCTYPE html>\n" + React.renderToStaticMarkup(<HTML page={page} body={body}/>)
    callback null, html
