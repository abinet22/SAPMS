module.exports = (sequelize, DataTypes) => {

    const ActivityIndicator = sequelize.define("ActivityIndicator", {
        activityindicatorid: {
        type: DataTypes.STRING,
     
      },
      activityindicatorname: {
    type: DataTypes.STRING,
 
  },
  measurementunit:{
    type: DataTypes.STRING,
  }
 
  
})
    return ActivityIndicator;
};


