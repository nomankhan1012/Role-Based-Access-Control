const {body} = require('express-validator')
module.exports = {
     RegisterValidator:
     [
          body('email').trim().isEmail().withMessage('Email must be the valid email').normalizeEmail().toLowerCase(),
          body('password').trim().isLength(2).withMessage('password length short min length required 2 char'),
          body('password2').custom((value,{req})=>{
            if(value !== req.body.password){
              throw new Error('password and confirm pass not match!')
            }
            return true;
          })
        ]
      
}