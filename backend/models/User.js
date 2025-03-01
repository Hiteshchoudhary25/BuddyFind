const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name :{
        type:String,
        required:true,
        trim : true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },
    password: {
        type:String,
        required : true
    },
    university:{
        type:String,
        required:true
    },
    darkMode : {
        type:Boolean,
        default:false 
    },
    emailVerified :{
        type:Boolean,
        default:false 
    },
    otp : {
        code:String,
        expiresAt :Date
    }
},{
    timestamps:true
});

userSchema.pre('save' , async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,12);
    }
    next();
});

userSchema.methods.comparePassword = async function(candidatePassword){
    return bcrypt.compare(candidatePassword , this.password);
};

const User = mongoose.model('User' , userSchema);

module.exports = User;