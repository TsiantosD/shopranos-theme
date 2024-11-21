const productattributesdefault = {
    props: {
        model: Object,
    },
    data() {
        return {
            productData: this._product,
            attributeSet: null,
            attributes: null
        }
    },
    mounted() {
        this.attributeSet = this._product?.attributeSet;
        this.attributes = this._product?.attributes;
    },
    methods: {
        checkAttributes() {
            if (this.attributes.find(a => a.attributeItemValue != null)) {
                return true;
            }
            return false;
        },
        checkGroupAttributes(group) {
            if (group.items.find(a => a.value != null)) {
                return true;
            }
            return false;
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
    }
}

app.component('productattributesdefault', {
    extends: productattributesdefault,
    template: '#productattributesdefault'
});