const express = require('express');
const common = require('../lib/common');
const escape = require('html-entities').AllHtmlEntities;
const colors = require('colors');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const glob = require('glob');
const mime = require('mime-type/with-db');
const router = express.Router();
const _prescriptionDAL = require('../lib/dal/prescription');

router.post('/admin/settings/option/remove', common.restrict, common.checkAccess, (req, res) => {
    const db = req.app.db;
    db.products.findOne({_id: common.getId(req.body.productId)}, (err, product) => {
        if(err){
            console.info(err.stack);
        }
        if(product && product.productOptions){
            let optJson = JSON.parse(product.productOptions);
            delete optJson[req.body.optName];

            db.products.update({_id: common.getId(req.body.productId)}, {$set: {productOptions: JSON.stringify(optJson)}}, (err, numReplaced) => {
                if(err){
                    console.info(err.stack);
                }
                if(numReplaced.result.nModified === 1){
                    res.status(200).json({message: 'Option successfully removed'});
                }else{
                    res.status(400).json({message: 'Failed to remove option. Please try again.'});
                }
            });
        }else{
            res.status(400).json({message: 'Product not found. Try saving before removing.'});
        }
    });
});

