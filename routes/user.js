const express = require('express');
const router = express.Router();
const { faker } = require('@faker-js/faker');
const mongo = require('mongodb');
const User = require('../models/user');
const mongoose = require('mongoose');
const jade = require('jade');
const path = require('path');
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/auth');

function createRandomUser() {
    return {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        username: faker.internet.userName(),
        email: faker.internet.email(),
        avatar: faker.image.avatar(),
        password: faker.internet.password(),
        birthdate: faker.date.birthdate(),
        registeredAt: faker.date.past(),
        role: 'User'
    };
}

router.get('/create', auth, (req, res, next) => {
    if (!req.body.verified) res.status(401).json({ success: false, err: 'Unauthorized' });

    const user = faker.helpers.multiple(createRandomUser, { count: 1 })[0];
    const dbUser = new User({ ...user, _id: new mongoose.Types.ObjectId() });
    dbUser
        .save()
        .then((result) => {
            res.status(200).json({ success: true, data: result })
        })
        .catch((err) => {
            console.log("err = ", err);
            res.status(500).json({ success: false, err: err.message || err });
        });
});

router.get('/list', auth, (req, res, next) => {
    if (!req.body.verified) res.status(401).json({ success: false, err: 'Unauthorized' });

    User.find({}, { password: 0 })
        .exec()
        .then((result) => {
            // const jadeToTemplate = jade.compileFile(path.join(__dirname, '../views/users.jade'));
            // const html = jadeToTemplate({ users: result });
            res.status(200).json({ success: true, data: result });
            // res.send(html);
        })
        .catch((err) => {
            res.status(500).json({ success: false, err: err.message || err });
        });
});

router.get("/delete/:id", auth, (req, res, next) => {
    if (!req.body.verified) res.status(401).json({ success: false, err: 'Unauthorized' });

    const id = req.params.id;
    User.deleteOne({ _id: id })
        .exec()
        .then((result) => {
            res.status(200).json({ success: true });
        })
        .catch(err => {
            res.status(500).json({ success: false })
        });
});

router.post('/login', (req, res, next) => {
    try {
        const { email, password } = req.body;
        User.find({ email: email })
            .exec()
            .then((result) => {
                result = result[0]._doc;
                if (password == result.password) {
                    const { firstName, lastName, password, birthDate, registeredAt, ...user } = result;
                    const token = jwt.sign(user, 'jsonWebToken', { expiresIn: '12h' });
                    res.status(200).json({
                        success: true,
                        data: {
                            firstName, lastName, password, birthDate, registeredAt, ...user, token
                        }
                    });
                }
                else {
                    res.status(401).json({ success: false, err: 'Unauthorized' });
                }
            })
            .catch((err) => {
                res.status(500).json({ success: false, err: err.message || err });
            });
    }
    catch (err) {
        res.status(500).json({ success: false, err: err.message || err });
    }
});
module.exports = router;