People = new Meteor.Collection('people');
Upvotes = new Meteor.Collection('upvotes');

if (Meteor.isClient) {

  Template.people.helpers({
    'person': function() {
      return People.find({}, {sort: {votes: -1}});
    },

    'new': function(fbId) {
      if (Session.get('new') && Session.get('fbId') == fbId) {
          return true;
      }
      return false;
    }

  });

  Template.people.events({
    'click .upvote': function(e) {
      var id = $(e.target).closest('li').attr('id');
      // if they're new
      if (Session.get('new') && People.findOne({_id: id}).fbId == Session.get('fbId')) {
        notifyError("Can't upvote yourself until you're up on the fame wall.");
      } else if (!Session.get('fbId')) {
        notifyError("You have to sign in to upvote.");
      } else if (!Upvotes.findOne({fbId: Session.get('fbId'), voteeId: id})) {
        People.update(id, {$inc: {votes: 1}});
        Upvotes.insert({fbId: Session.get('fbId'), voteeId: id});
      } else {
        notifyError("You've already upvoted this person.");
      }
    },

    'click .add': function(e) {
      var id = $(e.target).closest('li').attr('id');
      user = People.findOne({_id: id});
      user.blurb = $('.new-blurb').val();
      People.update(id, user);
      Session.set('new', false);
    }
  });

  Template.facebook.helpers({
    'loggedIn': function() {
      return !!Session.get('fbId');
    },

    'notFamous': function() {
      return (People.find({fbId: Session.get('fbId')}).fetch().length === 0);
    }
  });

  Template.facebook.events({
    'click button.login': function(e) {
      fbApi.login(function(user) {
         Session.set('user', user);
         Session.set('fbId', user.id);
      });
      return false;
    },

    'click button.logout': function(e) {
      fbApi.logout(function(response) {
        Session.set('fbId', null);
      });
    },

    'click button.famous': function(e) {
      var user = Session.get('user');
      if (People.findOne({fbId: user.id})) {
            console.log("you're already on your way to fame!");
       } else {
          Session.set('new', true);
          People.insert({fbId: user.id, name: user.name, votes: 0, picture: "http://graph.facebook.com/" + user.id + "/picture", blurb: ""});
       }
    }
  });


}

if (Meteor.isServer) {
  Meteor.startup(function () {
    if (People.find().fetch().length == 0) {
      People.insert({fbId: "idhere", name: 'Simon Zheng', votes: 0, blurb: "im a swagger", picture: "https://lh3.googleusercontent.com/-pFiEmZTn7V0/AAAAAAAAAAI/AAAAAAAAAAA/_l2TEFyYhsY/s48-c-k/photo.jpg"});
      People.insert({fbId: "idhere", name: 'Shadi Barhoumi', votes: 0, blurb: "im a swagger", picture: "https://lh3.googleusercontent.com/-pFiEmZTn7V0/AAAAAAAAAAI/AAAAAAAAAAA/_l2TEFyYhsY/s48-c-k/photo.jpg"});
      People.insert({fbId: "idhere", name: 'Chen Liang', votes: 0, blurb: "im a swagger", picture: "https://lh3.googleusercontent.com/-pFiEmZTn7V0/AAAAAAAAAAI/AAAAAAAAAAA/_l2TEFyYhsY/s48-c-k/photo.jpg"});
      People.insert({fbId: "idhere", name: 'Sid Dange', votes: 0, blurb: "im a swagger", picture: "https://lh3.googleusercontent.com/-pFiEmZTn7V0/AAAAAAAAAAI/AAAAAAAAAAA/_l2TEFyYhsY/s48-c-k/photo.jpg"});
    }

    // All values listed below are default
    collectionApi = new CollectionAPI({
      authToken: undefined,              // Require this string to be passed in on each request
      apiPath: 'api',          // API path prefix
      standAlone: false,                 // Run as a stand-alone HTTP(S) server
      sslEnabled: false,                 // Disable/Enable SSL (stand-alone only)
      listenPort: 3005,                  // Port to listen to (stand-alone only)
      listenHost: undefined,             // Host to bind to (stand-alone only)
      privateKeyFile: 'privatekey.pem',  // SSL private key file (only used if SSL is enabled)
      certificateFile: 'certificate.pem' // SSL certificate key file (only used if SSL is enabled)
    });

    collectionApi.addCollection(People, 'people', {
      // All values listed below are default
      authToken: undefined,                   // Require this string to be passed in on each request
      methods: ['GET', 'POST', 'DELETE', 'PUT'],  // Allow creating, reading, updating, and deleting
      before: {  // This methods, if defined, will be called before the POST/GET/PUT/DELETE actions are performed on the collection. If the function returns false the action will be canceled, if you return true the action will take place.
        POST: undefined,  // function(obj) {return true/false;},
        GET: function(arg) {
          console.log(arg);
          return true;
        },  // function(collectionID, objs) {return true/false;},
        PUT: undefined,  //function(collectionID, obj, newValues) {return true/false;},
        DELETE: undefined,  //function(collectionID, obj) {return true/false;}
      }
    });

    collectionApi.addCollection(Upvotes, 'upvotes', {
      // All values listed below are default
      authToken: undefined,                   // Require this string to be passed in on each request
      methods: ['GET', 'POST', 'DELETE', 'PUT'],  // Allow creating, reading, updating, and deleting
      before: {  // This methods, if defined, will be called before the POST/GET/PUT/DELETE actions are performed on the collection. If the function returns false the action will be canceled, if you return true the action will take place.
        POST: undefined,  // function(obj) {return true/false;},
        GET: undefined,  // function(collectionID, objs) {return true/false;},
        PUT: undefined,  //function(collectionID, obj, newValues) {return true/false;},
        DELETE: undefined,  //function(collectionID, obj) {return true/false;}
      }
    });

    // Starts the API server
    collectionApi.start();


  });
    Meteor.Router.add('/people.json', function() {
      return {'response': 'swag my dick out'};
    });
}
