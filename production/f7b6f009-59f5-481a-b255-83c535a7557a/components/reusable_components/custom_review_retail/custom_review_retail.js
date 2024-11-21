const custom_review_retail  = {
    props:
        { 
            model : Object,
            steps:Array,
            activeStep : String,
            buttonLoading : Boolean,
    },
    data() {
        return {
            checkout:null,
            selectedcarrier : null,
            carriers: null,
            selectedCarrier: null,
            selectedBranch: null,
            units: [],
            billingAddress: null,
            currentStep : this.activeStep,
            loader : this.buttonLoading

        }
        },
    mounted(){
        this.checkout = this.model;
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
                this.checkOut();
            },
            checkOut() {
                debugger;
                this.dataLoaded = false;
                this.loader = true;
                this.$emit('update:buttonLoading', this.loader);
                this._initiateCompleteCheckout(this.checkout, this.oncheckoutComplete, this.oncheckoutCompleteError)
            },

            checkValid(){
                return true; 
            }
    },
    computed: {
        Checkout:{
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

app.component('custom_review_retail', {
extends: custom_review_retail,
template: '#custom_review_retail'
});