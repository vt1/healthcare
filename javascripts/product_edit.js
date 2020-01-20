$(document).ready(() => {
    localStorage.clear();
    $('#productTab li:nth-child(1) a').tab('show');

    let optProdJson = $('#productOptionJson').val();
    let optPricesJson = $('#productPricesJson').val();
    let optProdType = $('#select_product_opt_type').val();

    let localStorageID = $('#frmProductId').val();

    const productOptions = JSON.parse(localStorage.getItem('productOptions' + localStorageID)) || [];
    productOptions.push(optProdJson);
    localStorage.setItem('productOptions' + localStorageID, productOptions);

    const optionsPrice = JSON.parse(localStorage.getItem('productPrices' + localStorageID)) || [];
    optionsPrice.push(optPricesJson);
    localStorage.setItem('productPrices' + localStorageID, optionsPrice);

    renderProductOptionsForm(optProdType);
    renderPriceForm(optProdType);
    renderPriceBodyForm(optProdType);

    $('#select_product_opt_type').change(() => {
        let optProdType = $('#select_product_opt_type').val();
        renderProductOptionsForm(optProdType);
        renderPriceForm(optProdType);
        renderPriceBodyForm(optProdType);
    });
});
