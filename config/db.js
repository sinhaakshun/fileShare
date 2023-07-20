require('dotenv').config();

const mongoose = require('mongoose');

function connectDB(){
    //db connection
    mongoose.connect(process.env.MONGO_CONNECTION_URL).then(() => {
        //mongoose.connect('mongodb+srv://akshunanand:Ws5HDxjoT4lb4uXT@userdata.5ae38pu.mongodb.net/test').then(()=>{
        console.log("database connected successfully");
    }).catch(err => {
        console.log("error in connecting to db", err)
    })
}

module.exports = connectDB;