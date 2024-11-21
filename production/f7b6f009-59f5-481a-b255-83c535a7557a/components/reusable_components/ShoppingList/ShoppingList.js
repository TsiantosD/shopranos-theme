const shoppinglist = {
    data() {
        return {
            shoppingList: null,
            displayShoppingList: false,
            lists: [],
            inputOn: [],
            isLoading: false,
            isLoadingLists: true,
            id: "",
            alias: "",
            products: [],
            getFinalProducts: [],
            title: '',
            totalPrice: 0,
            cartData: null,
            selectedQuantity: 0,
            totalProductQuantity: 0,
            product: null,
            searchText: "",
            products: [],
            timerId: "",
        }
    },
    beforeMount() {
        this._getCart(e => {
            this.cartData = e;
        });
    },
    mounted() {
        var path = window.location.pathname.substring(1).split("/");
        
        if(path.length > 2){
            this.displayShoppingList = true;
            this.isLoading = true;
        } else {
            this.isLoadingLists = true;
        }

        this._getShoppingLists(e => {  
            this.lists = e;
            if(path.length > 2){
                if(this.lists.find(el => el.alias === path[2])) {
                    this.isLoading = false;
                    this.shoppingListSelected(path[2]);
                } else {
                    this.displayShoppingList = false;
                    window.history.replaceState(null, null, `/profile/shoppingLists`);
                    this.isLoadingLists = false;
                    this.arrayOfBooleans();
                }
            }  else {
                this.isLoadingLists = false;
                this.arrayOfBooleans();
            }            
        })
    },
    methods: {
        async addAllToCart() {
            var cartitems = [];
            for (let getFinalProduct of this.getFinalProducts) {
                var cartitem = new Object();
                cartitem.productVariantId = getFinalProduct.product.productVariants[getFinalProduct.i].id;
                cartitem.productId = getFinalProduct.product.id;
                cartitem.quantity = getFinalProduct.product.productVariants[getFinalProduct.i].selectedQuantity;
                cartitems.push(cartitem);
            }

            await this._addToCartMultiAsync(cartitems);

            this.updateCart();
            this.getFinalProducts.forEach(p => {
                this.setQuantity(p.product, p.i);
            });
        },
        addClickedProduct(product) {
            if (product == null && this.products.length > 0)
                product = this.products[0];
            else if (product == null && this.products.length == 0)
                return;

            if(this.shoppingList.items.find(item=> item.productVariantId !== product.productVariants[0].id)) {
                this.shoppingList.items.push({
                    productId: product.id,
                    productVariantId: product.productVariants[0].id,
                });
                this._updateShoppingList(this.shoppingList, e => {
                    this.shoppingList.items = e.items;
                    this.getShoppingList();
                    
                    this.searchText = "";
                    let dropdown = document.querySelectorAll('.dropdown-search .dropdown-menu');
                    if (dropdown != null && dropdown.length > 0)
                        dropdown[dropdown.length - 1].style.display = "none";
                })
            } else {
                this.searchText = "";
                let dropdown = document.querySelectorAll('.dropdown-search .dropdown-menu');
                if (dropdown != null && dropdown.length > 0)
                    dropdown[dropdown.length - 1].style.display = "none";
            }

        },
        async addSingleToCart(product, index) {
            await this._addToCartAsync(product.id, product.productVariants[index].id, product.productVariants[index].selectedQuantity);

            this.updateCart();
            this.setQuantity(product, index);
        },
        arrayOfBooleans() {
            this.inputOn = [];
            for (let list of this.lists) {
                this.inputOn.push(false);
            }
        },
        backToShoppingLists() {
            this.displayShoppingList = false;
            window.history.replaceState({ view: 'shoppingLists' }, 'shoppingLists', `/profile/shoppingLists`);
            this.get_shoppingLists();
        },
        buildFilter() {
            this.filter = "";
            let productIds = this.shoppingList.items.map(function (item) {
                return item.productId;
            });
            for (const id of productIds) {
                this.filter = this.filter.concat("&ids=", id);
            }
            this.filter = this.filter.concat("&page=1&pageSize=1000")
        },
        calculateCurrency(price) {
            return this._calculateCurrency(price)
        },
        checkVariants(p) {
            if (p.product.productVariants[p.i].dimension1ItemId !== null || p.product.productVariants[p.i].dimension2ItemId !== null) 
                return true
            else
                return false
        },
        createList() {
            if (this.title !== null && this.title !== "") {
                let data = { title: this.title };
                this._createShoppingList(data, e => {
                    this.title = '';
                    this.get_shoppingLists();
                });
            }
        },
        deleteFromList(productid, variantid, index) {
            this.isLoading = true;
            
            this.getFinalProducts.forEach(getFinalProduct => {
                getFinalProduct.product.productVariants.forEach((productVariant, index) => {
                    if(getFinalProduct.product.id == productid && productVariant.id == variantid) {
                        this.getFinalProducts.splice(index, 1);                        
                    }
                });
            });
            
            this.shoppingList.items.splice(index, 1);

            this._updateShoppingList(this.shoppingList, e => {
                this.isLoading = false;
                this.shoppingList.items = e.items;
                if (this.shoppingList.items === null || this.shoppingList.items.length < 1) {
                    this.products = [];
                    this.getFinalProducts = [];
                    return;
                }
            });
        },
        deleteList(alias) {
            this._deleteShoppingList(alias, e => {
                this.get_shoppingLists();
            });
        },
        getListAfterQuantityChange(currvalue, product, index) {
            this._getCart(e => {
                this.cartData = e;
                if (this.cartData === null) {
                    product.productVariants[index].selectedQuantity = this._onQuantityChange(currvalue, product, index, []);
                } else {
                    product.productVariants[index].selectedQuantity = this._onQuantityChange(currvalue, product, index, this.cartData.cartItems);
                }
            });
        },
        getProducts() {
            this.buildFilter();
            this.getFinalProducts = [];    
            if (this.filter == "") {
                this.products = [];
                return;
            }
            this._getProductsByFilter(this.filter, e => {
                this.products = e;

                this.products.forEach(product => {
                    product.productVariants.forEach((p, index) => {
                        p.selectedQuantity ? p.selectedQuantity : this.setQuantity(product, index)
                    });
                });

                this.products.forEach(product => {
                    product.productVariants.forEach((b, i)=>{
                        this.shoppingList.items.forEach((a)=>{                            
                            if(b.id == a.productVariantId){                                
                                this.getFinalProducts.push({product,i});
                            }
                        })
                    })
                });       
                this.isLoading = false;
            })
        },
        getShoppingList() {
            this.isLoading = true;
            this._getShoppingListByAlias(this.id, e => {
                this.shoppingList = e;            

                if (this.shoppingList.items === null || this.shoppingList.items.length < 1) {
                    this.shoppingList.items = [];
                    this.products = [];
                    this.isLoading = false;
                    return;
                }
                this.getProducts();                
            })
        },
        get_shoppingLists() {
            this.isLoadingLists = true;
            this._getShoppingLists(e => {                
                this.isLoadingLists = false;
                this.lists = e;
                this.arrayOfBooleans();
            })
        },
        getVariants(p) {
            if (p.product.productVariants[p.i].dimension1ItemId !== null) {
                var dim1 = p.product.dimension1.items.find(el=>el.id === p.product.productVariants[p.i].dimension1ItemId).value;
                if (p.product.productVariants[p.i].dimension2ItemId !== null) {
                    var dim2 = p.product.dimension2.items.find(el=>el.id === p.product.productVariants[p.i].dimension2ItemId).value;
                    return dim1 + ' / ' + dim2;
                }
                return dim1;
            } else if (p.product.productVariants[p.i].dimension2ItemId !== null) {
                var dim2 = p.product.dimension2.items.find(el=>el.id === p.product.productVariants[p.i].dimension2ItemId).value;
                return dim2;
            }
        },
        newCart() {
            this._clearCart();
            localStorage.removeItem("cartToken");
            this.addAllToCart();
        },
        search(ev) {
            this.product = null;
            clearTimeout(this.timerId);
            this.timerId = setTimeout(() => {
                this._findProductsByTitle(1, 16, this.searchText, true, "-SortDate", data => {
                    if (data && data.length > 0) {
                        this.products = data
                        this.resultsdiv = ev.target.parentNode.querySelector('.dropdown-search .dropdown-menu');
                        this.resultsdiv.style.display = "block";
                    }
                    else {
                        this.resultsdiv = ev.target.parentNode.querySelector('.dropdown-search .dropdown-menu');
                        this.resultsdiv.style.display = "";
                    }
                });
            }, 400)
        },
        setQuantity(product, index) {
            if (this.cartData === null) {
                this.selectedQuantity = this._findSelected(product.productVariants[index], []);
            } else {
                this.selectedQuantity = this._findSelected(product.productVariants[index], this.cartData.cartItems);
                if (this.cartData.cartItems.find((p) => p.productVariantId === product.productVariants[index].id))
                    this.totalProductQuantity = this.cartData.cartItems.find((p) => p.productVariantId === product.productVariants[index].id).quantity;
            }
        },
        showInput(index) {
            this.arrayOfBooleans();
            this.inputOn[index] = true;
        },
        shoppingListSelected(alias) {
            this.id = alias;
            window.history.replaceState(null, null, `/profile/shoppingLists/${alias}`);
            this.getShoppingList();
            this.displayShoppingList = true;
        },
        updateCart() {
            this._getCart(e => {
                this.cartData = e;
            });
        },
        updateTitle(list, index) {
            this._updateShoppingList(list, e => {
                this.lists[index] = e;
                this.inputOn[index] = false;
            })
        }
    }
}

app.component('shoppinglist', {
    extends: shoppinglist,
    template: '#shoppinglist'
});