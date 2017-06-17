const render = require('preact-render-to-string')
const decache = require('decache')
const path = require('path')

const defaultOptions = {
  cache: true,
  doctype: '<!DOCTYPE html>'
}

function clearRequireCache (entries) {
  for (let i = 0; i < entries.length; i += 1) {
    decache(entries[i])
  }
}

function compileLayout (Element, context, options) {
  const layoutPath = path.join(options.layoutPath, options.layout)
  const LayoutElement = require(layoutPath)
  const Layout = LayoutElement.default || LayoutElement

  if (!options.cache) {
    clearRequireCache([options.filename, layoutPath])
  }

  return `${options.doctype}${render(Layout({ children: Element(context) }))}`
}

exports.compile = (template, compileOptions) => (context) => {
  const options = Object.assign(defaultOptions, compileOptions)

  const ViewElement = require(options.filename)
  const Element = ViewElement.default || ViewElement

  if (typeof options.beforeRender === 'function') {
    options.beforeRender()
  }

  if (options.layout) {
    return compileLayout(Element, context, options)
  }

  if (!options.cache) {
    clearRequireCache([options.filename])
  }

  return `${options.doctype}${render(Element(context))}`
}
