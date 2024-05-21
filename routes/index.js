const express = require('express');
const router = express.Router();

const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const passport = require('passport');
const db = require("../models");
const bcrypt = require('bcryptjs');
const path = require("path");
const fs = require('fs');
const { promisify } = require('util');
const PizZip = require('pizzip');
const DetailActivityKPI = require('../models'); 
const readFile = promisify(fs.readFile);
const Op = db.Sequelize.Op;
const Docxtemplater = require('docxtemplater');
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

const [totdact2,tdatm2] = await db.sequelize.query(`
select count(DetailActivities.id) as tot,Plans.planid,plantitle,plancode from DetailActivities
inner join MajorActivities on MajorActivities.mactivityid = DetailActivities.mactivityid
inner join StrategicDirections on StrategicDirections.sdirid = MajorActivities.sdirid
inner join StrategicGoals on StrategicDirections.sgoalid = StrategicGoals.sgoalid
inner join Plans on Plans.planid = StrategicGoals.planid

group by plancode,planid,plantitle
`)
const [startdact2,sa2] = await db.sequelize.query(`
select count(DetailActivityKPIs.id) as tot,Plans.planid,plantitle,plancode from DetailActivityKPIs
inner join MajorActivities on MajorActivities.mactivityid = DetailActivityKPIs.mactivityid
inner join StrategicDirections on StrategicDirections.sdirid = MajorActivities.sdirid
inner join StrategicGoals on StrategicDirections.sgoalid = StrategicGoals.sgoalid
inner join Plans on Plans.planid = StrategicGoals.planid
where  start= 'Yes'
group by plancode,planid,plantitle
`)
const [progressdact2,prs2] = await db.sequelize.query(`
select count(DetailActivityKPIs.id) as tot,Plans.planid,plantitle,plancode from DetailActivityKPIs
inner join ProgressReports on ProgressReports.dactivityid = DetailActivityKPIs.dactivityid
inner join MajorActivities on MajorActivities.mactivityid = DetailActivityKPIs.mactivityid
inner join StrategicDirections on StrategicDirections.sdirid = MajorActivities.sdirid
inner join StrategicGoals on StrategicDirections.sgoalid = StrategicGoals.sgoalid
inner join Plans on Plans.planid = StrategicGoals.planid

group by plancode,planid,plantitle
`)
const [finisheddact2,fir2] = await db.sequelize.query(`
select count(DetailActivityKPIs.id) as tot,Plans.planid,plantitle,plancode from DetailActivityKPIs
inner join FinalReports on FinalReports.dactivityid = DetailActivityKPIs.dactivityid
inner join MajorActivities on MajorActivities.mactivityid = DetailActivityKPIs.mactivityid
inner join StrategicDirections on StrategicDirections.sdirid = MajorActivities.sdirid
inner join StrategicGoals on StrategicDirections.sgoalid = StrategicGoals.sgoalid
inner join Plans on Plans.planid = StrategicGoals.planid

group by plancode,planid,plantitle
`)
const [totdact,tdatm] = await db.sequelize.query(`
select count(DetailActivities.id) as tot,Plans.planid,plantitle,plancode from DetailActivities
inner join DetailActivityKPIs on DetailActivities.dactivityid = DetailActivityKPIs.dactivityid

inner join MajorActivities on MajorActivities.mactivityid = DetailActivities.mactivityid
inner join StrategicDirections on StrategicDirections.sdirid = MajorActivities.sdirid
inner join StrategicGoals on StrategicDirections.sgoalid = StrategicGoals.sgoalid
inner join Plans on Plans.planid = StrategicGoals.planid
where  dacttgroup ='${req.user.targetgid}'
group by plancode,planid,plantitle
`)
const [startdact,sa] = await db.sequelize.query(`
select count(DetailActivityKPIs.id) as tot,Plans.planid,plantitle,plancode from DetailActivityKPIs
inner join MajorActivities on MajorActivities.mactivityid = DetailActivityKPIs.mactivityid
inner join StrategicDirections on StrategicDirections.sdirid = MajorActivities.sdirid
inner join StrategicGoals on StrategicDirections.sgoalid = StrategicGoals.sgoalid
inner join Plans on Plans.planid = StrategicGoals.planid
where  dacttgroup ='${req.user.targetgid}' and start= 'Yes'
group by plancode,planid,plantitle
`)
const [progressdact,prs] = await db.sequelize.query(`
select count(DetailActivityKPIs.id) as tot,Plans.planid,plantitle,plancode from DetailActivityKPIs
inner join ProgressReports on ProgressReports.dactivityid = DetailActivityKPIs.dactivityid
inner join MajorActivities on MajorActivities.mactivityid = DetailActivityKPIs.mactivityid
inner join StrategicDirections on StrategicDirections.sdirid = MajorActivities.sdirid
inner join StrategicGoals on StrategicDirections.sgoalid = StrategicGoals.sgoalid
inner join Plans on Plans.planid = StrategicGoals.planid
where  dacttgroup ='${req.user.targetgid}'
group by plancode,planid,plantitle
`)
const [finisheddact,fir] = await db.sequelize.query(`
select count(DetailActivityKPIs.id) as tot,Plans.planid,plantitle,plancode from DetailActivityKPIs
inner join FinalReports on FinalReports.dactivityid = DetailActivityKPIs.dactivityid
inner join MajorActivities on MajorActivities.mactivityid = DetailActivityKPIs.mactivityid
inner join StrategicDirections on StrategicDirections.sdirid = MajorActivities.sdirid
inner join StrategicGoals on StrategicDirections.sgoalid = StrategicGoals.sgoalid
inner join Plans on Plans.planid = StrategicGoals.planid
where  dacttgroup ='${req.user.targetgid}'
group by plancode,planid,plantitle
`)

  if(req.user.user_roll==="Admin"){
    res.render('dashboard',{
      totdact:totdact2,
      startdact:startdact2,
      progressdact:progressdact2,
      finisheddact:finisheddact2,
      user:req.user,allplans:existingplans,plan:plan,sdir:sdir,mact:mact,goal:goal,dact:dact});
  
  }else {
    res.render('dashboardtarget',{totdact:totdact,
      startdact:startdact,
      progressdact:progressdact,
      finisheddact:finisheddact,user:req.user,allplans:existingplans,plan:plancurrent,sdir:sdir,mact:mact,goal:goal,dact:dact});
  
  }
   });
 

router.get('/progress', ensureAuthenticated, async (req, res) =>{
res.render('progress');
});
router.get('/addnewannualplan', ensureAuthenticated, async function(req, res) {
const existingplans = await db.Plan.findAll({});
res.render('addnewannualplan',{allplans:existingplans});
});

  router.get('/createactivityindicator', ensureAuthenticated, async function(req, res) {
    const existingplans = await db.Plan.findAll({});
    const detailview = await db.StrategicGoal.findAll({});
    const departmentlist = await db.ActivityIndicator.findAll();
   res.render('createactivityindicator',{departmentlist:departmentlist,allplans:existingplans,sgoal:detailview});
    });
router.get('/createtargetgroup', ensureAuthenticated, async function(req, res) {
  const existingplans = await db.Plan.findAll({});
  const detailview = await db.StrategicGoal.findAll({});
  const targetgrouplist = await db.TargetGroup.findAll();
  const departmentlist = await db.Department.findAll();
  const occupationlist = await db.Occupation.findAll();
 res.render('createtargetgroup',{occupationlist:occupationlist,departmentlist:departmentlist,targetgrouplist:targetgrouplist,allplans:existingplans,sgoal:detailview});
  });
  router.get('/deletetargetgroup/(:targetid)', ensureAuthenticated, async function(req, res) {
    const existingplans = await db.Plan.findAll({});
    const detailview = await db.StrategicGoal.findAll({});
    
    const departmentlist = await db.Department.findAll();
    const occupationlist = await db.Occupation.findAll();
    await db.TargetGroup.update({is_active:'No'},{where:{targetgid:req.params.targetid}});
    const targetgrouplist = await db.TargetGroup.findAll();
   res.render('createtargetgroup',{occupationlist:occupationlist,departmentlist:departmentlist,targetgrouplist:targetgrouplist,allplans:existingplans,sgoal:detailview});
    });
    router.post('/changepasswordtargetgroup/(:targetid)', ensureAuthenticated, async function(req, res) {
      const {newpassword} = req.body;
      const existingplans = await db.Plan.findAll({});
      const detailview = await db.StrategicGoal.findAll({});
      
      const departmentlist = await db.Department.findAll();
      const occupationlist = await db.Occupation.findAll();
      const targetgrouplist = await db.TargetGroup.findAll();
      
     if(newpassword){
      db.TargetGroup.findOne({where:{targetgid:req.params.targetid}}).then(tg =>{
        if(tg){
          bcrypt.hash(newpassword, 10, (err, hash) => {
           
    
           db.TargetGroup.update({password:hash},{where:{targetgid:req.params.targetid}}).then(newtg =>{
            res.render('createtargetgroup',{success_msg:'Successfully update password try again',occupationlist:occupationlist,departmentlist:departmentlist,targetgrouplist:targetgrouplist,allplans:existingplans,sgoal:detailview});
        
           }).catch(err =>{
            res.render('createtargetgroup',{error_msg:'Cant update password',occupationlist:occupationlist,departmentlist:departmentlist,targetgrouplist:targetgrouplist,allplans:existingplans,sgoal:detailview});
        
          })
        })
    
        }else{
          res.render('createtargetgroup',{error_msg:'Cant find target group with this id',occupationlist:occupationlist,departmentlist:departmentlist,targetgrouplist:targetgrouplist,allplans:existingplans,sgoal:detailview});
    
        }
      }).catch(err =>{
        console.log(err)
        res.render('createtargetgroup',{error_msg:'Cant update password try again',occupationlist:occupationlist,departmentlist:departmentlist,targetgrouplist:targetgrouplist,allplans:existingplans,sgoal:detailview});
    
      })
     }else{
      res.render('createtargetgroup',{error_msg:'Please enter password try again',occupationlist:occupationlist,departmentlist:departmentlist,targetgrouplist:targetgrouplist,allplans:existingplans,sgoal:detailview});
    
     }
     
      });
  router.get('/createdepartment', ensureAuthenticated, async function(req, res) {
    const existingplans = await db.Plan.findAll({});
    const detailview = await db.StrategicGoal.findAll({});
    const departmentlist = await db.Department.findAll();
   res.render('createdepartment',{departmentlist:departmentlist,allplans:existingplans,sgoal:detailview});
    });
    router.get('/createoccupation', ensureAuthenticated, async function(req, res) {
      const existingplans = await db.Plan.findAll({});
      const detailview = await db.StrategicGoal.findAll({});
      const [occupationlist,occmt] =await db.sequelize.query(`
      select * from Occupations inner join Departments on Occupations.departmentid =Departments.departmentid
      `)
      const departmentlist = await db.Department.findAll();
     res.render('createoccupation',{departmentlist:departmentlist,occupationlist:occupationlist,allplans:existingplans,sgoal:detailview});
      });
       
router.post('/addnewtargetgroup', ensureAuthenticated, async function(req, res) {
  const {targetgroupname,grouptype,username,departmentid,occupationid,userroll,password,retypepassword} =req.body;
const existingplans = await db.Plan.findAll({});
const detailview = await db.StrategicGoal.findAll({});
const departmentlist = await db.Department.findAll();
const occupationlist = await db.Occupation.findAll();
const newtargetgroup ={
 targetgid:uuidv4(),
 targetgroupname:targetgroupname,
  grouptype:grouptype,
  username:username,password:password,
  department_id:departmentid,
  occupation_id:occupationid
  ,retypepassword:retypepassword,user_roll:userroll,is_active:'Yes'
}
const targetgrouplist = await db.TargetGroup.findAll();
let errors=[];
if(!targetgroupname ||!grouptype || grouptype ==="0" || username==="0" ||!username ||!userroll ||!password ||!retypepassword){
  errors.push({msg:'Please ensert all required feilds'})
}
if(grouptype=="Department" && departmentid =="0"){
  errors.push({msg:'Please department name'})
}
if(grouptype=="Occupation" && occupationid =="0"){
  errors.push({msg:'Please select occupation name'})
}

if(password != retypepassword){

 errors.push({msg:'Please match password'})
}
if(errors.length >0){
  res.render('createtargetgroup',{errors,departmentlist:departmentlist,occupationlist:occupationlist,targetgrouplist:targetgrouplist,allplans:existingplans,sgoal:detailview});

}

else{
  db.TargetGroup.findOne({where:{targetgroupname:targetgroupname,user_roll:userroll}}).then(tg =>{
    if(tg){
      res.render('createtargetgroup',{departmentlist:departmentlist,occupationlist:occupationlist,targetgrouplist:targetgrouplist,allplans:existingplans,sgoal:detailview,error_msg:'Target group already created'});
  
    }else{
      bcrypt.hash(password, 10, (err, hash) => {
        newtargetgroup.password = hash;


        db.TargetGroup.create(newtargetgroup)
            .then(data => {
              db.TargetGroup.findAll().then(newtarg=>{
                res.render('createtargetgroup',{departmentlist:departmentlist,occupationlist:occupationlist,targetgrouplist:newtarg,allplans:existingplans,sgoal:detailview,success_msg:'New target group created successfully'});
            
               }).catch(err =>{
                res.render('createtargetgroup',{departmentlist:departmentlist,occupationlist:occupationlist,targetgrouplist:targetgrouplist,allplans:existingplans,sgoal:detailview,error_msg:'New target group created successfully'});
            
               })
            }).catch(err => {
              res.render('createtargetgroup',{departmentlist:departmentlist,occupationlist:occupationlist,targetgrouplist:targetgrouplist,allplans:existingplans,sgoal:detailview,error_msg:'New target group created successfully'});
  
            }) // end of then catch for create method
        }); //

    }
  }).catch(err =>{
    res.render('createtargetgroup',{departmentlist:departmentlist,occupationlist:occupationlist,targetgrouplist:targetgrouplist,allplans:existingplans,sgoal:detailview,error_msg:'Cant create now try later'});
  })
  
}

});
router.post('/addnewdepartment', ensureAuthenticated, async function(req, res) {
  const {departmentname} =req.body;
const existingplans = await db.Plan.findAll({});
const detailview = await db.StrategicGoal.findAll({});
const newtargetgroup ={
 departmentid:uuidv4(),
 departmentname:departmentname
}
const departmentlist = await db.Department.findAll();
let errors=[];
if(!departmentname){
  res.render('createdepartment',{departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'Please ensert all reqiured fields'});
  
}

else{
  db.Department.findOne({where:{departmentname:departmentname}}).then(tg =>{
    if(tg){
      res.render('createdepartment',{departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'Department already created'});
  
    }else{
      db.Department.create(newtargetgroup)
      .then(data => {
        db.Department.findAll().then(newtarg=>{
          res.render('createdepartment',{departmentlist:newtarg,allplans:existingplans,sgoal:detailview,success_msg:'New department created successfully'});
      
         }).catch(err =>{
          res.render('createdepartment',{departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'New department created successfully'});
      
         })
      }).catch(err => {
        res.render('createdepartment',{departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'New department created successfully'});

      })

    }
  }).catch(err =>{
    res.render('createdepartment',{departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'Cant create now try later'});
  })
  
}

});
router.post('/addnewactivityindicator', ensureAuthenticated, async function(req, res) {
  const {activityindicator} =req.body;
const existingplans = await db.Plan.findAll({});
const detailview = await db.StrategicGoal.findAll({});
const newtargetgroup ={
 activityindicatorid:uuidv4(),
 activityindicatorname:activityindicator
}
const departmentlist = await db.ActivityIndicator.findAll();
let errors=[];
if(!activityindicator){
  res.render('createactivityindicator',{departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'Please ensert all reqiured fields'});
  
}

else{
  db.ActivityIndicator.findOne({where:{activityindicatorname:activityindicator}}).then(tg =>{
    if(tg){
      res.render('createactivityindicator',{departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'Activity Indicator already created'});
  
    }else{
      db.ActivityIndicator.create(newtargetgroup)
      .then(data => {
        db.ActivityIndicator.findAll().then(newtarg=>{
          res.render('createactivityindicator',{departmentlist:newtarg,allplans:existingplans,sgoal:detailview,success_msg:'New Activity Indicator created successfully'});
      
         }).catch(err =>{
          res.render('createactivityindicator',{departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'New Activity Indicator created successfully'});
      
         })
      }).catch(err => {
        res.render('createactivityindicator',{departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'New Activity Indicator created successfully'});

      })

    }
  }).catch(err =>{
    res.render('createactivityindicator',{departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'Cant create now try later'});
  })
  
}

});
router.post('/updateactivityindicator', ensureAuthenticated, async function(req, res) {
  const {activityindicator,activityindicatorid} =req.body;
const existingplans = await db.Plan.findAll({});
const detailview = await db.StrategicGoal.findAll({});

const departmentlist = await db.ActivityIndicator.findAll();
let errors=[];
if(!activityindicator || !activityindicatorid){
  res.render('createactivityindicator',{departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'Please ensert all reqiured fields'});
  
}

else{
  db.ActivityIndicator.findOne({where:{activityindicatorid:activityindicatorid}}).then(tg =>{
    if(tg){
      db.ActivityIndicator.update({activityindicatorname:activityindicator},{where:{activityindicatorid:activityindicatorid}})
      .then(data => {
        db.ActivityIndicator.findAll().then(newtarg=>{
          res.render('createactivityindicator',{departmentlist:newtarg,allplans:existingplans,sgoal:detailview,success_msg:'Activity Indicator Updated successfully'});
      
         }).catch(err =>{
          res.render('createactivityindicator',{departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'New Activity Indicator created successfully'});
      
         })
      }).catch(err => {
        res.render('createactivityindicator',{departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'New Activity Indicator created successfully'});

      })
    }else{
    
      res.render('createactivityindicator',{departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'Cant find Activity Indicator'});
    
    }
  }).catch(err =>{
    res.render('createactivityindicator',{departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'Cant create now try later'});
  })
  
}

});
router.post('/updatedepartmentname', ensureAuthenticated, async function(req, res) {
  const {departmentname,departmentid} =req.body;
const existingplans = await db.Plan.findAll({});
const detailview = await db.StrategicGoal.findAll({});

const departmentlist = await db.Department.findAll();
let errors=[];
if(!departmentname){
  res.render('createdepartment',{departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'Please ensert all reqiured fields'});
  
}

else{
  db.Department.findOne({where:{departmentname:departmentname}}).then(tg =>{
    if(tg){
      res.render('createdepartment',{departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'Department already created'});
  
    }else{
      db.Department.update({departmentname:departmentname},{where:{departmentid:departmentid}})
      .then(data => {
        db.Department.findAll().then(newtarg=>{
          res.render('createdepartment',{departmentlist:newtarg,allplans:existingplans,sgoal:detailview,success_msg:'Department name updated successfully'});
      
         }).catch(err =>{
          res.render('createdepartment',{departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'New department created successfully'});
      
         })
      }).catch(err => {
        res.render('createdepartment',{departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'New department created successfully'});

      })

    }
  }).catch(err =>{
    res.render('createdepartment',{departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'Cant create now try later'});
  })
  
}

});
router.post('/deleteactivityindicator', ensureAuthenticated, async function(req, res) {
  const {activityindicatorid} =req.body;
const existingplans = await db.Plan.findAll({});
const detailview = await db.StrategicGoal.findAll({});

const departmentlist = await db.ActivityIndicator.findAll();
let errors=[];
if(!activityindicatorid){
  res.render('createactivityindicator',{departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'Please ensert all reqiured fields'});
  
}

else{
  db.ActivityIndicator.findOne({where:{activityindicatorid:activityindicatorid}}).then(tg =>{
    if(tg){
      db.ActivityIndicator.destroy({where:{activityindicatorid:activityindicatorid}})
      .then(data => {
        db.ActivityIndicator.findAll().then(newtarg=>{
          res.render('createactivityindicator',{departmentlist:newtarg,allplans:existingplans,sgoal:detailview,success_msg:'Activity Indicator name deleted successfully'});
      
         }).catch(err =>{
          res.render('createactivityindicator',{departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'Error while finding new Activity Indicator '});
      
         })
      }).catch(err => {
        res.render('createactivityindicator',{departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'Error while deleting Activity Indicator '});

      })

    }
  }).catch(err =>{
    res.render('createactivityindicator',{departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'Cant Delete now try later'});
  })
  
}

});
router.post('/addnewoccupation', ensureAuthenticated, async function(req, res) {
  const {departmentname,occupationname} =req.body;
const existingplans = await db.Plan.findAll({});
const detailview = await db.StrategicGoal.findAll({});
const newtargetgroup ={
 occupationid:uuidv4(),
 departmentid:departmentname,
 occupationname:occupationname
}
const departmentlist = await db.Department.findAll();
let errors=[];
const [occupationlist,occmt] =await db.sequelize.query(`
select * from Occupations inner join Departments on Occupations.departmentid =Departments.departmentid
`)
if(!departmentname || !occupationname || occupationname ==0){
  res.render('createoccupation',{occupationlist:occupationlist,departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'Please ensert all reqiured fields'});
  
}

else{
  db.Occupation.findOne({where:{occupationname:occupationname}}).then(tg =>{
    if(tg){
      res.render('createoccupation',{occupationlist:occupationlist,departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'Occupation already created'});
  
    }else{
      db.Occupation.create(newtargetgroup)
      .then(data => {
        db.Occupation.findAll().then(newtarg=>{
          res.render('createoccupation',{occupationlist:newtarg,departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,success_msg:'New occupation created successfully'});
      
         }).catch(err =>{
          res.render('createoccupation',{occupationlist:occupationlist,departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'New occupation created successfully'});
      
         })
      }).catch(err => {
        res.render('createoccupation',{occupationlist:occupationlist,departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'New occupation created successfully'});

      })

    }
  }).catch(err =>{
    console.log(err)
    res.render('createdepartment',{departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'Cant create now try later'});
  })
  
}

});
router.post('/updateoccupationname', ensureAuthenticated, async function(req, res) {
  const {occupationid,occupationname} =req.body;
const existingplans = await db.Plan.findAll({});
const detailview = await db.StrategicGoal.findAll({});

const departmentlist = await db.Department.findAll();
let errors=[];
const [occupationlist,occmt] =await db.sequelize.query(`
select * from Occupations inner join Departments on Occupations.departmentid =Departments.departmentid
`)
if( !occupationname || occupationname ==0){
  res.render('createoccupation',{occupationlist:occupationlist,departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'Please ensert all reqiured fields'});
  
}

else{
  db.Occupation.findOne({where:{occupationname:occupationname}}).then(tg =>{
    if(tg){
      res.render('createoccupation',{occupationlist:occupationlist,departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'Occupation already created'});
  
    }else{
      db.Occupation.update({occupationname:occupationname},{where:{occupationid:occupationid}})
      .then(data => {
        db.Occupation.findAll().then(newtarg=>{
          res.render('createoccupation',{occupationlist:newtarg,departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,success_msg:'Occupation name update successfully'});
      
         }).catch(err =>{
          res.render('createoccupation',{occupationlist:occupationlist,departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'New occupation created successfully'});
      
         })
      }).catch(err => {
        res.render('createoccupation',{occupationlist:occupationlist,departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'New occupation created successfully'});

      })

    }
  }).catch(err =>{
    console.log(err)
    res.render('createdepartment',{departmentlist:departmentlist,allplans:existingplans,sgoal:detailview,error_msg:'Cant create now try later'});
  })
  
}

});
router.post('/selectplantoviewdetail', ensureAuthenticated, async function(req, res) {
const{planid,configcat} =req.body;
const existingplans = await db.Plan.findAll({});
const plan = await db.Plan.findOne({where:{planid:planid}});
var goal,sdir,mact,dact;
const [totdact2,tdatm2] = await db.sequelize.query(`
select count(DetailActivities.id) as tot,Plans.planid,plantitle,plancode from DetailActivities
inner join MajorActivities on MajorActivities.mactivityid = DetailActivities.mactivityid
inner join StrategicDirections on StrategicDirections.sdirid = MajorActivities.sdirid
inner join StrategicGoals on StrategicDirections.sgoalid = StrategicGoals.sgoalid
inner join Plans on Plans.planid = StrategicGoals.planid

group by plancode,planid,plantitle
`)
const [startdact2,sa2] = await db.sequelize.query(`
select count(DetailActivityKPIs.id) as tot,Plans.planid,plantitle,plancode from DetailActivityKPIs
inner join MajorActivities on MajorActivities.mactivityid = DetailActivityKPIs.mactivityid
inner join StrategicDirections on StrategicDirections.sdirid = MajorActivities.sdirid
inner join StrategicGoals on StrategicDirections.sgoalid = StrategicGoals.sgoalid
inner join Plans on Plans.planid = StrategicGoals.planid
where  start= 'Yes'
group by plancode,planid,plantitle
`)
const [progressdact2,prs2] = await db.sequelize.query(`
select count(DetailActivityKPIs.id) as tot,Plans.planid,plantitle,plancode from DetailActivityKPIs
inner join ProgressReports on ProgressReports.dactivityid = DetailActivityKPIs.dactivityid
inner join MajorActivities on MajorActivities.mactivityid = DetailActivityKPIs.mactivityid
inner join StrategicDirections on StrategicDirections.sdirid = MajorActivities.sdirid
inner join StrategicGoals on StrategicDirections.sgoalid = StrategicGoals.sgoalid
inner join Plans on Plans.planid = StrategicGoals.planid

group by plancode,planid,plantitle
`)
const [finisheddact2,fir2] = await db.sequelize.query(`
select count(DetailActivityKPIs.id) as tot,Plans.planid,plantitle,plancode from DetailActivityKPIs
inner join FinalReports on FinalReports.dactivityid = DetailActivityKPIs.dactivityid
inner join MajorActivities on MajorActivities.mactivityid = DetailActivityKPIs.mactivityid
inner join StrategicDirections on StrategicDirections.sdirid = MajorActivities.sdirid
inner join StrategicGoals on StrategicDirections.sgoalid = StrategicGoals.sgoalid
inner join Plans on Plans.planid = StrategicGoals.planid

group by plancode,planid,plantitle
`)
const [totdact,tdatm] = await db.sequelize.query(`
select count(DetailActivities.id) as tot,Plans.planid,plantitle,plancode from DetailActivities
inner join DetailActivityKPIs on DetailActivities.dactivityid = DetailActivityKPIs.dactivityid

inner join MajorActivities on MajorActivities.mactivityid = DetailActivities.mactivityid
inner join StrategicDirections on StrategicDirections.sdirid = MajorActivities.sdirid
inner join StrategicGoals on StrategicDirections.sgoalid = StrategicGoals.sgoalid
inner join Plans on Plans.planid = StrategicGoals.planid
where  dacttgroup ='${req.user.targetgid}'
group by plancode,planid,plantitle
`)
const [startdact,sa] = await db.sequelize.query(`
select count(DetailActivityKPIs.id) as tot,Plans.planid,plantitle,plancode from DetailActivityKPIs
inner join MajorActivities on MajorActivities.mactivityid = DetailActivityKPIs.mactivityid
inner join StrategicDirections on StrategicDirections.sdirid = MajorActivities.sdirid
inner join StrategicGoals on StrategicDirections.sgoalid = StrategicGoals.sgoalid
inner join Plans on Plans.planid = StrategicGoals.planid
where  dacttgroup ='${req.user.targetgid}' and start= 'Yes'
group by plancode,planid,plantitle
`)
const [progressdact,prs] = await db.sequelize.query(`
select count(DetailActivityKPIs.id) as tot,Plans.planid,plantitle,plancode from DetailActivityKPIs
inner join ProgressReports on ProgressReports.dactivityid = DetailActivityKPIs.dactivityid
inner join MajorActivities on MajorActivities.mactivityid = DetailActivityKPIs.mactivityid
inner join StrategicDirections on StrategicDirections.sdirid = MajorActivities.sdirid
inner join StrategicGoals on StrategicDirections.sgoalid = StrategicGoals.sgoalid
inner join Plans on Plans.planid = StrategicGoals.planid
where  dacttgroup ='${req.user.targetgid}'
group by plancode,planid,plantitle
`)
const [finisheddact,fir] = await db.sequelize.query(`
select count(DetailActivityKPIs.id) as tot,Plans.planid,plantitle,plancode from DetailActivityKPIs
inner join FinalReports on FinalReports.dactivityid = DetailActivityKPIs.dactivityid
inner join MajorActivities on MajorActivities.mactivityid = DetailActivityKPIs.mactivityid
inner join StrategicDirections on StrategicDirections.sdirid = MajorActivities.sdirid
inner join StrategicGoals on StrategicDirections.sgoalid = StrategicGoals.sgoalid
inner join Plans on Plans.planid = StrategicGoals.planid
where  dacttgroup ='${req.user.targetgid}'
group by plancode,planid,plantitle
`)

if(plan){
  goal = await db.StrategicGoal.findOne({where:{planid:planid}}).catch(err =>{
    console.log(err)
  })
}
if(goal){
  sdir = await db.StrategicDirection.findOne({where:{sgoalid:goal.sgoalid}}).catch(err =>{
   console.log(err)
  })
}if(sdir){
  mact = await db.MajorActivity.findOne({where:{sdirid:sdir.sdirid}}).catch(err =>{
   console.log(err)
  })
}
if(mact){
  dact = await db.DetailActivity.findOne({where:{mactivityid:mact.mactivityid}}).catch(err =>{
   console.log(err)
  })
}

//const goal = await db.StrategicGoal.findOne({where:{planid:planid}});
//const sdir = await db.StrategicDirection.findOne({where:{sgoalid:goal.sgoalid}});
// mact = await db.MajorActivity.findOne({where:{sdirid:sdir.sdirid}});
 //dact = await db.DetailActivity.findOne({where:{mactivityid:mact.mactivityid}})
const [majorkpi  ,majorkpimeta] =  await db.sequelize.query(`
select * from MajorActivityKPIs inner join DetailActivities on MajorActivityKPIs.dactivityid = DetailActivities.dactivityid ;
`)
const [detailkpi,detailkpimeta] =  await db.sequelize.query(`
select * from DetailActivityKPIs inner join TargetGroups on dacttgroup = targetgid ;
`)
console.log(planid)
var detailview; 
if(!goal || !sdir || !mact ||!dact){
  const existingplans = await db.Plan.findAll({});
  const plan = await db.Plan.findAll({});
  const plancurrent = await db.Plan.findAll({where:{iscurrent:'Yes'}});
const goal = await db.StrategicGoal.findAll({});
const sdir = await db.StrategicDirection.findAll({});
const mact = await db.MajorActivity.findAll({});
const dact = await db.DetailActivity.findAll({});
  if(req.user.user_roll==="Admin"){
    res.render('dashboard',{
      totdact:totdact2,
      startdact:startdact2,
      progressdact:progressdact2,
      finisheddact:finisheddact2,
      user:req.user,allplans:existingplans,plan:plan,sdir:sdir,mact:mact,goal:goal,dact:dact,
    error_msg:'Please Finish Plan Detail'
    });
  
  }else {
    res.render('dashboardtarget',{
      totdact:totdact2,
      startdact:startdact2,
      progressdact:progressdact2,
      finisheddact:finisheddact2,
      user:req.user,allplans:existingplans,plan:plancurrent,sdir:sdir,mact:mact,goal:goal,dact:dact});
  
  }
}else{
  if(configcat ==="SG"){
    const detailview = await db.sequelize.query(`
    SELECT StrategicGoals.*
    FROM StrategicGoals 
    INNER JOIN Plans ON StrategicGoals.planid = Plans.planid
    WHERE Plans.planid = :planid
  `, {
    replacements: { planid: planid }, // provide the planid value here
    type: db.sequelize.QueryTypes.SELECT
  });
    res.render('plandetail',{configcat:configcat,allplans:existingplans,plan:plan,sgoal:detailview,tag:"sg"});
   }
   else if(configcat ==="SD"){
    const detailview = await db.sequelize.query(`
    SELECT StrategicDirections.*
    FROM StrategicDirections 
    INNER JOIN StrategicGoals ON StrategicDirections.sgoalid = StrategicGoals.sgoalid
    INNER JOIN Plans ON StrategicGoals.planid = Plans.planid
    WHERE Plans.planid = :planid
  `, {
    replacements: { planid: planid }, // provide the planid value here
    type: db.sequelize.QueryTypes.SELECT
  });
     res.render('plandetail',{configcat:configcat,allplans:existingplans,plan:plan,sgoal:detailview,tag:"sd"});
    }
    else if(configcat ==="MA"){
      const detailview = await db.sequelize.query(`
     SELECT MajorActivities.*
     FROM MajorActivities 
    
     INNER JOIN StrategicDirections ON StrategicDirections.sdirid = MajorActivities.sdirid
     INNER JOIN StrategicGoals ON StrategicDirections.sgoalid = StrategicGoals.sgoalid
     INNER JOIN Plans ON StrategicGoals.planid = Plans.planid
     WHERE Plans.planid = :planid
   `, {
     replacements: { planid: planid }, // provide the planid value here
     type: db.sequelize.QueryTypes.SELECT
   });
     res.render('plandetail',{configcat:configcat,allplans:existingplans,plan:plan,sgoal:detailview,tag:"ma"});
    }
    else if(configcat ==="DA"){
    // detailview = await db.DetailActivity.findAll({where:{mactivityid:mact.mactivityid}});
     const detailview = await db.sequelize.query(`
     SELECT DetailActivities.*
     FROM DetailActivities 
     INNER JOIN MajorActivities ON MajorActivities.mactivityid = DetailActivities.mactivityid
     INNER JOIN StrategicDirections ON StrategicDirections.sdirid = MajorActivities.sdirid
     INNER JOIN StrategicGoals ON StrategicDirections.sgoalid = StrategicGoals.sgoalid
     INNER JOIN Plans ON StrategicGoals.planid = Plans.planid
     WHERE Plans.planid = :planid
   `, {
     replacements: { planid: planid }, // provide the planid value here
     type: db.sequelize.QueryTypes.SELECT
   });
     res.render('plandetail',{configcat:configcat,allplans:existingplans,plan:plan,planid:planid,sgoal:detailview,tag:"da"});
    }
    else if(configcat ==="DP"){
     // res.redirect('/stvcpms/detailplan/' + planid);
    
      const goal2 = await db.StrategicGoal.findAll({where:{planid:planid}});
    const [sdir2,sm] = await db.sequelize.query(`
    select * from StrategicDirections inner join 
    StrategicGoals on StrategicGoals.sgoalid = StrategicDirections.sgoalid
where StrategicGoals.planid = '${planid}';

    `)
    const [mact2,mm] =  await db.sequelize.query(`
    select * from MajorActivities inner join StrategicDirections
    on StrategicDirections.sdirid = MajorActivities.sdirid
    inner join StrategicGoals on StrategicGoals.sgoalid = StrategicDirections.sgoalid
where StrategicGoals.planid = '${planid}';

    `)
    const [dact2,dm] =  await db.sequelize.query(`
    select * from DetailActivities inner join 
    MajorActivities on DetailActivities.mactivityid = MajorActivities.mactivityid
    inner join StrategicDirections
    on StrategicDirections.sdirid = MajorActivities.sdirid
    inner join StrategicGoals on StrategicGoals.sgoalid = StrategicDirections.sgoalid
where StrategicGoals.planid = '${planid}';

    `)
    const [detailkpi2,detailkpimeta2] =  await db.sequelize.query(
      `select * from DetailActivityKPIs inner join TargetGroups on dacttgroup = targetgid 
       inner join DetailActivities on DetailActivities.dactivityid = DetailActivityKPIs.dactivityid 
       inner join MajorActivities on DetailActivities.mactivityid = MajorActivities.mactivityid 
       inner join StrategicDirections
    on StrategicDirections.sdirid = MajorActivities.sdirid
    inner join StrategicGoals on StrategicGoals.sgoalid = StrategicDirections.sgoalid
where StrategicGoals.planid = '${planid}';`
      );
    
       res.render('showfullplandetail',{configcat:configcat,detailkpi:detailkpi2,majorkpi:majorkpi,allplans:existingplans,plan:plan,goal2:goal2,sdir2:sdir2,mact2:mact2,dact2:dact2});
    
      } else if(configcat ==="VP"){
     const goal2 = await db.StrategicGoal.findAll({where:{planid:planid}});
     const sdir2 = await db.StrategicDirection.findAll({where:{sgoalid:goal.sgoalid}});
     const mact2 = await db.MajorActivity.findAll({where:{sdirid:sdir.sdirid}});
     const dact2 = await db.DetailActivity.findAll({where:{mactivityid:mact.mactivityid}});
     const targetgroup = await db.TargetGroup.findAll({});
     const departments = await db.Department.findAll({});
    
     res.render('searchplanprogress',{departments:departments,targetgroup:targetgroup,configcat:configcat,detailkpi:detailkpi,majorkpi:majorkpi,allplans:existingplans,plan:plan,goal:goal2,sdir:sdir2,mact:mact2,dact:dact2});
    } else if(configcat ==="VF"){
   
      const [detailkpi,detailkpimeta] =  await db.sequelize.query(
        "select * from DetailActivityKPIs inner join TargetGroups on dacttgroup = targetgid "+
        " inner join DetailActivities on DetailActivities.dactivityid = DetailActivityKPIs.dactivityid "+
        " inner join MajorActivities on DetailActivities.mactivityid = MajorActivities.mactivityid "+
        " where DetailActivityKPIs.isfinalsent ='Yes'"
        );
   const mact = await db.MajorActivity.findOne({where:{sdirid:sdir.sdirid}});
   const dact = await db.DetailActivity.findAll({where:{mactivityid:mact.mactivityid}});
   const [finalrpt,finalrptmeta] =await db.sequelize.query(`
   select * from FinalReports inner join TargetGroups on FinalReports.dacttgroupid = TargetGroups.targetgid ;
   `)
     res.render('searchplanfinalreport',{configcat:configcat,finalrpt:finalrpt,detailkpi:detailkpi,majorkpi:majorkpi,allplans:existingplans,plan:plan,goal:goal,sdir:sdir,mact:mact,dact:dact});
   
    }
}


});
router.get('/showoutcomes/(:goalid)', ensureAuthenticated, async (req, res) => {
  const sdir = await db.StrategicDirection.findAll({ where: { sgoalid: req.params.goalid } });
  res.json({ outcomes: sdir }); // Wrap the array in an object
});
router.get('/detailplan/:planid', ensureAuthenticated, async (req, res) => {
  try {
    const planid = req.params.planid;

    // Custom SQL query to fetch goals with details
    const query = `
    SELECT
    goals.*,
    outcomes.*,
    outputs.*,
    activities.*,
    kpis.*
  FROM
    StrategicGoals AS goals
  LEFT JOIN
    StrategicDirections AS outcomes ON goals.sgoalid = outcomes.sgoalid
  LEFT JOIN
    MajorActivities AS outputs ON outcomes.sdirid = outputs.sdirid
  LEFT JOIN
    DetailActivities AS activities ON outputs.mactivityid = activities.mactivityid
  LEFT JOIN
    DetailActivityKPIs AS kpis ON activities.dactivityid = kpis.dactivityid
      WHERE
        goals.planid = '${planid}';
    `;

    // Execute the query
   const goals  = await db.sequelize.query(query);
  
         const goal2 = await db.StrategicGoal.findAll({where:{planid:planid}});
   const sdir2 = await db.StrategicDirection.findAll({where:{sgoalid:goal.sgoalid}});
    const mact2 = await db.MajorActivity.findAll({where:{sdirid:sdir.sdirid}});
     const dact2 = await db.DetailActivity.findAll({where:{mactivityid:mact.mactivityid}});
   
      res.render('showfullplandetail',{goals:goals,configcat:configcat,detailkpi:detailkpi,majorkpi:majorkpi,allplans:existingplans,plan:plan,goal:goal2,sdir:sdir2,mact:mact2,dact2:dact2});
  
    console.log('Fetched goals:', goals);
   
  } catch (err) {
    console.error('Error fetching goals with details:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Function to execute a SQL query


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
  const targetgroup = await db.TargetGroup.findAll({});
  res.render('searchplanprogress',{targetgroup:targetgroup,allplans:existingplans,sgoal:sgoal,sdir:sdir,mact:mact,dact:dact});
  });

  router.post('/filtersearchforprogressreport', ensureAuthenticated, async (req, res) =>{
    const {planid,sgoalid,sdirid,mactivityid,dactivityid} = req.body;
    const sgoal = await db.StrategicGoal.findAll({});
    const sdir = await db.StrategicDirection.findAll({});
    const mact = await db.MajorActivity.findAll({});
    const dact = await db.DetailActivity.findOne({where:{dactivityid:dactivityid}});
    const dact2 = await db.DetailActivity.findAll({});
    const existingplans = await db.Plan.findAll({});
    const plan = await db.Plan.findOne({where:{planid:planid}});
    const targetgroup = await db.TargetGroup.findAll({});
    const departments = await db.Department.findAll({});
    if(planid==="0" ||sgoalid==="0" || sdirid==="0" || mactivityid==="0" || dactivityid==="0"){


      res.render('searchplanprogress',{departments:departments, error_msg:'Please select all criterias',targetgroup:targetgroup,allplans:existingplans,sgoal:sgoal,sdir:sdir,mact:mact,dact:dact2});
    }else{
      const [progress,progressmetta] =   await db.sequelize.query(
        "select * from ProgressReports "+
        " inner join TargetGroups on ProgressReports.dacttgroupid = TargetGroups.targetgid "+
        " where  dactivityid ='"+dactivityid+"' "
        );
        res.render('filtersearchforprogressreport',{departmentname:'',department:'',reporttypeinput:'',reporttype:'',target:'', targetgroup:targetgroup,progress:progress,user:req.user,allplans:existingplans,plan:plan,sdir:sdir,mact:mact,goal:sgoal,dact:dact})
  
    }
   
});
router.post('/filtersearchforprogressreportbymajoract', ensureAuthenticated, async (req, res) =>{
  const {planid,sgoalid,sdirid,mactivityid} = req.body;
  const sgoal = await db.StrategicGoal.findAll({});
  const sdir = await db.StrategicDirection.findAll({});
  const mact = await db.MajorActivity.findAll({});
  const dact = await db.MajorActivity.findOne({where:{mactivityid:mactivityid}});
  const dact2 = await db.DetailActivity.findAll({});
  const existingplans = await db.Plan.findAll({});
  const plan = await db.Plan.findOne({where:{planid:planid}});
  const targetgroup = await db.TargetGroup.findAll({});
  const departments = await db.Department.findAll({});
  if(planid==="0" ||sgoalid==="0" || sdirid==="0" || mactivityid==="0"){


    res.render('searchplanprogress',{departments:departments, error_msg:'Please select all criterias',targetgroup:targetgroup,allplans:existingplans,sgoal:sgoal,sdir:sdir,mact:mact,dact:dact2});
  }else{
    const [progress,progressmetta] =   await db.sequelize.query(
    `
    select * from ProgressReports 
    inner join TargetGroups on ProgressReports.dacttgroupid = TargetGroups.targetgid 
  inner join DetailActivities on DetailActivities.dactivityid = ProgressReports.dactivityid
  inner join MajorActivities on MajorActivities.mactivityid =DetailActivities.mactivityid
  where MajorActivities.mactivityid = '${mactivityid}'
    `
      );
      res.render('filtersearchforprogressreport',{departmentname:'',department:'',reporttypeinput:'',reporttype:'',target:'', targetgroup:targetgroup,progress:progress,user:req.user,allplans:existingplans,plan:plan,sdir:sdir,mact:mact,goal:sgoal,dact:dact})

  }
 
});
router.post('/filtersearchforprogressreporttargetgroup', ensureAuthenticated, async (req, res) =>{
  const {planid,sgoalid,sdirid,mactivityid,dactivityid,targetgroup} = req.body;
  const sgoal = await db.StrategicGoal.findAll({});
  const sdir = await db.StrategicDirection.findAll({});
  const mact = await db.MajorActivity.findAll({});
  const dact = await db.DetailActivity.findOne({where:{dactivityid:dactivityid}});
  const dact2 = await db.DetailActivity.findAll({});
  const existingplans = await db.Plan.findAll({});
  const plan = await db.Plan.findOne({where:{planid:planid}});
  const targetgroups = await db.TargetGroup.findAll({});
  const departments = await db.Department.findAll({});
  if(planid==="0" ||sgoalid==="0" || sdirid==="0" || mactivityid==="0" || dactivityid==="0" ||targetgroup==="0"){

    res.render('searchplanprogress',{departments:departments,error_msg:'Please select all criterias',targetgroup:targetgroups,allplans:existingplans,sgoal:sgoal,sdir:sdir,mact:mact,dact:dact2});
  }else{
    const [progress,progressmetta] =   await db.sequelize.query(
      "select * from ProgressReports "+
      " inner join TargetGroups on ProgressReports.dacttgroupid = TargetGroups.targetgid "+
      " where  dactivityid ='"+dactivityid+"' and dacttgroupid='"+targetgroup+"'"
      );
      res.render('filtersearchforprogressreport',{departmentname:'',department:'',reporttypeinput:'',reporttype:'',target:targetgroup,progress:progress,user:req.user,allplans:existingplans,plan:plan,sdir:sdir,mact:mact,goal:sgoal,dact:dact})

  }
 
});
router.post('/filtersearchforprogressreportdepartment', ensureAuthenticated, async (req, res) =>{
  const {planid,sgoalid,sdirid,mactivityid,dactivityid,department} = req.body;
  const sgoal = await db.StrategicGoal.findAll({});
  const sdir = await db.StrategicDirection.findAll({});
  const mact = await db.MajorActivity.findAll({});
  const dact = await db.DetailActivity.findOne({where:{dactivityid:dactivityid}});
  const dact2 = await db.DetailActivity.findAll({});
  const existingplans = await db.Plan.findAll({});
  const plan = await db.Plan.findOne({where:{planid:planid}});
  const targetgroups = await db.TargetGroup.findAll({});
  const departments = await db.Department.findAll({});
  const departmentname = await db.Department.findOne({where:{departmentid:department}});
  if(planid==="0" ||sgoalid==="0" || sdirid==="0" || mactivityid==="0" || dactivityid==="0" ||department==="0"){


    res.render('searchplanprogress',{error_msg:'Please select all criterias',targetgroup:targetgroups,departments:departments,allplans:existingplans,sgoal:sgoal,sdir:sdir,mact:mact,dact:dact2});
  }else{
    const [progress,progressmetta] =   await db.sequelize.query(`
    select * from ProgressReports 
    inner join TargetGroups on ProgressReports.dacttgroupid = TargetGroups.targetgid 
    inner join Occupations on Occupations.occupationid = TargetGroups.occupation_id 
    inner join Departments on Departments.departmentid = Occupations.departmentid 
  
     where  dactivityid ='${dactivityid}' and Departments.departmentid='${department}'
    ` );
      res.render('filtersearchforprogressreport',{department:department,reporttypeinput:'',reporttype:'',target:'',departmentname:departmentname.departmentname,departments:departments,progress:progress,user:req.user,allplans:existingplans,plan:plan,sdir:sdir,mact:mact,goal:sgoal,dact:dact})

  }
 
});
router.post('/filtersearchforprogressreportbytype', ensureAuthenticated, async (req, res) =>{
  const {planid,sgoalid,sdirid,mactivityid,dactivityid,reporttype,month,quarter} = req.body;
  const sgoal = await db.StrategicGoal.findAll({});
  const sdir = await db.StrategicDirection.findAll({});
  const mact = await db.MajorActivity.findAll({});
  const dact = await db.DetailActivity.findOne({where:{dactivityid:dactivityid}});
  const dact2 = await db.DetailActivity.findAll({});
  const existingplans = await db.Plan.findAll({});
  const plan = await db.Plan.findOne({where:{planid:planid}});
  const targetgroup = await db.TargetGroup.findAll({});
  const departments = await db.Department.findAll({});
  var reporttypeinput = reporttype==="Monthly"?month:quarter;
  let errors =[];
  if(reporttypeinput ==="0"|| reporttype ==="0"){
    errors.push({msg:'please select report type '})
  }
  if(planid==="0" || sgoalid ==="0"|| sdirid==="0" || mactivityid ==="0"|| dactivityid==="0"  || reporttype==="0"||!reporttypeinput){
   errors.push({msg:'please enter all required feilds'})
   }
  if(errors.length >0){
    res.render('searchplanprogress',{departments:departments,targetgroup:targetgroup,error_msg:'Please select all criterias',allplans:existingplans,sgoal:sgoal,sdir:sdir,mact:mact,dact:dact2});
  
  }
  else{
    const [progress,progressmetta] =   await db.sequelize.query(
      "select * from ProgressReports "+
      " inner join TargetGroups on ProgressReports.dacttgroupid = TargetGroups.targetgid "+
      " where  dactivityid ='"+dactivityid+"' and reporttype='"+reporttype+"' and reportmnthquarter='"+reporttypeinput+"'"
      );
      res.render('filtersearchforprogressreport',{departmentname:'',department:'',reporttypeinput:reporttypeinput,reporttype:reporttype,target:'',targetgroup:targetgroup,progress:progress,user:req.user,allplans:existingplans,plan:plan,sdir:sdir,mact:mact,goal:sgoal,dact:dact})

  }
 
});
router.post('/showdetailfinalreport', ensureAuthenticated, async (req, res) =>{
  const {planid,sgoalid,sdirid,mactivityid,dactivityid} = req.body;
  const sgoal = await db.StrategicGoal.findAll({});
  const sdir = await db.StrategicDirection.findAll({});
  const mact = await db.MajorActivity.findAll({});
  const dact = await db.DetailActivity.findOne({where:{dactivityid:dactivityid}});
  const dact2 = await db.DetailActivity.findAll({});
  const existingplans = await db.Plan.findAll({});
  const plan = await db.Plan.findOne({where:{planid:planid}});

  if(!dactivityid){

    const [detailkpi,detailkpimeta] =  await db.sequelize.query(`
   select * from DetailActivityKPIs inner join TargetGroups on dacttgroup = targetgid ;
   `)
   const [finalrpt,finalrptmeta] =await db.sequelize.query(`
   select * from FinalReports inner join TargetGroups on FinalReports.dacttgroupid = TargetGroups.targetgid ;
   `)
     res.render('searchplanfinalreport',{finalrpt:finalrpt,detailkpi:detailkpi,majorkpi:detailkpi,allplans:existingplans,plan:plan,goal:sdir,sdir:sdir,mact:mact,dact:dact});
   
    }else{
    const [finalrpt,progressmetta] =   await db.sequelize.query(
      "select * from FinalReports "+
      " inner join TargetGroups on FinalReports.dacttgroupid = TargetGroups.targetgid "+
      " where  dactivityid ='"+dactivityid+"' "
      );
      res.render('filtersearchforfinalreport',{finalrpt:finalrpt,user:req.user,allplans:existingplans,plan:plan,sdir:sdir,mact:mact,goal:sgoal,dact:dact})

  }
 
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
  const{sgoalid,planid} =req.body;
  const curentsgoal = await db.StrategicGoal.findOne({where:{sgoalid:sgoalid}});
  console.log("current goal")
  const existingplans = await db.Plan.findAll({})
  const thisplan = await db.Plan.findOne({where:{planid:planid}})
  console.log(curentsgoal)
  const sgs = await db.StrategicGoal.findAll({where:{planid:planid}});
  const sdirs = await db.StrategicDirection.findAll({where:{sgoalid:sgoalid}});
  if(sgoalid ==="0"){
    res.render('addstrategicgoal',{error_msg:'Please select strategic goal title first',allplans:existingplans,plan:thisplan,sgs:sgs,planid:planid});
  }else{
   db.StrategicGoal.findOne({where:{sgoalid:sgoalid}}).then(sgoal =>{
    if(sgoal){
     res.render('addstrategicdirection',{success_msg:'You can add edit or delete plan strategic dirrections here',allplans:existingplans,sdir:sdirs,sgoal:sgoal,sgoalid:sgoalid,planid:planid});
    }else{
      res.render('addstrategicgoal',{error_msg:'Cant find plan with this id. please try again',allplans:existingplans,plan:thisplan,sgs:sgs,planid:planid});
    }
   }).catch(err =>{
    res.render('addstrategicgoal',{error_msg:'Error while finding plan with id try again',allplans:existingplans,plan:thisplan,sgs:sgs,planid:planid});
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
  const{sdirid,sgoalid,planid} =req.body;
  const currentdirection = await db.StrategicDirection.findAll({where:{sgoalid:sgoalid}});
  const sgoal = await db.StrategicGoal.findOne({where:{sgoalid:sgoalid}});
  const existingplans = await db.Plan.findAll({})
 
  const targetgrouplist = await db.TargetGroup.findAll();
  if(sdirid ==="0"){
    res.render('addstrategicdirection',{error_msg:'Please select strategic direction first',allplans:existingplans,sdir:currentdirection,sgoal:sgoal,sgoalid:sgoalid,planid:planid});
  }else{
    const mact =await db.MajorActivity.findAll({where:{sdirid:sdirid}});
   db.StrategicDirection.findOne({where:{sdirid:sdirid}}).then(sdir =>{
    if(sdir){

     res.render('addmajoractivity',{success_msg:'You can add edit or delete major activities here',targetgrouplist:targetgrouplist,allplans:existingplans,mact:mact,sdir:sdir,planid:planid,sdirid:sdirid,sgoalid:sgoalid,});
    }else{
      res.render('addstrategicdirection',{error_msg:'Cant find strategic direction with this id. please try again',allplans:existingplans,sdir:currentdirection,sgoal:sgoal,sgoalid:sgoalid,planid:planid});
    }
   }).catch(err =>{
    res.render('addstrategicdirection',{error_msg:'Error while finding strategic direction with id try again',allplans:existingplans,sdir:currentdirection,sgoal:sgoal,sgoalid:sgoalid,planid:planid});
   })
  }
});
router.post('/addplandetailactivity', ensureAuthenticated, async function(req, res) {
  const{mactivityid,sdirid,sgoalid,planid} =req.body;
  const sdir = await db.StrategicDirection.findAll({where:{sdirid:sdirid}});
  const mact = await db.MajorActivity.findAll({where:{sdirid:sdirid}});
  const existingplans = await db.Plan.findAll({});
  const activityindicator = await db.ActivityIndicator.findAll({});
  const targetgrouplist  = await db.TargetGroup.findAll()
  if(mactivityid ==="0"){
    res.render('addmajoractivity',{targetgrouplist:targetgrouplist,error_msg:'Please select major activity first',allplans:existingplans,sgoalid:sgoalid,planid:planid,sdirid:sdirid,mact:mact,sdir:sdir,mactivityid:mactivityid});
  }else{
    const mact2 = await db.MajorActivity.findOne({where:{mactivityid:mactivityid}})
   db.DetailActivity.findAll({where:{mactivityid:mactivityid}}).then(dact =>{
    if(dact){
     res.render('adddetailactivity',{activityindicator:activityindicator,targetgrouplist:targetgrouplist,success_msg:'You can add edit or delete detail activities here',allplans:existingplans,sgoalid:sgoalid,planid:planid,sdirid:sdirid,dact:dact,mact:mact2,mactivityid:mactivityid});
    }else{
      res.render('adddetailactivity',{activityindicator:activityindicator,targetgrouplist:targetgrouplist,error_msg:'Cant find  detail activities with this id. please try again',allplans:existingplans,sgoalid:sgoalid,planid:planid,sdirid:sdirid,dact:dact,mact:mact2,mactivityid:mactivityid});
    }
   }).catch(err =>{
    res.render('adddetailactivity',{activityindicator:activityindicator,targetgrouplist:targetgrouplist,error_msg:'Error while finding  detail activities with id try again',allplans:existingplans,sgoalid:sgoalid,planid:planid,sdirid:sdirid,dact:dact,mact:mact2,mactivityid:mactivityid});
   })
  }
});

router.post('/addkpifordetailactivity', ensureAuthenticated, async function(req, res) {
  const{mactivityid,criteria,dactivityid,targetgroup,targetindicator,dactinputtype,dactkpi,registeredrisk,planid,sdirid,budget} =req.body;
  const curactivity = await db.MajorActivity.findOne({where:{mactivityid:mactivityid}});
  const dept = await db.TargetGroup.findAll({});
  const mact = await db.MajorActivity.findAll({where:{sdirid:curactivity.sdirid}});
  const dact = await db.DetailActivity.findAll({where:{mactivityid:mactivityid}});
  const existingplans = await db.Plan.findAll({})
  const targetgrouplist  = await db.TargetGroup.findAll();
  const activityindicator = await db.ActivityIndicator.findAll({})
  if(!mactivityid || !criteria || !dactivityid ||!targetgroup ||!targetindicator ||!dactinputtype ||!dactkpi||!registeredrisk){
    res.render('adddetailactivity',{activityindicator:activityindicator,sdirid:sdirid,planid:planid, dept:dept,targetgrouplist:targetgrouplist,error_msg:'Please add all required fields',dact:dact,allplans:existingplans,mact:mact,mactivityid:mactivityid});
  }else{
    try {
      // Parse the JSON string into an array of objects
      const criteriaData = JSON.parse(criteria);
  
      // Loop through each object in the criteriaData array
      const activityData = {};

      // Add dynamic month values from the JSON object
      console.log("criteriaData",criteriaData)
      criteriaData.forEach(monthData => {
        for (const [month, value] of Object.entries(monthData)) {
          activityData[month.toLowerCase()] = value;
          console.log(month);
          console.log(value);
        }
      });
      activityData.mactivityid=mactivityid;
      activityData.dactivityid =dactivityid;
      activityData.dacttgroup= targetgroup;
      activityData.dacttindicator= targetindicator;
      activityData.dacttinputtype= dactinputtype;
      activityData.dactkpi= dactkpi;
      activityData.budget= budget;
      activityData.dactregisteredrisk=registeredrisk;
      activityData.isfinalsent='No',
      console.log(activityData)
      const olddactkpi = await db.DetailActivityKPI.findOne({where:{dactivityid:dactivityid,dacttgroup:targetgroup,
        dacttindicator:targetindicator,dactkpi: dactkpi
      }});
      if(olddactkpi){
        res.render('adddetailactivity',{activityindicator:activityindicator,sdirid:sdirid,planid:planid,dept:dept,targetgrouplist:targetgrouplist, error_msg: 'An error KPI aready registered!',allplans:existingplans,dact:dact,mact:curactivity,mactivityid:mactivityid});
  
      }else{
        console.log("activityData",activityData)
        db.DetailActivityKPI.create(activityData).then(dakpi =>{
          res.render('adddetailactivity',{activityindicator:activityindicator,sdirid:sdirid,planid:planid,dept:dept,targetgrouplist:targetgrouplist, success_msg: 'KPIs added successfully!',allplans:existingplans,dact:dact,mact:curactivity,mactivityid:mactivityid});
  
        }).catch (err => {
          console.error('Error inserting criteria data:', err);
          res.render('adddetailactivity',{activityindicator:activityindicator,sdirid:sdirid,planid:planid,dept:dept,targetgrouplist:targetgrouplist, error_msg: 'An error occurred while adding criteria.!',allplans:existingplans,dact:dact,mact:curactivity,mactivityid:mactivityid});
  
        })
      }
      
    } catch (err) {
      console.error('Error inserting criteria data:', err);
      res.render('adddetailactivity',{activityindicator:activityindicator,sdirid:sdirid,planid:planid,dept:dept,targetgrouplist:targetgrouplist, error_msg: 'An error occurred while adding criteria.!',allplans:existingplans,dact:dact,mact:curactivity,mactivityid:mactivityid});

    }
  
  }
});
router.post('/editkpifordetailactivity', ensureAuthenticated, async function(req, res) {
  const{mactivityid,kpiid,criteriaedit,dactivityid,targetgroup,targetindicator,dactinputtype,dactkpi,registeredrisk,planid,sdirid,budget} =req.body;
  const curactivity = await db.MajorActivity.findOne({where:{mactivityid:mactivityid}});
  const dept = await db.TargetGroup.findAll({});
  const mact = await db.MajorActivity.findAll({where:{sdirid:curactivity.sdirid}});
  const dact = await db.DetailActivity.findAll({where:{mactivityid:mactivityid}});
  const existingplans = await db.Plan.findAll({})
  const targetgrouplist  = await db.TargetGroup.findAll();
  const activityindicator = await db.ActivityIndicator.findAll({})
  if(!kpiid){
    res.render('adddetailactivity',{activityindicator:activityindicator,sdirid:sdirid,planid:planid, dept:dept,targetgrouplist:targetgrouplist,error_msg:'Please add all required fields',dact:dact,allplans:existingplans,mact:mact,mactivityid:mactivityid});
  }else{
    try {
      // Parse the JSON string into an array of objects
     
      // Loop through each object in the criteriaData array
      const activityData = {};

      // Add dynamic month values from the JSON object
      console.log("criteriaData",criteriaedit)
      if (criteriaedit ) {
        const criteriaData = JSON.parse(criteriaedit);
  
        criteriaData.forEach(monthData => {
          for (const [month, value] of Object.entries(monthData)) {
            activityData[month.toLowerCase()] = value;
            console.log(month);
            console.log(value);
          }
        });
      }
      if(targetgroup || targetgroup!=0){
        activityData.dacttgroup= targetgroup;
      }
      if(dactinputtype || dactinputtype!=0){
        activityData.dacttinputtype= dactinputtype;
      }
      if(dactkpi){

        activityData.dactkpi= dactkpi;
      }
      if(targetindicator || targetindicator!=0){
        activityData.targetindicator= targetindicator;
      }
      if(budget){

        activityData.budget= budget;
      }
      if(registeredrisk){

        activityData.dactregisteredrisk=registeredrisk;
      }
      activityData.mactivityid=mactivityid;
      activityData.dactivityid =dactivityid;
         
      
      activityData.isfinalsent='No',
      console.log(activityData)
     
db.DetailActivityKPI.update(activityData,{where:{id:kpiid}}).then(dakpi =>{
  res.render('adddetailactivity',{activityindicator:activityindicator,sdirid:sdirid,planid:planid,dept:dept,targetgrouplist:targetgrouplist, success_msg: 'KPIs Updated successfully!',allplans:existingplans,dact:dact,mact:curactivity,mactivityid:mactivityid});

}).catch (err => {
  console.error('Error inserting criteria data:', err);
  res.render('adddetailactivity',{activityindicator:activityindicator,sdirid:sdirid,planid:planid,dept:dept,targetgrouplist:targetgrouplist, error_msg: 'An error occurred while adding criteria.!',allplans:existingplans,dact:dact,mact:curactivity,mactivityid:mactivityid});

})
      
    } catch (err) {
      console.error('Error inserting criteria data:', err);
      res.render('adddetailactivity',{activityindicator:activityindicator,sdirid:sdirid,planid:planid,dept:dept,targetgrouplist:targetgrouplist, error_msg: 'An error occurred while adding criteria.!',allplans:existingplans,dact:dact,mact:curactivity,mactivityid:mactivityid});

    }
  
  }
});
router.post('/addkpiformajoractivity', ensureAuthenticated, async function(req, res) {
  const{mactivityid,mcriteria,dactivityid,planid,sdirid} =req.body;
  const curactivity = await db.MajorActivity.findOne({where:{mactivityid:mactivityid}});

  const mact = await db.MajorActivity.findOne({where:{mactivityid:mactivityid}});
  const dact = await db.DetailActivity.findAll({where:{mactivityid:mactivityid}});
  const existingplans = await db.Plan.findAll({})
  const targetgrouplist  = await db.TargetGroup.findAll()
  if(!mactivityid || !mcriteria || !dactivityid){
    res.render('adddetailactivity',{sdirid:sdirid,planid:planid,targetgrouplist:targetgrouplist,error_msg:'Please add all required fields',allplans:existingplans,mact:mact,dact:dact,mactivityid:mactivityid});
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
      res.render('adddetailactivity',{sdirid:sdirid,planid:planid,targetgrouplist:targetgrouplist, success_msg: 'KPIs added successfully!',allplans:existingplans,dact:dact,mact:curactivity,mactivityid:mactivityid});

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
const sgs = await db.StrategicGoal.findAll({where:{planid:planid}});
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
router.post('/editstrategicgoal', ensureAuthenticated, async function(req, res) {
  const{sgoalcode,sgoaltitle,tobeupdated,sgoalid,sgoaldescription,sgoalduration,enddate,startdate,planid} =req.body;
  let errors =[];
  const plan = await db.Plan.findOne({where:{planid:planid}});
  const existingplans = await db.Plan.findAll({});
  const sgs = await db.StrategicGoal.findAll({where:{planid:planid}});
  if(!tobeupdated || tobeupdated==0){
    errors.push({mssg:'Please add all required fields'})
  }
  if(!sgoalid || !tobeupdated || !planid){
  errors.push({mssg:'Please add all required fields'})
  }
  if(errors.length >0){
    res.render('addstrategicgoal',{errors,sgs:sgs,allplans:existingplans});
  }else{
  
    
    let updateQuery = {};

    // Set the appropriate field in the update query based on the selected option
    switch (tobeupdated) {
      case 'sgoalcode':
        updateQuery.sgoalcode = sgoalcode;
        break;
    
      case 'sgoaltitle':
        updateQuery.sgoaltitle = sgoaltitle;
        break;
      case 'sgoaldescription':
        updateQuery.sgoaldescription = sgoaldescription;
        break;
      case 'sgoalduration':
        updateQuery.sgoalduration = sgoalduration;
        break;
      case 'enddate':
        updateQuery.enddate = enddate;
        break;
      case 'startdate':
        updateQuery.startdate = startdate;
        break;
      default:
        // Handle unknown tobeupdated value
        break;
    }
    db.StrategicGoal.update(updateQuery,{where:{sgoalid:sgoalid}}).then(sgs =>{
      if(sgs){
        db.StrategicGoal.findAll({where:{planid:planid}}).then(allsgs =>{
        res.render('addstrategicgoal',{success_msg:'You are successfully update  goal',allplans:existingplans,planid:planid,plan:plan,sgs:allsgs});
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
  
  });
router.post('/addnewstrategicdirection', ensureAuthenticated, async function(req, res) {
const{sdircode,sdirtitle,sdirdescription,sdirduration,enddate,startdate,sgoalid,planid} =req.body;
let errors =[];
const existingplans = await db.Plan.findAll({});
const sgoal = await db.StrategicGoal.findOne({where:{sgoalid:sgoalid}});
const sdir = await db.StrategicDirection.findAll({where:{sgoalid:sgoalid}});
if(!sdircode || !sdirdescription || !sdirduration || !sdirtitle || !startdate || !enddate || !sgoalid){
errors.push({mssg:'Please add all required fields',allplans:existingplans})
}
if(errors.length >0){
res.render('addstrategicdirection',{error_msg:'Please enter all required fields',allplans:existingplans,planid:planid,sdir:sdir,sgoal:sgoal,sgoalid:sgoalid});
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
    res.render('addstrategicdirection',{success_msg:'You are successfully create new strategic direction please add all the necessary attributes',planid:planid,allplans:existingplans,sdir:allsds,sgoal:sgoal,sgoalid:sgoalid});
    }).catch(err =>{
    res.render('addstrategicdirection',{error_msg:'Error while finding exsting updated strategic direction .' ,planid:planid,allplans:existingplans,sdir:sdir,sgoal:sgoal,sgoalid:sgoalid});
    })
  }else{
    res.render('addstrategicdirection',{error_msg:'Please enter new plan code. strategic direction code already exist.',planid:planid,allplans:existingplans,sdir:sdir,sgoal:sgoal,sgoalid:sgoalid});
  }
  }).catch(err =>{
  res.render('addstrategicdirection',{error_msg:'Error while creating new strategic direction.',planid:planid,allplans:existingplans,sdir:sdir,sgoal:sgoal,sgoalid:sgoalid});
  })
  }
}).catch(err =>{
  res.render('addstrategicdirection',{error_msg:'Error while finding existing strategic direction .',planid:planid,allplans:existingplans,sdir:sdir,sgoal:sgoal,sgoalid:sgoalid});
})

}

});

router.post('/editstrategicdirection', ensureAuthenticated, async function(req, res) {
  const{sdircode,sdirtitle,tobeupdated,sdirid,sdirdescription,sdirduration,enddate,startdate,sgoalid,planid} =req.body;
  let errors =[];
  const existingplans = await db.Plan.findAll({});
  const sgoal = await db.StrategicGoal.findOne({where:{sgoalid:sgoalid}});
  const sdir = await db.StrategicDirection.findAll({where:{sgoalid:sgoalid}});
  if(!tobeupdated || tobeupdated==0){
    errors.push({mssg:'Please add all required fields'})
  }
  if(!sgoalid || !tobeupdated || !sdirid){
  errors.push({mssg:'Please add all required fields'})
  }
  if(errors.length >0){
  res.render('addstrategicdirection',{error_msg:'Please enter all required fields',allplans:existingplans,planid:planid,sdir:sdir,sgoal:sgoal,sgoalid:sgoalid});
  }else{

  let updateQuery = {};

  // Set the appropriate field in the update query based on the selected option
  switch (tobeupdated) {
    case 'sdircode':
      updateQuery.sdircode = sdircode;
      break;
  
    case 'sdirtitle':
      updateQuery.sdirtitle = sdirtitle;
      break;
    case 'sdirdescription':
      updateQuery.sdirdescription = sdirdescription;
      break;
    case 'sdirduration':
      updateQuery.sdirduration = sdirduration;
      break;
    case 'enddate':
      updateQuery.enddate = enddate;
      break;
    case 'startdate':
      updateQuery.startdate = startdate;
      break;
    default:
      // Handle unknown tobeupdated value
      break;
  }
  console.log(updateQuery)
  console.log(sdirid)
  db.StrategicDirection.update(updateQuery,{
    where:{sdirid:sdirid}
  }).then(sds =>{
    if(sds){
      console.log(sds)
      db.StrategicDirection.findAll({where:{sgoalid:sgoalid}}).then(allsds =>{
      res.render('addstrategicdirection',{success_msg:'You are successfully update outcome',planid:planid,allplans:existingplans,sdir:allsds,sgoal:sgoal,sgoalid:sgoalid});
      }).catch(err =>{
      res.render('addstrategicdirection',{error_msg:'Error while finding exsting updated strategic direction .' ,planid:planid,allplans:existingplans,sdir:sdir,sgoal:sgoal,sgoalid:sgoalid});
      })
    }else{
      res.render('addstrategicdirection',{error_msg:'Please enter new plan code. strategic direction code already exist.',planid:planid,allplans:existingplans,sdir:sdir,sgoal:sgoal,sgoalid:sgoalid});
    }
    }).catch(err =>{
    res.render('addstrategicdirection',{error_msg:'Error while creating new strategic direction.',planid:planid,allplans:existingplans,sdir:sdir,sgoal:sgoal,sgoalid:sgoalid});
    })
  }
  
  });
router.post('/addnewmajoractivity', ensureAuthenticated, async function(req, res) {
  const{sdirid,mactcode,macttitle,mactdescription,mactduration,enddate,startdate,sgoalid,planid} =req.body;
  let errors =[];
  const existingplans = await db.Plan.findAll({});
  const sdirone = await db.StrategicDirection.findOne({where:{sdirid:sdirid}});
  const mact = await db.MajorActivity.findAll({where:{sdirid:sdirid}});
  const targetgrouplist  = await db.TargetGroup.findAll()
  if(!sdirid || !mactcode || !mactduration || !macttitle || !startdate || !enddate || !mactdescription){
  errors.push({mssg:'Please add all required fields'})
  }
  if(errors.length >0){
  res.render('addmajoractivity',{targetgrouplist:targetgrouplist,error_msg:'Please enter all required fields',sdir:sdirone,mact:mact,allplans:existingplans,planid:planid,sdirid:sdirid,sgoalid:sgoalid});
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
      res.render('addmajoractivity',{targetgrouplist:targetgrouplist,error_msg:'Please enter new major activity.code already exist.',allplans:existingplans,sdir:sdirone,mact:mact,sdirid:sdirid,planid:planid,sgoalid:sgoalid});
    }else{
    db.MajorActivity.create(newstrategicdirection).then(sds =>{
    if(sds){
      db.MajorActivity.findAll({where:{sdirid:sdirid}}).then(allmact =>{
      res.render('addmajoractivity',{targetgrouplist:targetgrouplist,success_msg:'You are successfully create new major activity.',allplans:existingplans,sdir:sdirone,mact:allmact,sdirid:sdirid,planid:planid,sgoalid:sgoalid});
      }).catch(err =>{
      res.render('addmajoractivity',{targetgrouplist:targetgrouplist,error_msg:'Error while finding exsting updated major activity.' ,allplans:existingplans,sdir:sdirone,mact:mact,sdirid:sdirid,planid:planid,sgoalid:sgoalid});
      })
    }else{
      res.render('addmajoractivity',{targetgrouplist:targetgrouplist,error_msg:'Please enter new major activity code. major activity code already exist.',allplans:existingplans,sdir:sdirone,mact:mact,sdirid:sdirid,planid:planid,sgoalid:sgoalid});
    }
    }).catch(err =>{
    res.render('addmajoractivity',{targetgrouplist:targetgrouplist,error_msg:'Error while creating new major activity.',allplans:existingplans,sdir:sdirone,mact:mact,sdirid:sdirid,planid:planid,sgoalid:sgoalid});
    })
    }
  }).catch(err =>{
    res.render('addmajoractivity',{targetgrouplist:targetgrouplist,error_msg:'Error while finding existing major activity.',allplans:existingplans,sdir:sdirone,mact:mact,sdirid:sdirid,planid:planid,sgoalid:sgoalid});
  })
  
  }
  
  });
router.post('/editmajoractivity', ensureAuthenticated, async function(req, res) {
    const{sdirid,mactcode,tobeupdated,mactivityid,macttitle,mactdescription,mactduration,enddate,startdate,sgoalid,planid} =req.body;
    let errors =[];
    const existingplans = await db.Plan.findAll({});
    const sdirone = await db.StrategicDirection.findOne({where:{sdirid:sdirid}});
    const mact = await db.MajorActivity.findAll({where:{sdirid:sdirid}});
    const targetgrouplist  = await db.TargetGroup.findAll()
    if(!tobeupdated || tobeupdated==0){
      errors.push({mssg:'Please add all required fields'})
    }
    if(!mactivityid || !tobeupdated || !sdirid){
    errors.push({mssg:'Please add all required fields'})
    }
    if(errors.length >0){
    res.render('addmajoractivity',{targetgrouplist:targetgrouplist,error_msg:'Please enter all required fields',sdir:sdirone,mact:mact,allplans:existingplans,planid:planid,sdirid:sdirid,sgoalid:sgoalid});
    }else{
      let updateQuery = {};

      // Set the appropriate field in the update query based on the selected option
      switch (tobeupdated) {
        case 'mactcode':
          updateQuery.mactivitycode = mactcode;
          break;
      
        case 'macttitle':
          updateQuery.mactivitytitle = macttitle;
          break;
        case 'mactdescription':
          updateQuery.mactivitydescription = mactdescription;
          break;
        case 'mactduration':
          updateQuery.mactivityduration = mactduration;
          break;
        case 'enddate':
          updateQuery.enddate = enddate;
          break;
        case 'startdate':
          updateQuery.startdate = startdate;
          break;
        default:
          // Handle unknown tobeupdated value
          break;
      }
      db.MajorActivity.update(updateQuery,{   where: {
        mactivityid: mactivityid
      }}).then(sds =>{
        if(sds){
          db.MajorActivity.findAll({where:{sdirid:sdirid}}).then(allmact =>{
          res.render('addmajoractivity',{targetgrouplist:targetgrouplist,success_msg:'You are successfully update  Output.',allplans:existingplans,sdir:sdirone,mact:allmact,sdirid:sdirid,planid:planid,sgoalid:sgoalid});
          }).catch(err =>{
          res.render('addmajoractivity',{targetgrouplist:targetgrouplist,error_msg:'Error while finding exsting updated major activity.' ,allplans:existingplans,sdir:sdirone,mact:mact,sdirid:sdirid,planid:planid,sgoalid:sgoalid});
          })
        }else{
          res.render('addmajoractivity',{targetgrouplist:targetgrouplist,error_msg:'Please enter new major activity code. major activity code already exist.',allplans:existingplans,sdir:sdirone,mact:mact,sdirid:sdirid,planid:planid,sgoalid:sgoalid});
        }
        }).catch(err =>{
        res.render('addmajoractivity',{targetgrouplist:targetgrouplist,error_msg:'Error while creating new major activity.',allplans:existingplans,sdir:sdirone,mact:mact,sdirid:sdirid,planid:planid,sgoalid:sgoalid});
        })
    
    }
    
    });
router.post('/addnewdetailactivity', ensureAuthenticated, async function(req, res) {
    const{mactivityid,dactcode,dactivityrisks,dacttitle,dactdescription,dactduration,enddate,startdate,planid,sdirid} =req.body;
    let errors =[];
    const existingplans = await db.Plan.findAll({});
    const mactone = await db.MajorActivity.findOne({where:{mactivityid:mactivityid}});
    const dact = await db.DetailActivity.findAll({where:{mactivityid:mactivityid}});
    const dept = await db.TargetGroup.findAll({});
    const targetgrouplist = await db.TargetGroup.findAll();
    const activityindicator = await db.ActivityIndicator.findAll({})
    if(!mactivityid || !dactcode || !dactduration || !dactdescription || !startdate || !enddate || !dacttitle){
    errors.push({mssg:'Please add all required fields'})
    }
    if(errors.length >0){
    res.render('adddetailactivity',{activityindicator:activityindicator,dept:dept,targetgrouplist:targetgrouplist,error_msg:'Please enter all required fields',dact:dact,mact:mactone,allplans:existingplans,mactivityid:mactivityid,planid:planid,sdirid:sdirid});
    }else{
    
    const uuid = uuidv4();
    const newdetailactivity ={
      dactivityid:uuid,
      
      mactivityid:mactivityid,
      dactivitytitle:dacttitle,
      dactivitydescription:dactdescription,
      dactivityduration:dactduration,
      dactivitycode: dactcode,
      dactivityrisks:dactivityrisks,
      startdate:new Date(startdate),
      enddate:new Date(enddate),
    }
    db.DetailActivity.findOne({where:{dactivitycode:dactcode}}).then(sd=>{
      if(sd){
        res.render('adddetailactivity',{activityindicator:activityindicator,dept:dept,targetgrouplist:targetgrouplist,error_msg:'Please enter new detail activity.code already exist.',planid:planid,sdirid:sdirid,dact:dact,mact:mactone,allplans:existingplans,mactivityid:mactivityid});
      }else{
      db.DetailActivity.create(newdetailactivity).then(dacts =>{
      if(dacts){
        db.DetailActivity.findAll({where:{mactivityid:mactivityid}}).then(alldact =>{
        res.render('adddetailactivity',{activityindicator:activityindicator,dept:dept,targetgrouplist:targetgrouplist,success_msg:'You are successfully create new detail activity please add all the necessary attributes',planid:planid,sdirid:sdirid,dact:alldact,mact:mactone,allplans:existingplans,mactivityid:mactivityid});
        }).catch(err =>{
        res.render('adddetailactivity',{activityindicator:activityindicator,dept:dept,targetgrouplist:targetgrouplist,error_msg:'Error while finding exsting updated detail activity.' ,planid:planid,sdirid:sdirid,dact:dact,mact:mactone,allplans:existingplans,mactivityid:mactivityid});
        })
      }else{
        res.render('adddetailactivity',{activityindicator:activityindicator,dept:dept,targetgrouplist:targetgrouplist,error_msg:'Please enter new detail activity code. detail activity code already exist.',planid:planid,sdirid:sdirid,dact:dact,mact:mactone,allplans:existingplans,mactivityid:mactivityid});
      }
      }).catch(err =>{
      res.render('adddetailactivity',{activityindicator:activityindicator,dept:dept,targetgrouplist:targetgrouplist,error_msg:'Error while creating new detail activity.',planid:planid,sdirid:sdirid,dact:dact,mact:mactone,allplans:existingplans,mactivityid:mactivityid});
      })
      }
    }).catch(err =>{
      res.render('adddetailactivity',{activityindicator:activityindicator,dept:dept,targetgrouplist:targetgrouplist,error_msg:'Error while finding existing detail activity.',planid:planid,sdirid:sdirid,dact:dact,mact:mactone,allplans:existingplans,mactivityid:mactivityid});
    })
    
    }
    
    });
 router.post('/editdetailactivity', ensureAuthenticated, async function(req, res) {
      const{mactivityid,dactivityid,tobeupdated,dactcode,dactivityrisks,dacttitle,dactdescription,dactduration,enddate,startdate,planid,sdirid} =req.body;
      let errors =[];
      const existingplans = await db.Plan.findAll({});
      const mactone = await db.MajorActivity.findOne({where:{mactivityid:mactivityid}});
      const dact = await db.DetailActivity.findAll({where:{mactivityid:mactivityid}});
      const dept = await db.TargetGroup.findAll({});
      const targetgrouplist = await db.TargetGroup.findAll();
      const activityindicator = await db.ActivityIndicator.findAll({})
      if(!tobeupdated || tobeupdated==0){
        errors.push({mssg:'Please add all required fields'})
      }
      if(!mactivityid || !tobeupdated || !dactivityid){
      errors.push({mssg:'Please add all required fields'})
      }
      if(errors.length >0){
      res.render('adddetailactivity',{activityindicator:activityindicator,dept:dept,targetgrouplist:targetgrouplist,error_msg:'Please enter all required fields',dact:dact,mact:mactone,allplans:existingplans,mactivityid:mactivityid,planid:planid,sdirid:sdirid});
      }else{
        let updateQuery = {};

        // Set the appropriate field in the update query based on the selected option
        switch (tobeupdated) {
          case 'dactcode':
            updateQuery.dactivitycode = dactcode;
            break;
          case 'dactivityrisks':
            updateQuery.dactivityrisks = dactivityrisks;
            break;
          case 'dacttitle':
            updateQuery.dactivitytitle = dacttitle;
            break;
          case 'dactdescription':
            updateQuery.dactivitydescription = dactdescription;
            break;
          case 'dactduration':
            updateQuery.dactivityduration = dactduration;
            break;
          case 'enddate':
            updateQuery.enddate = enddate;
            break;
          case 'startdate':
            updateQuery.startdate = startdate;
            break;
          default:
            // Handle unknown tobeupdated value
            break;
        }
    
       console.log(updateQuery)
        db.DetailActivity.update(updateQuery, {
          where: {
            dactivityid: dactivityid
          }
        }).then(dacts =>{
          if(dacts){
            console.log(dacts)
            db.DetailActivity.findAll({where:{mactivityid:mactivityid}}).then(alldact =>{
            res.render('adddetailactivity',{activityindicator:activityindicator,dept:dept,targetgrouplist:targetgrouplist,success_msg:'You are successfully update activity please add all the necessary attributes',planid:planid,sdirid:sdirid,dact:alldact,mact:mactone,allplans:existingplans,mactivityid:mactivityid});
            }).catch(err =>{
            res.render('adddetailactivity',{activityindicator:activityindicator,dept:dept,targetgrouplist:targetgrouplist,error_msg:'Error while finding exsting updated detail activity.' ,planid:planid,sdirid:sdirid,dact:dact,mact:mactone,allplans:existingplans,mactivityid:mactivityid});
            })
          }else{
            res.render('adddetailactivity',{activityindicator:activityindicator,dept:dept,targetgrouplist:targetgrouplist,error_msg:'Please enter new detail activity code. detail activity code already exist.',planid:planid,sdirid:sdirid,dact:dact,mact:mactone,allplans:existingplans,mactivityid:mactivityid});
          }
          }).catch(err =>{
          res.render('adddetailactivity',{activityindicator:activityindicator,dept:dept,targetgrouplist:targetgrouplist,error_msg:'Error while creating new detail activity.',planid:planid,sdirid:sdirid,dact:dact,mact:mactone,allplans:existingplans,mactivityid:mactivityid});
          })
      }
      
      });
router.post('/viewmajoractivitykpi/(:mactivityid)',ensureAuthenticated, async function (req,res){
  const{planid} =req.body;
  const existingplans = await db.Plan.findAll({});
  const mactone = await db.MajorActivity.findOne({where:{mactivityid:req.params.mactivityid}});
  const plan = await db.Plan.findOne({where:{planid:planid}});
  const targetgrouplist = await db.TargetGroup.findAll({});
  const alldact = await db.DetailActivity.findAll({where:{mactivityid:req.params.mactivityid}});
  const [mactbudget,mabm] = await db.sequelize.query(`
  SELECT sum(budget) as budget,MajorActivities.mactivityid from MajorActivities 
inner join DetailActivityKPIs on DetailActivityKPIs.mactivityid =MajorActivities.mactivityid
where MajorActivities.mactivityid = '${req.params.mactivityid}'
group by MajorActivities.mactivityid
  `)
  const [mkpi,mkpimeta] =await db.sequelize.query(`
  SELECT MajorActivityKPIs.*,DetailActivities.dactivitytitle from MajorActivities 
inner join MajorActivityKPIs on MajorActivityKPIs.mactivityid =MajorActivities.mactivityid
inner join DetailActivities on DetailActivities.mactivityid =MajorActivities.mactivityid
where MajorActivities.mactivityid = '${req.params.mactivityid}'
  `)
  db.MajorActivityKPI.findAll({where:{mactivityid:req.params.mactivityid}}).then(mkpisds =>{
    console.log(mkpi)
    res.render('majoractivitykpi',{budgetsummery:mactbudget[0].budget,targetgrouplist:targetgrouplist,alldact:alldact,mkpi:mkpi,allplans:existingplans,mactone:mactone,plan:plan})

  }).catch(err =>{
    console.log(err)
    res.render('majoractivitykpi',{budgetsummery:mactbudget[0].budget,targetgrouplist:targetgrouplist,alldact:alldact,mkpi:'',allplans:existingplans,mactone:mactone,plan:plan})
  })

})
router.post('/deletemajoractivitykpi/(:mactivityid)',ensureAuthenticated, async function (req,res){
  const{planid,mactkpiid} =req.body;
  const existingplans = await db.Plan.findAll({});
  const mactone = await db.MajorActivity.findOne({where:{mactivityid:req.params.mactivityid}});
  const plan = await db.Plan.findOne({where:{planid:planid}});
  const targetgrouplist = await db.TargetGroup.findAll({});
  const alldact = await db.DetailActivity.findAll({where:{mactivityid:req.params.mactivityid}});
  const [mactbudget,mabm] = await db.sequelize.query(`
  SELECT sum(budget) as budget,majoractivities.mactivityid from majoractivities 
inner join detailactivitykpis on detailactivitykpis.mactivityid =majoractivities.mactivityid
where majoractivities.mactivityid = '${req.params.mactivityid}'
group by majoractivities.mactivityid
  `)
  const [mkpi,mkpimeta] =await db.sequelize.query(`
  SELECT majoractivitykpis.*,detailactivities.dactivitytitle from majoractivities 
inner join majoractivitykpis on majoractivitykpis.mactivityid =majoractivities.mactivityid
inner join detailactivities on detailactivities.mactivityid =majoractivities.mactivityid
where majoractivities.mactivityid = '${req.params.mactivityid}'
  `)
 const deletekpi = await db.MajorActivityKPI.destroy({where:{id:mactkpiid}});
 if(deletekpi){
  const [mkpin,mkpimeta] =await db.sequelize.query(`
  SELECT majoractivitykpis.*,detailactivities.dactivitytitle from majoractivities 
inner join majoractivitykpis on majoractivitykpis.mactivityid =majoractivities.mactivityid
inner join detailactivities on detailactivities.mactivityid =majoractivities.mactivityid
where majoractivities.mactivityid = '${req.params.mactivityid}'
  `)
  res.render('majoractivitykpi',{
    success_msg:'Major activity KPI deleted successfully',
    budgetsummery:mactbudget[0].budget,targetgrouplist:targetgrouplist,alldact:alldact,mkpi:mkpin,
    allplans:existingplans,mactone:mactone,plan:plan})

 }else{
  res.render('majoractivitykpi',{
    error_msg:'Error while deleting major activity KPI',
    budgetsummery:mactbudget[0].budget,targetgrouplist:targetgrouplist,alldact:alldact,mkpi:mkpi,
    allplans:existingplans,mactone:mactone,plan:plan})

 }

})
router.post('/viewdetailactivitykpi/(:dactivityid)',ensureAuthenticated, async function (req,res){
  const{planid,mactivityid} =req.body;
  const existingplans = await db.Plan.findAll({});
  const dactone = await db.DetailActivity.findOne({where:{dactivityid:req.params.dactivityid}});
  const targetgrouplist = await db.TargetGroup.findAll({});
  const dept = await db.TargetGroup.findAll({})
  const plan = await db.Plan.findOne({});
  const activityindicator = await db.ActivityIndicator.findAll({});
  const allmact = await db.MajorActivity.findAll({where:{mactivityid:mactivityid}});
  const [budgetsummery,bsm] = await db.sequelize.query(`
  SELECT sum(budget) as budget from DetailActivityKPIs
where dactivityid='${req.params.dactivityid}'
  `)
  db.DetailActivityKPI.findAll({where:{dactivityid:req.params.dactivityid}}).then(dkpi =>{
   
    res.render('detailactivitykpi',{activityindicator:activityindicator,planid:planid,budgetsummery:budgetsummery[0].budget,dept:dept,targetgrouplist:targetgrouplist,allmact:allmact,dkpi:dkpi,allplans:existingplans,dactone:dactone,plan:plan})

  }).catch(err =>{
    res.render('detailactivitykpi',{activityindicator:activityindicator,planid:planid,budgetsummery:budgetsummery[0].budget,dept:dept,targetgrouplist:targetgrouplist,allmact:allmact,dkpi:'',allplans:existingplans,dactone:dactone,plan:plan})
  })
})
router.post('/downloaddetailplan',ensureAuthenticated,async function(req,res){
 const {planid,dactivityid,reporttype ,reportby,target ,reporttypeinput,department,departmentname} =req.body;
 const plan = await db.Plan.findOne({where:{planid:planid}});

// const progressreport  = await db.ProgressReport.findAll({where:{dactivityid:dactivityid}});
var rptqry ;

if(reporttype && reporttypeinput){
 rptqry = "select * from ProgressReports "+
 " inner join TargetGroups on ProgressReports.dacttgroupid = TargetGroups.targetgid "+
 " where  dactivityid ='"+dactivityid+"' and reporttype ='"+reporttype+"'  and reportmnthquarter ='"+reporttypeinput+"'  " 
 
}else if(target){
  rptqry = "select * from ProgressReports "+
  " inner join TargetGroups on ProgressReports.dacttgroupid = TargetGroups.targetgid "+
  " where  dactivityid ='"+dactivityid+"' and dacttgroupid ='"+target+"'  "
}else if(department){
  rptqry = "select * from ProgressReports "+
  " inner join TargetGroups on ProgressReports.dacttgroupid = TargetGroups.targetgid "+
  " inner join Occupations on Occupations.occupationid = TargetGroups.occupation_id "+
  " inner join Departments on Departments.departmentid = Occupations.departmentid "+
 
  " where  dactivityid ='"+dactivityid+"' and Departments.departmentid ='"+department+"'  "
}else if(reportby){
  rptqry = "select * from ProgressReports "+
  " inner join TargetGroups on ProgressReports.dacttgroupid = TargetGroups.targetgid "+
  
  " where  dactivityid ='"+dactivityid+"' and ProgressReports.dacttgroupid ='"+reportby+"'  "
}
else{
  rptqry = "select * from ProgressReports "+
  " inner join TargetGroups on ProgressReports.dacttgroupid = TargetGroups.targetgid "+
  " where  dactivityid ='"+dactivityid+"' "
}
 const [progressreport,progressmetta] =   await db.sequelize.query(rptqry);
console.log(reportby);
console.log(dactivityid);
console.log(progressreport)
var goal,sdir,mact,dact;
if(plan){
  goal = await db.StrategicGoal.findOne({where:{planid:planid}}).catch(err =>{
    console.log(err)
  })
}
if(goal){
  sdir = await db.StrategicDirection.findOne({where:{sgoalid:goal.sgoalid}}).catch(err =>{
   console.log(err)
  })
}if(sdir){
  mact = await db.MajorActivity.findOne({where:{sdirid:sdir.sdirid}}).catch(err =>{
   console.log(err)
  })
}
if(mact){
  dact = await db.DetailActivity.findOne({where:{mactivityid:mact.mactivityid}}).catch(err =>{
   console.log(err)
  })
}
if(!goal || !sdir || !mact ||!dact){
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
}else{
  const plan2 = await db.Plan.findAll({where:{planid:planid}});
  const goal2 = await db.StrategicGoal.findAll({where:{planid:planid}});
  const sdir2 = await db.StrategicDirection.findAll({where:{sgoalid:goal.sgoalid}});
  const mact2 = await db.MajorActivity.findAll({where:{sdirid:sdir.sdirid}});
  const dact2 = await db.DetailActivity.findAll({where:{mactivityid:mact.mactivityid}});
  try {
    const templatePath = path.join(__dirname,'../public/template/ProgressReport.docx');
    //download the template
   const content = await readFile(templatePath);
    //const content = fs.readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {nullGetter() { return ''; }});
    const detailactivity = await db.DetailActivity.findAll({ where: { dactivityid: dactivityid } });

    if (detailactivity.length === 0) {
      // Handle the case where no detail activity is found
      console.error('No detail activity found for the specified ID.');
      // You might want to return or throw an error, depending on your use case
    }
    
    const mactivityid = detailactivity[0].mactivityid;
    
    const macttoplan = await db.MajorActivity.findAll({ where: { mactivityid } });
    const mappedMacttoplan = macttoplan.map((row, index) => mapMajorActivity(row, index));
    
    const mappedDacttoplan = detailactivity.map((row, index) => mapDetailActivity(row, index));
    
    function mapMajorActivity(row, index) {
      return {
        id: index + 1,
        mactivitytitle: row.mactivitytitle,
        mactivitydescription: row.mactivitydescription,
        mactivitycode: row.mactivitycode,
        mactivityduration: row.mactivityduration,
        mactivitytargetgroup: row.mactivitytargetgroup,
        mactivitykpi: row.mactivitykpi,
        mactivityrisks: row.mactivityrisks,
        enddate: new Date(row.enddate).toLocaleDateString(),
        startdate: new Date(row.startdate).toLocaleDateString(),
      };
    }
    
    function mapDetailActivity(row, index) {
      return {
        id: index + 1,
        dactivitytitle: row.dactivitytitle,
        dactivitydescription: row.dactivitydescription,
        dactivitycode: row.dactivitycode,
        dactivityduration: row.dactivityduration,
        dacttindicator: row.dacttindicator,
        dactivityrisks: row.dactivityrisks,
        enddate: new Date(row.enddate).toLocaleDateString(),
        startdate: new Date(row.startdate).toLocaleDateString(),
      };
    }
     db.Plan.findAll({ where: { planid:planid } })
.then(plan => {
 const users = plan.map((row,index) => ({
    
  id: index+1,
  plantitle: row.plantitle,
  plancode: row.plancode,
  planduration:row.planduration,
  enddate:new Date(row.enddate).toLocaleDateString(),
  startdate:new Date(row.startdate).toLocaleDateString(),
  plandescription:row.plandescription
  }));
 
doc.setData({users:users,
  plan:users,
  majoractivity:mappedMacttoplan,
  progressreport:progressreport,
  detailactivity:mappedDacttoplan,
  reporttype:reporttype,
  department:departmentname,
  reporttypeinput:reporttypeinput,
noofpass:users.length,

});

doc.render();

const buffer = doc.getZip().generate({ type: 'nodebuffer' });

//download
res.set({
'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
'Content-Disposition': 'inline; filename="PlanDetail.docx"',
'Content-Length': buffer.length
});

res.send(buffer);
})
.catch(error => {
  console.error(error);
});
   
       
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating document');
  }
}
  })
  router.post('/downloadfinalreport',ensureAuthenticated,async function(req,res){
    const {planid,dactivityid} =req.body;
    const plan = await db.Plan.findOne({where:{planid:planid}});
   
   var goal,sdir,mact,dact;
   if(plan){
     goal = await db.StrategicGoal.findOne({where:{planid:planid}}).catch(err =>{
       console.log(err)
     })
   }
   if(goal){
     sdir = await db.StrategicDirection.findOne({where:{sgoalid:goal.sgoalid}}).catch(err =>{
      console.log(err)
     })
   }if(sdir){
     mact = await db.MajorActivity.findOne({where:{sdirid:sdir.sdirid}}).catch(err =>{
      console.log(err)
     })
   }
   if(mact){
     dact = await db.DetailActivity.findOne({where:{mactivityid:mact.mactivityid}}).catch(err =>{
      console.log(err)
     })
   }
   if(!goal || !sdir || !mact ||!dact){
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
   }else{
     
     try {
       const templatePath = path.join(__dirname,'../public/template/FinalReport.docx');
       //download the template
      const content = await readFile(templatePath);
       //const content = fs.readFileSync(templatePath, 'binary');
       const zip = new PizZip(content);
       const doc = new Docxtemplater(zip, {nullGetter() { return ''; }});
       const [finalrpt,progressmetta] =   await db.sequelize.query(
        "select * from FinalReports "+
        " inner join TargetGroups on FinalReports.dacttgroupid = TargetGroups.targetgid "+
        " where  dactivityid ='"+dactivityid+"' "
        );
     
        db.Plan.findAll({ where: { planid:planid } })
   .then(plan => {
    const users = plan.map((row,index) => ({
       
       id: index+1,
       plantitle: row.plantitle,
       plancode: row.plancode,
       planduration:row.planduration,
       enddate:new Date(row.enddate).toLocaleDateString(),
       startdate:new Date(row.startdate).toLocaleDateString(),
       plandescription:row.plandescription
     }));
   doc.setData({users:users,
     plan:users,
     progressreport:finalrpt,
     detailactivity:dact,
     majoractivity:mact,
     reporttype:'Final Report',
    
   noofpass:users.length,
   
   });
   
   doc.render();
   
   const buffer = doc.getZip().generate({ type: 'nodebuffer' });
   
   //download
   res.set({
   'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
   'Content-Disposition': 'inline; filename="PlanDetail.docx"',
   'Content-Length': buffer.length
   });
   
   res.send(buffer);
   })
   .catch(error => {
     console.error(error);
   });
      
          
     } catch (error) {
       console.error(error);
       res.status(500).send('Error generating document');
     }
   }
     })
router.post('/deletestrategicdirection/(:sdirid)',ensureAuthenticated,async function(req,res){
  const {sgoalid,planid} =req.body;
  const existingplans = await db.Plan.findAll({});
const sgoal = await db.StrategicGoal.findOne({where:{sgoalid:sgoalid}});
const sdir = await db.StrategicDirection.findAll({where:{sgoalid:sgoalid}});
db.StrategicDirection.destroy({where:{sdirid:req.params.sdirid}}).then(dsd =>{
  db.StrategicDirection.findAll({where:{sgoalid:sgoalid}}).then(newsd =>{
    res.render('addstrategicdirection',{success_msg:'Successfully Deleted !',planid:planid,allplans:existingplans,sdir:newsd,sgoal:sgoal,sgoalid:sgoalid});
  }).catch(err =>{
    res.render('addstrategicdirection',{allplans:existingplans,sdir:sdir,sgoal:sgoal,planid:planid,sgoalid:sgoalid});
  })
}).catch(err =>{
  res.render('addstrategicdirection',{error_msg:'Cant Delete Try Again !',planid:planid,allplans:existingplans,sdir:sdir,sgoal:sgoal,sgoalid:sgoalid});
})
  
})
router.post('/deleteplan/(:planid)',ensureAuthenticated,async function(req,res){

db.Plan.destroy({where:{planid:req.params.planid}}).then(dsd =>{
  db.Plan.findAll({}).then(newplanlst =>{
    
res.render('addnewannualplan',{success_msg:'Successfully Deleted !',allplans:newplanlst});
  }).catch(err =>{
  
    res.render('addnewannualplan',{allplans:existingplans});
    })
}).catch(err =>{
  
res.render('addnewannualplan',{error_msg:'Cant Delete Try Again !',allplans:existingplans});
})

})
router.post('/deletestrategicgoal/(:sgoalid)', ensureAuthenticated, async function(req, res) {
  const{planid} =req.body;
  const existingplans = await db.Plan.findAll({});
  const thisplan = await db.Plan.findOne({where:{planid:planid}});
  const sgs = await db.StrategicGoal.findAll({where:{planid:planid}});
 
  
db.StrategicGoal.destroy({where:{sgoalid:req.params.sgoalid}}).then(dsd =>{
  db.StrategicGoal.findAll({where:{planid:planid}}).then(newsg =>{
    res.render('addstrategicgoal',{success_msg:'Successfully Deleted !',allplans:existingplans,sgs:newsg,plan:thisplan,planid:planid});
   
  }).catch(err =>{
    res.render('addstrategicgoal',{error_msg:'Cant Delete Try Again !',allplans:existingplans,sgs:sgs,plan:thisplan,planid:planid});
   
    })
}).catch(err =>{
  
  res.render('addstrategicgoal',{error_msg:'Cant Delete Try Again !',allplans:existingplans,sgs:sgs,plan:thisplan,planid:planid});
   
})
})
router.post('/deletedetailactivity/(:dactivityid)',ensureAuthenticated,async function(req,res){
  const {sgoalid,mactivityid,sdirid,planid} =req.body;
  const sdir = await db.StrategicDirection.findAll({where:{sdirid:sdirid}});
  const mact2 = await db.MajorActivity.findOne({where:{mactivityid:mactivityid}});
  const existingplans = await db.Plan.findAll({})
  const activityindicator = await db.ActivityIndicator.findAll({});
  const targetgrouplist  = await db.TargetGroup.findAll()
db.DetailActivity.destroy({where:{dactivityid:req.params.dactivityid}}).then(dsd =>{
  db.DetailActivity.findAll({where:{mactivityid:mactivityid}}).then(dact =>{
    res.render('adddetailactivity',{activityindicator:activityindicator,targetgrouplist:targetgrouplist,success_msg:'Successfully Deleted!',allplans:existingplans,sgoalid:sgoalid,planid:planid,sdirid:sdirid,dact:dact,mact:mact2,mactivityid:mactivityid});
  
  }).catch(err =>{
    res.render('adddetailactivity',{activityindicator:activityindicator,targetgrouplist:targetgrouplist,error_msg:'Cant Delete Try Again ! ',allplans:existingplans,sgoalid:sgoalid,planid:planid,sdirid:sdirid,dact:dact,mact:mact2,mactivityid:mactivityid});
  
  })
}).catch(err =>{
  res.render('adddetailactivity',{activityindicator:activityindicator,targetgrouplist:targetgrouplist,error_msg:'Cant Delete Try Again ! ',allplans:existingplans,sgoalid:sgoalid,planid:planid,sdirid:sdirid,dact:dact,mact:mact2,mactivityid:mactivityid});
  
})
  
})

router.post('/deletemajoractivity/(:mactivityid)',ensureAuthenticated,async function(req,res){
  const {sgoalid,sdirid,planid} =req.body;
  
const sdir = await db.StrategicDirection.findOne({where:{sdirid:sdirid}});
const currentdirection = await db.StrategicDirection.findAll({where:{sgoalid:sgoalid}});
const sgoal = await db.StrategicGoal.findOne({where:{sgoalid:sgoalid}});
const existingplans = await db.Plan.findAll({})
const mact = await db.MajorActivity.findAll({})
const targetgrouplist = await db.TargetGroup.findAll();
db.MajorActivity.destroy({where:{mactivityid:req.params.mactivityid}}).then(dsd =>{
  db.MajorActivity.findAll({where:{sdirid:sdirid}}).then(newsd =>{
    res.render('addmajoractivity',{success_msg:'Successfully Deleted!',targetgrouplist:targetgrouplist,allplans:existingplans,mact:newsd,sdir:sdir,planid:planid,sdirid:sdirid,sgoalid:sgoalid,});
  }).catch(err =>{
    res.render('addmajoractivity',{error_msg:'Cant Delete Try Again !',targetgrouplist:targetgrouplist,allplans:existingplans,mact:mact,sdir:sdir,planid:planid,sdirid:sdirid,sgoalid:sgoalid,});
  })
}).catch(err =>{
  console.log(err)
  res.render('addmajoractivity',{error_msg:'Cant Delete Try Again !',targetgrouplist:targetgrouplist,allplans:existingplans,mact:mact,sdir:sdir,planid:planid,sdirid:sdirid,sgoalid:sgoalid,});
  
})
  
})
router.post('/deletedetailactivitykpi/(:id)',ensureAuthenticated, async function (req,res){
  const{planid,mactivityid,dactivityid} =req.body;
  const existingplans = await db.Plan.findAll({});
  const dactone = await db.DetailActivity.findOne({where:{dactivityid:dactivityid}});
  const targetgrouplist = await db.TargetGroup.findAll({});
  const dept = await db.TargetGroup.findAll({})
  const plan = await db.Plan.findOne({});
  const allmact = await db.MajorActivity.findAll({where:{mactivityid:mactivityid}});
  const activityindicator =  await db.ActivityIndicator.findAll({});
  const [budgetsummery,bsm] = await db.sequelize.query(`
  SELECT sum(budget) as budget from DetailActivityKPIs
where dactivityid='${dactivityid}'
  `)
  console.log(dactivityid)
  console.log(req.body)
 const deltval = await  db.DetailActivityKPI.destroy({where:{id:req.params.id,dactivityid:dactivityid}});

 if(deltval){
  db.DetailActivityKPI.findAll({where:{dactivityid:dactivityid}}).then(dkpi =>{
    if(dkpi){
 
    }
     res.render('detailactivitykpi',{activityindicator:activityindicator,planid:planid,budgetsummery:budgetsummery[0].budget,dept:dept,targetgrouplist:targetgrouplist,allmact:allmact,dkpi:dkpi,allplans:existingplans,dactone:dactone,plan:plan})
 
   }).catch(err =>{
     res.render('detailactivitykpi',{activityindicator:activityindicator,planid:planid,budgetsummery:budgetsummery[0].budget,dept:dept,targetgrouplist:targetgrouplist,allmact:allmact,dkpi:'',allplans:existingplans,dactone:dactone,plan:plan})
   })
 }

})
module.exports = router;