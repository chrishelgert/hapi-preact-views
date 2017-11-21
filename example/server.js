/* eslint-disable import/no-extraneous-dependencies */
require('babel-register')

const Hapi = require('hapi')
const vision = require('vision')
const hapiPreactViews = require('../lib')

const server = new Hapi.Server({ port: '3000' })

const provision = async () => {
  try {
    await server.register({ plugin: vision })
  } catch (err) {
    console.error('failed to register vision')
    throw err
  }

  server.views({
    engines: { js: hapiPreactViews },
    relativeTo: __dirname,
    path: 'views'
  })

  try {
    await server.start()

    server.route({
      method: 'GET',
      path: '/{name?}',
      handler: (req, h) => {
        return h.view('View', { name: req.params.name })
      }
    })
  } catch (err) {
    console.error('failed to start server', err)
  }
}

provision()
