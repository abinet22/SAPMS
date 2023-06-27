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
  const existingplans = await db.Plan.findAll({});
  const plan = await db.Plan.findAll({});
const goal = await db.StrategicGoal.findAll({});
const sdir = await db.StrategicDirection.findAll({});
const mact = await db.MajorActivity.findAll({});
const dact = await db.DetailActivity.findAll({});
  if(req.user.user_roll==="Admin"){
    res.render('dashboard',{user:req.user,allplans:existingplans,plan:plan,sdir:sdir,mact:mact,goal:goal,dact:dact});
  
  }else if (req.user.user_roll==="Department_Head"){


    res.render('dashboarddept',{user:req.user,allplans:existingplans});
  
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
router.get('/createtargetgroup', ensureAuthenticated, async function(req, res) {
  const existingplans = await db.Plan.findAll({});
  const detailview = await db.StrategicGoal.findAll({});
 res.render('createtargetgroup',{allplans:existingplans,sgoal:detailview});
  });
router.post('/selectplantoviewdetail', ensureAuthenticated, async function(req, res) {
const{planid,configcat} =req.body;
const existingplans = await db.Plan.findAll({});
const plan = await db.Plan.findOne({where:{planid:planid}});
const goal = await db.StrategicGoal.findOne({where:{planid:planid}});
const sdir = await db.StrategicDirection.findOne({where:{sgoalid:goal.sgoalid}});
const mact = await db.MajorActivity.findOne({where:{sdirid:sdir.sdirid}});
const dact = await db.DetailActivity.findOne({where:{mactivityid:mact.mactivityid}});
var detailview; 
if(configcat ==="SG"){
 detailview = await db.StrategicGoal.findAll({where:{planid:planid}});
 res.render('plandetail',{allplans:existingplans,plan:plan,sgoal:detailview,tag:"sg"});
}
else if(configcat ==="SD"){
  detailview = await db.StrategicDirection.findAll({where:{sgoalid:goal.sgoalid}});
  res.render('plandetail',{allplans:existingplans,plan:plan,sgoal:detailview,tag:"sd"});
 }
 else if(configcat ==="MA"){
  detailview = await db.MajorActivity.findAll({where:{sdirid:mact.sdirid}});
  res.render('plandetail',{allplans:existingplans,plan:plan,sgoal:detailview,tag:"ma"});
 }
 else if(configcat ==="DA"){
  detailview = await db.DetailActivity.findAll({where:{mactivityid:mact.mactivityid}});
  res.render('plandetail',{allplans:existingplans,plan:plan,sgoal:detailview,tag:"da"});
 }
 else if(configcat ==="DP"){
  const goal = await db.StrategicGoal.findAll({});
const sdir = await db.StrategicDirection.findAll({});
const mact = await db.MajorActivity.findAll({});
const dact = await db.DetailActivity.findAll({});
 
  res.render('showfullplandetail',{allplans:existingplans,plan:plan,goal:goal,sdir:sdir,mact:mact,dact:dact});
 }

});

router.get('/setting', ensureAuthenticated, async (req, res) =>{
res.render('setting');
});

router.get('/createplan', ensureAuthenticated, async (req, res) =>{
res.render('createplan');
});
router.get('/searchplanprogress', ensureAuthenticated, async (req, res) =>{
  const sgoal = await db.StrategicGoal.findAll({});
  const sdir = await db.StrategicDirection.findAll({});
  const mact = await db.MajorActivity.findAll({});
  const dact = await db.DetailActivity.findAll({});
  const existingplans = await db.Plan.findAll({});

  res.render('searchplanprogress',{allplans:existingplans,sgoal:sgoal,sdir:sdir,mact:mact,dact:dact});
  });
router.get('/login', forwardAuthenticated, async (req, res) =>{
res.render('login');
});
  
router.get('/goals/(:planId)', async (req, res) => {
  try {
    const { planId } = req.params;
    const goals = await db.StrategicGoal.findAll({ where:{planid:planId}});
     console.log(goals)
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route handler for fetching the "major activities" based on the selected "goal" ID
router.get('/major-activities/(:goalId)', async (req, res) => {
  try {
    const { goalId } = req.params;
    const majorActivities =await db.MajorActivity.findAll({ where:{sdirid:goalId}});

    res.json(majorActivities);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get('/direction/(:goalId)', async (req, res) => {
  try {
    const { goalId } = req.params;
    const majorActivities =await db.StrategicDirection.findAll({ where:{sgoalid:goalId}});

    res.json(majorActivities);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get('/detail-activities/(:goalId)', async (req, res) => {
  try {
    const { goalId } = req.params;
    const majorActivities =await db.DetailActivity.findAll({ where:{mactivityid:goalId}});

    res.json(majorActivities);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
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
  const thisplan = await db.Plan.findOne({where:{planid:planid}});
  const sgs = await db.StrategicGoal.findAll({where:{planid:planid}});
  if(planid ==="0"){
    res.render('addnewannualplan',{error_msg:'Please select plan title first',allplans:existingplans,plan:thisplan});
  }else{
   db.Plan.findOne({where:{planid:planid}}).then(plan =>{
    if(plan){
     res.render('addstrategicgoal',{success_msg:'You can add edit or delete plan strategic goals or objectives here',allplans:existingplans,sgs:sgs,plan:plan,planid:planid});
    }else{
      res.render('addnewannualplan',{error_msg:'Cant find plan with this id. please try again',allplans:existingplans,plan:thisplan});
    }
   }).catch(err =>{
    res.render('addnewannualplan',{error_msg:'Error while finding plan with id try again',allplans:existingplans,plan:thisplan});
   })
  }
});
router.post('/addplanstrategicdirection', ensureAuthenticated, async function(req, res) {
  const{sgoalid} =req.body;
  const curentsgoal = await db.StrategicGoal.findOne({where:{sgoalid:sgoalid}});
  console.log("current goal")
  const existingplans = await db.Plan.findAll({})
  console.log(curentsgoal)
  const sgs = await db.StrategicGoal.findAll({where:{planid:curentsgoal.planid}});
  const sdirs = await db.StrategicDirection.findAll({where:{sgoalid:sgoalid}});
  if(sgoalid ==="0"){
    res.render('addstrategicgoal',{error_msg:'Please select plan title first',allplans:existingplans,plan:curentsgoal,sgs:sgs,planid:curentsgoal.planid});
  }else{
   db.StrategicGoal.findOne({where:{sgoalid:sgoalid}}).then(sgoal =>{
    if(sgoal){
     res.render('addstrategicdirection',{success_msg:'You can add edit or delete plan strategic dirrections here',allplans:existingplans,sdir:sdirs,sgoal:sgoal,sgoalid:sgoalid});
    }else{
      res.render('addstrategicgoal',{error_msg:'Cant find plan with this id. please try again',allplans:existingplans,plan:curentsgoal,sgs:sgs,planid:curentsgoal.planid});
    }
   }).catch(err =>{
    res.render('addstrategicgoal',{error_msg:'Error while finding plan with id try again',allplans:existingplans,plan:curentsgoal,sgs:sgs,planid:curentsgoal.planid});
   })
  }
});
router.post('/addplanmajoractivity', ensureAuthenticated, async function(req, res) {
  const{sdirid} =req.body;
  const currentdirection = await db.StrategicDirection.findOne({where:{sdirid:sdirid}});
  const sgoal = await db.StrategicGoal.findAll({where:{sgoalid:currentdirection.sgoalid}});
  const existingplans = await db.Plan.findAll({})
  const mact = await db.MajorActivity.findAll({where:{sdirid:sdirid}});
  if(sdirid ==="0"){
    res.render('addstrategicdirection',{error_msg:'Please select strategic direction first',allplans:existingplans,sdir:sdir,sgoal:sgoal,sgoalid:currentdirection.sgoalid});
  }else{
   db.StrategicDirection.findOne({where:{sdirid:sdirid}}).then(sdir =>{
    if(sgoal){
     res.render('addmajoractivity',{success_msg:'You can add edit or delete major activities here',allplans:existingplans,mact:mact,sdir:sdir,sdirid:sdirid});
    }else{
      res.render('addstrategicdirection',{error_msg:'Cant find strategic direction with this id. please try again',allplans:existingplans,sdir:sdir,sgoal:sgoal,sgoalid:currentdirection.sgoalid});
    }
   }).catch(err =>{
    res.render('addstrategicdirection',{error_msg:'Error while finding strategic direction with id try again',allplans:existingplans,sdir:sdir,sgoal:sgoal,sgoalid:currentdirection.sgoalid});
   })
  }
});
router.post('/addplandetailactivity', ensureAuthenticated, async function(req, res) {
  const{mactivityid} =req.body;
  const curactivity = await db.MajorActivity.findOne({where:{mactivityid:mactivityid}});
  const mact = await db.MajorActivity.findAll({where:{sdirid:curactivity.sdirid}});
  const existingplans = await db.Plan.findAll({})
  if(mactivityid ==="0"){
    res.render('addmajoractivity',{error_msg:'Please select major activity first',allplans:existingplans,mact:mact,sdir:sdir,mactivityid:mactivityid});
  }else{
   db.MajorActivity.findOne({where:{mactivityid:mactivityid}}).then(dact =>{
    if(dact){
     res.render('adddetailactivity',{success_msg:'You can add edit or delete detail activities here',allplans:existingplans,dact:dact,mact:curactivity,mactivityid:mactivityid});
    }else{
      res.render('adddetailactivity',{error_msg:'Cant find  detail activities with this id. please try again',allplans:existingplans,dact:'',mact:curactivity,mactivityid:mactivityid});
    }
   }).catch(err =>{
    res.render('adddetailactivity',{error_msg:'Error while finding  detail activities with id try again',allplans:existingplans,dact:'',mact:curactivity,mactivityid:mactivityid});
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
    res.render('addnewannualplan',{errors,allplans:existingplans});
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
const existingplans = await db.Plan.findAll({});
const sgs = await db.StrategicGoal.findOne({where:{planid:planid}});
if(!sgoalcode || !sgoaldescription || !sgoalduration || !sgoaltitle || !startdate || !enddate || !planid){
  errors.push({mssg:'Please add all required fields'})
}
if(errors.length >0){
  res.render('addstrategicgoal',{errors,sgs:sgs,allplans:existingplans});
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
      res.render('addstrategicgoal',{error_msg:'Please enter new strategic goal code.code already exist.',allplans:existingplans,plan:plan,planid:planid,sgs:sgs});
    }else{
    db.StrategicGoal.create(newstrategicgoal).then(sgs =>{
    if(sgs){
      db.StrategicGoal.findAll({where:{planid:planid}}).then(allsgs =>{
      res.render('addstrategicgoal',{success_msg:'You are successfully create new strategic goal please add all the necessary attributes',allplans:existingplans,planid:planid,plan:plan,sgs:allsgs});
      }).catch(err =>{
      res.render('addstrategicgoal',{error_msg:'Error while finding exsting updated strategic goal .',allplans:existingplans, plan:plan,planid:planid,sgs:sgs});
      })
    }else{
      res.render('addstrategicgoal',{error_msg:'Please enter new plan code. strategic goal code already exist.',allplans:existingplans,plan:plan,planid:planid,sgs:sgs});
    }
    }).catch(err =>{
    res.render('addstrategicgoal',{error_msg:'Error while creating new strategic goal.',allplans:existingplans,plan:plan,planid:planid,sgs:sgs});
    })
    }
  }).catch(err =>{
    res.render('addstrategicgoal',{error_msg:'Error while finding existing strategic goal .',allplans:existingplans,plan:plan,planid:planid,sgs:sgs});
  })

}

});
router.post('/addnewstrategicdirection', ensureAuthenticated, async function(req, res) {
const{sdircode,sdirtitle,sdirdescription,sdirduration,enddate,startdate,sgoalid} =req.body;
let errors =[];
const existingplans = await db.Plan.findAll({});
const sgoal = await db.StrategicGoal.findOne({where:{sgoalid:sgoalid}});
const sdir = await db.StrategicGoal.findAll({where:{sgoalid:sgoalid}});
if(!sdircode || !sdirdescription || !sdirduration || !sdirtitle || !startdate || !enddate || !sgoalid){
errors.push({mssg:'Please add all required fields',allplans:existingplans})
}
if(errors.length >0){
res.render('addstrategicgoal',{errors,sgs:sgs});
}else{

const uuid = uuidv4();
const newstrategicdirection ={
  sdirid:uuid,
  sgoalid:sgoalid,
 
sdircode:sdircode,
sdirdescription:sdirdescription,
sdirduration:sdirduration,
sdirtitle:sdirtitle,
  startdate:new Date(startdate),
  enddate:new Date(enddate),
}
db.StrategicDirection.findOne({where:{sdircode:sdircode}}).then(sd=>{
  if(sd){
    res.render('addstrategicdirection',{error_msg:'Please enter new strategic direction code.code already exist.',allplans:existingplans,sdir:sdir,sgoal:sgoal,sgoalid:sgoalid});
  }else{
  db.StrategicDirection.create(newstrategicdirection).then(sds =>{
  if(sds){
    db.StrategicDirection.findAll({where:{sgoalid:sgoalid}}).then(allsds =>{
    res.render('addstrategicdirection',{success_msg:'You are successfully create new strategic direction please add all the necessary attributes',allplans:existingplans,sdir:allsds,sgoal:sgoal,sgoalid:sgoalid});
    }).catch(err =>{
    res.render('addstrategicdirection',{error_msg:'Error while finding exsting updated strategic direction .' ,allplans:existingplans,sdir:sdir,sgoal:sgoal,sgoalid:sgoalid});
    })
  }else{
    res.render('addstrategicdirection',{error_msg:'Please enter new plan code. strategic direction code already exist.',allplans:existingplans,sdir:sdir,sgoal:sgoal,sgoalid:sgoalid});
  }
  }).catch(err =>{
  res.render('addstrategicdirection',{error_msg:'Error while creating new strategic direction.',allplans:existingplans,sdir:sdir,sgoal:sgoal,sgoalid:sgoalid});
  })
  }
}).catch(err =>{
  res.render('addstrategicdirection',{error_msg:'Error while finding existing strategic direction .',allplans:existingplans,sdir:sdir,sgoal:sgoal,sgoalid:sgoalid});
})

}

});
router.post('/addnewmajoractivity', ensureAuthenticated, async function(req, res) {
  const{sdirid,mactcode,macttitle,mactdescription,mactduration,enddate,startdate} =req.body;
  let errors =[];
  const existingplans = await db.Plan.findAll({});
  const sdirone = await db.StrategicDirection.findOne({where:{sdirid:sdirid}});
  const mact = await db.MajorActivity.findAll({where:{sdirid:sdirid}});
  if(!sdirid || !mactcode || !mactduration || !macttitle || !startdate || !enddate || !mactdescription){
  errors.push({mssg:'Please add all required fields'})
  }
  if(errors.length >0){
  res.render('addmajoractivity',{errors,sdir:sdirone,mact:mact,allplans:existingplans,});
  }else{
  
  const uuid = uuidv4();
  const newstrategicdirection ={
    mactivityid:uuid,
    sdirid:sdirid,
    mactivitytitle:macttitle,
    mactivitydescription:mactdescription,
    mactivityduration:mactduration,
    mactivitycode: mactcode,
    
    startdate:new Date(startdate),
    enddate:new Date(enddate),
  }
  db.MajorActivity.findOne({where:{mactivitycode:mactcode}}).then(sd=>{
    if(sd){
      res.render('addmajoractivity',{error_msg:'Please enter new major activity.code already exist.',allplans:existingplans,sdir:sdirone,mact:mact,sdirid:sdirid});
    }else{
    db.MajorActivity.create(newstrategicdirection).then(sds =>{
    if(sds){
      db.MajorActivity.findAll({where:{sdirid:sdirid}}).then(allmact =>{
      res.render('addmajoractivity',{success_msg:'You are successfully create new major activity please add all the necessary attributes',allplans:existingplans,sdir:sdirone,mact:allmact,mact,sdirid:sdirid});
      }).catch(err =>{
      res.render('addmajoractivity',{error_msg:'Error while finding exsting updated major activity.' ,allplans:existingplans,sdir:sdirone,mact:mact,sdirid:sdirid});
      })
    }else{
      res.render('addmajoractivity',{error_msg:'Please enter new major activity code. major activity code already exist.',allplans:existingplans,sdir:sdirone,mact:mact,sdirid:sdirid});
    }
    }).catch(err =>{
    res.render('addmajoractivity',{error_msg:'Error while creating new major activity.',allplans:existingplans,sdir:sdirone,mact:mact,sdirid:sdirid});
    })
    }
  }).catch(err =>{
    res.render('addmajoractivity',{error_msg:'Error while finding existing major activity.',allplans:existingplans,sdir:sdirone,mact:mact,sdirid:sdirid});
  })
  
  }
  
  });
  router.post('/addnewdetailactivity', ensureAuthenticated, async function(req, res) {
    const{mactivityid,dactcode,dacttitle,dactdescription,dactduration,enddate,startdate} =req.body;
    let errors =[];
    const existingplans = await db.Plan.findAll({});
    const mactone = await db.MajorActivity.findOne({where:{mactivityid:mactivityid}});
    const dact = await db.DetailActivity.findAll({where:{mactivityid:mactivityid}});
    if(!mactivityid || !dactcode || !dactduration || !dactdescription || !startdate || !enddate || !dacttitle){
    errors.push({mssg:'Please add all required fields'})
    }
    if(errors.length >0){
    res.render('adddetailactivity',{errors,dact:dact,mact:mactone,allplans:existingplans,mactivityid:mactivityid});
    }else{
    
    const uuid = uuidv4();
    const newdetailactivity ={
      dactivityid:uuid,
      
      mactivityid:mactivityid,
      dactivitytitle:dacttitle,
      dactivitydescription:dactdescription,
      dactivityduration:dactduration,
      dactivitycode: dactcode,
      
      startdate:new Date(startdate),
      enddate:new Date(enddate),
    }
    db.DetailActivity.findOne({where:{dactivitycode:dactcode}}).then(sd=>{
      if(sd){
        res.render('adddetailactivity',{error_msg:'Please enter new detail activity.code already exist.',dact:dact,mact:mactone,allplans:existingplans,mactivityid:mactivityid});
      }else{
      db.DetailActivity.create(newdetailactivity).then(dacts =>{
      if(dacts){
        db.DetailActivity.findAll({where:{mactivityid:mactivityid}}).then(alldact =>{
        res.render('adddetailactivity',{success_msg:'You are successfully create new detail activity please add all the necessary attributes',dact:alldact,mact:mactone,allplans:existingplans,mactivityid:mactivityid});
        }).catch(err =>{
        res.render('adddetailactivity',{error_msg:'Error while finding exsting updated detail activity.' ,dact:dact,mact:mactone,allplans:existingplans,mactivityid:mactivityid});
        })
      }else{
        res.render('adddetailactivity',{error_msg:'Please enter new detail activity code. detail activity code already exist.',dact:dact,mact:mactone,allplans:existingplans,mactivityid:mactivityid});
      }
      }).catch(err =>{
      res.render('adddetailactivity',{error_msg:'Error while creating new detail activity.',dact:dact,mact:mactone,allplans:existingplans,mactivityid:mactivityid});
      })
      }
    }).catch(err =>{
      res.render('adddetailactivity',{error_msg:'Error while finding existing detail activity.',dact:dact,mact:mactone,allplans:existingplans,mactivityid:mactivityid});
    })
    
    }
    
    });
module.exports = router;