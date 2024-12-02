const User = require("../models/User");
const Package = require('../models/Package'); 
const nodemailer = require("nodemailer");
const Transaction = require("../models/Transaction");
const bcrypt = require("bcrypt");

exports.managerDashboard = async (req, res) => {
    if (req.user && req.user.role === "manager") {
        try {
            const packages = await Package.find({});
            res.render("managerdashboard", { user: req.user, packages });
        } catch (error) {
            console.error("Error fetching packages:", error);
            res.status(500).send("An error occurred while fetching packages.");
        }
    } else {
        res.status(403).send("Access denied. Managers only.");
    }
};


exports.renderAddPackage = (req, res) => {
    res.render('addPackage');
};


exports.createPackage = async (req, res) => {
    try {
        const { packageName, packageDescription, packagePrice, availability } = req.body;

        
        const newPackage = new Package({
            name: packageName,
            description: packageDescription,
            price: packagePrice,
            availability: availability || 'available'  
        });

        await newPackage.save();

        console.log("Package added successfully");
        res.redirect('/managerdashboard');
    } catch (error) {
        console.error("Error adding package:", error);
        res.status(500).send("An error occurred while adding the package.");
    }
};



exports.updatePackageForm = async (req, res) => {
    const packageId = req.params.id;
    try {
        const package = await Package.findById(packageId);
        if (!package) return res.status(404).send("Package not found");

        res.render("updatePackage", { package });
    } catch (error) {
        console.error("Error fetching package:", error);
        res.status(500).send("An error occurred while fetching the package.");
    }
};



exports.updatePackage = async (req, res) => {
    const packageId = req.params.id;
    const { name, description, price} = req.body; 

    try {
        const updatedPackage = await Package.findByIdAndUpdate(packageId, {
            name,
            description,
            price
        }); 

        if (!updatedPackage) {
            return res.status(404).send("Package not found");
        }

        console.log("Package updated successfully");
        res.redirect("/managerdashboard"); 
    } catch (error) {
        console.error("Error updating package:", error);
        res.status(500).send("An error occurred while updating the package.");
    }
};



exports.deletePackage = async (req, res) => {
    const packageId = req.params.id;
    try {
        await Package.findByIdAndDelete(packageId);
        res.redirect("/managerdashboard");
    } catch (error) {
        console.error("Error deleting package:", error);
        res.status(500).send("An error occurred while deleting the package.");
    }
};

exports.viewTransactions = async (req, res) => {
    if (req.user && req.user.role === "manager") {
        try {
            
            const transactions = await Transaction.find({ managerEmail: req.user.email }) 
                .populate('userId')
                .exec();

            res.render('transactions', { user: req.user, transactions });
        } catch (error) {
            console.error("Error fetching transactions:", error);
            res.status(500).send("An error occurred while fetching transactions.");
        }
    } else {
        res.status(403).send("Access denied. Managers only.");
    }
};

exports.searchTransactions = async (req, res) => {
    if (req.user && req.user.role === "manager") {
        const { query } = req.query;

        try {
            let searchCriteria = { managerEmail: req.user.email };
            if (query) {
                searchCriteria.clientName = { $regex: query, $options: "i" }; // Case-insensitive search
            }

            // Fetch transactions with the latest update sorted by date (descending)
            const transactions = await Transaction.find(searchCriteria)
                .sort({ date: -1 }) // Sort by latest date
                .exec();

            res.render('transactions', { user: req.user, transactions });
        } catch (error) {
            console.error("Error searching transactions:", error);
            res.status(500).send("An error occurred while searching transactions.");
        }
    } else {
        res.status(403).send("Access denied. Managers only.");
    }
};

exports.deleteTransaction = async (req, res) => {
    const transactionId = req.params.id;

    try {
        await Transaction.findByIdAndDelete(transactionId);
        // Redirect to the correct route that lists the transactions
        res.redirect("/managertransactions");
    } catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).send("An error occurred while deleting the transaction.");
    }
};

