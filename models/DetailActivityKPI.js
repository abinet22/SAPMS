
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
     
      },
      january: {
        type: DataTypes.STRING,
     
      },
  february:{
    type: DataTypes.STRING,
 
  },
  march: {
    type: DataTypes.STRING,
 
  },
  april: {
    type: DataTypes.STRING,
 
  },
  may: {
    type: DataTypes.STRING,
 
  },
  june: {
    type: DataTypes.STRING,
 
  },
  july: {
    type: DataTypes.STRING,
 
  },
  august: {
    type: DataTypes.STRING,
 
  },
  september: {
    type: DataTypes.STRING,
 
  },
  october: {
    type: DataTypes.STRING,
 
  },
  november: {
    type: DataTypes.STRING,
 
  },
  december: {
    type: DataTypes.STRING,
 
  },
  budget:{
    type: DataTypes.DECIMAL(10,2),
  }
  
})
    return DetailActivityKPI;
};


