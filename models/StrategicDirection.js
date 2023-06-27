module.exports = (sequelize, DataTypes) => {

    const StrategicDirection = sequelize.define("StrategicDirection", {
      sdirid: {
        type: DataTypes.STRING,
     
      },
      sgoalid: {
        type: DataTypes.STRING,
     
      },
  sdirtitle: {
    type: DataTypes.STRING,
 
  },
  sdirdescription: {
    type: DataTypes.STRING,
 
  },
  sdircode: {
    type: DataTypes.STRING,
 
  },
  sdirrisks: {
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
  sdirduration: {
    type: DataTypes.DECIMAL,
 
  },
  sdirtargetgroup: {
    type: DataTypes.JSON,
 
  },
  sdirkpi: {
    type: DataTypes.JSON,
 
  },
})
    return StrategicDirection;
};


