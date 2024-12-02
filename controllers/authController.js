const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const User = require("../models/User");
const Transaction = require("../models/Transaction");




exports.signUp = async (req, res) => {
    try {
        const { name, age, email, phno, gender, address, password } = req.body;

       
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send("User with this email already exists.");
        }

        
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        
        const verificationToken = crypto.randomBytes(32).toString('hex');

        
        const user = new User({
            name,
            age,
            email,
            phno,
            gender,
            address,
            password: hashedPassword,
            role: 'client',
            verificationToken, 
            isVerified: false, 
        });

        await user.save();

       
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'joannemile2003@gmail.com', 
                pass: 'tein xpsl extl oicc', 
            }
        });

        const verificationUrl = `http://localhost:3003/verify-email/${verificationToken}`;

        const mailOptions = {
            from: 'your-email@gmail.com',
            to: email,
            subject: 'Please verify your email address',
            text: `Click the link below to verify your email address:\n\n${verificationUrl}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Error sending email:", error);
            } else {
                console.log('Verification email sent: ' + info.response);
            }
        });

        console.log("User registered successfully");
        return res.redirect("/login"); 
    } catch (error) {
        console.error("Error in sign up", error);
        res.status(500).send("An error occurred during registration.");
    }
};


exports.verifyEmail = async (req, res) => {
    const { verificationToken } = req.params; 

    try {
        
        const user = await User.findOne({ verificationToken });

        if (!user) {
            return res.status(400).send("Invalid or expired verification token.");
        }

       
        user.isVerified = true;
        user.verificationToken = undefined; 
        await user.save();

        return res.send("Your email has been successfully verified! You can now log in.");
    } catch (error) {
        console.error("Email verification error:", error);
        res.status(500).send("An error occurred during email verification.");
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
       
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send("Invalid email or password.");
        }

        
        if (!user.isVerified) {
            return res.status(401).send("Please verify your email first.");
        }

       
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send("Invalid email or password.");
        }

       
        req.session.user = { 
            id: user._id, 
            role: user.role, 
            name: user.name, 
            email: user.email,
            address: user.role === "manager" ? user.address : undefined
        };

       
        switch (user.role) {
            case "generalAdmin":
                return res.redirect("/admindashboard");
            case "manager":
                return res.redirect("/managerdashboard");
            default:
                return res.redirect("/clientdashboard");
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send("An error occurred during login.");
    }
};


exports.logout = (req, res) => {
    req.session.user = null; 
    res.redirect('/'); 
};


exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send("No user found with this email.");
        }

        
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 3600000; 
        await user.save();

        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'joannemile2003@gmail.com', 
                pass: 'tein xpsl extl oicc',  
            }
        });

        const resetUrl = `http://localhost:3003/reset-password/${resetToken}`;

        const mailOptions = {
            from: 'your-email@gmail.com',
            to: email,
            subject: 'Password Reset Request',
            text: `Click the link below to reset your password:\n\n${resetUrl}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Error sending email:", error);
            } else {
                console.log('Password reset email sent: ' + info.response);
            }
        });

        res.send("Password reset email sent.");
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).send("An error occurred while processing the password reset request.");
    }
};


exports.resetPassword = async (req, res) => {
    const { resetToken } = req.params;
    const { newPassword } = req.body;

    try {
        const user = await User.findOne({ resetToken, resetTokenExpiry: { $gt: Date.now() } });

        if (!user) {
            return res.status(400).send("Invalid or expired token.");
        }

        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;

        await user.save();

       

        res.redirect("/login");
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).send("An error occurred during password reset.");
    }
};



