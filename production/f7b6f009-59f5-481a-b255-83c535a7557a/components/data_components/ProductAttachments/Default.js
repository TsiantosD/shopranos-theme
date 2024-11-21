const productattachmentsdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            productData: this._product,
            attachments: []
        }
    },
    mounted() {
        if (this.productData.mediaItems != null)
            this.productData.mediaItems.forEach((element) => {
                if (element.mediaType == "Attachment" || element.mediaType == 2) {
                    this.attachments.push(element)
                }
            });

        this.$nextTick(() => {
        });
    },
    methods: {
        carouselInitialization() {
            let swiper = new Swiper(".product-attachments__carousel-" + this.model.id, {
                loop: false,
                spaceBetween: 0,
                slidesPerView: 1,
                freeMode: false,
                watchSlidesProgress: true,
                pagination: {
                    el: ".swiper-pagination-" + this.model.id,
                    clickable: true
                },
                breakpoints: {
                    700: {
                        slidesPerView: 2,
                        spaceBetween: 40,
                    },
                    1100: {
                        slidesPerView: 3,
                        spaceBetween: 60,
                    },
                }
            });
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
        this.carouselInitialization();
    }
}

app.component('productattachmentsdefault', {
    extends: productattachmentsdefault,
    template: '#productattachmentsdefault'
});