
module.exports = (sequelize, DataTypes) => {

    const ProgressReport = sequelize.define("ProgressReport", {
      
     
      dactivityid:{
        type: DataTypes.STRING,
     
      },
      dacttgroupid: {
        type: DataTypes.STRING,
     
      },
      dacttindicator: {
        type: DataTypes.STRING,
     
      },
      dacttinputtype: {
        type: DataTypes.STRING,
     
      },
      dactkpi: {
        type: DataTypes.STRING,
     
      },
      progressreport: {
        type: DataTypes.TEXT("long"),
     
      },
      remark: {
        type: DataTypes.TEXT("long"),
     
      },
      number: {
        type: DataTypes.DECIMAL,
     
      },
      percent: {
        type: DataTypes.DECIMAL,
     
      },
      ratio: {
        type: DataTypes.DECIMAL,
     
      },
      reportdate: {
        type: DataTypes.DATE,
     
      },
      reporttype: {
        type: DataTypes.STRING,
     
      }
 
  
})
    return ProgressReport;
};


