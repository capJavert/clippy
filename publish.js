// publish to gh-pages (add, commit, push)

const ghpages = require('gh-pages');

ghpages.publish('dist', function(err) {
  console.error(err)
});
