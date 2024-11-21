const productscarouseldefault = {
    props: {
        model: Object
    },
    data() {
        return {
            collection: this.model.collectionIds && this.model.collectionIds.length > 0 && [this.model.collectionIds[0]],
            collections: null,
            buttonText: this.model.buttonText,
            collectionUrl: null,
            products: [],
            carouselLoaded: false,
            areProductsCalculated: false,
            carouselId: `carousel` + this.model.id,
            slidesPerView: 1,
            slidesPerColumn: 1,
            slideSettings: {},
        }
    },
    mounted() {
        this._findCollectionsByIdsThenCalculate(this.collection, true, e => {
            if (e !== null && e.length > 0) {
                this.products = e[0].products;
                this.collectionUrl = 'collection/' + e[0].alias
                e[0].products.forEach(p => {
                    if (p.productVariants[0].salesUnitId != null) {
                        this._findUnitsByIds([p.productVariants[0].salesUnitId, p.productVariants[0].unitId], units => {
                            p.productVariants[0].unit = units.find(u => u.id == p.productVariants[0].salesUnitId)?.name;
                        })
                    }
                });
                this.areProductsCalculated = true;
            }
        });
    },
    methods: {
        carouselInitialization() {
            if (this.model.displayBanner && this.model.image !== null) {
                this.slideSettings = {
                    loop: false,
                    freeMode: false,
                    watchSlidesProgress: true,
                    pagination: {
                        el: ".swiper-pagination-" + this.model.id,
                        clickable: true
                    },
                    slidesPerView: 1,
                    slidesPerGroup: 1,
                    spaceBetween: 0,
                    grid: {
                        rows: 1,
                        fill: "row"
                    },
                    breakpoints: {
                        700: {
                            slidesPerView: 2,
                            slidesPerGroup: 4,
                            spaceBetween: 20,
                            grid: {
                                rows: 2,
                                fill: "row"
                            },
                        },
                        1100: {
                            slidesPerView: 3,
                            slidesPerGroup: 3,
                            spaceBetween: 40,
                            grid: {
                                rows: 2,
                                fill: "row"
                            },
                        },
                    }
                }
            } else {
                this.slideSettings = {
                    loop: false,
                    spaceBetween: 0,
                    slidesPerView: 1,
                    slidesPerGroup: 1,
                    autoplay: {
                        delay: 5000,
                        pauseOnMouseEnter: true,
                    },
                    freeMode: false,
                    pagination: {
                        el: ".swiper-pagination-" + this.model.id,
                        clickable: true
                    },
                    breakpoints: {
                        700: {
                            slidesPerView: 2,
                            slidesPerGroup: 2,
                            spaceBetween: 16 * 3,
                        },
                        1100: {
                            slidesPerView: 3,
                            slidesPerGroup: 3,
                            spaceBetween: 16 * 3,
                        },
                    }
                }
            }

            let swiper = new Swiper(".products-carousel-" + this.model.id, this.slideSettings);
            this.carouselLoaded = true;
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
        }
    },
    updated: function () {
        !this.carouselLoaded ? this.carouselInitialization() : null;
        this.carouselLoaded = true;
    },
}

app.component('productscarouseldefault', {
    extends: productscarouseldefault,
    template: '#productscarouseldefault'
});