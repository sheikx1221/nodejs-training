const mongoose = require('mongoose');
const schema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: { type: String, required: true },
    description: { type: String, required: false },
    price: { type: Number, required: true, default: 0 },
    availableQuantity: { type: Number, required: false, default: 0 },
    category: { type: String, required: true }
}, { strict: false });

module.exports = mongoose.model('Product', schema);