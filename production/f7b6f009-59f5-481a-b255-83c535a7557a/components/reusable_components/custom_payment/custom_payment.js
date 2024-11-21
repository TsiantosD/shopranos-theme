const custom_payment  = {
        props:
            {model : Object},
        data() {
            return {
                checkout:null,
                selectedPaymentMethod: null,
            }
            },
        mounted(){
            this.checkout = this.model;
        },
        methods: {
            setPayment() {
                this.checkout.payment = {};
                this.checkout.payment.provider = this.selectedPaymentMethod.provider;
            },
            checkValid(){
                return !!this.selectedPaymentMethod.provider;
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

app.component('custom_payment', {
    extends: custom_payment,
    template: '#custom_payment'
});