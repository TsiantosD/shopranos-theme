const cartimport = {
    props:
        {},
    data() {
        return {
            isLoading: false,
            hasError: false,
            showModal: false,
            showModalError: false,
            errors: [],
            items: null
        }
    },
    mounted() {
        // this.upload();
    },
    methods: {
        async upload() {
            if (this.$refs.upload.files.length != 0 && !this.hasError) {
                this.isLoading = true;
                const file = this.$refs.upload.files[0];
                const response = await this._createCartFromFile(file);
                this.isLoading = false;
                var path = window.location.pathname.substring(1).split("/");

                if (this.showModal)
                    this.closeModal();

                if (response.data.errors != null && response.data.errors.length > 0) {
                    this.items = response.data.cart.cartItems;
                    this.errors = response.data.errors;
                    this.openModalError();
                } else if (path.length > 0 && path.includes('profile') && response.data.cart.cartItems.length > 0) {
                    window.location.href = "/cart";
                }

            }
        },
        uploadChange() {
            if (this.$refs.upload.files.length > 0 && this.$refs.upload.files[0].type != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" && this.$refs.upload.files[0].type != "text/csv") {
                this.hasError = true;
            } else {
                this.hasError = false;
            }
        },
        openModal() {
            if (this.$refs.upload.files.length != 0 && !this.hasError) {
                this._getCart(e => {
                    if (e != null && e.cartItems.length > 0) {
                        this.showModal = true;
                        var backdrop = document.createElement("div");
                        backdrop.classList.add("modal-backdrop", "fade", "show");
                        document.body.appendChild(backdrop);
                        this.$refs.uploadmodal.style.display = "block";
                    }
                    else {
                        this.upload();
                    }
                })

            }
        },
        closeModal() {
            this.showModal = false;
            this.$refs.uploadmodal.style.display = "";
            document.querySelector('.modal-backdrop').remove();
        },
        openModalError() {
            this.showModalError = true;
            var backdrop = document.createElement("div");
            backdrop.classList.add("modal-backdrop", "fade", "show");
            document.body.appendChild(backdrop);
            this.$refs.uploadmodalerror.style.display = "block";
        },
        closeModalError() {
            this.showModalError = false;
            this.$refs.uploadmodalerror.style.display = "";
            document.querySelector('.modal-backdrop').remove();
        },
        proceedToCart() {
            this.closeModalError();
            var path = window.location.pathname.substring(1).split("/");
            if (path.length > 0 && path.includes('profile')) {
                window.location.href = "/cart";
            }
        }
    }
}

app.component('cartimport', {
    extends: cartimport,
    template: '#cartimport'
});