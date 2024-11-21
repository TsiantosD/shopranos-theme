const shipping = {
    props: {
        model: Object,
    },
    data() {
        return {
            checkout: null,
            selectedCarrierId: null,
            carriers: null,
            selectedCarrier: null,
            shippingValue: null,
            checkRun: false,
            user: null,
            useraddresses: null,
            emptyAddress: false,
            isBillingEnabled: false,
        }
    },
    mounted() {
        this.checkout = this.model;
        this.checkComponents();       
        console.log(this.checkout);
        console.log(this.isBillingEnabled);
           
        
        if((this.checkout.billingAddress == null ||(this.checkout.billingAddress !== null && this.checkout.billingAddress.address1 == '')) && !this.isBillingEnabled ){
            this.emptyAddress = true;
        }
        console.log(this.emptyAddress);
        
        this.checkRun = this.checkout.reRun !== undefined ? this.checkout.reRun : false;
        if (this.checkRun) {
            setTimeout(() => {
                this.checkRun = false;
                this.carriers = this.checkout.shippingOptions;
                if (this.carriers && this.carriers.length > 0) {
                    this.selectedCarrierId = this.carriers[0].carrier.id;
                    this.setCarrier();
                }
            }, 500);
        }
    },
    methods: {
        calculateCurrency(price) {
            return this._calculateCurrency(price);
        },
        checkComponents() {
            if(this.checkout !== null && this.checkout.settings !== null && this.checkout.settings.showBilling)
                this.isBillingEnabled = true
        },
        setCarrier() {
            this.selectedCarrier = this.carriers.find(c => c.carrier.id === this.selectedCarrierId);
            this.shippingValue = this.selectedCarrier.shippingLine.totalAmount;
            this.checkout.shippingLine = this.selectedCarrier.shippingLine;
            this.$emit('update:checkout', this.checkout);
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
    }
}

app.component('shipping', {
    extends: shipping,
    template: '#shipping'
});