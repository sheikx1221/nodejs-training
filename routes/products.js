const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Product = require('../models/product');
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

function createFakeProduct() {
    return {
        _id: new mongoose.Types.ObjectId(),
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: faker.commerce.price(),
        availableQuantity: Math.floor(Math.random() * (200 - 1 + 1)) + 1,
        category: faker.commerce.department(),
    }
}

router.get('/create', auth, (req, res, next) => {
    if (!req.body.isAdmin) res.status(401).json({ success: false, err: 'Unauthorized' });

    const product = new Product(createFakeProduct());
    product.save()
        .then((result) => {
            res.status(200).json({ success: true, data: result });
        })
        .catch(err => {
            res.status(500).json({ success: false, err: err.message || err });
        });
});

router.put('/update', auth, (req, res, next) => {
    if (!req.body.isAdmin) res.status(401).json({ success: false, err: 'Unauthorized' });

    try {
        const { _id, ...newProductInfo } = req.body;
        Product.findOneAndUpdate({ _id }, newProductInfo, { new: true })
            .then((updatedInfo) => {
                res.status(203).json({ success: true, data: updatedInfo });
            }).
            catch(err => {
                throw err;
            });
    }
    catch(err) {
        res.status(500).json({ success: false, err: err.message || err });
    }
});

router.get('/list', auth, (req, res, next) => {
    if (!req.body.verified) res.status(500).json({ success: false, err: 'Unauthorized' });

    Product.find({ })
        .exec()
        .then(result => {
            res.status(200).json({ success: true, data: result });
        })
        .catch(err => {
            res.status(500).json({ success: false, err: err.message || err });
        });
});

router.delete('/delete', auth, (req, res, next) => {
    if (!req.body.isAdmin) res.status(500).json({ success: false, err: 'Unauthorized' });

    try {
        const { _id } = req.body;
        Product.deleteOne({ _id })
        .then((result) => {
            res.status(204).json({ success: true });
        })
        .catch(err => {
            throw err;
        })
    }
    catch(err) {
        res.status(500).json({ success: false, err: err.message || err });
    }
});

router.put('/add-stock', auth, (req, res, next) => {
    if (!req.body.isAdmin) res.status(500).json({ success: false, err: 'Unauthorized' });

    try {
        const { _id, addStockQty } = req.body;

        Product.findOneAndUpdate({ _id }, { $inc: { availableQuantity: addStockQty }}, { new: true })
            .then((result) => {
                if (!result) res.status(404).json({ success: false, err: 'Not found' });
                else res.status(204).json({ success: true, data: result });
            })
            .catch(err => {
                throw err;
            });
    }
    catch(err) {
        res.status(500).json({ success: false, err: err.message || err });
    }
});
module.exports = router;