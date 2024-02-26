module.exports = (sequelize, DataTypes) => {

    const DetailActivity = sequelize.define("DetailActivity", {
      dactivityid: {
        type: DataTypes.STRING,
     
      },
      mactivityid: {
        type: DataTypes.STRING,
     
      },
      dactivitytitle: {
    type: DataTypes.STRING,
 
  },
  dactivitydescription: {
    type: DataTypes.TEXT('long'),
 
  },
  dactivitycode: {
    type: DataTypes.STRING,
 
  },
  dactivityrisks: {
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
  dactivityduration: {
    type: DataTypes.DECIMAL,
 
  },
  dactivitytargetgroup: {
    type: DataTypes.JSON,
 
  },
  dactivitykpi: {
    type: DataTypes.JSON,
 
  },
})
    return DetailActivity;
};


