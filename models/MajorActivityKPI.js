
module.exports = (sequelize, DataTypes) => {

    const MajorActivityKPI = sequelize.define("MajorActivityKPI", {
      
      mactivityid:  {
        type: DataTypes.STRING,
     
      } ,
  
          dactivityid:  {
            type: DataTypes.STRING,
         
          } ,
          
          macttindicator:   {
            type: DataTypes.STRING,
         
          } ,
          macttinputtype:  {
            type: DataTypes.STRING,
         
          } ,
          mactkpi:  {
            type: DataTypes.STRING,
         
          } ,
          mactregisteredrisk:  {
            type: DataTypes.STRING,
         
          } ,
          isfinalsent:  {
            type: DataTypes.STRING,
         
          } ,
 
  
})
    return MajorActivityKPI;
};


