const ObjectId = require('mongodb').ObjectId
module.exports = function(app, passport, db) {

    // normal routes ===============================================================
    
        // show the home page (will also have our login links)
        app.get('/', function(req, res) {
          db.collection('posts').find().toArray((err, result) => {
            if (err) return console.log(err)
            res.render('index.njk', {
              user : req.user,
              posts: result
            })
          })
      });

        app.get('/post', function(req, res) {
          res.render('post.njk');
      });
    
        // PROFILE SECTION =========================
        app.get('/loghome', isLoggedIn, function(req, res) {
            db.collection('posts').find().toArray((err, result) => {
              if (err) return console.log(err)
              res.render('loghome.njk', {
                user : req.user,
                posts: result
              })
            })
        });
    
        // LOGOUT ==============================
        app.get('/logout', function(req, res) {
            req.logout(() => {
              console.log('User has logged out!')
            });
            res.redirect('/');
        });
    
    // posts routes ===============================================================
    
      app.post('/reddit-post', (req, res) => {
        db.collection('posts').insertOne({title: req.body.title, posttext: req.body.posttext}, (err, result) => {
          if (err) return console.log(err)
          console.log('saved to database')
          res.redirect('/loghome')
        })
      })
    
    
        app.delete('/delete', (req, res) => {
          db.collection('posts').findOneAndDelete({_id: ObjectId(req.body.id)}, (err, result) => {
            if (err) return res.send(500, err)
            res.send('Message deleted!')
          })
        })
    
    // =============================================================================
    // AUTHENTICATE (FIRST LOGIN) ==================================================
    // =============================================================================
    
        // locally --------------------------------
            // LOGIN ===============================
            // show the login form
            app.get('/login', function(req, res) {
                res.render('login.njk', { message: req.flash('loginMessage') });
            });
    
            // process the login form
            app.post('/login', passport.authenticate('local-login', {
                successRedirect : '/loghome', // redirect to the secure profile section
                failureRedirect : '/login', // redirect back to the signup page if there is an error
                failureFlash : true // allow flash messages
            }));
    
            // SIGNUP =================================
            // show the signup form
            app.get('/signup', function(req, res) {
                res.render('signup.njk', { message: req.flash('signupMessage') });
            });
    
            // process the signup form
            app.post('/signup', passport.authenticate('local-signup', {
                successRedirect : '/loghome', // redirect to the secure profile section
                failureRedirect : '/signup', // redirect back to the signup page if there is an error
                failureFlash : true // allow flash messages
            }));
    
    // =============================================================================
    // UNLINK ACCOUNTS =============================================================
    // =============================================================================
    // used to unlink accounts. for social accounts, just remove the token
    // for local account, remove email and password
    // user account will stay active in case they want to reconnect in the future
    
        // local -----------------------------------
        app.get('/unlink/local', isLoggedIn, function(req, res) {
            var user            = req.user;
            user.local.email    = undefined;
            user.local.password = undefined;
            user.save(function(err) {
                res.redirect('/loghome');
            });
        });
    
    };
    
    // route middleware to ensure user is logged in
    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();
    
        res.redirect('/');
    }
    