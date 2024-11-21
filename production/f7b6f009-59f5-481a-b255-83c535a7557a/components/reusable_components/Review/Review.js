const review = {
    props:
    {
        model: Object,
        steps: Array,
        activeStep: String,
        buttonLoading: Boolean,
    },
    data() {
        return {
            checkout: null,
            selectedcarrier: null,
            carriers: null,
            selectedCarrier: null,
            selectedBranch: null,
            units: [],
            billingAddress: null,
            currentStep: this.activeStep,
            loader: this.buttonLoading
        }
    },
    mounted() {
        this.checkout = this.model;
        this.customerData = this.checkout.customer;
        this.billingAddress = this.checkout.billingAddress;
        this.shippingAddress = this.checkout.shippingAddress;
        this.selectedBranch = this.checkout.customerBranchId == null ? this.checkout.addresses[0] : this.checkout.customer.branches.find((branch) => branch.id === this.checkout.customerBranchId);
        this.carriers = this.checkout.shippingOptions;
    },
    methods: {
        calculateCurrency(price) {
            return this._calculateCurrency(price);
        },
        hasDiscount(item) {
            if (item.initialPrice == undefined || item.initialPrice == null || item.initialPrice <= item.price)
                return false;

            return true;
        },
        calculateUnitName(id) {
            let unit = this.units.find(u => u.id === id);
            if (unit !== undefined && unit !== null) {
                if (unit.name !== undefined && unit.name !== null && unit.name !== "") {
                    return `(${unit.name})`
                }
            }
        },
        oncheckoutComplete(e) {
            this.loader = false;
            this.checkoutData = e;
            this.customerData = {};
            this.checkout.cartItems = {};
            this.dataLoaded = true;
            this.currentStep = 'orderplaced';
            this.$emit('update:activeStep', this.currentStep);
            this.$emit('update:checkout', this.checkoutData);
            this.$emit('update:buttonLoading', this.loader);


        },

        oncheckoutCompleteError(status, e) {
            console.log(status, e);
        },
        placeOrder() {

            this.checkout.shippingAddress = this.ShippingAddress;

            this.checkout.customerId = this.customerData.id;

            // this.checkout.customerBranchId = this.selectedBranch.id;

            if (!this.steps.includes("billing")) {
                if (this.selectedBranch.id != this.customerData.id) {
                    this.checkout.customerBranchId = this.selectedBranch.id;
                }
            }

            this.checkOut();
        },
        checkOut() {
            this.dataLoaded = false;
            this.loader = true;
            this.$emit('update:buttonLoading', this.loader);
            this._initiateCompleteCheckout(this.checkout, this.oncheckoutComplete, this.oncheckoutCompleteError)
        },

        checkValid() {
            return true;
        }
    },
    computed: {
        Checkout: {
            get() {
                return this.checkout;
            },
            set(value) {
                this.checkout = value;
                this.$emit('update:checkout', value);
            }
        },
        BillingAddress: {
            get() {
                this.customerData.billingAddress = this.billingAddress;
                return this.billingAddress;
            },
            set(newVal) {
                this.billingAddress = newVal;
            }
        },
        SelectedBranch: {
            get() {
                return this.selectedBranch;
            },
            set(newVal) {
                this.selectedBranch = newVal;
            }
        },
        ShippingAddress: {
            get() {
                return this.shippingAddress;
            },
            set(newVal) {
                this.shippingAddress = newVal;
            }
        },
    }
}

app.component('review', {
    extends: review,
    template: '#review'
});