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
      return new Promise((resolve) => {
        const server = new Hapi.Server()
        server.register(vision, () => {
          server.views({
            engines: { js: hapiPreactViews },
            relativeTo: path.resolve(__dirname, '..', '..', 'example'),
            path: 'views',
            compileOptions
          })

          resolve(server)
        })
      })
    }

    function renderView (server, done) {
      server.render('View', context, (err, output) => {
        expect(err).toBeNull()
        expect(output).toMatchSnapshot()

        done()
      })
    }

    describe('without layout', () => {
      test('returns the view', (done) => {
        createServer().then((server) => {
          renderView(server, done)
        })
      })

      test('clears the cache, when option.cache is false', (done) => {
        createServer({ cache: false }).then((server) => {
          server.render('View', context, () => {
            expect(decache).toHaveBeenCalled()

            done()
          })
        })
      })
    })

    describe('with layout', () => {
      test('renders the view in the layout', (done) => {
        const config = Object.assign(layoutConfig, { cache: true })
        createServer(config).then((server) => {
          renderView(server, done)
        })
      })

      test('clears the cache, when option.cache is false', (done) => {
        const config = Object.assign(layoutConfig, { cache: false })
        createServer(config).then((server) => {
          server.render('View', context, () => {
            expect(decache).toHaveBeenCalled()

            done()
          })
        })
      })
    })

    test('calls beforeRender, when it is in options', (done) => {
      const beforeRender = jest.fn()
      createServer({ beforeRender }).then((server) => {
        server.render('View', context, () => {
          expect(beforeRender).toHaveBeenCalled()

          done()
        })
      })
    })
  })
})
