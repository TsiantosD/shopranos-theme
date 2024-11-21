const textwithimagedefault = {
    props: {
        model: Object
    },
    data() {
        return {
            imgUrl: this.model.image != null ? this.model.image.link : null,
            imgAlt: this.model.header,
            image: this.model.imageOrientation,
            text: this.model.textOrientation,
            imageClass: "col-md-6",
            textClass: "col-md-6",
            genTextClass: "text-start left",
            imagePosition: this.model.imagePosition !== null ? this.model.imagePosition : 0,
            hasText: (this.model.header !== null && this.model.header != '') || (this.model.subHeader !== null) || (this.model.text !== null) || (this.model.buttonText !== null && this.model.buttonLink !== null)
        }
    },
    methods: {
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
    created: function () {
        if (this.hasText) {
            if (this.text === 1) {
                this.genTextClass = "text-end right";
            } else if (this.text === 2) {
                this.genTextClass = "text-center center";
            }
        }
        if (this.imgUrl === null) {
            this.textClass = "col-12";
        } else {
            if (this.model.image.alt) {
                this.imgAlt = this.model.image.alt;
            }
            if (this.image === 1) {
                this.genImageClass = "text-end right";
            } else if (this.image === 2) {
                this.genImageClass = "text-center center";
            }
            if (this.hasText) {
                if (this.imagePosition === 1) {
                    this.imageClass = "col-md-6 order-md-last";
                } else if (this.imagePosition === 2) {
                    this.imageClass = "col-12";
                    this.textClass = "col-12 pt-5";
                } else if (this.imagePosition === 3) {
                    this.imageClass = "col-12 order-md-last";
                    this.textClass = "col-12 pb-5";
                }
            } else {
                this.imageClass = "col-12";
            }
        }
    }
}

app.component('textwithimagedefault', {
    extends: textwithimagedefault,
    template: '#textwithimagedefault'
});