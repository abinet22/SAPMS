module.exports = (sequelize, DataTypes) => {

    const Occupation = sequelize.define("Occupation", {
      occupationid: {
        type: DataTypes.STRING,
     
      },
  occupationname: {
    type: DataTypes.STRING,
 
  },
  departmentid: {
    type: DataTypes.STRING,
 
  },
 
  
})
    return Occupation;
};


