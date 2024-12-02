// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    packageName: { type: String, required: true },
    paymentAmount: { type: Number, required: true },
    paymentStatus: { type: String, required: true },
    remainingBalance: { type: Number, required: true },
    managerEmail: { type: String, required: true },
    managerBranch: { type: String, required: true },
    clientName: { type: String, required: true }, // New field
    clientPhone: { type: String, required: true }, // New field
    clientEmail: { type: String, required: true }, // New field
    date: { type: Date, default: Date.now },
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
