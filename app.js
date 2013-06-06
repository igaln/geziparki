
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , vines = require('./routes/vines')
  , images = require('./routes/images')
  , youtube = require('./routes/youtube')
  , fact = require('./routes/fact')
  , map = require('./routes/map')
  , http = require('http')
  , path = require('path')
  , passport = require('passport')
  , flash = require('connect-flash')
  , LocalStrategy = require('passport-local').Strategy;



// PASSPORT STUFF

var users = [
    { id: 1, username: 'bob', password: 'secret', email: 'bob@example.com' }
  , { id: 2, username: 'joe', password: 'birthday', email: 'joe@example.com' }
];

function findById(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}

function findByUsername(username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  findById(id, function (err, user) {
    done(err, user);
  });
});


// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
passport.use(new LocalStrategy(
  function(username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // Find the user by username.  If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure and set a flash message.  Otherwise, return the
      // authenticated `user`.
      findByUsername(username, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      })
    });
  }
));


// END PASSPORT STUFF

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'hjs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
//app.use(express.session());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(flash());
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());

app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/vines', vines.index);
app.get('/images', images.index);
app.get('/youtube', youtube.index);

app.get('/users', user.list);
app.get('/map', map.view);

app.get('/map', map.view);
app.get('/factchecker',fact.index);

//app.get ( '/data/:name' , fact.data);  //file name + function for req  / res


app.get ( '/data/:start/:end/:text' , function(req,res) {

  // console.log(req.params);
  // res.send('start ' + req.params.start);
  // res.send('end ' + req.params.end);
  // res.send('text ' + req.params.text);

  
  //  if(typeof req.query.begin==='undefined'){
  //   console.log("of");
  //   start = 0;
  //  } else {
  //   start = parseInt(req.query.begin);
  //  }

  //  var end = start + 7;

  // console.log(start + " " + end);

  // var tweetdata  = [];
   var Db = require('mongodb').Db
    , Connection = require('mongodb').Connection
  , Server = require('mongodb').Server
    , format = require('util').format;

  //166.78.181.167
   var client = new Db('gezi', new Server("166.78.181.167", 27017, {}), {w: 1});
       
      client.open(function(err, p_client) {
          
          var fields = {
            "created_at": true,
            "text": true,
            "entities":true
           };

          // In Between these Times Query
          var startQuery = new Date(req.params.start);
          var endQuery = new Date(req.params.end);

          //var query = {"_id": {"$gte": startQuery, "$lt": endQuery} };
          //----//


          var query = {"text" :  new RegExp(req.params.text) };

          client.collection("tweets", function(err,collection) {
            collection.find(query,fields).sort({_id:-1}).toArray(function(err, results){
              res.send(results);
              
            });

            client.close(); 
             //console.log(tweetdata.length);
             //res.render('index', { tweetdata: tweetdata, start:end, type:"vines" });
         });



      });
}); 





app.get('/account', ensureAuthenticated, function(req, res){
  console.log(req.user);
  res.render('accessdenied', { user: req.user });
});

// app.get('/login', function(req, res){
//   res.render('login', { user: req.user, message: req.flash('error') });
// });

// POST /login
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
//
//   curl -v -d "username=bob&password=secret" http://127.0.0.1:3000/login

// app.post('/login', 
//   passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
//   function(req, res) {
//     res.redirect('/');
//   });
  
// POST /login
//   This is an alternative implementation that uses a custom callback to
//   acheive the same functionality.

app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      req.flash('error', info.message);
      return res.redirect('/factchecker')
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/account');
    });
  })(req, res, next);
});



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/factchecker')
}


