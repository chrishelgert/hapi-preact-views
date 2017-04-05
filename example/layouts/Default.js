/** @jsx h */
import { h } from 'preact'

const Default = ({ children }) => (
  <html lang='en'>
    <head>
      <meta name='viewport' content='with=device-with; initial-scale=1.0' />
    </head>
    <body>
      <section id='default-layout'>
        {children}
      </section>
    </body>
  </html>
)

export default Default
