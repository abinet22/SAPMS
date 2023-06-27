module.exports = (sequelize, DataTypes) => {

    const Tasks = sequelize.define("Tasks", {
      taskid: {
        type: DataTypes.STRING,
     
      },
      dactivityid: {
        type: DataTypes.STRING,
     
      },
      dactivitytitle: {
    type: DataTypes.STRING,
 
  },

  taskcode: {
    type: DataTypes.STRING,
 
  },
  taskrisks: {
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
 
  }
})
    return Tasks;
};


