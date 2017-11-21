jest.mock('decache')

const path = require('path')
const Hapi = require('hapi')
const vision = require('vision')
const decache = require('decache')
const hapiPreactViews = require('../../lib/index')

describe('hapi-preact-views', () => {
  test('returns a compile function', () => {
    expect(hapiPreactViews.compile).toBeInstanceOf(Function)
  })

  describe('compile', () => {
    const context = { name: 'Test' }
    const layoutConfig = {
      layoutPath: path.join(__dirname, '..', '..', 'example', 'layouts'),
      layout: 'Default'
    }

    function createServer (compileOptions = {}) {
      return new Promise(async (resolve) => {
        const server = new Hapi.Server({ port: '9999' })
        await server.register({ plugin: vision })

        server.views({
          engines: { js: hapiPreactViews },
          relativeTo: path.resolve(__dirname, '..', '..', 'example'),
          path: 'views',
          compileOptions
        })

        resolve(server)
      })
    }

    async function renderView (server) {
      try {
        const output = await server.render('View', context)
        expect(output).toMatchSnapshot()
      } catch (err) {
        expect(err).toBeNull()
      }
    }

    describe('without layout', () => {
      test('returns the view', async () => {
        const server = await createServer()
        await renderView(server)
      })

      test('clears the cache, when option.cache is false', async () => {
        const server = await createServer({ cache: false })
        await server.render('View', context)

        expect(decache).toHaveBeenCalled()
      })
    })

    describe('with layout', () => {
      test('renders the view in the layout', async () => {
        const config = Object.assign(layoutConfig, { cache: true })
        const server = await createServer(config)
        await renderView(server)
      })

      test('clears the cache, when option.cache is false', async () => {
        const config = Object.assign(layoutConfig, { cache: false })
        const server = await createServer(config)
        await server.render('View', context)

        expect(decache).toHaveBeenCalled()
      })
    })

    test('calls beforeRender, when it is in options', async () => {
      const beforeRender = jest.fn()
      const server = await createServer({ beforeRender })
      await server.render('View', context)

      expect(beforeRender).toHaveBeenCalled()
    })
  })
})
