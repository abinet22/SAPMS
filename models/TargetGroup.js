module.exports = (sequelize, DataTypes) => {

    const TargetGroup = sequelize.define("TargetGroup", {
        targetgid: {
        type: DataTypes.STRING,
     
      },
      targetgroupname: {
    type: DataTypes.STRING,
 
  },
  grouptype:{
    type: DataTypes.STRING
  },
  username: {
    type: DataTypes.STRING
  },
  password: {
    type: DataTypes.STRING
  },
  user_roll: {
    type: DataTypes.STRING
  },
  is_active: {
    type: DataTypes.STRING
  },
  department_id: {
    type: DataTypes.STRING
  },
  occupation_id: {
    type: DataTypes.STRING
  },
 
  
})
    return TargetGroup;
};


