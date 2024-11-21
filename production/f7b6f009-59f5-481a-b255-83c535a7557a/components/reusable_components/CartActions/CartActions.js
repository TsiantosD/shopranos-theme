const cartactions = {
    props:
        {},
    data() {
        return {
            hasError: false,
            exportOption: 'excel',
            content: null,
            isLoading: false,
            cartHasProducts: false,
            importHasError: false,
            errors: [],
            items: null,
            fatalErrorOccured: false,
        }
    },
    mounted() {
    },

    methods: {
        uploadChange() {
            this.errors = [];
            this.items = null;
            this.importHasError = false;
            this.fatalErrorOccured = false;

            if (this.$refs.upload.files.length > 0 && this.$refs.upload.files[0].type != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" && this.$refs.upload.files[0].type != "text/csv") {
                this.hasError = true;
            } else {
                this.hasError = false;
            }
        },
        async uploadCart() {
            this.errors = [];
            this.importHasError = false;
            if (this.hasError) {
                return;
            }
            if (this.$refs.upload.files.length != 0 && !this.hasError) {
                this.isLoading = true;
                const file = this.$refs.upload.files[0];
                const response = await this._createCartFromFile(file);
                this.isLoading = false;
                if (response.status === 500) {
                    this.fatalErrorOccured = true;
                    return;
                }
                if (response.data.errors != null && response.data.errors.length > 0) {
                    this.importHasError = true;
                    this.items = response.data.cart.cartItems;
                    this.errors = response.data.errors;
                }
                else {
                    ;
                    document.getElementById("upload").value = '';
                    this.closeModal("importexportmodal");
                }

            }
        },
        setContentImport() {
            this.content = 'import';
            this._getCart(e => {
                if (e != null && e.cartItems.length > 0) {
                    this.cartHasProducts = true;
                }
            });
        },
        async exportCart(type) {
            if (type === undefined || type === null) {
                return;
            }
            this.isLoading = true;
            await this._exportCart(type);
            this.isLoading = false;
            this.closeModal("importexportmodal");
        },
        closeModal(modalId) {
            var myModalEl = document.getElementById(modalId);
            var modal = bootstrap.Modal.getInstance(myModalEl)
            modal.hide();
        },
    }
}

app.component('cartactions', {
    extends: cartactions,
    template: '#cartactions'
});