const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("🚀MongoDB connected Sucessfully");
    } catch (error) {
       console.log("MongoDB connection Error : " , error);
       process.exit(1); //exit the process bcoz db we dont have anything to do
    }
};

module.exports = connectDB;