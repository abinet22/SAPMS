module.exports = (sequelize, DataTypes) => {

    const StrategicGoal = sequelize.define("StrategicGoal", {
      sgoalid: {
        type: DataTypes.STRING,
     
      },
      planid: {
        type: DataTypes.STRING,
     
      },
  sgoaltitle: {
    type: DataTypes.STRING,
 
  },
  sgoaldescription: {
    type: DataTypes.TEXT('long'),
 
  },
  sgoalcode: {
    type: DataTypes.STRING,
 
  },
  sgoalrisks: {
    type: DataTypes.STRING,
 
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
  sgoalduration: {
    type: DataTypes.DECIMAL,
 
  },
  sgoaltargetgroup: {
    type: DataTypes.JSON,
 
  },
  sgoalkpi: {
    type: DataTypes.JSON,
 
  },
})
    return StrategicGoal;
};


