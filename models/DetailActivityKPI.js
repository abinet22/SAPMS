
module.exports = (sequelize, DataTypes) => {

    const DetailActivityKPI = sequelize.define("DetailActivityKPI", {
      
      mactivityid:  {
        type: DataTypes.STRING,
     
      } ,
      dactivityid:{
        type: DataTypes.STRING,
     
      },
      dacttgroup: {
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
      dactregisteredrisk: {
        type: DataTypes.STRING,
     
      },
      seen: {
        type: DataTypes.STRING,
     
      },
      seendate: {
        type: DataTypes.DATE,
     
      },
      start: {
        type: DataTypes.STRING,
     
      },
      startdate: {
        type: DataTypes.DATE,
     
      },
      isfinalsent:{
        type: DataTypes.STRING,
     
      }
 
  
})
    return DetailActivityKPI;
};


