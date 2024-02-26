module.exports = (sequelize, DataTypes) => {

    const Plan = sequelize.define("Plan", {
      planid: {
        type: DataTypes.STRING,
     
      },
  plantitle: {
    type: DataTypes.STRING,
 
  },
  plandescription: {
    type: DataTypes.TEXT('long'),
 
  },
  plancode: {
    type: DataTypes.STRING,
 
  },
  planduration: {
    type: DataTypes.DECIMAL,
 
  },
  startdate: {
    type: DataTypes.DATE,
 
  },
  enddate: {
    type: DataTypes.DATE,
 
  },
  createdby: {
    type: DataTypes.STRING,
 
  },
  iscurrent: {
    type: DataTypes.STRING,
 
  },
  
})
    return Plan;
};


