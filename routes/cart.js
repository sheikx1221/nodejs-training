const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/product');
const User = require('../models/user');
const auth = require('../middlewares/auth');
const mongoose = require('mongoose');
const createError = require('http-errors');

router.get('/items', auth, (req, res, next) => {
    if (!req.body.verified) return res.status(500).json({ success: false, err: 'Unauthorized' });

    try {
        const { userId } = req.body;
        Cart.find({ user: new mongoose.Types.ObjectId(userId )}).populate('products.product').exec()
            .then((result) => {
                res.status(200).json({ success: true, data: result })
            })
            .catch(err => {
                throw createError(404, err.message || "Not Found!");
            })
    }
    catch(err) {
        res.status(err.statusCode || 500, err.message || err);
    }
});

router.post('/add-item', auth, async (req, res, next) => {
    if (!req.body.verified) return res.status(500).json({ success: false, err: 'Unauthorized' });

    try {
        const { productId, userId, purchasedQty } = req.body;

        const product = await Product.findById(productId).exec();
        if (!product) throw createError(404, "Product not found!");
        if (product.availableQuantity < purchasedQty) throw createError(400, `Max order qty ${product.availableQuantity}`);

        const user = await User.findById(userId).exec();
        if (!user) throw createError(404, "User not found!");

        let cart = await Cart.findOne({ user: user._id }).exec();
        if (!cart) {
            const newCart = new Cart({
                _id: new mongoose.Types.ObjectId(), user: user._id, products: [{
                    product: new mongoose.Types.ObjectId(productId),
                    purchasedQty, totalPrice: product.price * purchasedQty
                }]
            });

            const saved = await newCart.save();
            if (!saved) throw createError(500, err.message || err);
            else res.json({ success: true, data: result });
        }
        else {
            let index = -1;
            const item = cart.products.find(({ product }, idx) => {
                index = idx;
                return product.toString() == productId
            });

            if (item) {
                const tmpProducts = [...cart.products];
                const [tmpProduct] = tmpProducts.splice(index, 1);
                tmpProduct.purchasedQty = purchasedQty;
                tmpProduct.totalPrice = purchasedQty * product.price;
                tmpProducts.splice(index, 0, tmpProduct);

                const updatedCart = await Cart.findOneAndUpdate(
                    { _id: cart._id },
                    { products: tmpProducts },
                    { new: true }
                ).exec();

                res.status(202).json({ success: true, data: updatedCart });
            }
            else {
                cart.products.push({
                    product: new mongoose.Types.ObjectId(productId),
                    purchasedQty,
                    totalPrice: purchasedQty * product.price
                });

                const updatedCart = await cart.save();
                res.status(200).json({ success: true, data: updatedCart });
            }
        }
    }
    catch (err) {
        res.status(err.statusCode || 500).json({ success: false, err: err.message || err });
    }
});

router.post('/place-order', auth, async (req, res, next) => {
    if (!req.body.verified) return res.status(500).json({ success: false, err: 'Unauthorized' });

    try {
        const { userId } = req.body;

        const cart = await Cart.findOne({ user: new mongoose.Types.ObjectId(userId)}).populate('products.product').exec();
        if (!cart) throw createError(404, 'CART NOT FOUND!');

        const updateProducts = [];
        let sumProducts = 0;
        for (let { purchasedQty, totalPrice, product } of cart.products) {
            product.availableQuantity = product.availableQuantity - purchasedQty;
            sumProducts = sumProducts + totalPrice;
            updateProducts.push(product.save());
        }

        await Promise.all(updateProducts);
        res.status(200).json({ success: true, data: { totalBill: sumProducts } });
    }
    catch (err) {
        res.status(err.statusCode || 500).json({ success: false, err: err.message || err });
    }
});

module.exports = router;