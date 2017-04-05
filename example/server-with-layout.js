/* eslint-disable import/no-extraneous-dependencies */
require('babel-register')
const Hapi = require('hapi')
const vision = require('vision')
const path = require('path')
const hapiPreactViews = require('../lib')

const server = new Hapi.Server()
server.connection({ port: '3000' })

server.register(vision, (err) => {
  if (err) throw err

  server.views({
    engines: { js: hapiPreactViews },
    relativeTo: __dirname,
    path: 'views',
    compileOptions: {
      layoutPath: path.join(__dirname, 'layouts'),
      layout: 'Default'
    }
  })

  server.start(() => {
    server.route({
      method: 'GET',
      path: '/{name?}',
      handler: (req, reply) => {
        reply.view('View', { name: req.params.name })
      }
    })
  })
})
