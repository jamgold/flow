function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

Meteor.startup(function () {
  var maxCount = 2500;
  // code to run on server at startup
  if(Collection.find().count() < maxCount)
  {
    for(var i=Collection.find().count();i<maxCount;i++)
    {
      Collection.insert({
        counter: i,
        created: new Date(),
        random: getRandomInt(0, 10000)
      });
    }
  }
});

Meteor.publish('collection', function(query, options) {
  query = query || {};
  options = options || {};
  var self = this;
  var index = 1;
  var sid = self._subscriptionId;
  if(useTransform)
  {
    options['transform'] = function(doc) {
      console.log('publish transform',self._subscriptionId);
      doc._subscriptionId = sid;
      doc.index = index++;
      return doc;
    };
    console.log(self._subscriptionId, options);
    return Collection.find( query, options );
  }
  else
  {
    // return Collection.find( query, options );
    //
    // we need to add the subscriptionId to every document
    //
    var handle = Collection.find( query, options ).observeChanges({
      added: function (id, fields) {
        fields._subscriptionId = sid;
        fields.index = index++;
        self.added('collection', id, fields);
      }, // Use either added() OR(!) addedBefore()
      changed: function( id , fields) {
        console.log('changed',id);
        self.changed( id, fields );
      },
      removed: function (id) {
        console.log('removed', id);
        self.removed('collection', id);
      }
    });
    self.ready();
    self.onStop(function () {
      handle.stop();
    });
  }
});

Meteor.methods({
  maxCollectionCount: function() {
    return Collection.find().count();
  }
});