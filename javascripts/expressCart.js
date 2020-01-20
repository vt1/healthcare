/* eslint-disable prefer-arrow-callback,  no-var, no-tabs */
$(document).ready(function (){
        $(document).on('click', '#orderRefundMoney', e => {
        const result = confirm('Are you sure you want refund money for this order?');
        if(result === true){
            $.ajax({
                method: 'POST',
                url: '/admin/order/refundmoney',
                data: {order_id: $('#order_id').val()}
            })
                .done(function (msg){
                    showNotification(msg.message, 'success', true);
                })
                .fail(function (msg){
                    showNotification(msg.responseJSON.message, 'danger');
                });
        }else{
            e.preventDefault();
        }
    });

    $(document).on('click', '.product_opt_remove', function(e){
        e.preventDefault();
        const name = $(this).closest('li').find('.opt-name').html();
        const optProdType = $('#select_product_opt_type').val();

        const productAction = $('#productAction').val();
        const localStorageID = productAction === 'new' ? $('#prodOptId').val() : $('#frmProductId').val();

        const productOptions = JSON.parse(localStorage.getItem(`productOptions${localStorageID}`)) || [];
        const productPrices = JSON.parse(localStorage.getItem(`productPrices${localStorageID}`)) || [];
        const filteredProductPrices = productPrices.filter(option => option.optProdType !== optProdType);
        const currentProductPrices = productPrices.filter(option => option.optProdType === optProdType);

        const idx = _.findIndex(productOptions, {'optName': name, 'optProdType': optProdType});

        if(currentProductPrices.length > 0){
            $('#removeOptionModal').modal('show');
            $('.btn-ok').on('click', function (){
                productOptions.splice(idx, 1);
                localStorage.setItem(`productOptions${localStorageID}`, JSON.stringify(productOptions));
                localStorage.setItem(`productPrices${localStorageID}`, JSON.stringify(filteredProductPrices));
                $('#removeOptionModal').modal('hide');
                renderProductOptionsForm(optProdType);
                renderPriceForm(optProdType);
                renderPriceBodyForm(optProdType);
            });
        }else{
            productOptions.splice(idx, 1);
            localStorage.setItem(`productOptions${localStorageID}`, JSON.stringify(productOptions));
            localStorage.setItem(`productPrices${localStorageID}`, JSON.stringify(filteredProductPrices));
        }
        renderProductOptionsForm(optProdType);
        renderPriceForm(optProdType);
        renderPriceBodyForm(optProdType);
    });

    $(document).on('click', '.product_opt_price_remove', function(e){
        e.preventDefault();

        const productAction = $('#productAction').val();
        let optProdType = $('#select_product_opt_type').val();
        let localStorageID = productAction === 'new' ? $('#prodOptId').val() : $('#frmProductId').val();

        let optionsPrice = JSON.parse(localStorage.getItem(`productPrices${localStorageID}`)) || [];
        let divs = $(this).closest('li').find('.col-lg-2');
        let tmpArray = [];

        divs.each(function(){
            tmpArray.push($(this).text());
        });

        tmpArray.pop();

        const searchTerm = Object.assign({}, optionsPrice.filter(item => item.optProdType === optProdType)[0]);

        let i = 0;
        for(let _prop in searchTerm){
            searchTerm[_prop] = tmpArray[i];
            i++;
        }

        const idx = _.findIndex(optionsPrice, searchTerm, 0);
        optionsPrice.splice(idx, 1);
        localStorage.setItem(`productPrices${localStorageID}`, JSON.stringify(optionsPrice));
        renderPriceBodyForm(optProdType);
    });
        $('#clear_local_storage').click(function(){
        localStorage.clear();
        console.log('Clear. Local storage length: ' + localStorage.length);
    })

    $('#show_local_storage').click(function(){
        console.log('Local storage content: ', localStorage);
    })

    $('#select_product_opt_type').change(function(){
        const productAction = $('#productAction').val();
        if(productAction === 'new'){
            let optProdType = $('#select_product_opt_type').val();
            renderProductOptionsForm(optProdType);
            renderPriceForm(optProdType);
            renderPriceBodyForm(optProdType);
        }else{
            //
        }
    });

    $(document).on('click', '#product_opt_add', function(e){
        e.preventDefault();

        let optId = new Date().getTime();
        const productAction = $('#productAction').val();

        if(productAction === 'new'){
            if($('#prodOptId').val() === ''){
                $('#prodOptId').val(optId);
            }
        }

        // get values from inputs
        var optName = $('#product_optName').val();
        var optLabel = $('#product_optLabel').val();
        var optType = $('#product_optType').val();
        var optOptions = $('#product_optOptions').val();
        var optProdType = $('#select_product_opt_type').val();

        if(optName.trim() === '' &&
           optLabel.trim() === '' &&
           optOptions.trim() === ''){
            showNotification('Product options: Name or Label or Options must not be empty.', 'danger', false);
            return;
        }

        // json for input 'productOptJson'
        var optJson = {};
        if($('#productOptJson').val() !== ''){
            optJson = JSON.parse($('#productOptJson').val());
        }

        var html = '<li class="list-group-item li-prod-opt">';
        html += '<div class="row">';
        html += '<div class="col-lg-2 opt-name">' + optName + '</div>';
        html += '<div class="col-lg-2 opt-label">' + optLabel + '</div>';
        html += '<div class="col-lg-2 opt-type">' + optType + '</div>';
        html += '<div class="col-lg-4 opt-options">' + optOptions + '</div>';
        html += '<div class="col-lg-2 text-right">';
        html += '<button class="product_opt_remove btn btn-danger btn-sm">Remove</button>';
        html += '</div></div></li>';

        // append data
        $('#product_opt_wrapper').append(html);

        // formation of json, converting to string, and setting its value to input 'productOptJson'
        optJson[optName] = {
            optId: optId,
            optName: optName,
            optLabel: optLabel,
            optType: optType,
            optProdType: optProdType,
            optOptions: $.grep(optOptions.split(','), function(n){ return n === 0 || n; })
        };

        // write new json back to field
        $('#productOptJson').val(JSON.stringify(optJson));

        // clear inputs
        $('#product_optName').val('');
        $('#product_optLabel').val('');
        $('#product_optOptions').val('');

        // json for local storage
        let optProdJson = {
            optId: optId,
            optName: optName,
            optLabel: optLabel,
            optType: optType,
            optProdType: optProdType,
            optOptions: $.grep(optOptions.split(','), function(n){ return n === 0 || n; })
        };

        let localStorageID = productAction === 'new' ? $('#prodOptId').val() : $('#frmProductId').val();

        const productOptions = JSON.parse(localStorage.getItem(`productOptions${localStorageID}`)) || [];
        productOptions.push(optProdJson);
        localStorage.setItem(`productOptions${localStorageID}`, JSON.stringify(productOptions));

        const optionsPrice = JSON.parse(localStorage.getItem(`productPrices${localStorageID}`)) || [];
        const productPrices = optionsPrice.filter(option => option.optProdType !== optProdType);
        localStorage.setItem(`productPrices${localStorageID}`, JSON.stringify(productPrices));

        renderPriceForm(optProdType);
    });

    $(document).on('click', '#product_opt_price_add', function(e){
        e.preventDefault();

        let divs = $(this).closest('div.row').find('.product-price-option');
        const productAction = $('#productAction').val();
        let optProdType = $('#select_product_opt_type').val();

        let price = $('#input_opt_price_header').val();
        if(price.trim() === ''){
            showNotification('Price must not be empty.', 'danger', false);
        }

        let prodPriceJson = {};

        divs.each(function(){
            let selectElement = $(this).find('.form-control');
            let selectOption = selectElement.attr('data-id');
            let selectValue = selectElement.val();
            prodPriceJson[selectOption] = selectValue;
        });

        prodPriceJson['price'] = price;
        prodPriceJson['optProdType'] = optProdType;

        let html = '<li class="list-group-item li-prod-price">';
        html += '<div class="row">';
        for(let propName in prodPriceJson){
            html += `<div class="col-lg-2">${prodPriceJson[propName]}</div>`;
        }

        html += '<div class="col-lg-2 text-right"><button class="product_opt_price_remove btn btn-danger btn-sm">Remove</button></div></div></li>';
        $('#product_opt_price_wrapper').append(html);

        let localStorageID = productAction === 'new' ? $('#prodOptId').val() : $('#frmProductId').val();

        const productPrices = JSON.parse(localStorage.getItem(`productPrices${localStorageID}`)) || [];
        productPrices.push(prodPriceJson);
        localStorage.setItem(`productPrices${localStorageID}`, JSON.stringify(productPrices));
    });

     $('.delete-prod-type').on('click', function() {
        const prodTypeName = $(this).closest('.drag-row').find('.navProductTypeId').attr('value');
        const answer = confirm('Are you sure?');
        if(answer) {
            $.ajax({
                type: 'POST',
                url: '/admin/products/type/deletetype',
                data: {prodTypeName: prodTypeName},
                success: function(msg){
                    showNotification(msg, 'success', true);
                },
                error: function(msg){
                    showNotification(msg, 'danger', true);
                }
            });
        }
    });

// rendering product options form depending on product type data(tablets, capsules and so on)
function renderProductOptionsForm(optionProductType){
    $('.li-prod-opt').remove();

    const productView = $('#productView').val();
    const productAction = $('#productAction').val();
    let localStorageID = productAction === 'new' ? $('#prodOptId').val() : $('#frmProductId').val();

    const options = JSON.parse(localStorage.getItem(`productOptions${localStorageID}`)) || [];
    const productOptions = options.filter(option => option.optProdType === optionProductType);

    productOptions.forEach(productOption => {
        let html = '<li class="list-group-item li-prod-opt">';
        html += '<div class="row">';
        html += '<div class="col-lg-2 opt-name">' + productOption.optName + '</div>';
        html += '<div class="col-lg-2 opt-label">' + productOption.optLabel + '</div>';
        html += '<div class="col-lg-2 opt-type">' + productOption.optType + '</div>';
        html += '<div class="col-lg-4 opt-options">' + productOption.optOptions + '</div>';
        html += '<div class="col-lg-2 text-right">';
        if(productView === undefined){
            html += '<button class="product_opt_remove btn btn-danger btn-sm">Remove</button>';
        }
        html += '</div></div></li>';
        $('#product_opt_wrapper').append(html);
    });
}

// rendering price form depending on product TYPE data(tablets, capsules and so on)
function renderPriceForm(optionProductType){
    $('.li-prod-price-header').remove();
    $('.li-prod-price').remove();
    const productView = $('#productView').val();
    const productAction = $('#productAction').val();
    let localStorageID = productAction === 'new' ? $('#prodOptId').val() : $('#frmProductId').val();

    const options = JSON.parse(localStorage.getItem(`productOptions${localStorageID}`)) || [];
    const productOptions = options.filter(option => option.optProdType === optionProductType);

    if(productOptions.length){
        let html = '<li class="list-group-item li-prod-price-header">';
        html += '<div class="row">';

        productOptions.forEach(productOption => {
            html += '<div class="col-lg-2 product-price-option">';
            html += '<strong>' + productOption.optName + '</strong>';
            if(productView === undefined){
                html += '<select id="product_opt_price_header_' + productOption.optName + '" class="form-control" data-id="' + productOption.optName + '">';
            }else{
                html += '<select id="product_opt_price_header_' + productOption.optName + '" class="form-control" data-id="' + productOption.optName + '" disabled>';
            }
            for(let j = 0; j < productOption.optOptions.length; j++){
                html += '<option value="' + productOption.optOptions[j] + '">' + productOption.optOptions[j] + '</option>';
            }
            html += '</select>';
            html += '</div>';
        });

        html += '<div class="col-lg-4">';
        html += '<strong>Price</strong>';
        if(productView === undefined){
            html += '<input type="text" id="input_opt_price_header" class="form-control" placeholder="price" /></div>';
        }else{
            html += '<input type="text" id="input_opt_price_header" class="form-control" placeholder="price" disabled /></div>';
        }

        html += '<div class="col-lg-2 text-right"></br>';
        if(productView === undefined){
            html += '<button id="product_opt_price_add" class="btn btn-success">Add price</button>';
        }
        html += '</div></div></li>';
        $('#product_opt_price_wrapper').append(html);
    }
}

function renderPriceBodyForm(optionProductType){
    $('.li-prod-price').remove();
    const productView = $('#productView').val();
    const productAction = $('#productAction').val();
    let localStorageID = productAction === 'new' ? $('#prodOptId').val() : $('#frmProductId').val();

    const options = JSON.parse(localStorage.getItem(`productPrices${localStorageID}`)) || [];
    const productPrices = options.filter(option => option.optProdType === optionProductType);

    if(productPrices.length){
        productPrices.forEach(productPrice => {
            let html = '<li class="list-group-item li-prod-price">';
            html += '<div class="row">';
            for(let prop in productPrice){
                html += '<div class="col-lg-2">' + productPrice[prop] + '</div>';
            }
            html += '<div class="col-lg-2 text-right">';
            if(productView === undefined){
                html += '<button class="product_opt_price_remove btn btn-danger btn-sm">Remove</button>';
            }
            html += '</div></div></li>';
            $('#product_opt_price_wrapper').append(html);
        });
    }
}
