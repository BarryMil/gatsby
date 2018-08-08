// @flow
const fs = require(`fs`)
const traverse = require(`babel-traverse`).default
const get = require(`lodash/get`)
const { babelParseToAst } = require(`../utils/babel-parse-to-ast`)
const report = require(`gatsby-cli/lib/reporter`)

/**
 * Given a `require.resolve()` compatible path pointing to a JS module,
 * return an array listing the names of the module's exports.
 *
 * Returns [] for invalid paths and modules without exports.
 *
 * @param {string} modulePath
 * @param {function} resolver
 */
module.exports = (modulePath, resolver = require.resolve) => {
  let absPath
  const exportNames = []

  try {
    absPath = resolver(modulePath)
  } catch (err) {
    return exportNames // doesn't exist
  }
  const code = fs.readFileSync(absPath, `utf8`) // get file contents

  const ast = babelParseToAst(code, absPath)

  let isCommonJS = false
  let isES6 = false

  // extract names of exports from file
  traverse(ast, {
    // Check if the file is using ES6 imports
    ImportDeclaration: function ImportDeclaration(astPath) {
      isES6 = true
    },

    // get foo from `export const foo = bar`
    ExportNamedDeclaration: function ExportNamedDeclaration(astPath) {
      const exportName = get(
        astPath,
        `node.declaration.declarations[0].id.name`
      )
      isES6 = true
      if (exportName) exportNames.push(exportName)
    },
    AssignmentExpression: function AssignmentExpression(astPath) {
      const nodeLeft = astPath.node.left

      if (nodeLeft.type !== `MemberExpression`) return

      // get foo from `exports.foo = bar`
      if (get(nodeLeft, `object.name`) === `exports`) {
        isCommonJS = true
        exportNames.push(nodeLeft.property.name)
      }

      // get foo from `module.exports.foo = bar`
      if (
        get(nodeLeft, `object.object.name`) === `module` &&
        get(nodeLeft, `object.property.name`) === `exports`
      ) {
        isCommonJS = true
        exportNames.push(nodeLeft.property.name)
      }
    },
  })

  if (isES6 && isCommonJS && process.env.NODE_ENV !== `test`) {
    report.panic(
      `This plugin file is using both CommonJS and ES6 module systems together which we don't support.
You'll need to edit the file to use just one or the other.

plugin: ${modulePath}.js

This didn't cause a problem in Gatsby v1 so you might want to review the migration doc for this:
https://next.gatsbyjs.org/docs/migrating-from-v1-to-v2/#convert-to-either-pure-commonjs-or-pure-es6
      `
    )
  }
  return exportNames
}
