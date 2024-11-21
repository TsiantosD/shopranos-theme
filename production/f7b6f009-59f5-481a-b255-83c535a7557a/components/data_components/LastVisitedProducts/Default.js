const lastvisitedproductsdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            carouselId: `carousel${this.model.id}`,
            lastVisitedProducts: [],
            products: [],
            areProductsCalculated: false,
            carouselLoaded: false,
            isLoading: true
        }
    },
    beforeMount() {
        this.products = JSON.parse(localStorage.getItem("visitedProducts"));

        if (this.products == null || this.products.length === 0) return;

        let productIds = this.products.map(function (item) {
            return item.productId;
        });

        let criteria = {
            page: 1,
            pageSize: productIds?.length,
            sort: '-SortDate',
            ids: productIds?.join('&ids=')

        };

        let path = window.location.pathname.replace(/\/+$/, '');
        path = path[0] == '/' ? path.substr(1) : path;

        this._findProductsThenCalculate(criteria, products => {
            if (products.length > 0) {
                products.forEach(p => {
                    if (p.productVariants[0].salesUnitId != null) {
                        this._findUnitsByIds([p.productVariants[0].salesUnitId, p.productVariants[0].unitId], units => {
                            p.productVariants[0].unit = units.find(u => u.id == p.productVariants[0].salesUnitId)?.name;
                        })
                    }
                });
            }
            this.lastVisitedProducts = products;

            if (this.lastVisitedProducts.findIndex((element) => element.link === path) > -1) {

                // this.lastVisitedProducts = this.lastVisitedProducts.splice(this.lastVisitedProducts.findIndex((element) => element.link === path), 1);
                this.lastVisitedProducts = this.lastVisitedProducts.filter(element => element.link !== path)
            }
        }, calculatedProducts => {
            this.areProductsCalculated = true;
            this.lastVisitedProducts = calculatedProducts;

            if (this.lastVisitedProducts.findIndex((element) => element.link === path) > -1) {
                // this.lastVisitedProducts = this.lastVisitedProducts.splice(this.lastVisitedProducts.findIndex((element) => element.link === path), 1);
                this.lastVisitedProducts = this.lastVisitedProducts.filter(element => element.link !== path)
            }
        });
    },
    mounted() {
        this.$nextTick(() => {
            setTimeout(() => {
                // this.carouselInitialization();
            }, 1200);
        });
    },
    methods: {
        carouselInitialization() {
            let swiper = new Swiper(".last-visited-carousel-" + this.model.id, {
                spaceBetween: 0,
                slidesPerView: 1,
                slidesPerGroup: 1,
                freeMode: false,
                watchSlidesProgress: true,
                pagination: {
                    el: ".swiper-pagination-" + this.model.id,
                    clickable: true
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
        if (this.lastVisitedProducts !== null && this.lastVisitedProducts.length > 0 && this.carouselLoaded === false) {
            this.carouselInitialization();
        }
    }
}

app.component('lastvisitedproductsdefault', {
    extends: lastvisitedproductsdefault,
    template: '#lastvisitedproductsdefault'
});