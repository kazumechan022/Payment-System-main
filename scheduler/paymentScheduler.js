const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Transaction = require('../models/Transaction');

const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'joannemile2003@gmail.com',
            pass: 'tein xpsl extl oicc', 
        },
    });

    const mailOptions = { from: 'joannemile2003@gmail.com', to, subject, text };
    await transporter.sendMail(mailOptions);
};

const checkPayments = async () => {
    try {
        const now = new Date();
        const oneWeekAhead = new Date();
        oneWeekAhead.setDate(now.getDate() + 7);

       
        const upcomingPayments = await Transaction.find({
            dueDate: { $gte: now, $lte: oneWeekAhead },
            remainingBalance: { $gt: 0 }, 
        });

        for (const payment of upcomingPayments) {
            const emailText = `Dear ${payment.clientName},\n\nThis is a reminder that your payment for the package "${payment.packageName}" is due on ${payment.dueDate.toLocaleDateString()}.\n\nRemaining balance: $${payment.remainingBalance.toFixed(2)}.\nPlease make the payment to avoid penalties.\n\nBest regards,\nYour Team`;
            await sendEmail(payment.clientEmail, 'Payment Reminder', emailText);
        }

        // Check overdue payments
        const overduePayments = await Transaction.find({
            dueDate: { $lt: now },
            remainingBalance: { $gt: 0 }, 
        });

        for (const payment of overduePayments) {
            const daysOverdue = Math.ceil((now - payment.dueDate) / (1000 * 60 * 60 * 24));
            const penalty = 100 * daysOverdue; 
            payment.remainingBalance += penalty;
            await payment.save();

            const emailText = `Dear ${payment.clientName},\n\nYour payment for the package "${payment.packageName}" is overdue by ${daysOverdue} days.\n\nA penalty of $${penalty.toFixed(2)} has been added. Your new remaining balance is $${payment.remainingBalance.toFixed(2)}.\nPlease make the payment as soon as possible to avoid further penalties.\n\nBest regards,\nYour Team`;
            await sendEmail(payment.clientEmail, 'Overdue Payment Notification', emailText);
        }
    } catch (error) {
        console.error('Error checking payments:', error);
    }
};


cron.schedule('0 0 * * *', checkPayments);
