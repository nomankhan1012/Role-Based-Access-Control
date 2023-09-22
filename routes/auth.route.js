const router = require('express').Router();
const User = require('../models/user.model');
const { validationResult } = require('express-validator');
const passport = require('passport');
const {ensureLoggedIn,ensureLoggedOut} = require('connect-ensure-login');
const { RegisterValidator } = require('../utils/validator');

router.get(
  '/login',ensureLoggedOut({redirectTo:"/"}),async (req, res, next) => {
     res.render('login');
   }
);

router.post('/login',ensureLoggedOut({redirectTo:"/"}),passport.authenticate('local',{
  successReturnToOrRedirect:'/',
  failureRedirect: "/auth/login",
  failureFlash: true,
})
);
router.get(
  '/register',ensureLoggedOut({redirectTo:"/"}),
  async (req, res, next) => {
    res.render('register');
  }
);

router.post(
  '/register',ensureLoggedOut({redirectTo:"/"}),RegisterValidator,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
          req.flash('error', error.msg);
        });
        res.render('register', {
          email: req.body.email,
          messages: req.flash(),
        });
        return;
      }

      const { email } = req.body;
      const doesExist = await User.findOne({ email });
      if (doesExist) {
        req.flash('warning', 'Username/email already exists');
        res.redirect('/auth/register');
        return;
      }
      const user = new User(req.body);
      await user.save();
      req.flash(
        'success',
        `${user.email} registered succesfully, Now you can login`
      );
      res.redirect('/auth/login');
    } catch (error) {
      next(error);
    }
  }
);
router.get("/logout",ensureLoggedIn({redirectTo:"/"}),(req, res) => {
  req.logout(req.user, err => {
    if(err) return next(err);
    res.redirect("/");
  });
});


module.exports = router;
