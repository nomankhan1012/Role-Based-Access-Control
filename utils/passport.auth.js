const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user.model');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email })
        // Username/email does NOT exist
        if (!user) {
          return done(null, false, {
            message: 'Username/email not Registered',
          });
        }
        // Email exist and now we need to verify the password
        const isMatch = await user.isValidPassword(password);
        return isMatch
          ? done(null, user)
          : done(null, false, { message: 'Incorrect username/password' });
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.serializeUser( (user, done)=>{
  console.log('serilizing user.....');
  console.log(user);
  done(null, user.id);
});

passport.deserializeUser(async (id, done)=>{
  console.log('Deserilizing user.....');
  console.log(id);
  try {
    const user = await User.findById(id);
    if
    (!user) throw new Error('user not found');
    done(null,user);
  } catch (error) {
    done(error,null)
  }
});
