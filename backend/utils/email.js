const nodemailer = require('nodemailer');

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

module.exports = {generateOTP , transporter};