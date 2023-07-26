const mongoose = require('mongoose');



mongoose.connect ("mongodb://localhost:27017/inotebook").then(() =>{

  
   console.log("connected to Mongo successfully");

   }).catch((err) => {
      console.log("not connected to database" ,err);
   });
    


