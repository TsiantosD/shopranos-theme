const productsblockdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            collection: this.model.collectionIds && this.model.collectionIds.length > 0 && [this.model.collectionIds[0]],
            products: null,
            areProductsCalculated: false,
            buttonText: this.model.buttonText,
            collectionUrl: null,
        }
    },
    mounted() {
        this._findCollectionsByIdsThenCalculate(this.collection, true, e => {
            if (e !== null && e.length > 0) {
                this.products = e[0].products;
            }
        },
            e => {
                this.areProductsCalculated = true;
                this.products = e[0].products;
                this.collectionUrl = 'collection/' + e[0].alias
            }
        );
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
    }
}

app.component('productsblockdefault', {
    extends: productsblockdefault,
    template: '#productsblockdefault'
});