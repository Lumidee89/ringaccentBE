const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    about: { type: String },
    profilePicture: { type: String },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },  
    otpCreatedAt: { type: Date },
    passwordResetToken: { type: String }, 
    passwordResetExpires: { type: Date },
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.comparePassword = async function (inputPassword) {
    return await bcrypt.compare(inputPassword, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
