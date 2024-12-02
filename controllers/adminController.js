// controllers/adminController.js
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const User = require("../models/User");
const Package = require('../models/Package');
const Transaction = require('../models/Transaction');

exports.adminDashboard = async (req, res) => {
    if (req.user && req.user.role === "generalAdmin") {
        try {
            const users = await User.find({});
            res.render("admindashboard", { user: req.user, users });
        } catch (error) {
            console.error("Error fetching users:", error);
            res.status(500).send("An error occurred while fetching users.");
        }
    } else {
        res.status(403).send("Access denied. Admins only.");
    }
};


exports.renderAddAdmin = (req, res) => {
    res.render("addManager");
};


exports.createAdmin = async (req, res) => {
    try {
        const { name, age, email, phno, gender, address, password, role } = req.body;

         
         const allowedRoles = ['generalAdmin', 'manager'];
         if (!allowedRoles.includes(role)) {
             return res.status(400).send("Invalid role. Allowed roles are 'generalAdmin' and 'manager'.");
         }

       
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
            role,
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
        return res.redirect("/admindashboard"); 
    } catch (error) {
        console.error("Error in sign up", error);
        res.status(500).send("An error occurred during registration.");
    }
};


exports.verification = async (req, res) => {
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

exports.viewTransactionsByBranch = async (req, res) => {
    try {
        // Fetch transactions grouped by managerBranch (not branch)
        const branches = ["Calapan", "Victoria", "Bansud", "Bongabong", "Roxas", "Mansalay", "Pinamalayan"];
        const transactionsByBranch = {};

        for (const branch of branches) {
            const branchTransactions = await Transaction.find({ managerBranch: branch });  // Changed 'branch' to 'managerBranch'
            transactionsByBranch[branch] = branchTransactions;
        }

        res.render("transactionsByBranch", { transactionsByBranch });
    } catch (error) {
        console.error("Error fetching transactions by branch:", error);
        res.status(500).send("An error occurred.");
    }
};



