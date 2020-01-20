const common = require('../common');
const _ = require('lodash');

exports.getProductById = (request, productId) => {
    const db = request.app.db;
    return new Promise((resolve, reject) => {
        db.products.findOne({_id: common.getId(productId)}, (err, product) => {
            if(err){
                reject(err);
            }else{
                resolve(product);
            }
        });
    });
};

exports.getProductTypes = (request) => {
    const db = request.app.db;
    return new Promise((resolve, reject) => {
        db.productType.find().toArray((err, results) => {
            if(err){
                return reject(err);
            }else{
                return resolve(results);
            }
        });
    });
};

exports.createProductType = (request) => {
    const db = request.app.db;
    return new Promise((resolve, reject) => {
        const productType = {
            type: request.body.navProductTypeName
        };
        db.productType.insertOne(productType, err => {
            if(err){
                reject(err);
            }else{
                resolve({result: true});
            }
        })
    });
};

exports.deleteProductType = (request) => {
    const db = request.app.db;
    return new Promise((resolve, reject) => {
        const prodTypeName = request.body.prodTypeName;
        db.productType.remove({type: prodTypeName}, err => {
            if(err){
                reject(err);
            }else{
                resolve({result: true});
            }
        })
    })
};

exports.updateProductType = (request) => {
    const db = request.app.db;
    return new Promise((resolve, reject) => {
        const newProdTypeName = request.body.navProductTypeName;
        const prodTypeId = request.body.navProductTypeId;
        db.productType.updateOne({type: prodTypeId}, {$set: {type: newProdTypeName}}, err => {
            if(err){
                reject(err);
            }else{
                resolve({result: true});
            }
        })
    });
};
