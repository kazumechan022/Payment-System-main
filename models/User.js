// models/User.js
const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    barangay: { type: String, required: true },
    branch: { 
        type: String, 
        enum: ['Calapan', 'Victoria', 'Bansud', 'Bongabong', 'Roxas', 'Mansalay', 'Pinamalayan'], 
        required: true 
    }
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    phno: { type: String, required: true },
    gender: { type: String, required: true },
    address: addressSchema, // Embed the address schema here
    password: { type: String, required: true },
    role: { type: String, enum: ['client','generalAdmin', 'manager'], default: 'client' },
    verificationToken: { type: String }, 
    isVerified: { type: Boolean, default: false },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date }, 
    balance: { type: Number, default: 0 }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
