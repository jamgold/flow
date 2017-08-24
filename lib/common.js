useTransform = false;
useTriggers = false;

Collection = new Mongo.Collection('collection',{
  // transform: function(doc){
  //   if(Meteor.isServer)
  //     console.log('collection transform', this);
  //   else
  //     console.log('collection transform')
  //   return doc;
  // }
});
FlowRouter.notFound = {
    // Subscriptions registered here don't have Fast Render support.
    action: function() {
      BlazeLayout.render('mainLayout', {
        header: "header",
        main: "notFound"
      });
    }
};

FlowRouter.route('/',{
  name: 'home',
  action: function(params) {
    if(Meteor.isClient)
    {
      Session.set('collectionCount', 0);
      // Session.set('subscriptionId', 'null');
    }
    BlazeLayout.render("mainLayout", {
      header: "header"
      ,main: "hello"
    });
  }
});
FlowRouter.route('/page1/:slug',{
  name: 'page1',
  subscriptions: function(params, queryParams) {
    this.minNum = 1000;
    var page = Meteor.subscribe('collection', {
      random: {
        $lt: this.minNum
      }
    },{
      sort:{random:1}
      // ,limit:this.minNum
    });
    this.subscriptionId = page.subscriptionId;
    this.register('page1', page );
  },
  action: function(params) {
    BlazeLayout.render("mainLayout", {
      header: "header",
      main: "page1"
    });
  }
});
FlowRouter.route('/page2/:slug',{
  name: 'page2',
  subscriptions: function(params, queryParams) {
    this.minNum = 1000;
    var page = Meteor.subscribe('collection', {
      random: {
        $gt: this.minNum,
        $lt: 5000
      }
    },{
      sort:{random:1}
      // ,limit:1000
    });
    this.subscriptionId = page.subscriptionId;
    this.register('page2', page);
  },
  action: function(params) {
    BlazeLayout.render("mainLayout", {
      header: "header",
      main: "page2"
    });
  }
});
FlowRouter.route('/page3/:slug', {
  name: 'page3',
  action: function(params) {
    BlazeLayout.render("mainLayout", {
      header: 'header',
      main: 'page3'
    })
  }
});
