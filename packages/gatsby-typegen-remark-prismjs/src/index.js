const visit = require(`unist-util-visit`)
const Prism = require(`prismjs`)

module.exports = ({ markdownAST }) => {
  visit(markdownAST, `code`, (node) => {
    if (!Prism.languages[node.lang]) {
      try {
        require(`prismjs/components/prism-${node.lang}.js`)
      } catch (e) {
        // Language wasn't loaded so let's bail.
        return
      }

      const lang = Prism.languages[node.lang]
      node.data = {
        hChildren: [{ type: `raw`, value: Prism.highlight(node.value, lang) }],
      }
    }
  })
}
