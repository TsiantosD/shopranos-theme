const cartexport = {
    props:
        {},
    data() {
        return {
            isLoading: false,
            hasError: false
        }
    },
    mounted() {
    },
    methods: {
        async exportCart(type) {
            this.isLoading = true;
            await this._exportCart(type);
            this.isLoading = false;
        }
    }
}

app.component('cartexport', {
    extends: cartexport,
    template: '#cartexport'
});