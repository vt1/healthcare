const _ = require('lodash');
const uglifycss = require('uglifycss');
const colors = require('colors');
const lunr = require('lunr');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const async = require('async');
const nodemailer = require('nodemailer');
const sanitizeHtml = require('sanitize-html');
const escape = require('html-entities').AllHtmlEntities;
let ObjectId = require('mongodb').ObjectID;        

exports.createNewCategory = (req, res) => {
    const db = req.app.db;
    return exports.getMenu(db)
    .then((menu) => {
        if(!menu || !menu.categories){
            menu = {};
            menu.categories = [];
        }
        let newCategory = {
            title: req.body.navCategoryName,
            order: menu.categories.length === 0 ? 1 : _.last(_.sortBy(menu.categories, 'order')).order + 1
        };

        menu.categories.push(newCategory);
        return db.menu.updateOne({}, {$set: {categories: menu.categories}}, {upsert: true})
        .then(() => {
            return true;
        });
    })
    .catch((err) => {
        console.log('Error create new category', err);
        return false;
    });
};

exports.deleteCategory = (req, res, id) => {
    const db = req.app.db;
    return exports.getMenu(db)
        .then((menu) => {
            const idCategory = menu.categories.findIndex(item => item.order === +id);
            const nameCategory = menu.categories[idCategory].title;
            menu.categories.splice(idCategory, 1);

            if(menu.items){
                menu.items.forEach((item) => {
                    if(item.category === nameCategory){
                        item.category = 'Select a category';
                    }
                });
            }

            return db.menu.updateOne({}, {$set: {categories: menu.categories, items: menu.items}}, {upsert: true})
                .then(() => {
                    return true;
                });
        })
        .catch(() => {
            return false;
        });
};

exports.updateCategory = (req, res) => {
    const db = req.app.db;
    return exports.getMenu(db)
        .then((menu) => {
            let categoryIndex = _.findIndex(menu.categories, ['title', req.body.navCategoryId]);
            menu.categories[categoryIndex].title = req.body.navCategoryName;

            if(menu.items){
                menu.items.forEach((item) => {
                    if(item.category === req.body.navCategoryId){
                        item.category = req.body.navCategoryName;
                    }
                });
            }

            return db.menu.updateOne({}, {$set: {categories: menu.categories, items: menu.items}}, {upsert: true})
                .then(() => {
                    return true;
                });
        })
        .catch(() => {
            return false;
        });
};

