let cancelTokenSource = null;
let calculatecartCancelTokenSource = null;
let _cache_category_tree = null;
let _cache_categories = null;
let _cache_main_menu = null;
let _cache_footer_menu = null;
let _cache_brands = null;
let _cache_units = null;
let _cache_customerMargin = null;
let forceFilters = null;
let _cache_collections = null;
const requestCacheUnits = new Map();
const requestCacheCategories = new Map();
const requestCacheBrands = new Map();
const requestCacheCollections = new Map();
const requestCacheCategoryTree = new Map();






var updateInfoData = localStorage.getItem(`${app.config.globalProperties._updateInfo.companyId}-UpdateInfo`);
if (updateInfoData === null || updateInfoData === undefined) {
    updateInfoData = app.config.globalProperties._updateInfo;
    localStorage.setItem(`${app.config.globalProperties._updateInfo.companyId}-UpdateInfo`, JSON.stringify(app.config.globalProperties._updateInfo));
}
else {
    updateInfoData = JSON.parse(updateInfoData);
    var hasChanges = false;
    if (updateInfoData.categories < app.config.globalProperties._updateInfo.categories) {
        hasChanges = true;
        _localStorageStartsWithClear(`${updateInfoData.companyId}-categories`);
    }
    if (updateInfoData.brands < app.config.globalProperties._updateInfo.brands) {
        hasChanges = true;
        _localStorageStartsWithClear(`${updateInfoData.companyId}-brands`);
    }
    if (updateInfoData.units < app.config.globalProperties._updateInfo.units) {
        hasChanges = true;
        _localStorageStartsWithClear(`${updateInfoData.companyId}-units`);
    }
    if (updateInfoData.headerMenu < app.config.globalProperties._updateInfo.headerMenu) {
        hasChanges = true;
        _localStorageStartsWithClear(`${updateInfoData.companyId}-header-menu`);
    }
    if (updateInfoData.footerMenu < app.config.globalProperties._updateInfo.footerMenu) {
        hasChanges = true;
        _localStorageStartsWithClear(`${updateInfoData.companyId}-footer-menu`);
    }
    if (updateInfoData.customerMargin < app.config.globalProperties._updateInfo.customerMargin) {
        hasChanges = true;
        _localStorageStartsWithClear(`${updateInfoData.companyId}-customerMargin`);
    }
    if (hasChanges)
        localStorage.setItem(`${app.config.globalProperties._updateInfo.companyId}-UpdateInfo`, JSON.stringify(app.config.globalProperties._updateInfo));
}

window.addEventListener("beforeunload", (event) => {
    if (document.activeElement) {
        if (document.activeElement.href && document.activeElement.href.endsWith("/account/logout")) {
            localStorage.removeItem("cartToken");
            localStorage.removeItem("cartData");
            emitter.emit("user-sign-out", { data: { userId: app.config.globalProperties._global.userId } });
        }
        else if (document.location.pathname.startsWith("/checkout") && (!document.activeElement.href || !document.activeElement.href.endsWith("/checkout")) && localStorage.checkoutToken) {
            emitter.emit("abandon-checkout", { data: { checkoutToken: localStorage.checkoutToken } });
        }
    }
});
document.addEventListener('DOMContentLoaded', onPageView);








function calculatePricing(collections, showProducts, pricingCallback) {
    if (!pricingCallback) return;

    const calcCollections = [...collections];
    let count = 0;

    calcCollections.forEach(collection => {
        _calculatePricing(collection.products, c => {
            if (c?.length === collection.products?.length) {
                collection.products = c;
            }
            count++;

            if (count === calcCollections.length) {
                pricingCallback(calcCollections);
            }
        });
    });
}
function onPageView() {
    var path = window.location.pathname;
    if (path.startsWith("/category/") || path.startsWith("/categories/")) {
        emitter.emit("category-view", { data: app.config.globalProperties._filterList.record });
    }
    else if (path.startsWith("/brand/")) {

        emitter.emit("brand-view", { data: app.config.globalProperties._filterList.record });
    }
    else if (path.startsWith("/collection/")) {
        emitter.emit("collection-view", { data: app.config.globalProperties._filterList.record });
    }
    else if (path.startsWith("/product/")) {

        emitter.emit("product-view", { data: app.config.globalProperties._product });
    }
    else {
        emitter.emit("page-view", { data: { path: path } });
    }
}

function isBackgroundColorLight(colorBG) {
    var hex = colorBG.replace('#', '');
    if (hex.length === 3) {
        hex = hex.split('').map(function (hexnew) {
            return hexnew + hexnew;
        }).join('');
    }
    const c_r = parseInt(hex.substr(0, 2), 16);
    const c_g = parseInt(hex.substr(2, 2), 16);
    const c_b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;
    return brightness > 155;
}

function _localStorageStartsWithClear(key) {
    Object.keys(localStorage)
        .filter(x =>
            x.startsWith(key))
        .forEach(x =>
            localStorage.removeItem(x));
};

function _searchNavigationsById(navigations, id) {
    if (navigations == null) {
        return null;
    }
    var i;
    var result = null;
    for (i = 0; result == null && i < navigations.length; i++) {
        if (navigations[i].relativeId == id)
            return navigations[i].navigations
        if (navigations[i].navigations != null) {
            result = _searchNavigationsById(navigations[i].navigations, id);
            if (result != null)
                return result;
        }
    }

    return null;
};

function _filterListByIds(objs, ids) {
    if (ids == null || ids.length === 0)
        return objs;
    return objs.filter((value) => {
        return ids.includes(value.id);
    });
};

function _getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
};

function _buildProductSearchUrl(searchCriteria, endpoint) {
    const baseUrl = ''; // Define your base URL here
    const urlParameters = Object.keys(searchCriteria).filter(key => searchCriteria[key] != null)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(searchCriteria[key])}`)
        .join('&');
    return `${baseUrl}${endpoint}?${urlParameters}`;
}

function _fetchData(url, callback) {
    axios.get(url)
        .then(response => {
            const totalCount = parseInt(response.headers['x-total-count']);
            callback(response.data, totalCount);
        })
        .catch(error => {
            // Handle errors here
            console.error(error);
        });
}

function _calculatePricing(products, callbackPricing) {
    axios.post('/api/pricing/calculate', products)
        .then(pricingResp => {
            if (products?.length > 0 && pricingResp.data?.length > 0) {
                products.forEach(p => {
                    let targetRespProduct = pricingResp.data.find(f => f.id == p.id);
                    if (p?.productVariants?.length > 0) {
                        p.productVariants.forEach(variant => {
                            let targetVariant = targetRespProduct.productVariants?.find(v => v.id == variant.id);

                            variant.price = targetVariant.price;
                            variant.initialPrice = targetVariant.initialPrice;
                        });
                    }
                });
            }

            callbackPricing(products);
        })
        .catch(error => {
            // Handle pricing calculation errors here
            console.error(error);
        });
}

function _findProducts(page, pagesize, filter, calc, sort = "-SortDate", callback) {
    if (calc) {
        axios({
            method: 'get',
            url: `/api/products/calculate?page=${page}&pageSize=${pagesize}&${filter}${forceFilters != null ? '&' + forceFilters : ''}`,
            params: {
                sort: sort,
            },
        }).then(response => {
            let totalCount = response.headers["x-total-count"];
            totalCount = parseInt(totalCount);
            var products = _initializeProductProperties(response.data);
            emitter.emit("search-results", {
                data: products, totalCount: totalCount, searchCriteria: filter
            });
            callback(products, totalCount);
        });
    }
    else {
        axios({
            method: 'get',
            url: `/api/products?page=${page}&pageSize=${pagesize}&${filter}${forceFilters != null ? '&' + forceFilters : ''}`,
            params: {
                sort: sort,
            },
        }).then(response => {
            let totalCount = response.headers["x-total-count"];
            totalCount = parseInt(totalCount);
            var products = _initializeProductProperties(response.data);
            emitter.emit("search-results", { data: products });
            callback(products, totalCount);
        });
    }
};

function _internalSetupFilters(pageNumber, pageSize, sort) {
    let paths = window.location.pathname.split('/');
    var childPath = _getCookie("_domainpath");
    if (childPath != null) {
        childPath = decodeURIComponent(childPath);
        childPath = childPath.split("/")[1];
        paths = paths.filter(p => p !== childPath)
    }

    let urlAlias = paths[2];
    let endPoint = paths[1];

    let searchParams = new Proxy(new URLSearchParams(window.location.search), {

        get: (searchParams, prop) => {
            if (prop.startsWith("size")) {
                return searchParams.getAll(prop);
            }
            else {
                return searchParams.get(prop);
            }
        },

    });


    if (searchParams.page) {
        pageNumber = searchParams.page
    } else {
        pageNumber = pageNumber ? pageNumber : 1;
    }

    if (searchParams.pageSize) {
        pageSize = searchParams.pageSize
    } else {
        pageSize = pageSize ? pageSize : 18;
    }

    var filterData = {
        alias: urlAlias,
        id: app.config.globalProperties._filterList.record.id,
        endPoint: endPoint,
        page: parseInt(pageNumber),
        pageSize: parseInt(pageSize),
        //sort: 'insertdate',
        sort: sort ? sort : "-SortDate",
        minPrice: Math.floor(app.config.globalProperties._filterList.filters.filterGroups?.find(g => g.type == "Price")?.min),
        maxPrice: Math.ceil(app.config.globalProperties._filterList.filters.filterGroups?.find(g => g.type == "Price")?.max),
        minRetailPrice: Math.floor(app.config.globalProperties._filterList.filters.filterGroups?.find(g => g.type == "RetailPrice")?.min),
        maxRetailPrice: Math.ceil(app.config.globalProperties._filterList.filters.filterGroups?.find(g => g.type == "RetailPrice")?.max),
        searchText: searchParams?.search ?? searchParams?.s,
        tag: searchParams?.tag,
        size1: searchParams?.size1,
        size2: searchParams?.size2,
        size3: searchParams?.size3,
        size4: searchParams?.size4,
        size5: searchParams?.size5,
        size6: searchParams?.size6,
        sourcetag: searchParams?.sourcetag,
        insertDate: searchParams?.insertDate,
        filters: app.config.globalProperties._getFilters(),
        products: null
    };


    filterData = app.config.globalProperties._buildFilters(filterData);
    return filterData;
};

function _sendInternalFilterRequest(filterdata, callback, pricingCallback) {

    var requestProducts = null;

    if (filterdata.endPoint == "search") {
        if (pricingCallback) {
            requestProducts = axios({
                method: 'get',
                url: `/api/products/${filterdata.requestUrl}${forceFilters != null ? '&' + forceFilters : ''}`,
                params: {
                    page: filterdata.page,
                    pageSize: filterdata.pageSize,
                    sort: filterdata.sort,
                },
            });
        } else {
            requestProducts = axios({
                method: 'get',
                url: `/api/products/calculate${filterdata.requestUrl}${forceFilters != null ? '&' + forceFilters : ''}`,
                params: {
                    page: filterdata.page,
                    pageSize: filterdata.pageSize,
                    sort: filterdata.sort,
                },
            });
        }
    } else {
        requestProducts = axios({
            method: 'get',
            url: `/api/products/${filterdata.endPoint}/${filterdata.id}${filterdata.requestUrl}${forceFilters != null ? '&' + forceFilters : ''}&calculate=${pricingCallback ? false : true}`,
            params: {
                page: filterdata.page,
                pageSize: filterdata.pageSize,
                sort: filterdata.sort,
            },
        });
    }
    const requestFilters = app.config.globalProperties._getFiltersCount(filterdata);

    Promise.all([requestProducts, requestFilters]).then(responses => {
        const responseProducts = responses[0];
        if (responseProducts.status != 200 || responseProducts.data == undefined || responseProducts.data == null)
            return callback(null);

        let totalCount = responseProducts.headers["x-total-count"];
        let products = responseProducts.data;
        products = _initializeProductProperties(products);
        filterdata.products = products;
        filterdata.totalCount = parseInt(totalCount);

        if (responses[1] != null) {
            var filtersCount = responses[1].data;
            filterdata.filters.forEach(filtergroup => {
                filtergroup.values?.map(s => s.count = filtersCount.find(f => f.id === s.id)?.count);
            });
        }
        callback(filterdata);

        if (pricingCallback && products?.length > 0) {
            _calculatePricing(products, pricingCallback);
        }

    });

};

function _initializeProductProperties(products) {
    products.forEach(p => {
        if (p.productVariants[0].salesUnitId != null) {
            app.config.globalProperties._findUnitsByIds([p.productVariants[0].salesUnitId, p.productVariants[0].unitId], units => {
                p.productVariants[0].unit = units.find(u => u.id == p.productVariants[0].salesUnitId)?.name;
                var unit = units.find(u => u.id == p.productVariants[0].unitId);
                p.productVariants[0].unitPriceWithDescr = `${app.config.globalProperties._calculateCurrency(p.productVariants[0].unitPrice)} / ${unit?.name}`;
            })
        }
        if (p.productVariants[0].suggestedOrderQuantity !== null && p.productVariants[0].suggestedOrderQuantity > 0) {
            p.productVariants[0].selectedQuantity = p.productVariants[0].suggestedOrderQuantity;
        }
        else if (p.productVariants[0].orderQuantityStep !== null && p.productVariants[0].orderQuantityStep !== 0) {
            p.productVariants[0].selectedQuantity = p.productVariants[0].orderQuantityStep;
        }
        else {
            p.productVariants[0].selectedQuantity = 1;
        }
        p.variant = p.productVariants[0]

        p.productVariants.forEach(v => {
            v.selectedQuantity = 1;
            if (v.suggestedOrderQuantity !== null && v.suggestedOrderQuantity > 0) {
                v.selectedQuantity = v.suggestedOrderQuantity;
            }
            if (v.salesUnitId != null)
                app.config.globalProperties._findUnitsByIds([v.salesUnitId], e => {
                    v.unit = e[0].name;
                })
        });

        app.config.globalProperties._findBrandsByIds([p.brandId], brands => {
            if (brands?.length > 0) {
                p.brand = brands[0];
            } else {
                p.brand = null;
            }
        });

        app.config.globalProperties._findCategoriesByIds([p.categoryId], categories => {
            if (categories?.length > 0) {
                p.category = categories[0];
            } else {
                p.category = null;
            }
        });
    });

    return products;
};

function _getInternalContentByType(id, type, callback) {
    axios({
        method: 'get',
        url: `/api/${type}/${id}/documentation`
    }).then(response => {
        if (response.data !== "") {
            callback(response.data);
        }
    });
};

function _getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
};

function proceedToComplete(data, onSuccess, onError) {
    if (data.payment != null && data.payment.provider != null) {
        app.config.globalProperties._initiatePayment(e => {
            if (e.data.redirectUrl && (data.payment.provider == "PayPal" || data.payment.provider == "JCC" || data.payment.provider == "Stripe")) {
                window.location.href = e.data.redirectUrl
            } else if (e.data.formRequest != null && data.payment.provider == "EDPS") {
                var form = `<div class="container d-none">
                    <form action="${e.data.formRequest.action}" method="POST" accept-charset="utf-8" enctype="application/x-www-form-urlencoded" id="edpspayment">

                        <input name="txnid" type="hidden" value="${e.data.formRequest.txnid}" />

                        <input name="backurl" type="hidden" value="${e.data.formRequest.backurl}" />

                        <input name="mid" type="hidden" value="${e.data.formRequest.mid}" />

                        <input name="mode" type="hidden" value="${e.data.formRequest.mode}" />

                        <input name="date" type="hidden" value="${e.data.formRequest.date}" />

                        <input name="amount" type="hidden" value="${e.data.formRequest.amount}" />

                        <input name="billingAddr" type="hidden" value="${e.data.formRequest.billingAddr}" />

                        <input type="submit" value="Submit">

                    </form>
                </div>`;
                window.document.body.insertAdjacentHTML('beforeend', form);
                document.getElementById("edpspayment").submit();
            } else if (e.data.formRequest != null && data.payment.provider == "Epay") {
                var form = `<div class="container d-none">
                    <form action="${e.data.formRequest.action}" method="POST" accept-charset="utf-8" enctype="application/x-www-form-urlencoded" id="epaypayment">

                        <input name="acquirerId" type="hidden" value="${e.data.formRequest.acquirerId}" />

                        <input name="merchantId" type="hidden" value="${e.data.formRequest.merchantId}" />

                        <input name="posId" type="hidden" value="${e.data.formRequest.posId}" />

                        <input name="user" type="hidden" value="${e.data.formRequest.user}" />

                        <input name="languageCode" type="hidden" value="${e.data.formRequest.languageCode}" />

                        <input name="merchantReference" type="hidden" value="${e.data.formRequest.merchantReference}" />

                        <input name="paramBackLink" type="hidden" value="${e.data.formRequest.paramBackLink}" />

                        <input type="submit" value="Submit">

                    </form>
                </div>`;
                window.document.body.insertAdjacentHTML('beforeend', form);
                document.getElementById("epaypayment").submit();
            } else if (e.data.formRequest != null && data.payment.provider == "CardLink") {
                var form = `<div class="container d-none">
                    <form action="${e.data.formRequest.action}" method="POST" accept-charset="utf-8" enctype="application/x-www-form-urlencoded" id="cardlinkpayment">

                        <input name="version" type="hidden" value="${e.data.formRequest.version}" />

                        <input name="mid" type="hidden" value="${e.data.formRequest.mid}" />

                        <input name="lang" type="hidden" value="${e.data.formRequest.lang}" />

                        <input name="orderDesc" type="hidden" value="${e.data.formRequest.orderDesc}" />

                        <input name="orderAmount" type="hidden" value="${e.data.formRequest.orderAmount}" />

                        <input name="currency" type="hidden" value="${e.data.formRequest.currency}" />

                        <input name="payerEmail" type="hidden" value="${e.data.formRequest.payerEmail}" />

                        <input name="payerPhone" type="hidden" value="${e.data.formRequest.payerPhone}" />

                        <input name="billCountry" type="hidden" value="${e.data.formRequest.billCountry}" />

                        <input name="billZip" type="hidden" value="${e.data.formRequest.billZip}" />

                        <input name="billCity" type="hidden" value="${e.data.formRequest.billCity}" />

                        <input name="billAddress" type="hidden" value="${e.data.formRequest.billAddress}" />

                        <input name="confirmUrl" type="hidden" value="${e.data.formRequest.confirmUrl}" />

                        <input name="cancelUrl" type="hidden" value="${e.data.formRequest.cancelUrl}" />

                        <input name="orderid" type="hidden" value="${e.data.formRequest.orderid}" />

                        <input name="digest" type="hidden" value="${e.data.formRequest.digest}" />

                    </form>
                </div>`;
                window.document.body.insertAdjacentHTML('beforeend', form);
                document.getElementById("cardlinkpayment").submit();
            } else if (e.data.htmlSnippet != null && data.payment.provider == "Klarna") {
                var checkoutContainer = document.getElementById('app')
                checkoutContainer.innerHTML = e.data.htmlSnippet
                var scriptsTags = checkoutContainer.getElementsByTagName('script')
                // This is necessary otherwise the scripts tags are not going to be evaluated
                for (var i = 0; i < scriptsTags.length; i++) {
                    var parentNode = scriptsTags[i].parentNode
                    var newScriptTag = document.createElement('script')
                    newScriptTag.type = 'text/javascript'
                    newScriptTag.text = scriptsTags[i].text
                    parentNode.removeChild(scriptsTags[i])
                    parentNode.appendChild(newScriptTag)
                }

            }
            else {
                app.config.globalProperties._completeCheckout(c => {
                    onSuccess(c);
                }, onError);
            }
        })
    } else {
        app.config.globalProperties._completeCheckout(c => {
            onSuccess(c);
        }, onError);
    }

}

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function getCurrencyCode() {
    var currency = _getCookie("_currency");
    if (currency === null || currency === "" || currency === undefined)
        currency = "eur";
    return currency;
};

internalUploadFiles = async (fields, callback) => {
    await Promise.all(fields.map(async (field) => {
        const files = document.getElementById(field.name).files;
        let values = [];
        if (files != null && files.length > 0) {
            await Promise.all(Array.from(files).map(async (file) => {
                const response = await app.config.globalProperties._uploadContactFormFile(file);
                values.push(response);
            }))
            field.value = values.join(",");
            callback({ response: null, error: false });
        }
    }))
        .catch(function (err) {
            callback({ response: err.message, error: true })
        });
}

internalCreateCartFromFile = async (guid, filetype) => {
    var type = "";
    if (filetype == "text/csv") {
        type = "csv"
    } else if (filetype == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        type = "excel"
    }
    try {
        const response = await axios({
            method: 'post',
            url: `/api/cart/createcart/${guid}/${type}`,
        });
        cartData = response.data.cart;
        localStorage.cartToken = cartData.token;
        localStorage.setItem("cartData", JSON.stringify(cartData));
        emitter.emit("cart-changed", cartData);
        return response;
    } catch (ex) {
        return ex.response;
    }
}

internalUploadFile = async (file, url) => {
    const chunkSize = 200000
    var guid = uuidv4(0);
    var index = 0;
    try {
        for (let start = 0; start < file.size; start += chunkSize) {
            const chunk = file.slice(start, start + chunkSize)
            const fd = new FormData()
            fd.set('myFile', chunk);
            var chunkMetaData = {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                lastModified: file.lastModified,
                index: index++,
                totalCount: Math.ceil(file.size / chunkSize),
                fileGuid: guid
            }
            fd.set("chunkmetadata", JSON.stringify(chunkMetaData));
            await fetch(url, { method: 'post', body: fd })
                .then((response) => {
                    if (!response.ok) {
                        return Promise.reject(response);
                    }
                })
                .then((json) => {
                })
                .catch((response) => {
                    console.log(response.status, response.statusText);
                    throw new Error(response.status)
                });
        }
        return guid;
    } catch (ex) {
        console.log(ex);
        throw new Error(ex.message);
    }
}

updateCustomer = async (customer) => {
    const response = await axios({
        method: 'put',
        url: `/api/customer/logo`,
        data: customer
    })

    return response.data
}

internalUploadFileWithParam = async (file, url, endpoint) => {
    const chunkSize = 200000
    var guid = uuidv4(0);
    var index = 0;
    for (let start = 0; start < file.size; start += chunkSize) {
        const chunk = file.slice(start, start + chunkSize)
        const fd = new FormData()
        fd.set('myFile', chunk);
        var chunkMetaData = {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            lastModified: file.lastModified,
            index: index++,
            totalCount: Math.ceil(file.size / chunkSize),
            fileGuid: guid
        }
        fd.set("chunkmetadata", JSON.stringify(chunkMetaData));
        var response = await fetch(`${url}?endpoint=${endpoint}`, { method: 'post', body: fd });
        if (!response.ok) {

            throw new Error(response.status);
        }


    }
    return guid;

}








app.config.globalProperties._accountForgotPassword = (data, callback) => {
    axios({
        method: 'post',
        url: `/api/account/forgotpassword`,
        data: data,
    }).then(response => {
        if (response.status != 200) {
            emitter.emit("user-forgot-password", { sucess: false, data: response.data });
            callback({ response: response, error: true })
        } else {
            emitter.emit("user-forgot-password", { sucess: true, data: response.data });
            callback({ response: response, error: false })
        }
    }).catch((error) => {
        emitter.emit("user-forgot-password", { sucess: false, data: error.response });
        callback({ response: error, error: true })
    });
};

app.config.globalProperties._accountLogin = (data, callback) => {
    axios({
        method: 'post',
        url: `/api/account/login`,
        data: data
    }).then(response => {
        if (response.status != 200) {
            emitter.emit("user-sign-in", { sucess: false, data: response.data });
            callback({ response: response, error: true })
        } else {
            emitter.emit("user-sign-in", { sucess: true, data: response.data });
            localStorage.removeItem("cartToken");
            localStorage.removeItem("cartData");
            axios({
                method: 'get',
                url: '/api/cart/user'
            }).then(response => {
                var cartData = response.data;
                localStorage.setItem("cartToken", cartData.token);
                localStorage.setItem("cartData", JSON.stringify(cartData));
            })
            callback({ response: response, error: false })
        }
    }).catch((error) => {
        emitter.emit("user-sign-in", { sucess: false, data: error.response });
        callback({ response: error, error: true })
    });
};

app.config.globalProperties._accountRegister = (data, callback) => {
    axios({
        method: 'post',
        url: `/api/account/register`,
        data: data
    }).then(response => {
        if (response.status != 200) {
            emitter.emit("user-register", { sucess: false, data: response.data });
            callback({ response: response, error: true })
        } else {
            emitter.emit("user-register", { sucess: true, data: response.data });
            callback({ response: response, error: false })
        }
    }).catch((error) => {
        emitter.emit("user-register", { sucess: false, data: error.response });
        callback({ response: error, error: true })
    });
};

app.config.globalProperties._addToCart = (productId, variantId, quantity) => {
    var cartitem = {};
    cartitem.variantId = variantId;
    cartitem.productId = productId;
    cartitem.quantity = quantity;
    if (!localStorage.cartToken && app.config.globalProperties._global.isAuthenticated) {
        axios({
            method: 'get',
            url: '/api/cart/user'
        }).then(response => {
            //console.log("hello", response.data.token);
            var cartData = response.data;
            localStorage.cartToken = cartData.token;
        });
    }
    axios({
        method: 'post',
        url: `/api/cart/${localStorage.cartToken}/add`,
        data: {
            productVariantId: variantId,
            productId: productId,
            quantity: quantity
        },
    }).then(response => {
        var cartData = response.data;
        localStorage.cartToken = cartData.token;
        localStorage.setItem("cartData", JSON.stringify(cartData));
        emitter.emit("cart-changed", cartData);
        app.config.globalProperties._publishAddToCart(cartitem);
    });
};

app.config.globalProperties._addToCartAsync = async (productId, variantId, quantity) => {
    var cartitem = {};
    cartitem.variantId = variantId;
    cartitem.productId = productId;
    cartitem.quantity = quantity;
    try {
        if (!localStorage.cartToken && app.config.globalProperties._global.isAuthenticated) {
            const response1 = await axios({
                method: 'get',
                url: '/api/cart/user'
            });
            //console.log("helloASYnc", response1.data.token);
            localStorage.cartToken = response1.data.token;
        }
        const response = await axios({
            method: 'post',
            url: `/api/cart/${localStorage.cartToken}/add`,
            data: {
                productVariantId: variantId,
                productId: productId,
                quantity: quantity
            },
        })
        var cartData = response.data;
        localStorage.cartToken = cartData.token;
        localStorage.setItem("cartData", JSON.stringify(cartData));
        emitter.emit("cart-changed", cartData);
        app.config.globalProperties._publishAddToCart(cartitem);
        return response.data;
    }
    catch (ex) {
        return ex.response;
    }
};

app.config.globalProperties._addToCartFromURL = (base64EncodedItems) => {
    if (!localStorage.cartToken && app.config.globalProperties._global.isAuthenticated) {
        axios({
            method: 'get',
            url: '/api/cart/user'
        }).then(response => {
            var cartData = response.data;
            localStorage.cartToken = cartData.token;
        });
    }
    axios({
        method: 'post',
        url: `/api/cart/createfromurl/${localStorage.cartToken}`,
        data: {
            url: base64EncodedItems
        },
    }).then(response => {
        var cartData = response.data;
        localStorage.cartToken = cartData.token;
        localStorage.setItem("cartData", JSON.stringify(cartData));
        emitter.emit("cart-changed", cartData);
        app.config.globalProperties._publishAddToCart(cartitem);
    });
}

app.config.globalProperties._addToCartMulti = (cartItems) => {
    axios({
        method: 'post',
        url: `/api/cart/${localStorage.cartToken}/addmultiple`,
        data: cartItems
    }).then(response => {
        var cartData = response.data;
        localStorage.cartToken = cartData.token;
        localStorage.setItem("cartData", JSON.stringify(cartData));
        emitter.emit("cart-changed", cartData);
        for (var i = 0; i < cartItems.length; i++) {
            app.config.globalProperties._publishAddToCart(cartItems[i]);
        }
    });
};

app.config.globalProperties._buildFilters = (filterdata) => {
    let globalUrl = "";
    let requestUrl = "?";
    if (filterdata.minPrice && filterdata.maxPrice)
        requestUrl += `pricerange=${filterdata.minPrice}:${filterdata.maxPrice}`;
    if (filterdata.minRetailPrice && filterdata.maxRetailPrice)
        requestUrl += `&priceretailrange=${filterdata.minRetailPrice}:${filterdata.maxRetailPrice}`;
    if (filterdata.searchText !== null && filterdata.searchText !== "")
        requestUrl += `&search=${filterdata.searchText.toLowerCase()}`;
    if (filterdata.tag !== null && filterdata.tag !== "")
        requestUrl += `&tag=${filterdata.tag}`;
    if (filterdata.sourcetag !== null && filterdata.sourcetag !== "")
        requestUrl += `&sourcetag=${filterdata.sourcetag}`;


    for (let i = 1; i < 7; i++) {
        if (filterdata[`size${i}`] !== null && filterdata[`size${i}`].length !== 0) {
            for (let j = 0; j < filterdata[`size${i}`].length; j++) {
                requestUrl += `&size${i}=${filterdata[`size${i}`][j]}`;
            }
        }
    }

    if (filterdata.insertDate !== null && filterdata.insertDate !== "") {
        if (requestUrl == "?") {
            requestUrl += `insertDate=${filterdata.insertDate}`;
        } else {
            requestUrl += `&insertDate=${filterdata.insertDate}`;
        }
    }

    filterdata.filters.forEach(filtergroup => {
        var selectedFilters = filtergroup.values?.filter(f => f.selected);
        if (selectedFilters?.length > 0) {
            globalUrl += "/" + filtergroup.slug + "/" + selectedFilters.map(s => s.slug).join("_or_");
            requestUrl += "&" + filtergroup.key + "=OneOf:" + selectedFilters.map(s => s.id).join(",");
        }
    });
    filterdata.historyUrl = globalUrl;
    filterdata.requestUrl = requestUrl;
    return filterdata;
};

app.config.globalProperties._calculateCart = (onSuccess, onError) => {
    if (calculatecartCancelTokenSource) {
        calculatecartCancelTokenSource.cancel();
    }
    calculatecartCancelTokenSource = axios.CancelToken.source();
    axios({
        method: 'get',
        url: `/api/cart/calculated/${localStorage.cartToken}/`,
        cancelToken: calculatecartCancelTokenSource.token
    }).then(response => {
        var cartData = response.data;

        onSuccess(cartData);
        emitter.emit("calculated-cart", { data: cartData });
    }).catch(ex => {
        onError(ex.response.status, ex.response.data);
    });
};

app.config.globalProperties._calculateCurrency = (price, digits = 2) => {
    var currency = _getCookie("_currency");
    if (currency === null || currency === "" || currency === undefined)
        currency = "eur";

    var culture = app.config.globalProperties._getCulture();

    var priceWithCurrency = new Intl.NumberFormat(culture, { style: 'currency', currency: currency, maximumFractionDigits: digits }).formatToParts(price).map(val => val.value).join('');
    return priceWithCurrency;
};

app.config.globalProperties._changePassword = (data, callback) => {
    axios({
        method: 'post',
        url: `/api/account/changepassword`,
        data: data,
    }).then(response => {
        if (response.status != 200) {
            callback({ response: response, error: true })
        } else {
            callback({ response: response, error: false })
        }

    }).catch((error) => {
        callback({ response: error.response, error: true })
    });
};

app.config.globalProperties._changePasswordProfile = (data, callback) => {
    axios({
        method: 'post',
        url: `/api/account/changeprofilepassword`,
        data: data,
    }).then(response => {

        if (response.status != 200) {
            callback({ response: response, error: true })
        } else {
            callback({ response: response, error: false })
        }
    }).catch((error) => {

        callback({ response: error.response, error: true })
    });
};

app.config.globalProperties._clearCart = () => {
    axios({
        method: 'delete',
        url: `/api/cart/${localStorage.cartToken}/all`
    }).then(response => {
        cartData = response.data;
        localStorage.cartToken = cartData.token;
        localStorage.setItem("cartData", JSON.stringify(cartData));
        emitter.emit("cart-changed", cartData);
    });
};

app.config.globalProperties._completeCheckout = (onSuccess, onError) => {
    axios({
        method: 'post',
        url: `/api/checkout/complete/${localStorage.checkoutToken}`,

    }).then(response => {
        localStorage.removeItem("cartToken");
        localStorage.removeItem("cartData");
        localStorage.removeItem("checkoutToken");

        emitter.emit("cart-changed", null);


        emitter.emit("complete-checkout", { data: response.data });
        onSuccess(response.data);
    }).catch(ex => {
        onError(ex.response.status, ex.response.data);
    });
};

app.config.globalProperties._createShoppingList = (data, callback) => {
    axios({
        method: 'post',
        url: `/api/ShoppingList`,
        data: data
    }).then(response => {
        var list = response.data;
        callback(list);
    });
};

app.config.globalProperties._deleteShoppingList = (alias, callback) => {
    axios({
        method: 'delete',
        url: `/api/ShoppingList/${alias}`,
    }).then(response => {
        var result = response;
        callback(result);
    });
};

app.config.globalProperties._findBrandsByIds = (brandIds, callback) => {

    if (_cache_brands != null)
        return callback(_filterListByIds(_cache_brands, brandIds));

    var lang = app.config.globalProperties._getCulture();
    var cacheKey = `${updateInfoData.companyId}-brands-${lang}`;
    var data = localStorage.getItem(cacheKey);

    if (data != null) {
        _cache_brands = JSON.parse(data);
        callback(_filterListByIds(_cache_brands, brandIds));
        return;
    }

    if (requestCacheBrands.has(cacheKey)) {
        requestCacheBrands.get(cacheKey).then(() => {
            callback(_filterListByIds(_cache_brands, brandIds));
        }).catch(error => {
            console.error("Error in cached request for brands:", error);
        });
        return;
    }

    const requestPromise = axios({
        method: 'GET',
        url: `/api/brands?sort=+Name`
    }).then(response => {
        _cache_brands = response.data;
        localStorage.setItem(`${updateInfoData.companyId}-brands-${lang}`, JSON.stringify(_cache_brands));
        callback(_filterListByIds(_cache_brands, brandIds));
    }).finally(() => {
        requestCacheBrands.delete(cacheKey);
    });

    requestCacheBrands.set(cacheKey, requestPromise);

    requestPromise.then(() => {
        callback(_filterListByIds(_cache_brands, brandIds));
    }).catch(error => {
        console.error("Error fetching brands:", error);
    });

};

app.config.globalProperties._findBrandsByIdsFiltered = (brandIds, callback) => {
    axios({
        method: 'GET',
        url: `/api/brands/filtered/nosort?page=1&pageSize=${brandIds.length}&id=${brandIds.join('&id=')}`
    }).then(response => {
        callback(response.data);
    });
};

app.config.globalProperties._findCategoriesByIds = (ids, callback) => {

    if (_cache_categories != null) {
        callback(_filterListByIds(_cache_categories, ids));
        return;
    }

    var lang = app.config.globalProperties._getCulture();
    var cacheKey = `${updateInfoData.companyId}-categories-${lang}`;
    var data = localStorage.getItem(cacheKey);

    if (data != null) {
        _cache_categories = JSON.parse(data);
        callback(_filterListByIds(_cache_categories, ids));
        return;
    }

    if (requestCacheCategories.has(cacheKey)) {
        requestCacheCategories.get(cacheKey).then(() => {
            callback(_filterListByIds(_cache_categories, ids));
        }).catch(error => {
            console.error("Error in cached request for categories:", error);
        });
        return;
    }

    const requestPromise = axios({
        method: 'GET',
        url: `/api/categories`
    }).then(response => {
        _cache_categories = response.data;
        localStorage.setItem(`${updateInfoData.companyId}-categories-${lang}`, JSON.stringify(_cache_categories));
        callback(_filterListByIds(_cache_categories, ids));
    }).finally(() => {
        requestCacheCategories.delete(cacheKey);
    });

    requestCacheCategories.set(cacheKey, requestPromise);
    requestPromise.then(() => {
        callback(_filterListByIds(_cache_categories, ids));
    }).catch(error => {
        console.error("Error fetching categories:", error);
    });
};

app.config.globalProperties._findCategoriesByIdsFiltered = (ids, callback) => {
    axios({
        method: 'GET',
        url: `/api/categories/filtered/nosort?page=1&pageSize=${ids.length}&id=${ids.join('&id=')}`
    }).then(response => {
        callback(response.data);
    });
};

app.config.globalProperties._findCategoryByAlias = (alias, callback) => {

    if (_cache_categories != null)
        return callback(_cache_categories.find((value) => alias == value.alias));

    var lang = app.config.globalProperties._getCulture();
    var cacheKey = `${updateInfoData.companyId}-categories-${lang}`;
    var data = localStorage.getItem(cacheKey);

    if (data != null) {
        _cache_categories = JSON.parse(data);
        return callback(_cache_categories.find((value) => alias === value.alias));
    }

    if (requestCacheCategories.has(cacheKey)) {
        requestCacheCategories.get(cacheKey).then(() => {
            callback(_cache_categories.find((value) => alias === value.alias));
        }).catch(error => {
            console.error("Error in cached request for categories:", error);
        });
        return;
    }

    const requestPromise = axios({
        method: 'GET',
        url: `/api/categories`
    }).then(response => {
        _cache_categories = response.data;
        localStorage.setItem(`${updateInfoData.companyId}-categories-${lang}`, JSON.stringify(_cache_categories));
        callback(_cache_categories.find((value) => alias === value.alias));
    }).finally(() => {
        requestCacheCategories.delete(cacheKey);
    });

    requestCacheCategories.set(cacheKey, requestPromise);

    requestPromise.then(() => {
        callback(_cache_categories.find((value) => alias === value.alias));
    }).catch(error => {
        console.error("Error fetching categories:", error);
    });

};

app.config.globalProperties._findCategoryTreeByAlias = (callback) => {
    let paths = window.location.pathname.split('/');
    var childPath = _getCookie("_domainpath");
    if (childPath != null) {
        childPath = decodeURIComponent(childPath);
        childPath = childPath.split("/")[1];
        paths = paths.filter(p => p != childPath);
    }
    let alias = paths[2];
    if (alias == null || alias == '') {
        app.config.globalProperties._findCategoryTreeById(null, callback);
    }
    else {
        app.config.globalProperties._findCategoryByAlias(alias, e => {
            app.config.globalProperties._findCategoryTreeById(e.id, callback);
        });
    }
};

app.config.globalProperties._findCategoryTreeById = (categoryId, callback) => {
    var lang = app.config.globalProperties._getCulture();
    var cacheKey = `${updateInfoData.companyId}-categories-tree-${lang}`;
    var data = localStorage.getItem(cacheKey);

    if (_cache_category_tree != null) {
        if (categoryId == null) {
            return callback(_cache_category_tree);
        }
        return callback(_searchNavigationsById(_cache_category_tree, categoryId));
    }

    if (data != null) {
        _cache_category_tree = JSON.parse(data);
        if (categoryId == null) {
            return callback(_cache_category_tree);
        }
        return callback(_searchNavigationsById(_cache_category_tree, categoryId));
    }

    if (requestCacheCategoryTree.has(cacheKey)) {
        requestCacheCategoryTree.get(cacheKey).then(() => {
            if (categoryId == null) {
                return callback(_cache_category_tree);
            }
            return callback(_searchNavigationsById(_cache_category_tree, categoryId));
        }).catch(error => {
            console.error("Error in cached request for category tree:", error);
        });
        return;
    }

    const requestPromise = axios({
        method: 'get',
        url: `/api/categories/root/children`
    }).then(response => {
        _cache_category_tree = response.data;
        localStorage.setItem(`${updateInfoData.companyId}-categories-tree-${lang}`, JSON.stringify(_cache_category_tree));
        if (categoryId == null) {
            return callback(_cache_category_tree);
        }
        return callback(_searchNavigationsById(_cache_category_tree, categoryId));
    }).finally(() => {
        requestCacheCategoryTree.delete(cacheKey);
    });

    requestCacheCategoryTree.set(cacheKey, requestPromise);
};

app.config.globalProperties._findCollectionsByIdsThenCalculate = (collectionIds, showProducts, callback, pricingCallback) => {

    if (!collectionIds) return;

    var url = `calculate=false&collectionIds=${collectionIds.join("&collectionIds=")}&expanded=${showProducts}`;
    var cacheKey = `${url}`;

    if (_cache_collections != null) {
        const filteredCollections = _cache_collections.filter(collection =>
            collectionIds.includes(collection.id)
        );
        callback(filteredCollections);
        calculatePricing(filteredCollections, showProducts, pricingCallback);
        return;
    }

    if (requestCacheCollections.has(cacheKey)) {
        requestCacheCollections.get(cacheKey).then(() => {
            const filteredCollections = _cache_collections.filter(collection =>
                collectionIds.includes(collection.id)
            );
            callback(filteredCollections);
            calculatePricing(filteredCollections, showProducts, pricingCallback);
        }).catch(error => {
            console.error("Error in cached request for collections:", error);
        });
        return;
    }

    const requestPromise = axios({
        method: 'get',
        url: `/api/collection?${url}`,
        data:
        {
            collectionIds: collectionIds,
            showProducts: showProducts
        }
    }).then(response => {
        _cache_collections = response.data; // Store in-memory cache
        const filteredCollections = _cache_collections.filter(collection =>
            collectionIds.includes(collection.id)
        );
        callback(filteredCollections);
        calculatePricing(filteredCollections, showProducts, pricingCallback);
    }).finally(() => {
        // Remove from request cache
        requestCacheCollections.delete(cacheKey);
    });

    requestCacheCollections.set(cacheKey, requestPromise);
};

app.config.globalProperties._findMinimum = (minimum, step) => {
    if (minimum > 1 && minimum !== null) {
        if (step !== null && step > 1) {
            return step * Math.ceil(minimum / step);
        } else {
            return minimum;
        }
    }
    else if (step !== null && step > 1) {
        return step;
    } else {
        return 1;
    }
}

app.config.globalProperties._findProductsByCriteria = (searchCriteria, callback) => {
    const requestUrl = _buildProductSearchUrl(searchCriteria, '/api/products');
    _fetchData(requestUrl, callback);
};

app.config.globalProperties._findProductsByIds = (productIds, calc, callback) => {
    if (productIds == null || productIds.length == 0)
        return;
    let filter = "&ids=" + productIds.join("&ids=");
    _findProducts(1, productIds.length, filter, calc, "-SortDate", callback);
};

app.config.globalProperties._findProductsByTitle = (page, pagesize, search, calc, sort, callback) => {

    _findProducts(page, pagesize, "search=" + search, calc, sort, callback);
};

app.config.globalProperties._findProductsThenCalculate = (searchCriteria, callbackProducts, callbackPricing) => {
    const productRequestUrl = _buildProductSearchUrl(searchCriteria, '/api/products');
    _fetchData(productRequestUrl, (products, totalCount) => {
        callbackProducts(products, totalCount);
        _calculatePricing(products, callbackPricing);
    });
};

app.config.globalProperties._findSelected = (product, cartItems) => {

    var cartQty = 0;
    if (cartItems !== null && Array.isArray(cartItems)) {
        if (cartItems.find((cartItem) => cartItem.productVariantId === product.id) !== undefined) {
            cartQty = cartItems.find((cartItem) => cartItem.productVariantId === product.id).quantity;
        }
    }

    var finalQuantity = 1;
    var quantity = product.quantity !== null ? product.quantity : 0;
    var suggested = product.suggestedOrderQuantity !== null ? product.suggestedOrderQuantity : 0;
    var minimum = product.minOrderQuantity !== null ? product.minOrderQuantity : 0;
    var step = product.orderQuantityStep !== null ? product.orderQuantityStep : 0;
    var sellOutOfStock = product.sellOutOfStock;

    if (!sellOutOfStock) {
        if (quantity - cartQty <= 0) {
            product.canOrder = false;
            finalQuantity = 0;
        } else {
            if (suggested > 1) {
                if (minimum > 1) {
                    if (step > 1) {
                        if (suggested > quantity) {
                            if (suggested > minimum) {
                                if (step > minimum) {
                                    finalQuantity = step;
                                } else {
                                    finalQuantity = step * (Math.ceil(minimum / step));
                                }
                            }
                        }
                        else {
                            if (suggested > minimum) {
                                if (step > minimum) {
                                    finalQuantity = step;
                                } else {
                                    finalQuantity = Math.floor(suggested / step) * step;
                                }
                            } else {
                                finalQuantity = Math.ceil(minimum / step) * step;
                            }
                        }
                    } else {
                        if (suggested > quantity) {
                            finalQuantity = minimum;
                        } else if (minimum > suggested) {
                            finalQuantity = minimum;
                        } else {
                            finalQuantity = suggested;
                        }
                    }
                } else if (step > 1) {
                    if (suggested > quantity) {
                        finalQuantity = step * (Math.ceil(minimum / step));
                    } else {
                        if (suggested > step) {
                            finalQuantity = Math.floor(suggested / step) * step;
                        } else {
                            finalQuantity = step;
                        }
                    }
                } else {
                    if (suggested > quantity) {
                        finalQuantity = quantity;
                    } else {
                        if (suggested + cartQty > quantity) {
                            finalQuantity = quantity - cartQty;
                        } else {
                            finalQuantity = suggested;
                        }
                    }
                }
            } else if (step > 1) {
                if (minimum > 1) {
                    if (minimum > step) {
                        finalQuantity = step * (Math.ceil(minimum / step));
                    } else {
                        finalQuantity = step;
                    }
                } else {
                    finalQuantity = step;
                }
            } else if (minimum > 1) {
                finalQuantity = minimum;
            }
        }
    } else {
        if (suggested > 1) {
            if (minimum > 1) {
                if (step > 1) {
                    if (suggested > minimum) {
                        if (step > minimum) {
                            finalQuantity = Math.ceil(suggested / step) * step;
                        } else {
                            finalQuantity = step * Math.ceil(minimum / step);
                        }
                    } else {
                        finalQuantity = Math.ceil(minimum / step) * step;
                    }
                } else {
                    if (minimum > suggested) {
                        finalQuantity = minimum;
                    } else {
                        finalQuantity = suggested;
                    }
                }
            } else if (step > 1) {
                if (suggested > step) {
                    finalQuantity = Math.floor(suggested / step) * step;
                } else {
                    finalQuantity = step;
                }
            } else {
                finalQuantity = suggested;
            }
        } else if (step > 1) {
            if (minimum > 1) {
                if (minimum > step) {
                    finalQuantity = step * (Math.ceil(minimum / step));
                } else {
                    finalQuantity = step;
                }
            } else {
                finalQuantity = step;
            }
        } else if (minimum > 1) {
            finalQuantity = minimum;
        }
    }

    return product.selectedQuantity = finalQuantity;
}

app.config.globalProperties._findUnitsByIds = (unitsIds, callback) => {
    if (_cache_units != null)
        return callback(_filterListByIds(_cache_units, unitsIds));

    var lang = app.config.globalProperties._getCulture();
    var cacheKey = `${updateInfoData.companyId}-units-${lang}`;
    var data = localStorage.getItem(cacheKey);

    if (data != null && data.length > 0) {
        _cache_units = JSON.parse(data);
        return callback(_filterListByIds(_cache_units, unitsIds));
    }
    if (requestCacheUnits.has(cacheKey)) {
        return requestCacheUnits.get(cacheKey).then(() => {
            callback(_filterListByIds(_cache_units, unitsIds));
        });
    }

    const requestPromise = axios({
        method: 'GET',
        url: `/api/units`
    }).then(response => {
        _cache_units = response.data;
        localStorage.setItem(`${updateInfoData.companyId}-units-${lang}`, JSON.stringify(_cache_units));
        callback(_filterListByIds(_cache_units, unitsIds));
    }).finally(() => {
        requestCacheUnits.delete(cacheKey);
    });

    requestCacheUnits.set(cacheKey, requestPromise);

    requestPromise.then(() => {
        callback(_filterListByIds(_cache_units, unitsIds));
    }).catch(error => {
        console.error("Error fetching units:", error);
    });

};

app.config.globalProperties._getActiveAnnouncements = (parameters, callback) => {
    axios({
        method: 'get',
        url: `/api/announcements`,
        params: parameters,
    }).then(response => {
        callback(response.data);
    }).catch(err => {
        console.log(err);
    });
};

app.config.globalProperties._getBadges = (product) => {
    var icotagshtml = "";
    if (product.additionalFeatures != null && product.additionalFeatures.icoTags != null)
        product.additionalFeatures.icoTags.forEach((el) => {
            icotagshtml = icotagshtml + `<div class="product-label" style="background-color:${el.backgroundColor || "color-mix(in srgb, var(--bs-primary) 60%, white);"};color:${el.textColor || "var(--bs-primary)"};">${el.name}</div>`;
        });
    return icotagshtml;
};

app.config.globalProperties._getBlogCategoryByAlias = (alias, callback) => {
    axios({
        method: 'get',
        url: `/api/blog/category/alias/${alias}`,
    }).then(response => {
        callback(response.data);
    }).catch(err => {
        console.log(err);
    });
}

app.config.globalProperties._getBlogCategoryById = (id, callback) => {
    axios({
        method: 'get',
        url: `/api/blog/category/${id}`,
    }).then(response => {
        callback(response.data);
    }).catch(err => {
        console.log(err);
    });
}

app.config.globalProperties._getBlogCategoryList = (callback) => {
    axios({
        method: 'get',
        url: `/api/blog/category`,
    }).then(response => {
        callback(response.data);
    }).catch(err => {
        console.log(err);
    });
}

app.config.globalProperties._getBlogList = (parameters, callback) => {
    axios({
        method: 'get',
        url: `/api/blog`,
        params: parameters,
    }).then(response => {
        callback(response.data);
    }).catch(err => {
        console.log(err);
    });
}

app.config.globalProperties._getCart = (callback) => {
    var data = localStorage.getItem("cartData");
    if (data != null) {
        callback(JSON.parse(data));
    } else {
        callback(null);
    }
};

app.config.globalProperties._getCategoryList = (parameters, callback) => {
    axios({
        method: 'get',
        url: `/api/blog/category`,
        params: parameters,
    }).then(response => {
        callback(response.data);
    }).catch(err => {
        console.log(err);
    });
}

app.config.globalProperties._getCheckout = (token, onSuccess, onError) => {
    axios({
        method: 'get',
        url: `/api/checkout/${token}`
    }).then(response => {
        onSuccess(response.data)
    }).catch(ex => {
        onError(ex.response.status, ex.response.data);
    })
};

app.config.globalProperties._getComments = (blogId, parameters, callback) => {
    axios({
        method: 'get',
        url: `/api/blog/${blogId}/comment`,
        params: parameters,
    }).then(response => {
        callback(response.data);
    }).catch(err => {
        console.log(err);
    });
}

app.config.globalProperties._getCompanyName = (companyName) => {

    var shortName = (companyName.match(/[A-ZΑ-Ω]/g) || []).join('');
    if (window.innerWidth < 1133) {
        if (shortName.length > 5) {
            shortName = shortName[0];
        }
        return shortName;
    } else {
        if (companyName.length > 15) {
            companyName = companyName.split(' ')[0];
        }
        return companyName;
    }

};

app.config.globalProperties._getCoupons = (parameters, callback) => {
    axios({
        method: 'get',
        url: `/api/loyalty/coupons`,
        params: parameters,
    }).then(response => {
        callback(response.data);
    }).catch(err => {
        console.log(err);
    });
};

app.config.globalProperties._getCulture = () => {
    var culture = _getCookie("_culture");
    if (culture === null || culture === "" || culture === undefined)
        return "en-US";
    return culture;
};

app.config.globalProperties._getCultureName = (code) => {
    switch (code) {
        case "el-GR": return "Ελληνικά";
        case "en-US": return "English";
        case "de-DE": return "Deutsch";
        case "fr-FR": return "Français";
        case "it-IT": return "Italiano";
        case "ro-RO": return "Română";
        case "bg-BG": return "Български";
        case "sq-AL": return "Shqiptare";
        case "sp-ES": return "Español";
        case "ru-RU": return "Русский";
        case "pl-PL": return "Polski";
        default: return "Unknown";
    };
};

app.config.globalProperties._getCurrencySymbol = () => {
    var currency = _getCookie("_currency");
    if (currency === null || currency === "" || currency === undefined)
        currency = "eur";

    var culture = app.config.globalProperties._getCulture();
    return (0).toLocaleString(
        culture,
        {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }
    ).replace(/\d/g, '').trim()
};

app.config.globalProperties._getCurrentCheckout = (onSuccess, onError) => {
    let paths = window.location.pathname.split('/');
    let current = paths[paths.length - 2];
    let token = paths[paths.length - 1];

    if (current === "complete") {
        app.config.globalProperties._getCheckout(token, e => {
            onSuccess(e)
            localStorage.removeItem("cartToken");
            localStorage.removeItem("cartData");
            localStorage.removeItem("checkoutToken");
            emitter.emit("cart-changed", null);
        }, onError);
    }
    else {
        app.config.globalProperties._startCheckout(onSuccess, onError);
    }
};

app.config.globalProperties._getDiscountFromPoints = async (totalAmount) => {
    const requestData = {
        referenceId: localStorage.checkoutToken,
        totalAmount: totalAmount
    };

    const response = await axios({
        method: 'post',
        url: '/api/loyalty/points/calculate/discount',
        data: requestData
    });
    return response.data?.discountValue;
};

app.config.globalProperties._getFaviconUrl = () => {
    return document.querySelector("link[rel*='icon']").attributes['href'].value;
};

app.config.globalProperties._getFiltersCount = (filterdata) => {
    if (filterdata.filters == null || filterdata.filters.length == 0)
        return;

    var filters = filterdata.filters;

    var filterRequestDTO = {
        Filters: [

        ],
        FilterData: [
        ]
    };


    for (var i = 0; i < filters.length; i++) {
        if (filters[i]?.values?.find(f => f.selected)) {
            filterRequestDTO.Filters.push({
                Filter: filters[i].key,
                Values: filters[i].values.filter(f => f.selected).map(s => s.id).join(","),
                Key: filters[i].slug
            });

        }
        if (filters[i].values != null && filters[i].values.length > 0) {
            filterRequestDTO.FilterData.push({
                Filter: filters[i].key,
                Values: filters[i].values.map(s => s.id).join(","),
                Key: filters[i].slug
            });
        }
    }

    var params = "";
    if (filterdata.searchText !== null)
        params += `&search=${filterdata.searchText}`;

    if (filterdata.minPrice && filterdata.maxPrice)
        params += `&pricerange=${filterdata.minPrice}:${filterdata.maxPrice}`;
    for (let i = 1; i < 7; i++) {
        if (filterdata[`size${i}`] !== null && filterdata[`size${i}`].length !== 0) {
            for (let j = 0; j < filterdata[`size${i}`].length; j++) {
                params += `&size${i}=${filterdata[`size${i}`][j]}`;
            }
        }
    }
    if (filterdata.id == "search") {
        return axios({
            method: 'post',
            url: `/api/products/filters/${filterdata.endPoint}/count?${params}${forceFilters != null ? '&' + forceFilters : ''}`,
            data: filterRequestDTO,
        });
    } else {
        return axios({
            method: 'post',
            url: `/api/products/filters/${filterdata.endPoint}/${filterdata.id}/count?${params}${forceFilters != null ? '&' + forceFilters : ''}`,
            data: filterRequestDTO,
        });
    }
};

app.config.globalProperties._getFilters = () => {
    var calculatedfilters = [];
    var filters = app.config.globalProperties._filterList.filters;
    var paths = window.location.pathname.split('/');
    var childPath = _getCookie("_domainpath");
    if (childPath != null) {
        childPath = decodeURIComponent(childPath);
        childPath = childPath.split("/")[1];
        paths = paths.filter(p => p != childPath);
    }
    if (paths[1] == "search")
        paths = paths.slice(2);
    else
        paths = paths.slice(3);
    var currentFilters = {};
    if (paths.length > 0) {
        for (var i = 1; i < paths.length; i += 2) {
            if (paths[i].split("_or_").length > 1) {
                currentFilters[`${paths[i - 1]}`] = [];
                paths[i].split("_or_").forEach(f => {
                    currentFilters[`${paths[i - 1]}`].push(f);
                });
            }
            else {
                currentFilters[`${paths[i - 1]}`] = [];
                currentFilters[`${paths[i - 1]}`].push(paths[i]);
            }
        }
    }
    if (filters.filterGroups != null && filters.filterGroups.length > 0) {
        filters.filterGroups.forEach(group => {
            if (group.type == "Category") {
                var obj = {};
                obj.name = "Categories";
                obj.slug = "categories";
                obj.key = "PathCategory";
                obj.values = [];
                group.lines.forEach(b => {
                    obj.values.push({
                        slug: b.slug,
                        id: b.id,
                        name: b.value,
                        selected: currentFilters["categories"]?.includes(b.slug) ? true : false,
                        count: b?.count
                    });
                });
                calculatedfilters.push(obj);
            } else if (group.type == "Price") {
                var obj = {};
                obj.name = "Price";
                obj.slug = "price";
                obj.key = "priceid";
                obj.min = group.min;
                obj.max = group.max;
                calculatedfilters.push(obj);
            } else if (group.type == "RetailPrice") {
                var obj = {};
                obj.name = "Price";
                obj.slug = "retailPrice";
                obj.key = "retailPriceId";
                obj.min = group.min;
                obj.max = group.max;
                calculatedfilters.push(obj);
            } else if (group.type == "Brand") {
                var obj = {};
                obj.name = "Brands";
                obj.slug = "brands";
                obj.key = "brandid";
                obj.values = [];
                group.lines.forEach(b => {
                    obj.values.push({
                        slug: b.slug,
                        id: b.id,
                        name: b.value,
                        selected: currentFilters["brands"]?.includes(b.slug) ? true : false,
                        count: b?.count
                    });
                });
                calculatedfilters.push(obj);
            } else if (group.type == "Attribute") {
                var obj = {};
                obj.name = group.title;
                obj.slug = group.slug;
                obj.key = "attribute";
                obj.values = [];
                group.lines.forEach(i => {
                    obj.values.push({
                        slug: i.slug,
                        id: `${group.id}~${i.id}`,
                        name: i.value,
                        selected: currentFilters[group.slug]?.includes(i.slug) ? true : false,
                        count: i?.count
                    });
                });
                calculatedfilters.push(obj);

            } else if (group.type == "Availability") {
                var obj = {};
                obj.name = "Availability";
                obj.slug = "availability";
                obj.key = "Availability";
                obj.values = [];
                group.lines.forEach(b => {
                    obj.values.push({
                        slug: b.slug,
                        id: b.id,
                        name: b.value,
                        selected: currentFilters["availability"]?.includes(b.slug) ? true : false,
                        count: b?.count
                    });
                });
                calculatedfilters.push(obj);
            }
        })
    }
    return calculatedfilters;
};

app.config.globalProperties._getFooterMenu = (callback) => {
    if (_cache_footer_menu != null)
        return callback(_cache_footer_menu);
    var lang = app.config.globalProperties._getCulture();

    var data = localStorage.getItem(`${updateInfoData.companyId}-footer-menu-${lang}`);
    if (data == null) {
        axios({
            method: 'GET',
            url: `/api/menus/Footer`
        }).then(response => {
            _cache_footer_menu = response.data;
            localStorage.setItem(`${updateInfoData.companyId}-footer-menu-${lang}`, JSON.stringify(_cache_footer_menu));
            callback(_cache_footer_menu);
        });
        return;
    }
    _cache_footer_menu = JSON.parse(data);
    callback(_cache_footer_menu);
};

app.config.globalProperties._getHeaderMenu = (callback) => {
    if (_cache_main_menu != null) {
        callback(_cache_main_menu);
        return;
    }
    var lang = app.config.globalProperties._getCulture();

    var data = localStorage.getItem(`${updateInfoData.companyId}-header-menu-${lang}`);
    if (data == null) {
        axios({
            method: 'GET',
            url: `/api/menus/Main`
        }).then(response => {
            _cache_main_menu = response.data;
            localStorage.setItem(`${updateInfoData.companyId}-header-menu-${lang}`, JSON.stringify(_cache_main_menu));
            callback(_cache_main_menu);
        });
        return;
    }
    _cache_main_menu = JSON.parse(data);
    callback(_cache_main_menu);
};

app.config.globalProperties._getLogoUrl = (bgColor) => {
    var colorBG = window.getComputedStyle(document.documentElement).getPropertyValue(bgColor);

    if (isBackgroundColorLight(colorBG)) {
        return document.querySelector('meta[data-logo]').attributes['data-logo'].value;
    }
    return document.querySelector('meta[data-logo-light]').attributes['data-logo-light'].value;
};

app.config.globalProperties._getMasterIdRelatedProducts = (productId, callback) => {
    axios({
        method: 'get',
        url: `/api/products/calculate?page=1&pageSize=1000&masterId=${productId}`,
    }).then(response => {
        callback(response)

    }).catch(ex => {
        console.log(ex.response);
    });
}

app.config.globalProperties._getMediaItem = (mediaItems) => {
    if (mediaItems !== null && mediaItems.length > 0 && mediaItems.filter(i => i.mediaType === 'Image').length > 0) {
        return mediaItems.filter(i => i.mediaType == 'Image')[0].link;
    }
    return null;
}

app.config.globalProperties._getNoImageUrl = () => {
    return document.querySelector('meta[data-noImage]').attributes['data-noImage'].value;
};

app.config.globalProperties._getOrders = (parameters, callback) => {
    axios({
        method: 'get',
        url: `/api/order/history`,
        params: parameters,
    }).then(response => {
        callback(response.data);
    });
}

app.config.globalProperties._getProductContent = (productId, callback) => {
    _getInternalContentByType(productId, "products", callback);
},

    app.config.globalProperties._getProductsByFilter = (filter, callback) => {
        axios({
            method: 'get',
            url: `/api/products?${filter}${forceFilters != null ? '&' + forceFilters : ''}`,
        }).then(response => {
            var products = response.data;
            callback(products);
        })
    };

app.config.globalProperties._getRelatedProducts = (productId, variantId, callback) => {
    axios({
        method: 'get',
        url: `/api/relatedproducts/${productId}/${variantId}`,
    }).then(response => {
        callback(response.data);
    });
};

app.config.globalProperties._getRetailUserProfile = (callback) => {
    axios({
        method: 'get',
        url: `/api/user/retail/profile`
    }).then(response => {
        callback(response.data);
    });
};

app.config.globalProperties._getRewardPoints = async () => {
    const response = await axios({
        method: 'get',
        url: `/api/loyalty/points`,
    });
    return response.data;
};

app.config.globalProperties._getRewardPointsSetup = async () => {
    const response = await axios({
        method: 'get',
        url: `/api/loyalty/points/setup`,
    });
    return response.data;
};

app.config.globalProperties._getShoppingListByAlias = (alias, callback) => {
    axios({
        method: 'get',
        url: `/api/ShoppingList/${alias}`,
    }).then(response => {
        var list = response.data;

        emitter.emit("view-wishlist", { data: list })

        callback(list);
    });
};

app.config.globalProperties._getShoppingLists = (callback) => {
    axios({
        method: 'get',
        url: `/api/ShoppingList`,
    }).then(response => {
        var lists = response.data;
        emitter.emit("view-all-wishlist", {
            data: lists
        });
        callback(lists);
    })
};

app.config.globalProperties._getShopranosCookie = (callback) => {
    axios({
        method: 'get',
        url: `/api/cookies/_shopranos`,
    }).then(response => {
        if (response.status === 204) {
            callback(null);
            return;
        }
        callback(response.data);
    }).catch(err => {
        console.log(err);
    });
};

app.config.globalProperties._handleImageError = (event) => {
    event.target.src = app.config.globalProperties._getNoImageUrl();
},

    app.config.globalProperties._hasDiscount = (variant) => {
        return variant.initialPrice != null && variant.price < variant.initialPrice;
    };

app.config.globalProperties._initiatePayment = (callback) => {
    axios({
        method: 'post',
        url: `/api/payment/initiate/${localStorage.checkoutToken}`
    }).then(response => {
        emitter.emit("payment-initiated", { data: response.data });
        callback(response);
    })
};

app.config.globalProperties._initiateCompleteCheckout = (checkout, onSuccess, onError) => {
    app.config.globalProperties._updateCheckout(checkout,
        data => {
            proceedToComplete(data, onSuccess, onError);
        },
        (status, data) => {
            onError(status, data);
        }
    )
};

app.config.globalProperties._onQuantityChange = (value, product, activeProduct, cartItems) => {

    var cartQty = 0;
    if (cartItems !== null && Array.isArray(cartItems)) {
        if (cartItems.find((cartItem) => cartItem.productVariantId === product.productVariants[activeProduct].id) !== undefined) {
            cartQty = cartItems.find((cartItem) => cartItem.productVariantId === product.productVariants[activeProduct].id).quantity;
        }
    }

    var currValue;
    if (isNaN(value) || value == '' || value == null) {
        currValue = 1;
    } else {
        currValue = parseInt(value);
    }

    var finalQuantity = currValue;
    var quantity = product.productVariants[activeProduct].quantity !== null ? product.productVariants[activeProduct].quantity : 0;
    var suggested = product.productVariants[activeProduct].suggestedOrderQuantity !== null ? product.productVariants[activeProduct].suggestedOrderQuantity : 0;
    var minimum = product.productVariants[activeProduct].minOrderQuantity !== null ? product.productVariants[activeProduct].minOrderQuantity : 0;
    var step = product.productVariants[activeProduct].orderQuantityStep !== null ? product.productVariants[activeProduct].orderQuantityStep : 0;
    var sellOutOfStock = product.productVariants[activeProduct].sellOutOfStock;

    if (!sellOutOfStock) {
        if (suggested > 1) {
            if (minimum > 1) {
                if (step > 1) {
                    if ((quantity - cartQty - currValue) <= 0) {
                        finalQuantity = quantity - cartQty;
                        if (finalQuantity % step !== 0) {
                            finalQuantity = step * (Math.floor(finalQuantity / step));
                        }
                    } else if (currValue > quantity) {
                        finalQuantity = Math.floor(quantity / step) * step;
                    } else if (currValue < minimum) {
                        finalQuantity = step * (Math.ceil(minimum / step));
                    } else if (currValue % step !== 0) {
                        finalQuantity = step * (Math.floor(currValue / step));
                    }
                } else {
                    if ((quantity - cartQty - currValue) <= 0) {
                        finalQuantity = quantity - cartQty;
                    } else if (currValue > quantity) {
                        finalQuantity = quantity;
                    } else if (currValue < minimum) {
                        finalQuantity = minimum;
                    }
                }
            } else if (step > 1) {
                if ((quantity - cartQty - currValue) <= 0) {
                    finalQuantity = quantity - cartQty;
                    if (finalQuantity % step !== 0) {
                        finalQuantity = step * (Math.floor(finalQuantity / step));
                    }
                } else if (currValue > quantity) {
                    finalQuantity = quantity;
                } else if (currValue < step) {
                    finalQuantity = step;
                } else if (currValue % step !== 0) {
                    finalQuantity = step * (Math.floor(currValue / step));
                }
            } else {
                if ((quantity - cartQty - currValue) <= 0) {
                    finalQuantity = quantity - cartQty;
                } else if (currValue > quantity) {
                    finalQuantity = quantity;
                } else if (currValue < 1) {
                    finalQuantity = 1;
                }
            }
        } else if (step > 1) {
            if ((quantity - cartQty - currValue) <= 0) {
                finalQuantity = quantity - cartQty;
                if (finalQuantity % step !== 0) {
                    finalQuantity = step * (Math.floor(finalQuantity / step));
                }
            } else if (currValue > quantity) {
                finalQuantity = quantity;
            } else if (minimum > 1) {
                if (currValue < minimum) {
                    finalQuantity = step * (Math.ceil(minimum / step));
                } else if (currValue % step !== 0) {
                    finalQuantity = step * (Math.floor(currValue / step));
                }
            } else if (currValue < step) {
                finalQuantity = step;
            } else if (currValue % step !== 0) {
                finalQuantity = step * (Math.floor(currValue / step));
            }
        } else if (minimum > 1) {
            if ((quantity - cartQty - currValue) <= 0) {
                finalQuantity = quantity - cartQty;
            } else if (currValue > quantity) {
                finalQuantity = quantity;
            } else if (currValue < minimum) {
                finalQuantity = minimum;
            }
        } else if (currValue > quantity) {
            if ((quantity - cartQty - currValue) <= 0) {
                finalQuantity = quantity - cartQty;
            } else {
                finalQuantity = quantity;
            }
        } else if (currValue < 1) {
            finalQuantity = 1;
        } else if ((quantity - cartQty - currValue) <= 0) {
            finalQuantity = quantity - cartQty;
        }
    } else {
        if (minimum > 1) {
            if (step > 1) {
                if (currValue < minimum) {
                    finalQuantity = step * (Math.ceil(minimum / step));
                } else if (currValue % step !== 0) {
                    finalQuantity = step * (Math.floor(currValue / step));
                    if (finalQuantity < minimum) {
                        finalQuantity += step;
                    }
                }
            }
            else if (currValue < minimum) {
                finalQuantity = minimum;
            }
        } else if (step > 1) {
            if (currValue < step) {
                finalQuantity = step;
            } else if (currValue % step !== 0) {
                finalQuantity = step * (Math.floor(currValue / step));
            }
        } else if (currValue < 1) {
            finalQuantity = 1;
        }
    }

    return finalQuantity;
}

app.config.globalProperties._postComment = (data, callback) => {
    axios({
        method: 'post',
        url: `/api/blog/${data.postId}/comment`,
        data: data,
    }).then(response => {
        callback();
    });
};

app.config.globalProperties._publishAddToCart = (cartitem) => {
    if (window.location.pathname.startsWith("/product/")) {
        emitter.emit("add-to-cart", cartitem);
    }
    else {
        emitter.emit("quick-add-to-cart", cartitem);
    }
}

app.config.globalProperties._publishInCartItemsChanged = (cartData) => {
    var cartitems = [];
    for (var i = 0; i < cartData.cartItems.length; i++) {
        {
            var cartitem = {};
            cartitem.productVariantId = cartData.cartItems[i].productVariantId;
            cartitem.productId = cartData.cartItems[i].productId;
            cartitem.quantity = cartData.cartItems[i].quantity;
            cartitems.push(cartitem);
        }
    }
    emitter.emit("in-cart-items-changed", { data: cartitems });
};

app.config.globalProperties._removeFromCart = (variantId) => {
    axios({
        method: 'delete',
        url: `/api/cart/${localStorage.cartToken}/${variantId}`
    }).then(response => {
        var cartData = response.data;
        localStorage.cartToken = cartData.token;
        localStorage.setItem("cartData", JSON.stringify(cartData));
        emitter.emit("cart-changed", cartData);
        var cartitem = {};
        cartitem.variantId = variantId;
        emitter.emit("remove-from-cart", { data: cartitem });
    });
};

app.config.globalProperties._resolveModules = (type) => {
    if (app.config.globalProperties._global?.modules == null || app.config.globalProperties._global?.modules.length == 0)
        return true;
    if (type == "lang") {
        if (app.config.globalProperties._global?.modules.includes("md_multilingual")) {
            return true;
        } else {
            return false;
        }
    }
    if (type == "shoppinglists") {
        if (app.config.globalProperties._global?.modules.includes("md_shopping_lists") && app.config.globalProperties._global?.isAuthenticated) {
            return true;
        } else {
            return false;
        }
    }
    if (type == "quotes") {
        if (app.config.globalProperties._global?.modules.includes("md_quotes")) {
            return true;
        } else {
            return false;
        }
    }
    if (type == "offers") {
        if (app.config.globalProperties._global?.modules.includes("md_offers")) {
            return true;
        } else {
            return false;
        }
    }
};

app.config.globalProperties._sendEmail = async (data, callback) => {
    var uploadFields = data.fields.filter(f => f.type == 4);
    if (uploadFields.length > 0) {

        await internalUploadFiles(uploadFields, (e) => {

            if (e.error === true) {
                callback(false, e.response);
            }
        });


    }
    axios({
        method: 'post',
        url: `/api/contact`,
        data: data,
    }).then(response => {
        let success = true;
        emitter.emit("form-submission", { success: true, data: response.data });
        callback(success, response.status);
    }).catch(error => {
        let success = false;
        emitter.emit("form-submission", { success: false, data: error.response });
        callback(success, error.response.status);
    });
};

app.config.globalProperties._sendFilterRequestThenCalculate = (filterdata, callback, pricingCallback) => {
    filterdata = app.config.globalProperties._buildFilters(filterdata);
    _sendInternalFilterRequest(filterdata, callback, pricingCallback);
    if (filterdata.id == "search") {
        window.history.pushState("", "", `/${filterdata.endPoint}${filterdata.historyUrl}?s=${filterdata.searchText}&page=${filterdata.page}&pageSize=${filterdata.pageSize}`);
    } else {
        window.history.pushState("", "", `/${filterdata.endPoint}/${filterdata.alias}${filterdata.historyUrl}?page=${filterdata.page}&pageSize=${filterdata.pageSize}`);
    }

};

app.config.globalProperties._setCart = (cartData) => {
    if (cancelTokenSource) {
        cancelTokenSource.cancel();
    }
    cancelTokenSource = axios.CancelToken.source();
    axios({
        method: 'put',
        url: `/api/cart/${localStorage.cartToken}`,
        data: cartData,
        cancelToken: cancelTokenSource.token
    }).then(response => {
        cartData = response.data;
        localStorage.cartToken = cartData.token;
        localStorage.setItem("cartData", JSON.stringify(cartData));
        emitter.emit("cart-changed", cartData);
        app.config.globalProperties._publishInCartItemsChanged(cartData);
    });
};

app.config.globalProperties._setCartListener = (callback) => {
    emitter.on('cart-changed', e => {
        callback(e);
    });
};

app.config.globalProperties._setLastVisited = (ProductId, VariantId) => {
    var existingEntries = JSON.parse(localStorage.getItem("visitedProducts"));
    if (existingEntries == null) existingEntries = [];
    if (existingEntries.length > 0 && existingEntries.some(e => e.VariantId === VariantId))
        return;
    else {
        if (existingEntries.length > 16) {
            existingEntries.shift();
        }
        var entry = {
            productId: ProductId,
            VariantId: VariantId
        };

        existingEntries.push(entry);
        localStorage.setItem("visitedProducts", JSON.stringify(existingEntries));
        return;
    }
};

app.config.globalProperties._setReadAnnouncementIds = (ids) => {
    axios({
        method: 'post',
        url: `/api/announcements`,
        data: ids
    }).then(_ => {
    }).catch(err => {
        console.log(err);
    });
};

app.config.globalProperties._setShopranosCookie = (value, expiresAt) => {
    axios({
        method: 'post',
        url: `/api/cookies`,
        data: {
            value: value,
            expirationDate: expiresAt
        },
    }).then(_ => {
    }).catch(err => {
        console.log(err);
    });
};

app.config.globalProperties._setupFiltersThenCalculate = (callback, pricingCallback, pageNumber, pageSize, sort) => {
    var filterData = _internalSetupFilters(pageNumber, pageSize, sort);
    _sendInternalFilterRequest(filterData, callback, pricingCallback);
    addEventListener('popstate', (event) => {
        _internalSetupFilters(callback, pageNumber, pageSize, sort, pricingCallback);
    });
};

app.config.globalProperties._startCheckout = (onSuccess, onError) => {

    /*if (!localStorage.checkoutToken) {
        onError(404, "Checkout not found");
        return;
    }*/
    if (!localStorage.checkoutToken) {
        localStorage.checkoutToken = uuidv4();
    }

    const url = window.location.search;
    const urlParams = new URLSearchParams(url);
    const quoteParam = urlParams.get('quote');

    if (quoteParam)
        axios({
            method: 'post',
            url: `/api/checkout/start/quote/${localStorage.checkoutToken}/${localStorage.quoteToken}`

        }).then(response => {



            emitter.emit("proceed-to-checkout", { data: response.data });
            onSuccess(response.data);
        }).catch(ex => {
            onError(ex.response.status, ex.response.data);
        });
    else {
        if (!localStorage.cartToken) {
            onError(404, "Checkout not found");
            return;
        }
        axios({
            method: 'post',
            url: `/api/checkout/start/${localStorage.checkoutToken}/${localStorage.cartToken}`
        }).then(response => {


            emitter.emit("proceed-to-checkout", { data: response.data });
            onSuccess(response.data);
        }).catch(ex => {
            onError(ex.response.status, ex.response.data);
        });
    }
};

app.config.globalProperties._subscribeToNewsletter = (email, callback) => {
    axios({
        method: 'post',
        url: `/api/subscribe/${email}`
    }).then(_ => {
        emitter.emit("subscribe-to-newsletter", { data: { email: email } });
        callback();
    }
    ).catch(ex => {
        console.log(ex);
    });
};

app.config.globalProperties._updateCheckout = (checkout, onSuccess, onError) => {
    axios({
        method: 'post',
        url: `/api/checkout/update/${localStorage.checkoutToken}`,
        data: checkout
    }).then(response => {
        onSuccess(response.data);
    }).catch(ex => {
        onError(ex.response.status, ex.response.data);
    });
};

app.config.globalProperties._updateCheckoutAsync = async (checkout) => {
    try {
        const response = await axios({
            method: 'post',
            url: `/api/checkout/update/${localStorage.checkoutToken}`,
            data: checkout
        });
        return response.data;
    } catch (ex) {
        throw ex;
    }
};

app.config.globalProperties._updateRetailUserProfile = (list, callback) => {
    axios({
        method: 'put',
        url: `/api/user/retail/profile`,
        data: list
    }).then(response => {
        onSucess(response)
    }).catch(ex => {
        onError(ex)
    });
};

app.config.globalProperties._updateShoppingList = (list, callback) => {
    axios({
        method: 'put',
        url: `/api/ShoppingList/${list.alias}`,
        data: list
    }).then(response => {
        var list = response.data;

        emitter.emit("update-wishlist", { data: list })
        callback(list);
    });
};

app.config.globalProperties._uploadContactFormFile = async (file) => {
    try {
        var guid = await internalUploadFile(file, '/api/file/contact');
        return guid;
    } catch (ex) {
        throw new Error(ex.message);
    }

};