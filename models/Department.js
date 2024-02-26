module.exports = (sequelize, DataTypes) => {

    const Department = sequelize.define("Department", {
      departmentid: {
        type: DataTypes.STRING,
     
      },
  departmentname: {
    type: DataTypes.STRING,
 
  },
 
  
})
    return Department;
};


