const relatedproductsdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            carouselId: `carousel${this.model.id}`,
            defaultVariant: this._product.productVariants[0],
            relatedProducts: [],
            hasRelatedProducts: false,
            carouselLoaded: false,
            areProductsCalculated: false,
            activeProduct: 0,
            relatedSwiper: null,
            componentKey: 0,
            isLoading: true
        }
    },
    mounted() {
        this.areProductsCalculated = true;
        this.fetchRelatedProducts();
    },
    methods: {
        carouselInitialization() {
            let swiper = new Swiper(".related-carousel-" + this.model.id, {
                spaceBetween: 0,
                slidesPerView: 1,
                slidesPerGroup: 1,
                freeMode: false,
                watchSlidesProgress: true,
                updateOnSlideChange: true,
                pagination: {
                    el: ".swiper-pagination-" + this.model.id,
                    clickable: true,
                    type: 'bullets',
                },
                breakpoints: {
                    700: {
                        slidesPerView: 2,
                        slidesPerGroup: 2,
                        spaceBetween: 20,
                    },
                    1100: {
                        slidesPerView: 3,
                        slidesPerGroup: 1,
                        spaceBetween: 40,
                    },
                }
            });
            this.carouselLoaded = true;
            setTimeout(() => {
                this.isLoading = false;
            }, 400);
        },
        fetchRelatedProducts() {
            if (this.model.relatedProductsAssociationType == 0 || this.model.relatedProductsAssociationType == null) {
                this._getRelatedProducts(this._product.id, this.defaultVariant.id, this.processRelatedProducts);
            } else if (this.model.relatedProductsAssociationType == 1) {
                this._getProductsByFilter(`categoryId=${this._product.categoryId}`, this.filterAndProcessRelatedProducts);
            } else if (this.model.relatedProductsAssociationType == 2) {
                this._getProductsByFilter(`brandId=${this._product.brandId}`, this.filterAndProcessRelatedProducts);
            }
        },
        filterAndProcessRelatedProducts(e) {
            this.relatedProducts = e.filter(product => product.id !== this._product.id);
            if (this.relatedProducts !== undefined && this.relatedProducts !== null && this.relatedProducts.length > 0) {
                this.hasRelatedProducts = true;
                this.relatedProducts.forEach(this.processProductVariants);
            }
        },
        forceRerender() {
            this.componentKey += 1;
        },
        getAlignmentClass(alignment) {
            switch (alignment) {
                case 1:
                    return 'justify-content-start';
                case 2:
                    return 'justify-content-center';
                case 3:
                    return 'justify-content-end';
                default:
                    return '';
            }
        },
        processProductVariants(p) {
            p.productVariants[this.activeProduct].selectedQuantity = 1;
            if (p.productVariants[this.activeProduct].salesUnitId != null) {
                this._findUnitsByIds([p.productVariants[this.activeProduct].salesUnitId], e => {
                    p.productVariants[this.activeProduct].unit = e[0].name;
                });
            }
            if (p.productVariants[this.activeProduct].suggestedOrderQuantity !== null && p.productVariants[this.activeProduct].suggestedOrderQuantity > 0) {
                p.productVariants[this.activeProduct].selectedQuantity = p.productVariants[this.activeProduct].suggestedOrderQuantity;
            } else if (p.productVariants[this.activeProduct].orderQuantityStep !== null && p.productVariants[this.activeProduct].orderQuantityStep !== 0) {
                p.productVariants[this.activeProduct].selectedQuantity = p.productVariants[this.activeProduct].orderQuantityStep;
            } else {
                p.productVariants[this.activeProduct].selectedQuantity = 1;
            }
        },
        processRelatedProducts(e) {
            this.relatedProducts = e;
            if (this.relatedProducts !== undefined && this.relatedProducts !== null && this.relatedProducts.length > 0) {
                this.hasRelatedProducts = true;
                this.relatedProducts.forEach(this.processProductVariants);
            }
        }
    },
    updated: function () {
        if (this.relatedProducts != null && !this.carouselLoaded)
            this.carouselInitialization();
    }
}

app.component('relatedproductsdefault', {
    extends: relatedproductsdefault,
    template: '#relatedproductsdefault'
});