const addtocart = {
    props: {
        model: Object,
        quantityActive: Boolean,
        isCalculated: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            product: this.model,
            loadingKey: null,
            cartData: [],
            totalProductQuantity: 0,
            uniqueKey: (Math.floor(Math.random() * 10000) + 10000).toString().substring(1)
        }
    },
    beforeMount() {
        this.product.productVariants.every(variant => {
            if (variant.canOrder) {
                this.product.productVariants[0] = variant;
                return false;
            }
            return true;
        })

        this._getCart(e => {
            this.cartData = e;
            if (this.cartData === null) {
                this.selectedQuantity = this._findSelected(this.product.productVariants[0], []);
            } else {
                this.selectedQuantity = this._findSelected(this.product.productVariants[0], this.cartData.cartItems);
                if (this.cartData.cartItems.find((p) => p.productVariantId === this.product.productVariants[0].id))
                    this.totalProductQuantity = this.cartData.cartItems.find((p) => p.productVariantId === this.product.productVariants[0].id).quantity;
            }
            this.product.productVariants[0].selectedQuantity = this.selectedQuantity;
        })
    },
    mounted() {
        if (this.cartData && this.cartData.cartItems.find((p) => p.productVariantId === this.product.productVariants[0].id) !== undefined)
            if (document.querySelector('#but-' + this.uniqueKey + '-' + this.product.id) !== null) {
                document.querySelector('#but-' + this.uniqueKey + '-'  + this.product.id).classList.remove('btn-secondary');
                document.querySelector('#but-' + this.uniqueKey + '-'  + this.product.id).classList.add('btn-primary');
                document.querySelector('#but-' + this.uniqueKey + '-'  + this.product.id).querySelector('.cart-item-circle').classList.remove('d-none');
                document.querySelector('#but-' + this.uniqueKey + '-'  + this.product.id).querySelector('.s-plus').classList.add('d-none');
            }
    },
    methods: {
        async addToCartBigButton(product, e) {
            var clickedElement = e.target;
            if (clickedElement.tagName.toLowerCase() !== 'button') {
                clickedElement = clickedElement.closest("button");
            }
            clickedElement.classList.add('clicked');
            clickedElement.classList.add('disabled');

            await this._addToCartAsync(product.id, product.productVariants[0].id, product.productVariants[0].selectedQuantity);

            setTimeout(() => {
                this._getCart(e => {
                    this.cartData = e;
                    this.totalProductQuantity = this.cartData.cartItems.find((p) => p.productVariantId === this.product.productVariants[0].id).quantity;
                });

                clickedElement.classList.remove('clicked');
                clickedElement.classList.remove('disabled');
                clickedElement.classList.remove('btn-secondary');
                clickedElement.classList.add('btn-primary');
                clickedElement.querySelector('.cart-item-circle').classList.remove('d-none');
                clickedElement.querySelector('.s-plus').classList.add('d-none');
                if (this.cartData === null) {
                    product.productVariants[0].selectedQuantity = this._findSelected(product.productVariants[0], []);
                } else {
                    product.productVariants[0].selectedQuantity = this._findSelected(product.productVariants[0], this.cartData.cartItems);
                }

            }, 1500);
        },
        async addToCartSmallButton(product, i) {
            this.loadingKey = i;
            await this._addToCartAsync(product.id, product.productVariants[0].id, product.productVariants[0].selectedQuantity);
            if (this.cartData === null) {
                product.productVariants[0].selectedQuantity = this._findSelected(product.productVariants[0], []);
            } else {
                product.productVariants[0].selectedQuantity = this._findSelected(product.productVariants[0], this.cartData.cartItems);
            }
            this.loadingKey = null;
        },
        isLoading(i) {
            return this.loadingKey === i;
        },
        onErrorCalculation(e) {
        },
        onQuantityChange(currvalue, product) {
            this._calculateCart(this.onSuccessCalculation, this.onErrorCalculation);
            this._getCart(e => {
                this.cartData = e;
                if (this.cartData.cartItems === null) {
                    this._onQuantityChange(currvalue, product, 0, []);
                } else {
                    this._onQuantityChange(currvalue, product, 0, this.cartData.cartItems);
                }
            });
        },
        onSuccessCalculation(e) {
            this.cartData = e;
        }
    }
}

app.component('addtocart', {
    extends: addtocart,
    template: '#addtocart'
});