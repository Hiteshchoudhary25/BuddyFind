const User = require('../models/User');
const jwt = require('jsonwebtoken');

const {generateOTP , transporter} = require('../utils/email');

const authController = {
    signup : async (req ,res) => {
        try {
            const {name , email , password , university } = req.body;
            
            const existingUser = await User.findOne({email});
            if(existingUser){
                return res.status(400).json({error : "Email already registered"});
            }

            const otp = generateOTP();
            const user = new User({
                name,
                email,
                password,
                otp:{
                    code:otp,
                    expiresAt:new Date(Date.now() + 10 * 60 * 1000) //10 minutes
                }
            });

            await user.save();

            await transporter.sendMail({
                from:process.env.EMAIL_USER,
                to:email,
                subject:'Verify your BuddyFind account',
                text:`Your OTP for BuddyFind is : ${otp}`
            });

            res.status(201).json({message: 'User created , Please Verify your email.'});


        } catch (error) {
            res.status(400).json({error:error.message});
        }
    },

    verifyEmail: async (req ,res) => {
        try {
            const {email , otp } = req.body;
            const user = await User.findOne({email});

            if(!user || user.otp.code !== otp || user.otp.expiresAt < Date.now()){
                return res.status(400).json({error: 'Invalid or expired OTP'});
            }

            user.emailVerified = true;
            user.otp = undefined;
            await user.save();

            const token = jwt.sign({id : user._id} , process.env.JWT_SECRET ,{
                expiresIn:'7d'
            });

            res.json({token});

        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    
    login:async (req ,res) => {
        try {
            const {email , password} = req.body;
            const user = await User.findOne({email});

            if(!user || (await user.comparePassword(password))){
                return res.status(401).json({error: 'Invalid crendentials'});
            }

            if(!user.emailVerified){
                res.status(401).json({error:'please verify email first'});
            }
            const token = jwt.sign({id : user._id} , process.env.JWT_SECRET , {
                expiresIn:'7d'
            });
            res.json({token});
        } catch (error) {
            res.status(400).json({error:error.message});
        }
    },

    getProfile: async (req, res) => {
        try {
          // Strip password and sensitive info
          const user = await User.findById(req.user._id).select('-password -otp');
          res.json(user);
        } catch (error) {
          res.status(400).json({ error: error.message });
        }
    },

    updateProfile: async (req ,res) => {
        try {
           const {name , university , darkMode} = req.body;
           const updates = {};
           
           if(name) updates.name = name;
           if(university) updates.university = university;
           if(darkMode !== undefined) updates.darkMode = darkMode;

           const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            {new : true , runValidators : true}
           ).select('-password -otp');

           res.json(user);
        } catch (error) {
            res.status(400).json({error:error.message})
        }
    },

    requestPasswordReset : async(req , res) => {
        try {
            const {email} = req.body;
            const user = await User.findOne({email});

            if(!user){
                return res.status(401).json({error:'User not found'});
            }
            const resetToken = jwt.sign({id:user._id} , process.env.JWT_SECRET,{
                expiresIn:'1h'
            });

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Reset your BuddyFind password',
                text: `Click on this link to reset your password: ${process.env.FRONTEND_URL}/reset-password/${resetToken}`
            })
            res.json({ message: 'Password reset email sent' });

        } catch (error) {
           res.status(400).json({error:error.message}); 
        }
    },
    resetPassword: async(req ,res) => {
        try {
            const {token} = req.params;
            const {password} = req.body;

            const decoded = jwt.verify(token , process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
              }
              
              user.password = password;
              await user.save();
              
              res.json({ message: 'Password reset successful' });
        } catch (error) {
            res.status(400).json({error:error.message}); 
        }
    }
};

module.exports = authController;