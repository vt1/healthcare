const express = require('express');
const router = express.Router();
const colors = require('colors');
const async = require('async');
const _ = require('lodash');
const common = require('../lib/common');

const _customerDAL = require('../lib/dal/customer');
const _productDAL = require('../lib/dal/product');
const _orderDAL = require('../lib/dal/order');
const _customerLocalization = require('../lib/localization/customer');

// Updates a single product quantity
router.get('/search', (req, res) => {
    let searchTerm = req.query.term;
    console.log(searchTerm);
    let queryObj = {
        productTitle: new RegExp(searchTerm, 'i'),
        productDescription: new RegExp(searchTerm, 'i'),
        productTags: new RegExp(searchTerm, 'i')
    };

    let pageNum = 1;
    if(req.params.pageNum){
        pageNum = req.params.pageNum;
    }

    Promise.all([
        common.getData(req, pageNum, {$or: [{'productTitle': queryObj.productTitle},
                {'productDescription': queryObj.productDescription},
                {'productTags': queryObj.productTags}]}, false)
    ])
        .then(([results]) => {
            res.status(200).json(results.data);
        });
});
