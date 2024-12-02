const Transaction = require('../models/Transaction');

exports.clientDashboard = async (req, res) => {
    try {
        const user = req.session.user;

        if (!user || !user.email) {
            return res.status(400).send("User is not logged in.");
        }

        
        const transactions = await Transaction.find({ clientEmail: user.email });

        res.render('clientDashboard', { user, transactions });
    } catch (error) {
        console.error("Error loading client dashboard:", error);
        res.status(500).send("An error occurred.");
    }
};
