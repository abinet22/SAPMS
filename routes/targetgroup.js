const express = require('express');
const router = express.Router();

const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const passport = require('passport');
const db = require("../models");
const bcrypt = require('bcryptjs');
const path = require("path");
const Op = db.Sequelize.Op;
const { v4: uuidv4 } = require('uuid');
router.get('/', forwardAuthenticated, async (req, res) =>{
  res.render('login');
 });
 router.get('/dashboard', ensureAuthenticated, async function(req, res) {
  const existingplans = await db.Plan.findAll({});
  const plan = await db.Plan.findAll({});
  const plancurrent = await db.Plan.findAll({where:{iscurrent:'Yes'}});
const goal = await db.StrategicGoal.findAll({});
const sdir = await db.StrategicDirection.findAll({});
const mact = await db.MajorActivity.findAll({});
const dact = await db.DetailActivity.findAll({});
  if(req.user.user_roll==="Admin"){
    res.render('dashboard',{user:req.user,allplans:existingplans,plan:plan,sdir:sdir,mact:mact,goal:goal,dact:dact});
  
  }else {
    res.render('dashboardtarget',{user:req.user,allplans:existingplans,plan:plancurrent,sdir:sdir,mact:mact,goal:goal,dact:dact});
  
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
  const targetgrouplist = await db.TargetGroup.findAll();
 res.render('createtargetgroup',{targetgrouplist:targetgrouplist,allplans:existingplans,sgoal:detailview});
  });
router.post('/addnewtargetgroup', ensureAuthenticated, async function(req, res) {
  const {targetgroupname,grouptype,username,userroll,password,retypepassword} =req.body;
const existingplans = await db.Plan.findAll({});
const detailview = await db.StrategicGoal.findAll({});
const newtargetgroup ={
 targetgid:uuidv4(),
 targetgroupname:targetgroupname,
  grouptype:grouptype,
  username:username,password:password
  ,retypepassword:retypepassword,user_roll:userroll,is_active:'Yes'
}
const targetgrouplist = await db.TargetGroup.findAll();
let errors=[];
if(!targetgroupname ||!grouptype || grouptype ==="0" || username==="0" ||!username ||!userroll ||!password ||!retypepassword){
  res.render('createtargetgroup',{targetgrouplist:targetgrouplist,allplans:existingplans,sgoal:detailview,error_msg:'Please ensert all reqiured fields'});
  
}

if(password != retypepassword){

  res.render('createtargetgroup',{targetgrouplist:targetgrouplist,allplans:existingplans,sgoal:detailview,error_msg:'Password and retype password must be the same'});

}else{
  db.TargetGroup.findOne({where:{targetgroupname:targetgroupname,user_roll:userroll}}).then(tg =>{
    if(tg){
      res.render('createtargetgroup',{targetgrouplist:targetgrouplist,allplans:existingplans,sgoal:detailview,error_msg:'Target group already created'});
  
    }else{
      bcrypt.hash(password, 10, (err, hash) => {
        newtargetgroup.password = hash;


        db.TargetGroup.create(newtargetgroup)
            .then(data => {
              db.TargetGroup.findAll().then(newtarg=>{
                res.render('createtargetgroup',{targetgrouplist:newtarg,allplans:existingplans,sgoal:detailview,success_msg:'New target group created successfully'});
            
               }).catch(err =>{
                res.render('createtargetgroup',{targetgrouplist:targetgrouplist,allplans:existingplans,sgoal:detailview,error_msg:'New target group created successfully'});
            
               })
            }).catch(err => {
              res.render('createtargetgroup',{targetgrouplist:targetgrouplist,allplans:existingplans,sgoal:detailview,error_msg:'New target group created successfully'});
  
            }) // end of then catch for create method
        }); //

    }
  }).catch(err =>{
    res.render('createtargetgroup',{targetgrouplist:targetgrouplist,allplans:existingplans,sgoal:detailview,error_msg:'Cant create now try later'});
  })
  
}

});
router.post('/selectplantoviewdetail', ensureAuthenticated, async function(req, res) {
const{planid,configcat} =req.body;
const existingplans = await db.Plan.findAll({});
const plan = await db.Plan.findOne({where:{planid:planid}});
const goal = await db.StrategicGoal.findOne({where:{planid:planid}});
const sdir = await db.StrategicDirection.findOne({where:{sgoalid:goal.sgoalid}});
const mact = await db.MajorActivity.findOne({where:{sdirid:sdir.sdirid}});
const dact = await db.DetailActivity.findAll({where:{mactivityid:mact.mactivityid}});
const [majorkpi  ,majorkpimeta] =  await db.sequelize.query(`
select * from majoractivitykpis inner join detailactivities on majoractivitykpis.dactivityid = detailactivities.dactivityid ;
`)
const [detailkpi,detailkpimeta] =  await db.sequelize.query(
"select * from detailactivitykpis inner join targetgroups on dacttgroup = targetgid where detailactivitykpis.dacttgroup ='"+req.user.targetgid +"'"
)
console.log(detailkpi)
var detailview; 
 if(configcat ==="DP"){
  const goal = await db.StrategicGoal.findAll({});
const sdir = await db.StrategicDirection.findAll({});
const mact = await db.MajorActivity.findAll({});
const dact = await db.DetailActivity.findAll({});
 
  res.render('seefullplandetailtarget',{detailkpi:detailkpi,majorkpi:majorkpi,allplans:existingplans,plan:plan,goal:goal,sdir:sdir,mact:mact,dact:dact});
 }else if(configcat ==="MyActivities"){
    const goal = await db.StrategicGoal.findAll({});
    const sdir = await db.StrategicDirection.findAll({});
    const mact = await db.MajorActivity.findAll({});
    const dact = await db.DetailActivity.findAll({});
    res.render('TGMyActivities',{detailkpi:detailkpi,majorkpi:majorkpi,allplans:existingplans,plan:plan,goal:goal,sdir:sdir,mact:mact,dact:dact});
 
 }
 else if(configcat ==="SDMyactivites"){
  const [detailkpi,detailkpimeta] =  await db.sequelize.query(
    "select * from detailactivitykpis inner join targetgroups on dacttgroup = targetgid "+
    " inner join detailactivities on detailactivities.dactivityid = detailactivitykpis.dactivityid "+
    " inner join majoractivities on detailactivities.mactivityid = majoractivities.mactivityid "+
    " where detailactivitykpis.dacttgroup ='"+req.user.targetgid +"'"
    )
  res.render('SmallMyActivities',{detailkpi:detailkpi,majorkpi:majorkpi,allplans:existingplans,plan:plan,goal:goal,sdir:sdir,mact:mact,dact:dact});

}else if(configcat ==="PR"){
  const [detailkpi,detailkpimeta] =  await db.sequelize.query(
    "select * from detailactivitykpis inner join targetgroups on dacttgroup = targetgid "+
    " inner join detailactivities on detailactivities.dactivityid = detailactivitykpis.dactivityid "+
    " inner join majoractivities on detailactivities.mactivityid = majoractivities.mactivityid "+
    " where detailactivitykpis.dacttgroup ='"+req.user.targetgid +"' and detailactivitykpis.isfinalsent ='No'"
    );
    const [progress,progressmetta] =   await db.sequelize.query(
      "select * from progressreports where dacttgroupid ='"+req.user.targetgid +"'  "
      );
  res.render('ProgressReport',{progress:progress,detailkpi:detailkpi,majorkpi:majorkpi,allplans:existingplans,plan:plan,goal:goal,sdir:sdir,mact:mact,dact:dact});

}else if(configcat ==="FR"){
  const [detailkpi,detailkpimeta] =  await db.sequelize.query(
    "select * from detailactivitykpis inner join targetgroups on dacttgroup = targetgid "+
    " inner join detailactivities on detailactivities.dactivityid = detailactivitykpis.dactivityid "+
    " inner join majoractivities on detailactivities.mactivityid = majoractivities.mactivityid "+
    " where detailactivitykpis.dacttgroup ='"+req.user.targetgid +"' and detailactivitykpis.isfinalsent ='Yes'"
    )
  res.render('FinalReport',{detailkpi:detailkpi,majorkpi:majorkpi,allplans:existingplans,plan:plan,goal:goal,sdir:sdir,mact:mact,dact:dact});

}

});
router.post('/showdetailprogressreport',ensureAuthenticated,async function(req,res){
  const{dactivityid,dacttindicator,planid} =req.body;
  const existingplans = await db.Plan.findAll({});
  const plan = await db.Plan.findOne({where:{planid:planid}});
  const plancurrent = await db.Plan.findAll({where:{iscurrent:'Yes'}});
const goal = await db.StrategicGoal.findAll({});
const sdir = await db.StrategicDirection.findAll({});
const mact = await db.MajorActivity.findAll({});
const dact = await db.DetailActivity.findOne({where:{dactivityid:dactivityid}});
  console.log(dact);
  const [progress,progressmetta] =   await db.sequelize.query(
    "select * from progressreports where dacttgroupid ='"+req.user.targetgid +"' and dactivityid ='"+dactivityid+"' and dacttindicator='"+dacttindicator+"' "
    );
res.render('showdetailprogressreport',{progress:progress,user:req.user,allplans:existingplans,plan:plan,sdir:sdir,mact:mact,goal:goal,dact:dact})

})
router.post('/showdetailfinalreport',ensureAuthenticated,async function(req,res){
  const{dactivityid,dacttindicator,planid} =req.body;
  const existingplans = await db.Plan.findAll({});
  const plan = await db.Plan.findOne({where:{planid:planid}});
  const plancurrent = await db.Plan.findAll({where:{iscurrent:'Yes'}});
const goal = await db.StrategicGoal.findAll({where:{planid:plan.planid}});
const sdir = await db.StrategicDirection.findAll({});
const [planinfo,planinfometa] =   await db.sequelize.query(
  "select * from plans inner join strategicgoals on strategicgoals.planid =plans.planid "+
  " inner join strategicdirections  on strategicgoals.sgoalid = strategicdirections.sgoalid "+
  " inner join majoractivities on majoractivities.sdirid = strategicdirections.sdirid "+
  " inner join detailactivities on detailactivities.mactivityid = majoractivities.mactivityid "+
  " where detailactivities.dactivityid = '"+ dactivityid+"'"
  );
const dact = await db.DetailActivity.findOne({where:{dactivityid:dactivityid}});
const mact = await db.MajorActivity.findOne({where:{mactivityid:dact.mactivityid}});
  const [progress,progressmetta] =   await db.sequelize.query(
    "select * from finalreports where dacttgroupid ='"+req.user.targetgid +"' and dactivityid ='"+dactivityid+"' and dacttindicator='"+dacttindicator+"' "
    );
res.render('showdetailfinalreport',{planinfo:planinfo,progress:progress,user:req.user,allplans:existingplans,plan:plan,sdir:sdir,mact:mact,goal:goal,dact:dact})
})
router.post('/updateactivitystatusseen',ensureAuthenticated,async function(req,res){
    const{planid,dactivityid,indicator} =req.body;
    const existingplans = await db.Plan.findAll({});
const plan = await db.Plan.findOne({where:{planid:planid}});
const goal = await db.StrategicGoal.findAll({});
const sdir = await db.StrategicDirection.findAll({});
const mact = await db.MajorActivity.findAll({});
const dact = await db.DetailActivity.findAll({});
const [majorkpi  ,majorkpimeta] =  await db.sequelize.query(`
select * from majoractivitykpis inner join detailactivities on majoractivitykpis.dactivityid = detailactivities.dactivityid ;
`);
const [detailkpi,detailkpimeta] =  await db.sequelize.query(
"select * from detailactivitykpis inner join targetgroups on dacttgroup = targetgid where detailactivitykpis.dacttgroup ='"+req.user.targetgid +"'"
);

db.DetailActivityKPI.findOne({where:{dactivityid:dactivityid,dacttgroup:req.user.targetgid}}).then(dacti =>{
    if(dacti){
        db.DetailActivityKPI.update({seen:'Yes',seendate:new Date()},{where:{dactivityid:dactivityid,dacttgroup:req.user.targetgid,dacttindicator:indicator}}).then(udact =>{
            res.render('TGMyActivities',{success_msg:'Activity status updated',detailkpi:detailkpi,majorkpi:majorkpi,allplans:existingplans,plan:plan,goal:goal,sdir:sdir,mact:mact,dact:dact});
  
        }).catch(err =>{
            res.render('TGMyActivities',{error_msg:'Error while updating try again',detailkpi:detailkpi,majorkpi:majorkpi,allplans:existingplans,plan:plan,goal:goal,sdir:sdir,mact:mact,dact:dact});
  
        })
      
    }else{
        res.render('TGMyActivities',{error_msg:'Cant find activity with this id',detailkpi:detailkpi,majorkpi:majorkpi,allplans:existingplans,plan:plan,goal:goal,sdir:sdir,mact:mact,dact:dact});
  
    }
}).catch(err =>{
    res.render('TGMyActivities',{error_msg:'Error while finding detail activity',detailkpi:detailkpi,majorkpi:majorkpi,allplans:existingplans,plan:plan,goal:goal,sdir:sdir,mact:mact,dact:dact});
  
})
  
   
})
router.post('/updateactivitystatusstarted',ensureAuthenticated,async function(req,res){
        const{planid,dactivityid,indicator} =req.body;
        const existingplans = await db.Plan.findAll({});
    const plan = await db.Plan.findOne({where:{planid:planid}});
    const goal = await db.StrategicGoal.findAll({});
    const sdir = await db.StrategicDirection.findAll({});
    const mact = await db.MajorActivity.findAll({});
    const dact = await db.DetailActivity.findAll({});
    const [majorkpi  ,majorkpimeta] =  await db.sequelize.query(`
    select * from majoractivitykpis inner join detailactivities on majoractivitykpis.dactivityid = detailactivities.dactivityid ;
    `);
    const [detailkpi,detailkpimeta] =  await db.sequelize.query(
    "select * from detailactivitykpis inner join targetgroups on dacttgroup = targetgid where detailactivitykpis.dacttgroup ='"+req.user.targetgid +"'"
    );
    
    db.DetailActivityKPI.findOne({where:{dactivityid:dactivityid,dacttgroup:req.user.targetgid}}).then(dacti =>{
        if(dacti){
            db.DetailActivityKPI.update({start:'Yes',startdate:new Date()},{where:{dactivityid:dactivityid,dacttgroup:req.user.targetgid,dacttindicator:indicator}}).then(udact =>{
                res.render('TGMyActivities',{success_msg:'Activity status updated',detailkpi:detailkpi,majorkpi:majorkpi,allplans:existingplans,plan:plan,goal:goal,sdir:sdir,mact:mact,dact:dact});
      
            }).catch(err =>{
                res.render('TGMyActivities',{error_msg:'Error while updating try again',detailkpi:detailkpi,majorkpi:majorkpi,allplans:existingplans,plan:plan,goal:goal,sdir:sdir,mact:mact,dact:dact});
      
            })
          
        }else{
            res.render('TGMyActivities',{error_msg:'Cant find activity with this id',detailkpi:detailkpi,majorkpi:majorkpi,allplans:existingplans,plan:plan,goal:goal,sdir:sdir,mact:mact,dact:dact});
      
        }
    }).catch(err =>{
        res.render('TGMyActivities',{error_msg:'Error while finding detail activity',detailkpi:detailkpi,majorkpi:majorkpi,allplans:existingplans,plan:plan,goal:goal,sdir:sdir,mact:mact,dact:dact});
      
    })
      
       
    })
router.post('/sendprogressreport',ensureAuthenticated,async function(req,res){
        const{planid,dactivityid,indicatorv,indicatorinputv,kpiinputv,reporttype,responseninput,
            progressreport,remark} =req.body;
        const existingplans = await db.Plan.findAll({});
    const plan = await db.Plan.findOne({where:{planid:planid}});
    const goal = await db.StrategicGoal.findAll({});
    const sdir = await db.StrategicDirection.findAll({});
    const mact = await db.MajorActivity.findAll({});
    const dact = await db.DetailActivity.findAll({});
    const [majorkpi  ,majorkpimeta] =  await db.sequelize.query(`
    select * from majoractivitykpis inner join detailactivities on majoractivitykpis.dactivityid = detailactivities.dactivityid ;
    `);
    const [detailkpi,detailkpimeta] =  await db.sequelize.query(
    "select * from detailactivitykpis inner join targetgroups on dacttgroup = targetgid where detailactivitykpis.dacttgroup ='"+req.user.targetgid +"'"
    );
    const progressreportdata ={
        dactivityid:dactivityid,
          dacttgroupid: req.user.targetgid,
          dacttindicator:  indicatorv,
          dacttinputtype: indicatorinputv,
          dactkpi:kpiinputv,
          progressreport: progressreport,
          remark: remark,
          reportdate: new Date(),
          reporttype:reporttype
     
    }
    if (indicatorinputv === 'Number') {
        progressreportdata.number = responseninput;
    } else if (indicatorinputv === 'Ratio') {
        progressreportdata.ratio = responseninput;
    } else if (indicatorinputv === 'Percent') {
        progressreportdata.percent = responseninput;
    }
    
    db.ProgressReport.create(progressreportdata).then(npr =>{
        res.render('TGMyActivities',{success_msg:'Progress report created and sent',detailkpi:detailkpi,majorkpi:majorkpi,allplans:existingplans,plan:plan,goal:goal,sdir:sdir,mact:mact,dact:dact});

    }).catch(err =>{
        res.render('TGMyActivities',{error_msg:'Error while updating try again',detailkpi:detailkpi,majorkpi:majorkpi,allplans:existingplans,plan:plan,goal:goal,sdir:sdir,mact:mact,dact:dact});
   
    })
  
      
       
    })
router.post('/sendfinalreport',ensureAuthenticated,async function(req,res){
      const{planid,dactivityid,indicatorv,indicatorinputv,kpiinputv,risksmitigated,responseninput,
          finalreport,remark} =req.body;
      const existingplans = await db.Plan.findAll({});
  const plan = await db.Plan.findOne({where:{planid:planid}});
  const goal = await db.StrategicGoal.findAll({});
  const sdir = await db.StrategicDirection.findAll({});
  const mact = await db.MajorActivity.findAll({});
  const dact = await db.DetailActivity.findAll({});
  const [majorkpi  ,majorkpimeta] =  await db.sequelize.query(`
  select * from majoractivitykpis inner join detailactivities on majoractivitykpis.dactivityid = detailactivities.dactivityid ;
  `);
  const [detailkpi,detailkpimeta] =  await db.sequelize.query(
  "select * from detailactivitykpis inner join targetgroups on dacttgroup = targetgid where detailactivitykpis.dacttgroup ='"+req.user.targetgid +"'"
  );
  const finalreportdata ={
      dactivityid:dactivityid,
        dacttgroupid: req.user.targetgid,
        dacttindicator:  indicatorv,
        dacttinputtype: indicatorinputv,
        dactkpi:kpiinputv,
        finalreport: finalreport,
        remark: remark,
        reportdate: new Date(),
        risksmitigated:risksmitigated
   
  }
  if (indicatorinputv === 'Number') {
    finalreportdata.number = responseninput;
  } else if (indicatorinputv === 'Ratio') {
    finalreportdata.ratio = responseninput;
  } else if (indicatorinputv === 'Percent') {
    finalreportdata.percent = responseninput;
  }
  
  db.FinalReport.create(finalreportdata).then(npr =>{
    db.DetailActivityKPI.findOne({where:{dactivityid:dactivityid,dacttindicator:indicatorv}}).then(olddkpi =>{
      if(olddkpi){
        db.DetailActivityKPI.update({isfinalsent:'Yes'},{where:{dactivityid:dactivityid,dacttindicator:indicatorv}}).then(udtkpi =>{
          res.render('TGMyActivities',{success_msg:'Final report created and sent',detailkpi:detailkpi,majorkpi:majorkpi,allplans:existingplans,plan:plan,goal:goal,sdir:sdir,mact:mact,dact:dact});
    
         }).catch(err =>{
          console.log(err)
          res.render('TGMyActivities',{error_msg:'Error while updating activity status ',detailkpi:detailkpi,majorkpi:majorkpi,allplans:existingplans,plan:plan,goal:goal,sdir:sdir,mact:mact,dact:dact});
    
        })
      }
      else{
     
        res.render('TGMyActivities',{error_msg:'Cant find activity  ',detailkpi:detailkpi,majorkpi:majorkpi,allplans:existingplans,plan:plan,goal:goal,sdir:sdir,mact:mact,dact:dact});
    
      }
    }).catch(err =>{
      console.log(err)
      res.render('TGMyActivities',{error_msg:'Error while finding activity  ',detailkpi:detailkpi,majorkpi:majorkpi,allplans:existingplans,plan:plan,goal:goal,sdir:sdir,mact:mact,dact:dact});

    })
     
  }).catch(err =>{
    console.log(err)
      res.render('TGMyActivities',{error_msg:'Error while creating try again',detailkpi:detailkpi,majorkpi:majorkpi,allplans:existingplans,plan:plan,goal:goal,sdir:sdir,mact:mact,dact:dact});
 
  })

    
     
  })
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
router.get('/adddkpiformactivity',ensureAuthenticated,async function(req,res){
  const currentdirection = await db.StrategicDirection.findOne({where:{sdirid:sdirid}});
  const sgoal = await db.StrategicGoal.findAll({where:{sgoalid:currentdirection.sgoalid}});
  const existingplans = await db.Plan.findAll({})
  const mact = await db.MajorActivity.findAll({where:{sdirid:sdirid}});
  const targetgrouplist = await db.TargetGroup.findAll();
  res.render('addkpiformactivity',{success_msg:'You can add edit or delete major activities KPI here',targetgrouplist:targetgrouplist,allplans:existingplans,mact:mact});
   
})
router.post('/addplanmajoractivity', ensureAuthenticated, async function(req, res) {
  const{sdirid} =req.body;
  const currentdirection = await db.StrategicDirection.findOne({where:{sdirid:sdirid}});
  const sgoal = await db.StrategicGoal.findAll({where:{sgoalid:currentdirection.sgoalid}});
  const existingplans = await db.Plan.findAll({})
  const mact = await db.MajorActivity.findAll({where:{sdirid:sdirid}});
  const targetgrouplist = await db.TargetGroup.findAll();
  if(sdirid ==="0"){
    res.render('addstrategicdirection',{error_msg:'Please select strategic direction first',allplans:existingplans,sdir:sdir,sgoal:sgoal,sgoalid:currentdirection.sgoalid});
  }else{
   db.StrategicDirection.findOne({where:{sdirid:sdirid}}).then(sdir =>{
    if(sgoal){
     res.render('addmajoractivity',{success_msg:'You can add edit or delete major activities here',targetgrouplist:targetgrouplist,allplans:existingplans,mact:mact,sdir:sdir,sdirid:sdirid});
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
  const dact = await db.DetailActivity.findAll({where:{mactivityid:mactivityid}});
  const existingplans = await db.Plan.findAll({})
  const targetgrouplist  = await db.TargetGroup.findAll()
  if(mactivityid ==="0"){
    res.render('addmajoractivity',{targetgrouplist:targetgrouplist,error_msg:'Please select major activity first',allplans:existingplans,mact:mact,sdir:sdir,mactivityid:mactivityid});
  }else{
   db.MajorActivity.findOne({where:{mactivityid:mactivityid}}).then(mact2 =>{
    if(mact2){
     res.render('adddetailactivity',{targetgrouplist:targetgrouplist,success_msg:'You can add edit or delete detail activities here',allplans:existingplans,dact:dact,mact:curactivity,mactivityid:mactivityid});
    }else{
      res.render('adddetailactivity',{targetgrouplist:targetgrouplist,error_msg:'Cant find  detail activities with this id. please try again',allplans:existingplans,dact:'',mact:curactivity,mactivityid:mactivityid});
    }
   }).catch(err =>{
    res.render('adddetailactivity',{targetgrouplist:targetgrouplist,error_msg:'Error while finding  detail activities with id try again',allplans:existingplans,dact:'',mact:curactivity,mactivityid:mactivityid});
   })
  }
});

router.post('/addkpifordetailactivity', ensureAuthenticated, async function(req, res) {
  const{mactivityid,criteria,dactivityid} =req.body;
  const curactivity = await db.MajorActivity.findOne({where:{mactivityid:mactivityid}});
  const mact = await db.MajorActivity.findAll({where:{sdirid:curactivity.sdirid}});
  const dact = await db.DetailActivity.findAll({where:{mactivityid:mactivityid}});
  const existingplans = await db.Plan.findAll({})
  const targetgrouplist  = await db.TargetGroup.findAll()
  if(!mactivityid || !criteria || !dactivityid){
    res.render('addmajoractivity',{targetgrouplist:targetgrouplist,error_msg:'Please add all required fields',allplans:existingplans,mact:mact,sdir:sdir,mactivityid:mactivityid});
  }else{
    try {
      // Parse the JSON string into an array of objects
      const criteriaData = JSON.parse(criteria);
  
      // Loop through each object in the criteriaData array
      for (const item of criteriaData) {
        // Create a new record in the DetailActivityKPI table for each object
        await db.DetailActivityKPI.create({
          mactivityid: mactivityid,
          dactivityid:dactivityid,
          dacttgroup: item.dacttgroup,
          dacttindicator: item.dacttindicator,
          dacttinputtype: item.dacttinputtype,
          dactkpi: item.dactkpi,
          dactregisteredrisk: item.dactregisteredrisk,
         
          // Add other fields as needed based on your model definition
        });
      }
  
      // Respond with a success message or any other appropriate response.
     // res.status(200).json({ message: 'Criteria added successfully!' });
      res.render('adddetailactivity',{targetgrouplist:targetgrouplist, success_msg: 'KPIs added successfully!',allplans:existingplans,dact:dact,mact:curactivity,mactivityid:mactivityid});

    } catch (err) {
      console.error('Error inserting criteria data:', err);
      res.status(500).json({ error: 'An error occurred while adding criteria.' });
    }
  //  db.MajorActivity.findOne({where:{mactivityid:mactivityid}}).then(mact2 =>{
  //   if(mact2){
  //     console.log(criteria)
  //    res.render('adddetailactivity',{targetgrouplist:targetgrouplist,success_msg:'You can add edit or delete detail activities here',allplans:existingplans,dact:dact,mact:curactivity,mactivityid:mactivityid});
  //   }else{
  //     res.render('adddetailactivity',{targetgrouplist:targetgrouplist,error_msg:'Cant find  detail activities with this id. please try again',allplans:existingplans,dact:'',mact:curactivity,mactivityid:mactivityid});
  //   }
  //  }).catch(err =>{
  //   res.render('adddetailactivity',{targetgrouplist:targetgrouplist,error_msg:'Error while finding  detail activities with id try again',allplans:existingplans,dact:'',mact:curactivity,mactivityid:mactivityid});
  //  })
  }
});
router.post('/addkpiformajoractivity', ensureAuthenticated, async function(req, res) {
  const{mactivityid,mcriteria,dactivityid} =req.body;
  const curactivity = await db.MajorActivity.findOne({where:{mactivityid:mactivityid}});
  const mact = await db.MajorActivity.findAll({where:{sdirid:curactivity.sdirid}});
  const dact = await db.DetailActivity.findAll({where:{mactivityid:mactivityid}});
  const existingplans = await db.Plan.findAll({})
  const targetgrouplist  = await db.TargetGroup.findAll()
  if(!mactivityid || !mcriteria || !dactivityid){
    res.render('addmajoractivity',{targetgrouplist:targetgrouplist,error_msg:'Please add all required fields',allplans:existingplans,mact:mact,sdir:sdir,mactivityid:mactivityid});
  }else{
    try {
      // Parse the JSON string into an array of objects
      const criteriaData = JSON.parse(mcriteria);
  
      // Loop through each object in the criteriaData array
      for (const item of criteriaData) {
        // Create a new record in the DetailActivityKPI table for each object
        await db.MajorActivityKPI.create({
          mactivityid: mactivityid,
          dactivityid:item.dactid,
          
          macttindicator: item.macttindicator,
          macttinputtype: item.macttinputtype,
          mactkpi: item.mactkpi,
          mactregisteredrisk: item.mactregisteredrisk,
         
          // Add other fields as needed based on your model definition
        });
      }
  
      // Respond with a success message or any other appropriate response.
     // res.status(200).json({ message: 'Criteria added successfully!' });
      res.render('adddetailactivity',{targetgrouplist:targetgrouplist, success_msg: 'KPIs added successfully!',allplans:existingplans,dact:dact,mact:curactivity,mactivityid:mactivityid});

    } catch (err) {
      console.error('Error inserting criteria data:', err);
      res.status(500).json({ error: 'An error occurred while adding criteria.' });
    }
  //  db.MajorActivity.findOne({where:{mactivityid:mactivityid}}).then(mact2 =>{
  //   if(mact2){
  //     console.log(criteria)
  //    res.render('adddetailactivity',{targetgrouplist:targetgrouplist,success_msg:'You can add edit or delete detail activities here',allplans:existingplans,dact:dact,mact:curactivity,mactivityid:mactivityid});
  //   }else{
  //     res.render('adddetailactivity',{targetgrouplist:targetgrouplist,error_msg:'Cant find  detail activities with this id. please try again',allplans:existingplans,dact:'',mact:curactivity,mactivityid:mactivityid});
  //   }
  //  }).catch(err =>{
  //   res.render('adddetailactivity',{targetgrouplist:targetgrouplist,error_msg:'Error while finding  detail activities with id try again',allplans:existingplans,dact:'',mact:curactivity,mactivityid:mactivityid});
  //  })
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
  const targetgrouplist  = await db.TargetGroup.findAll()
  if(!sdirid || !mactcode || !mactduration || !macttitle || !startdate || !enddate || !mactdescription){
  errors.push({mssg:'Please add all required fields'})
  }
  if(errors.length >0){
  res.render('addmajoractivity',{targetgrouplist:targetgrouplist,errors,sdir:sdirone,mact:mact,allplans:existingplans,});
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
      res.render('addmajoractivity',{targetgrouplist:targetgrouplist,error_msg:'Please enter new major activity.code already exist.',allplans:existingplans,sdir:sdirone,mact:mact,sdirid:sdirid});
    }else{
    db.MajorActivity.create(newstrategicdirection).then(sds =>{
    if(sds){
      db.MajorActivity.findAll({where:{sdirid:sdirid}}).then(allmact =>{
      res.render('addmajoractivity',{targetgrouplist:targetgrouplist,success_msg:'You are successfully create new major activity please add all the necessary attributes',allplans:existingplans,sdir:sdirone,mact:allmact,mact,sdirid:sdirid});
      }).catch(err =>{
      res.render('addmajoractivity',{targetgrouplist:targetgrouplist,error_msg:'Error while finding exsting updated major activity.' ,allplans:existingplans,sdir:sdirone,mact:mact,sdirid:sdirid});
      })
    }else{
      res.render('addmajoractivity',{targetgrouplist:targetgrouplist,error_msg:'Please enter new major activity code. major activity code already exist.',allplans:existingplans,sdir:sdirone,mact:mact,sdirid:sdirid});
    }
    }).catch(err =>{
    res.render('addmajoractivity',{targetgrouplist:targetgrouplist,error_msg:'Error while creating new major activity.',allplans:existingplans,sdir:sdirone,mact:mact,sdirid:sdirid});
    })
    }
  }).catch(err =>{
    res.render('addmajoractivity',{targetgrouplist:targetgrouplist,error_msg:'Error while finding existing major activity.',allplans:existingplans,sdir:sdirone,mact:mact,sdirid:sdirid});
  })
  
  }
  
  });
  router.post('/addnewdetailactivity', ensureAuthenticated, async function(req, res) {
    const{mactivityid,dactcode,dacttitle,dactdescription,dactduration,enddate,startdate} =req.body;
    let errors =[];
    const existingplans = await db.Plan.findAll({});
    const mactone = await db.MajorActivity.findOne({where:{mactivityid:mactivityid}});
    const dact = await db.DetailActivity.findAll({where:{mactivityid:mactivityid}});
    const targetgrouplist = await db.TargetGroup.findAll();
    if(!mactivityid || !dactcode || !dactduration || !dactdescription || !startdate || !enddate || !dacttitle){
    errors.push({mssg:'Please add all required fields'})
    }
    if(errors.length >0){
    res.render('adddetailactivity',{targetgrouplist:targetgrouplist,errors,dact:dact,mact:mactone,allplans:existingplans,mactivityid:mactivityid});
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
        res.render('adddetailactivity',{targetgrouplist:targetgrouplist,success_msg:'You are successfully create new detail activity please add all the necessary attributes',dact:alldact,mact:mactone,allplans:existingplans,mactivityid:mactivityid});
        }).catch(err =>{
        res.render('adddetailactivity',{targetgrouplist:targetgrouplist,error_msg:'Error while finding exsting updated detail activity.' ,dact:dact,mact:mactone,allplans:existingplans,mactivityid:mactivityid});
        })
      }else{
        res.render('adddetailactivity',{targetgrouplist:targetgrouplist,error_msg:'Please enter new detail activity code. detail activity code already exist.',dact:dact,mact:mactone,allplans:existingplans,mactivityid:mactivityid});
      }
      }).catch(err =>{
      res.render('adddetailactivity',{targetgrouplist:targetgrouplist,error_msg:'Error while creating new detail activity.',dact:dact,mact:mactone,allplans:existingplans,mactivityid:mactivityid});
      })
      }
    }).catch(err =>{
      res.render('adddetailactivity',{targetgrouplist:targetgrouplist,error_msg:'Error while finding existing detail activity.',dact:dact,mact:mactone,allplans:existingplans,mactivityid:mactivityid});
    })
    
    }
    
    });
module.exports = router;