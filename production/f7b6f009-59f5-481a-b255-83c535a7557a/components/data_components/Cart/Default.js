const cartdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            timerId: "",
            timerQuantity: "",
            cart: null,
            isLoading: false,
            isLoadingData: false,
            products: [],
            product: null,
            SearchText: "",
            units: [],
            undoDeletionActive: false,
            deletedProductName: "",
            productIds: [],
            parentProducts: null,
            emptyCartAfterDeletion: false,
            controlButton: false
        }
    },
    mounted() {
        this.isLoading = true;
        this._calculateCart(this.onSuccessCalculation, this.onErrorCalculation);
        this.addItemFromUrl();
        this._setCartListener(e => {
            this.cart = e;
            this.isLoadingData = true;
            this._calculateCart(this.onSuccessCalculation, this.onErrorCalculation);
        });
    },
    methods: {
        AddClickedProduct(product) {
            if (product == null && this.products.length > 0)
                product = this.products[0];
            else if (product == null && this.products.length == 0)
                return;
            if (product.productVariants[0].canOrder) {
                this.undoDeletionActive = false;
                this._addToCart(product.id, product.productVariants[0].id, product.productVariants[0].selectedQuantity);
            } else {
                this.showErrorMessage();
                return;
            }
            this.products = [];
            this.product = null;
            this.SearchText = "";
            let dropdown = document.querySelectorAll('.dropdown-search .dropdown-menu');
            if (dropdown != null && dropdown.length > 0)
                dropdown[dropdown.length - 1].style.display = "none";

        },
        addItemFromUrl() {
            const queryParams = new URLSearchParams(window.location.search);
            if (queryParams.has('items')) {
                const items = queryParams.get('items');
                this._addToCartFromURL(items);
            }
        },
        addProduct() {
            this._addToCart(this.deletedProduct.productId, this.deletedProduct.productVariantId, this.deletedProduct.quantity);
            this.undoDeletionActive = false;
            this.controlButton = false;
        },
        calculateSubTotal(items) {
            var total = 0;
            items.forEach(item => total += (item?.lineValue - item?.discountValue))
            return this._calculateCurrency(total);
        },
        calculateUnitName(id) {
            let unit = this.units.find(u => u.id === id);
            if (unit !== undefined && unit !== null) {
                if (unit.name !== undefined && unit.name !== null && unit.name !== "") {
                    return `(${unit.name})`
                }
            }
        },
        clearItem(item) {
            this._removeFromCart(item.productVariantId);
            if (this.cart.cartItems.length == 1) {
                this.emptyCartAfterDeletion = true;
                this.controlButton = true;
            }
            this.undoDeletion(item);
        },
        getCartAfterQuantityChange(currvalue, product) {
            if (this.parentProducts.find(el => el.id === product.productId)) {
                let parentProduct = this.parentProducts.find(el => el.id === product.productId);
                let activeVariantIndex = parentProduct.productVariants.findIndex(el => el.id === product.productVariantId);
                product.selectedQuantity = this._onQuantityChange(currvalue, parentProduct, activeVariantIndex, []);
                product.quantity = product.selectedQuantity;
            }
            clearTimeout(this.timerQuantity);
            this.timerQuantity = setTimeout(() => {
                this._setCart(this.cart);
            }, 300);

        },
        handleImageError(event) {
            event.target.src = this._getNoImageUrl();
        },
        hasDiscount(item) {
            if (item.discountValue > 0)
                return true;

            return false;
        },
        onErrorCalculation(e) {
            this.isLoadingData = false;
            this.isLoading = false;
        },
        onSuccessCalculation(e) {
            this.cart = e;
            this.isLoadingData = false;
            this.isLoading = false;
            let ids = e.cartItems.map(c => c.salesUnitId);
            this._findUnitsByIds(ids, e => this.units = e);

            this.cart.cartItems.forEach(variant => {
                if (this.productIds.indexOf(variant.productId) === -1) {
                    this.productIds.push(variant.productId);
                }
                variant.selectedQuantity = variant.quantity;
            })
            this._findProductsByIds(this.productIds, true, e => {
                this.parentProducts = e;
            });
        },
        Search(ev) {
            this.product = null;
            this.showVariants = [];
            clearTimeout(this.timerId);
            this.timerId = setTimeout(() => {
                this._findProductsByTitle(1, 16, this.SearchText, true, "-SortDate", data => {
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
        showErrorMessage() {
            const errorMessageModal = new bootstrap.Modal(document.getElementById('errorMessageModal'));
            errorMessageModal.show();
        },
        toggleNote(event) {
            if (event.target.parentNode.classList.contains('open')) {
                event.target.parentNode.classList.remove('open');
            } else {
                event.target.parentNode.classList.add('open');
            }
        },
        proceedToCheckout() {
            localStorage.checkoutToken = this.uuidv4();
            window.location.href = `/checkout`;
        },
        undoDeletion(product) {
            this.deletedProduct = product;
            this.deletedProductName = product.productTitle;
            this.undoDeletionActive = true;
        },
        updateCart() {
            this._setCart(this.cartData);
        },
        uuidv4() {
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        }
    }
}

app.component('cartdefault', {
    extends: cartdefault,
    template: '#cartdefault'
});