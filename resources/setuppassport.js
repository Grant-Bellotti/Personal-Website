var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

var user = {
  id: 1,
  username: "admin"
};

module.exports = function() {
  passport.serializeUser(function(user, done) {
    // Serialize the user object (e.g., save user.id to session)
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    // Deserialize the user object (e.g., retrieve user from a simulated data store using id)
    if (id === user.id) {
      done(null, user);
    } else {
      done(new Error("User not found"));
    }
  });

  passport.use("login", new LocalStrategy(function(username, password, done) {
    return done(null, user);
  }));

};
