const mongoose = require('mongoose');
const schema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{ 
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        purchasedQty: { type: Number, required: true, default: 1 },
        totalPrice: { type: Number, required: true, default: function() { return this.product.price }}
    }]
});

module.exports = mongoose.model('Cart', schema);