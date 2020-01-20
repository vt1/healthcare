const express = require('express');
const common = require('../lib/common');
const router = express.Router();
const _orderDAL = require('../lib/dal/order');
const _customerDAL = require('../lib/dal/customer');
const stripe = require('stripe')(common.getPaymentConfig().secretKey);

router.post('/admin/order/refundmoney', common.restrict, common.checkAccess, (req, res) => {
    const db = req.app.db;
    const config = req.app.config;
    db.orders.findOne({_id: common.getId(req.body.order_id)}, (err, order) => {
        if(err){
            console.info(err.stack);
        }

        if(common.getConfig().paymentGateway === 'stripe'){
            stripe.refunds.create({
                charge: order.orderPaymentId
            }, (err, refund) => {
                if(err){
                    res.status(200).json({message: err.message});
                }else{
                    db.orders.update({_id: common.getId(req.body.order_id)}, {$set: {orderStatus: 'Refunded'}}, {multi: false}, (err, result) => {
                        if(err){
                            console.err(err.stack);
                            res.status(200).json({message: 'Order status was not updated.'});
                        }else{
                            _customerDAL.getCustomerById(req, order.customerId)
                                .then(customer => {
                                    const templateData = {
                                        brand: config.cartTitle,
                                        websiteUrl: config.baseUrl,
                                        orderId: order.orderId,
                                        orderStatus: 'Refunded'
                                    };
                                    const emailMessage = common.getTemplateMessage('orderstatus_changed_template', templateData);
                                    common.sendEmail(customer.email, 'Your order status was changed', emailMessage)
                                        .then(result => {
                                            if(result.result === true){
                                                console.info(result.info);
                                            }
                                        })
                                        .catch(error => {
                                            console.log(error.message);
                                        });
                                })
                                .catch(error => {
                                    console.error(error.message);
                                });
                            res.status(200).json({message: 'Order status was updated.'});
                        }
                    });
                    const orderHistoryObject = {
                        status: 'Refunded',
                        updatedAt: new Date(),
                        charge: refund.charge,
                        id: refund.id
                    };
                    db.orders.findOneAndUpdate({_id: common.getId(req.body.order_id)}, {$push: {orderHistory: orderHistoryObject}}, (err, newDoc) => {
                        if(err){
                            console.err(err.stack);
                            res.status(200).json({message: 'Order status history was not updated.'});
                        }
                    });
                }
            });
        }
    });
});

module.exports = router;
