// publish to gh-pages (add, commit, push)

const ghpages = require('gh-pages')

ghpages.publish('dist', function(err) {
  if (typeof err !== 'undefined') {
    console.log('Publish failed or up to date')
  } else {
    console.log('Publish successful')
  }

  console.log('Link:', 'https://kickass.website/clippy')
})
