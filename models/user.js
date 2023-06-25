const mongoose = require('mongoose');
const schema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    avatar: { type: String, required: false },
    password: { type: String, required: false },
    birthdate: { type: String, required: false },
    registeredAt: { type: String, required: false },
    role: { type: String, enum: ['Admin', 'User'], default: 'User' }
});

module.exports = mongoose.model('User', schema);