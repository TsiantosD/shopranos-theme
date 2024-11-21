const reviewretail = {
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
            carriers: null,
            units: [],
            currentStep: this.activeStep,
            loader: this.buttonLoading,
            checkRun: false
        }
    },
    mounted() {
        this.checkout = this.model;
        this.checkRun = this.checkout.reRun !== undefined ? this.checkout.reRun : false;
        if (this.checkRun) {
            setTimeout(() => {
                this.checkRun = false;
                this.$emit('update:checkout', this.checkout);
            }, 500);
        }
    },
    methods: {
        calculateCurrency(price) {
            return this._calculateCurrency(price);
        },
        calculateUnitName(id) {
            let unit = this.units.find(u => u.id === id);
            if (unit !== undefined && unit !== null) {
                if (unit.name !== undefined && unit.name !== null && unit.name !== "") {
                    return `(${unit.name})`
                }
            }
        },
        getSelectedCarrier(shippingLine) {
            return this.checkout.shippingOptions.find(el => el.shippingLine.carrierId == shippingLine.carrierId).carrier;
        },
        hasDiscount(item) {
            if (item.initialPrice == undefined || item.initialPrice == null || item.initialPrice <= item.price)
                return false;

            return true;
        },
        oncheckoutComplete(e) {
            this.loader = false;
            this.checkoutData = e;
            this.checkout.cartItems = {};
            this.dataLoaded = true;
            this.currentStep = 'orderplaced';
            this.$emit('update:activeStep', this.currentStep);
            this.$emit('update:checkout', this.checkoutData);
            this.$emit('update:buttonLoading', this.loader);
        },
        oncheckoutCompleteError(status, e) {
            // console.log(status, e);
        },
        // DO NOT REMOVE - Functions below are needed for external component (Checkout) 
        checkOut() {
            this.dataLoaded = false;
            this.loader = true;
            this.$emit('update:buttonLoading', this.loader);
            this._initiateCompleteCheckout(this.checkout, this.oncheckoutComplete, this.oncheckoutCompleteError)
        },
        placeOrder() {
            this.checkOut();
        },
        // DO NOT REMOVE - Functions above are needed for external component (Checkout) 
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
    }
}

app.component('reviewretail', {
    extends: reviewretail,
    template: '#reviewretail'
});