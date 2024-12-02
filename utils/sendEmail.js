const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "Gmail", // You can use other email services like Outlook or custom SMTP
            auth: {
                user: "joannemile2003@gmail.com", // Replace with your email
                pass: "tein xpsl extl oicc", // Replace with your email's app password
            },
        });

        const mailOptions = {
            from: "your-email@gmail.com", // Replace with your email
            to,
            subject,
            text,
        };

        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Email could not be sent");
    }
};

module.exports = sendEmail;
