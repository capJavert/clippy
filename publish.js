// publish to gh-pages (add, commit, push)
const { join } = require('path')
const { writeFileSync } = require('fs')
const ghpages = require('gh-pages')

const CNAME = 'clippy.kickass.website'

writeFileSync(join(__dirname, '/dist/CNAME'), CNAME)

ghpages.publish('dist', function(err) {
  if (typeof err !== 'undefined') {
    console.log('Publish failed or up to date')
  } else {
    console.log('Publish successful')
  }

  console.log('Link:', CNAME)
})
