jest.mock('decache')

const path = require('path')
const Hapi = require('hapi')
const vision = require('vision')
const decache = require('decache')
const hapiPreactViews = require('../../lib/index')

describe('hapi-preact-views', () => {
  it('should return a compile-functions', () => {
    expect(hapiPreactViews.compile).toBeInstanceOf(Function)
  })

  describe('compile', () => {
    const context = { name: 'Test' }
    const layoutConfig = {
      layoutPath: path.join(__dirname, '..', '..', 'example', 'layouts'),
      layout: 'Default',
    }
    let server

    function createServer(compileOptions = {}) {
      return new Promise((resolve) => {
        server = new Hapi.Server()
        server.register(vision, () => {
          server.views({
            engines: { js: hapiPreactViews },
            relativeTo: path.resolve(__dirname, '..', '..', 'example'),
            path: 'views',
            compileOptions,
          })

          resolve()
        })
      })
    }

    describe('without layout', () => {
      it('should return the view', (done) => {
        createServer().then(() => {
          server.render('View', context, (err, output) => {
            expect(err).toBeNull()
            expect(output).toMatchSnapshot()

            done()
          })
        })
      })

      it('should clear the cache, when option.cache is false', (done) => {
        createServer({ cache: false }).then(() => {
          server.render('View', context, () => {
            expect(decache).toHaveBeenCalled()

            done()
          })
        })
      })
    })

    describe('with layout', () => {
      it('should render the view in the layout', (done) => {
        const config = Object.assign(layoutConfig, { cache: true })
        createServer(config).then(() => {
          server.render('View', context, (err, output) => {
            expect(err).toBeNull()
            expect(output).toMatchSnapshot()

            done()
          })
        })
      })

      it('should clear the cache, when option.cache is false', (done) => {
        const config = Object.assign(layoutConfig, { cache: false })
        createServer(config).then(() => {
          server.render('View', context, () => {
            expect(decache).toHaveBeenCalled()

            done()
          })
        })
      })
    })

    it('should call beforeRender, when it is in options', (done) => {
      const beforeRender = jest.fn()
      createServer({ beforeRender }).then(() => {
        server.render('View', context, () => {
          expect(beforeRender).toHaveBeenCalled()

          done()
        })
      })
    })
  })
})
