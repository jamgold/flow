// counter starts at 0
// http://stackoverflow.com/questions/37858901/a-good-way-to-define-default-rendering-templates-in-flowrouter

Session.setDefault('counter', 0);
Session.setDefault('subscriptionId', null);
Session.setDefault('collectionCount', 0);
Session.setDefault('subscriptionIdFilter', false);
Session.setDefault('onbeforeunloadCheck', null);

onbeforeunloadCheck = function(e){
  console.log('onbeforeunloadCheck',e);
  return Session.get('onbeforeunloadCheck');
}

Meteor.startup(function(){
  if(useTriggers)
  {
    FlowRouter.triggers.enter([function(context){
        console.info('enter', context);
        // $(window).trigger('onbeforeunload');
    }]);
    // redirectFunc(url, params, queryParams)
    FlowRouter.triggers.exit([function(context, redirectFunc){
      var e = new Event('beforeunload');e.bubbles = true;
      console.info('exit', context, e);
      window.dispatchEvent(e);
      //
      // redirect back to current
      //
      // redirectFunc( FlowRouter.current().path );

        // if(Session.get('onbeforeunloadCheck'))
        //   if(!confirm(Session.get('onbeforeunloadCheck')))
        //   {
        //     Session.set('onbeforeunloadCheck', null);
        //     redirect(context.path);
        //   }
        // $(window).trigger('onbeforeunload');
    }]);
  }
  // window.onbeforeunload = onbeforeunloadCheck;
});

Template.hello.onRendered(function(){
  this.$('.content').on('beforeunload', onbeforeunloadCheck );//.each(function(){console.log(this)});
});
Template.page3.onCreated(function() {
  var sub = this.subscribe('collection', {
      random: {
        $gt: 5000
      }
    },{
      sort:{random:1}
      // ,limit:1000
    });
  FlowRouter.current().route.minNum = 5000;
  FlowRouter.current().route.subscriptionId = sub.subscriptionId;
  this.subscriptionId = sub.subscriptionId;
});
Template.page3.helpers({
  subscriptionId: function(){
    var template = Template.instance();
    return template.subscriptionId;
  },
  entries: function(){
    var template = Template.instance();
    var query = Session.get('subscriptionIdFilter') ? {_subscriptionId: template.subscriptionId} : {};

    var cursor = Collection.find(query,{
      sort:{
        counter:1
        ,_subscriptionId:1
      }
    });
    Session.set('collectionCount', cursor.count());
    return cursor;
  }
})

Template.registerHelper('collection', function(){
  var subscriptionId = FlowRouter.current().route.subscriptionId;// Session.get('subscriptionId');
  // console.log('collection subscriptionId', subscriptionId);
  var query = Session.get('subscriptionIdFilter') ? {_subscriptionId: subscriptionId} : {};
  //
  // a transform here is useless, because we can not filter for the subscriptionId with find
  //
  var cursor = Collection.find(query,{
    sort:{
      counter:1
      ,_subscriptionId:1
    }
    // ,transform: function(doc){
    //   // console.log('transform', doc);
    //   doc._subscriptionId = subscriptionId;
    //   return doc;
    // }
  });
  Session.set('collectionCount', cursor.count());
  return cursor;
});
Template.registerHelper('slug', function(){
  return FlowRouter.getParam('slug');
});
Template.registerHelper('miniMongoReady', function() {
  var sid = FlowRouter.current().route.subscriptionId;
  return Session.get('collectionCount') == Collection.find({_subscriptionId: sid}).count();
});
Template.registerHelper('collectionCount', function(){
  //
  return Session.get('collectionCount');
});
Template.registerHelper('maxCollectionCount', function() {
  Meteor.call('maxCollectionCount', function(err,res){
    if(!err) Session.set('maxCollectionCount', res);
    else console.error(err);
  });
  return Session.get('maxCollectionCount');
});
Template.registerHelper('subsReady', function(sub) {
  return FlowRouter.subsReady(sub);
});
Template.registerHelper('subscriptionId', function(sub) {
  return FlowRouter.current().route.subscriptionId;//Session.get('subscriptionId');
});
Template.registerHelper('minNum', function() {
  // console.log('minNum', FlowRouter.current());
  return FlowRouter.current().route.minNum;
});
Template.registerHelper('pageCount', function() {
  var sid = FlowRouter.current().route.subscriptionId;
  return Collection.find({_subscriptionId: sid}).count();
});

Template.header.onRendered(function(){
  console.log(this.view.name+'.rendered');
})

Template.caption.helpers({
  checked: function() {
    return Session.get('subscriptionIdFilter') ? 'checked' : '';
  }
});
Template.caption.events({
  'change input': function(e,t) {
    Session.set('subscriptionIdFilter', e.target.checked);
  }
});

Template.mainLayout.helpers({
  menu: function () {
    FlowRouter.watchPathChange();
    var p = FlowRouter.current().route.name;
    // console.log('mainLayout.menu '+p);
    var t = new Date().getTime();
    var menu = [
      {active: p == 'home' ? 'active': '',url:'/',text:'Home'},
      {active: p == 'page1' ? 'active': '',url:'/page1/'+t, text:'Page 1'},
      {active: p == 'page2' ? 'active': '',url:'/page2/'+t, text:'Page 2'},
      {active: p == 'page3' ? 'active': '',url:'/page3/'+t, text:'Page 3'},
    ];
    return menu;
  }
});
