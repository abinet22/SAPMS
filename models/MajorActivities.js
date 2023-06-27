module.exports = (sequelize, DataTypes) => {

    const MajorActivity = sequelize.define("MajorActivity", {
      mactivityid: {
        type: DataTypes.STRING,
     
      },
      sdirid: {
        type: DataTypes.STRING,
     
      },
      mactivitytitle: {
    type: DataTypes.STRING,
 
  },
  mactivitydescription: {
    type: DataTypes.STRING,
 
  },
  mactivitycode: {
    type: DataTypes.STRING,
 
  },
  mactivityrisks: {
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
  mactivityduration: {
    type: DataTypes.DECIMAL,
 
  },
  mactivitytargetgroup: {
    type: DataTypes.JSON,
 
  },
  mactivitykpi: {
    type: DataTypes.JSON,
 
  },
})
    return MajorActivity;
};


