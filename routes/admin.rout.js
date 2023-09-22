const User = require('../models/user.model');
const router = require('express').Router();
const mongoose = require('mongoose');
const { roles } = require('../utils/constant');


router.get('/users',async(req,res,next)=>{
     try {
          const users = await User.find();
          res.render('manageUser',{ users })
     } catch (error) {
          next(error)
     }
})

router.get('/user/:id', async (req, res, next) => {
     try {
       const { id } = req.params;
       if (!mongoose.Types.ObjectId.isValid(id)) {
         req.flash('error', 'Invalid id');
         res.redirect('/admin/users');
         return;
       }
       const person = await User.findById(id);
       res.render('profile', { person });
     } catch (error) {
       next(error);
     }
   });

router.post('/update-role',async(req,res,next)=>{
  const {id , role} = req.body
    // Checking for id and roles in req.body

  if(!id || !role){
    req.flash('error',"invalid Request")
    return res.redirect('back')
  }
    // Check for valid mongoose objectID


  if(!mongoose.Types.ObjectId.isValid(id)){
    req.flash('error',"invalid Id")
    return res.redirect('back')
  }
    // Check for Valid role

  const roleArray = Object.values(roles)
  if(!roleArray.includes(role)){
    req.flash('error',"invalid Role")
    return res.redirect('back')
  }
    // Admin cannot remove himself/herself as an admin

  if(req.user.id === id){
    req.flash('error',"Admin can't Remove themselves from Admin Role please ask another Admin for change.")
    return res.redirect('back')
  }
    // Finally update the user

  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  );

  req.flash('info', `Updated role for ${user.email} to ${user.role}`);
  res.redirect('back');
})    
   

module.exports = router;
