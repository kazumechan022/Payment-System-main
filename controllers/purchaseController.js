const Package = require("../models/Package");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const nodemailer = require("nodemailer");


exports.renderPurchasePage = async (req, res) => {
    const { packageId } = req.params;

    try {
        const package = await Package.findById(packageId);
        if (!package) return res.status(404).send("Package not found");

        const user = req.session.user;
        
        const previousTransactions = await Transaction.find({
            userId: user.id,
            packageName: package.name
        });

        const totalPaid = previousTransactions.reduce((sum, transaction) =>
            sum + transaction.paymentAmount, 0);

        const remainingBalance = package.price - totalPaid;

        // Pass remainingBalance to the view
        res.render("purchase", { 
            package, 
            user: req.session.user,
            remainingBalance
        });
    } catch (error) {
        console.error("Error loading purchase page:", error);
        res.status(500).send("An error occurred.");
    }
};



exports.handlePurchase = async (req, res) => {
    const { packageId } = req.params;
    const { paymentAmount, paymentStatus, clientName, clientPhone, clientEmail } = req.body;
    const paymentAmountNumber = parseFloat(paymentAmount);

    try {
        const package = await Package.findById(packageId);
        if (!package) return res.status(404).send("Package not found");

        const user = req.session.user;

        if (!user || !user.email) {
            return res.status(400).send("User email is missing.");
        }

        // Fetch the manager's branch
        const manager = await User.findOne({ email: user.email });
        if (!manager || !manager.address || !manager.address.branch) {
            return res.status(400).send("Manager's branch information is missing.");
        }

        const managerBranch = manager.address.branch;

        // Check if the client email exists in the database
        const clientUser = await User.findOne({ email: clientEmail });
        if (!clientUser) {
            return res.status(400).send("The provided client email does not exist in our records.");
        }

        // Get previous transactions for this package
        const previousTransactions = await Transaction.find({
            userId: user.id,
            packageName: package.name,
        });

        const totalPaid = previousTransactions.reduce((sum, transaction) =>
            sum + transaction.paymentAmount, 0);

        const remainingBalance = package.price - totalPaid;

        if (paymentStatus === "fullypaid") {
            if (paymentAmountNumber !== remainingBalance) {
                return res.status(400).send(`The payment amount for fully paid status must match the remaining balance of $${remainingBalance.toFixed(2)}.`);
            }
        } else if (paymentAmountNumber > remainingBalance) {
            return res.status(400).send("Payment exceeds the remaining balance.");
        }

        // Create a new transaction
        const transaction = new Transaction({
            userId: user.id,
            packageName: package.name,
            paymentAmount: paymentAmountNumber,
            paymentStatus,
            remainingBalance: remainingBalance - paymentAmountNumber,
            managerEmail: user.email,
            managerBranch,
            clientName,
            clientPhone,
            clientEmail,
            date: new Date(),
        });

        await transaction.save();

        // Update the remaining balance for the email
        const updatedRemainingBalance = remainingBalance - paymentAmountNumber;
        const updatedTotalPaid = totalPaid + paymentAmountNumber;

        // Email setup
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "joannemile2003@gmail.com",
                pass: "tein xpsl extl oicc",
            },
        });

        const mailOptions = {
            from: "joannemile2003@gmail.com",
            to: clientEmail,
            subject: `Purchase Confirmation for ${package.name}`,
            text: `Dear ${clientName},\n\nThe manager (${user.email}) has successfully purchased the package "${package.name}" for you.\n\nPackage Details:\n- Package Name: ${package.name}\n- Total Price: $${package.price}\n- Paid Amount: $${paymentAmountNumber}\n- Total Paid: $${updatedTotalPaid}\n- Remaining Balance: $${updatedRemainingBalance.toFixed(2)}\n\nIf you have any questions, feel free to contact us.\n\nBest regards,\nYour Team`,
        };

        await transporter.sendMail(mailOptions);

        // Send a fully paid email if balance reaches zero
        if (updatedRemainingBalance === 0) {
            const fullyPaidMailOptions = {
                from: "joannemile2003@gmail.com",
                to: clientEmail,
                subject: "Package Fully Paid",
                text: `Dear ${clientName},\n\nCongratulations! The package "${package.name}" is now fully paid.\n\nThank you for your purchase.\n\nBest regards,\nYour Team`,
            };

            await transporter.sendMail(fullyPaidMailOptions);
        }

        res.redirect("/managerdashboard");
    } catch (error) {
        console.error("Error processing purchase:", error);
        res.status(500).send("An error occurred.");
    }
};








