const express = require('express');
const router = express.Router();

const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const passport = require('passport');
const db = require("../models");
const path = require("path");
const Op = db.Sequelize.Op;
const { v4: uuidv4 } = require('uuid');
router.get('/', forwardAuthenticated, async (req, res) =>{
  res.render('login');
 });
 router.get('/dashboard', ensureAuthenticated, async function(req, res) {
  if(req.user.user_roll==="Admin"){
    res.render('dashboard',{user:req.user});
  
  }else if (req.user.user_roll==="Department_Head"){


    res.render('dashboarddept',{user:req.user});
  
  }else{
    res.render('pageerror');
  }
   });
 

router.get('/progress', ensureAuthenticated, async (req, res) =>{
res.render('progress');
});
router.get('/addnewannualplan', ensureAuthenticated, async function(req, res) {
  const existingplans = await db.Plan.findAll({});
  res.render('addnewannualplan',{allplans:existingplans});
  });
router.get('/setting', ensureAuthenticated, async (req, res) =>{
  res.render('setting');
  });
  router.get('/createplan', ensureAuthenticated, async (req, res) =>{
    res.render('createplan');
    });
 router.get('/login', forwardAuthenticated, async (req, res) =>{
    res.render('login');
   });
  
  
// // Logout
// router.get('/logout', (req, res) => {
//     req.logout();
//     req.flash('success_msg', 'You are logged out');
//     res.redirect('/stvcpms/login')

// })

router.get('/logout', (req, res) => {
  // Perform any necessary actions before logging out

  req.logout(function(err) {
    if (err) {
      // Handle any error that occurred during logout
      console.error('Logout error:', err);
      // Optionally, redirect or send an error response
      return res.status(500).send('Error occurred during logout');
    }

    // Logout successful
    // Redirect or send a success response
    res.redirect('/stvcpms/login');
  });
});


// Post Routers 
router.post('/login', (req, res, next) => {

    
    passport.authenticate('local', {
        successRedirect: '/stvcpms/dashboard',
        failureRedirect: '/stvcpms/login',
        failureFlash: true

    })(req, res, next);
});
router.post('/addplanstrategicgoal', ensureAuthenticated, async function(req, res) {
  const{planid} =req.body;
  const existingplans = await db.Plan.findAll({});
  const sgs = await db.StrategicGoal.findAll({where:{planid:planid}});
  if(planid ==="0"){
    res.render('addnewannualplan',{error_msg:'Please select plan title first',allplans:existingplans});
  }else{
   db.Plan.findOne({where:{planid:planid}}).then(plan =>{
    if(plan){
     res.render('addstrategicgoal',{success_msg:'You can add edit or delete plan strategic goals or objectives here',sgs:sgs,plan:plan,planid:planid});
    }else{
      res.render('addnewannualplan',{error_msg:'Cant find plan with this id. please try again',allplans:existingplans});
    }
   }).catch(err =>{
    res.render('addnewannualplan',{error_msg:'Error while finding plan with id try again',allplans:existingplans});
   })
  }
});
router.post('/addnewplan', ensureAuthenticated, async function(req, res) {
  const{plancode,plantitle,plandescription,planduration,enddate,startdate} =req.body;
  let errors =[];
  const existingplans = await db.Plan.findAll({});
  if(!plancode || !plandescription || !planduration || !plantitle || !startdate || !enddate){
    errors.push({mssg:'Please add allrequired fields'})
  }
  if(errors.length >0){
    res.render('addnewannualplan',{errors});
  }else{

    const uuid = uuidv4();
    const newplan ={
      planid :uuid,
      plantitle:plantitle,
      plancode:plancode,
      plandescription:plandescription,
      planduration:planduration,
      startdate:new Date(startdate),
      enddate:new Date(enddate),
    }
    db.Plan.findOne({where:{plancode:plancode}}).then(plan=>{
      if(plan){
        res.render('addnewannualplan',{error_msg:'Please enter new plan code. plan code already exist.',allplans:existingplans});
      }else{
     db.Plan.create(newplan).then(plans =>{
      if(plans){
       db.Plan.findAll().then(allplans =>{
        res.render('addnewannualplan',{success_msg:'You are successfully create new plan please add all the necessary attributes',allplans:allplans});
       }).catch(err =>{
        res.render('addnewannualplan',{error_msg:'Error while finding exsting updated plans.', allplans:existingplans});
       })
      }else{
        res.render('addnewannualplan',{error_msg:'Please enter new plan code. plan code already exist.',allplans:existingplans});
      }
     }).catch(err =>{
      res.render('addnewannualplan',{error_msg:'Error while creating new plan.',allplans:existingplans});
     })
      }
    }).catch(err =>{
      res.render('addnewannualplan',{error_msg:'Error while finding existing plan.',allplans:existingplans});
    })
  
  }

  });
router.post('/addnewstrategicgoal', ensureAuthenticated, async function(req, res) {
    const{sgoalcode,sgoaltitle,sgoaldescription,sgoalduration,enddate,startdate,planid} =req.body;
    let errors =[];
    const plan = await db.Plan.findOne({where:{planid:planid}});
    const sgs = await db.StrategicGoal.findOne({where:{planid:planid}});
    if(!sgoalcode || !sgoaldescription || !sgoalduration || !sgoaltitle || !startdate || !enddate){
      errors.push({mssg:'Please add all required fields'})
    }
    if(errors.length >0){
      res.render('addstrategicgoal',{errors});
    }else{
  
      const uuid = uuidv4();
      const newstrategicgoal ={
        sgoalid:uuid,
        planid :planid,
      sgoalcode:sgoalcode,
      sgoaldescription:sgoaldescription,
      sgoalduration:sgoalduration,
      sgoaltitle:sgoaltitle,
        startdate:new Date(startdate),
        enddate:new Date(enddate),
      }
      db.StrategicGoal.findOne({where:{sgoalcode:sgoalcode}}).then(sg=>{
        if(sg){
          res.render('addstrategicgoal',{error_msg:'Please enter new strategic goal code.code already exist.',plan:plan,planid:planid,sgs:sgs});
        }else{
       db.StrategicGoal.create(newstrategicgoal).then(sgs =>{
        if(sgs){
         db.StrategicGoal.findAll({where:{planid:planid}}).then(allsgs =>{
          res.render('addstrategicgoal',{success_msg:'You are successfully create new strategic goal please add all the necessary attributes',planid:planid,plan:plan,sgs:allsgs});
         }).catch(err =>{
          res.render('addstrategicgoal',{error_msg:'Error while finding exsting updated strategic goal .', plan:plan,planid:planid,sgs:sgs});
         })
        }else{
          res.render('addstrategicgoal',{error_msg:'Please enter new plan code. strategic goal code already exist.',plan:plan,planid:planid,sgs:sgs});
        }
       }).catch(err =>{
        res.render('addstrategicgoal',{error_msg:'Error while creating new strategic goal.',plan:plan,planid:planid,sgs:sgs});
       })
        }
      }).catch(err =>{
        res.render('addstrategicgoal',{error_msg:'Error while finding existing strategic goal .',plan:plan,planid:planid,sgs:sgs});
      })
    
    }
  
    });
module.exports = router;