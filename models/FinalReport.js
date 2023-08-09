
module.exports = (sequelize, DataTypes) => {

    const FinalReport = sequelize.define("FinalReport", {
      
     
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
      finalreport: {
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
      risksmitigated: {
        type: DataTypes.STRING,
     
      },
 
  
})
    return FinalReport;
};


