var reviews = new function() {
  this.getReviews = function(x, callback) {
      x.query = x.id;
      x.find = {id: x.id};
      x.data = [];
      execute('reviews', {
          query: x.query,
          find: x.find
        },
        function(r) {
          x.data = r;
          console.log(r);
          callback(x);
        }, callback);
    }
}
