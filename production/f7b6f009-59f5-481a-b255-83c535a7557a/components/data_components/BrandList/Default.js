const brandlistdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            brandList: [],
            brandlistSwiper: null,
            carouselLoaded: false
        }
    },
    mounted() {
        if(this.model.brandIds.length == 0) {
            this._findBrandsByIds(this.model.brandIds, e => {
                this.brandList = e;
            });
        } else {
            this._findBrandsByIdsFiltered(this.model.brandIds, e => {
                this.brandList = e;
            });
        }
    },
    methods: {
        carouselInitialization() {
            this.brandlistSwiper = new Swiper(".brandlist-carousel-" + this.model.id, {
                observer: true,
                observeParents: true,
                loop: true,
                spaceBetween: 0,
                slidesPerView: 1,
                slidesPerGroup: 1,
                pagination: {
                    el: ".swiper-pagination-" + this.model.id,
                    clickable: true
                },
                navigation: {
                    nextEl: ".swiper-button-next-" + this.model.id,
                    prevEl: ".swiper-button-prev-" + this.model.id,
                },
                freeMode: false,
                watchSlidesProgress: true,
                breakpoints: {
                    700: {
                        slidesPerView: 2,
                        slidesPerGroup: 2,
                        spaceBetween: 20,
                    },
                    1100: {
                        slidesPerView: 3,
                        slidesPerGroup: 3,
                        spaceBetween: 40,
                    },
                }
            });
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
        if (this.model.displayAsSlider && this.carouselLoaded === false)
            this.carouselInitialization();
    }
}

app.component('brandlistdefault', {
    extends: brandlistdefault,
    template: '#brandlistdefault'
});