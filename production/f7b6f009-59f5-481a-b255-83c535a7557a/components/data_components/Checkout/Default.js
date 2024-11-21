const checkoutdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            checkout: null,
            activeStep: 'review',
            customerData: null,
            checkoutData: {
                notes: ""
            },
            user: null,
            selectedBranch: null,
            shippingAddress: {
                address1: null,
                address2: null,
                city: null,
                country: null,
                postalCode: null,
                state: null
            },
            addressLoaded: false,
            dataLoaded: false,
            buttonLoading: false,
            errorCode: null,
            errorType: "",
            error: null,
            errorMessage: "",
            guestCheckout: false,
            componentKey: 0,
            runOnce: 0,
            enableButtonAction: false,
            inputFieldsOk: false,
            shippingCheckedOk: false,
            paymentCheckedOk: false,
            billingAddressOptionsLengthInit: -1,
            shippingAddressOptionsLengthInit: -1,
            signInUser: false,
            signUpUser: false,
            couponCode: '',
            couponMessage: -1,
            pointsMessage: -1,
            isCouponValid: false,
            isPointsLoading: false,
            isCouponLoading: false,
            isRedeeming: false,
            finalTotalAmount: 0,
            isCouponRedeemed: false,
            isPointsRedeemed: false,
            rewardPoints: -1,
            isPointsRedemptionActive: false,
            discountFromPoints: -1,
            isBillingLoaded: false,
            totalRedemptionRate: 0,
            totalRedemptionValue: 0,
            isBillingEnabled: false,
            isShippingEnabled: false,
            isPaymentEnabled: false
        }
    },
    mounted() {
        if (localStorage.cartToken) {
            if (this.CanCheckout) {
                this._getCurrentCheckout(this.onCheckoutSuccess, this.onCheckOutError);
            }
        }
        else {
            this.dataLoaded = true;
        }
    },
    methods: {
        calculateCurrency(price) {
            return this._calculateCurrency(price);
        },
        calculateSubTotal() {
            var total = 0;
            this.checkout.cartItems.forEach(item => total += item?.lineValue)
            return this._calculateCurrency(total);
        },
        calculateUnitName(id) {
            let unit = this.units.find(u => u.id === id);
            if (unit !== undefined && unit !== null) {
                if (unit.name !== undefined && unit.name !== null && unit.name !== "") {
                    return `${unit.name}`
                }
            }
        },
        async checkAddressFields() {
            try {
                let component = `billingComponent`;
                let checkValid = this.$refs[component];

                if (checkValid.checkValid() === true) {
                    this.inputFieldsOk = true;
                    this.checkValidCheckout();
                    try {
                        this.checkout = checkValid.updateCheckout();
                        this.checkout = await this._updateCheckoutAsync(this.checkout);
                    } catch (error) {
                        this.onCheckOutError(error.response.status, error.response.data);
                    }
                } else {
                    this.inputFieldsOk = false;
                    this.checkValidCheckout();
                    this.checkout = checkValid.updateCheckout();
                }
                this.checkout.reRun = true;
                this.forceRerender();
                this.$emit('update:checkout', this.checkout);
            } catch (error) {
                console.log(error);
                // this.onCheckOutError(error.response.status, error.response.data);
            }
        },
        checkComponents() {
            if (this.checkout.settings.showBilling)
                this.isBillingEnabled = true
            if (this.checkout.settings.showShipping)
                this.isShippingEnabled = true
            if (this.checkout.settings.showPayment)
                this.isPaymentEnabled = true
        },
        async checkPaymentCost() {
            let component = `paymentComponent`;
            let checkPayment = this.$refs[component];
            try {
                this.checkout.payment = checkPayment.updateCheckoutPayment();
                this.checkout = await this._updateCheckoutAsync(this.checkout);
                // TODO - Checkout returns serviceamount always null after above function
            } catch (error) {
                this.onCheckOutError(error.response.status, error.response.data);
            }
        },
        checkValidCheckout() {
            if (
                (this.inputFieldsOk && !this.isShippingEnabled)
                ||
                (this.inputFieldsOk && this.isShippingEnabled && document.querySelectorAll('#shipping input:checked').length > 0)
                ||
                ((this.inputFieldsOk || (!this.isBillingEnabled && !this.isShippingEnabled)) && this.isPaymentEnabled)
                ||
                (!this.isBillingEnabled && !this.isShippingEnabled && !this.isPaymentEnabled)
            ) {
                this.enableButtonAction = true;
            } else {
                this.enableButtonAction = false;
            }
        },
        enableGuest() {
            this.guestCheckout = true;
            this._getCurrentCheckout(this.onCheckoutSuccess, this.onCheckOutError);
        },
        handleClickOrder() {
            if (this.enableButtonAction) {
                this.$refs.reviewComponent.placeOrder();
            }
        },
        async handleCouponActivation() {
            this.couponMessage = -1;
            if (this.couponCode) {
                try {
                    await this.redeemCoupon(this.couponCode);
                } catch (error) {
                    this.couponMessage = 1;
                }
            } else {
                this.couponMessage = 0;
            }
        },
        async handlePointsActivation() {
            this.pointsMessage = -1;
            try {
                await this.redeemPoints();
            } catch (error) {
                this.pointsMessage = 1;
            }
        },
        async handleCouponUndo() {
            this.couponMessage = -1;
            if (this.couponCode) {
                try {
                    await this.removeCouponByCode(this.couponCode);
                } catch (error) {
                    this.couponMessage = 2;
                }
            } else {
                this.couponMessage = 0;
            }
        },
        async handlePointsUndo() { // TODO - Add logic from back
            this.pointsMessage = -1;
            try {
                await this.removePoints();
            } catch (error) {
                this.couponMessage = 2;
            }
        },
        hasDiscount(item) {
            if (item.initialPrice == undefined || item.initialPrice == null || item.initialPrice <= item.price)
                return false;

            return true;
        },
        forceRerender() {
            this.componentKey++;
        },
        onBillingLoaded() {
            setTimeout(() => {
                this.isBillingLoaded = true;
                var billingAddressOption = document.querySelectorAll('.order-details #billing .billing-wrap .billingAddress-option input');
                var shippingAddressOption = document.querySelectorAll('.order-details #billing .shipping-wrap .shippingAddress-option input');
                var invoiceOption = document.getElementById('radioInvoice');
                var paymentOption = document.querySelectorAll('.order-details #payment-method .single-payment input');

                let component = 'billingComponent';
                let checkValid = this.$refs[component];
                let inputFields;
                let nextElement;

                billingAddressOption.forEach((option, i) => {
                    if (i == 0 && option.id !== 'newBillingAddress') {
                        this.checkAddressFields();
                    }

                    nextElement = option.parentNode.nextElementSibling;

                    if (nextElement && (nextElement.length > 0 || nextElement.classList.contains('newAddress'))) {

                        inputFields = option.parentNode.nextSibling.querySelectorAll('input');

                        inputFields.forEach(input => {
                            input.addEventListener('change', e => {
                                if (!checkValid.checkForErrors()) {
                                    this.checkAddressFields();
                                }
                            });
                        });
                    }

                    option.addEventListener('change', e => {
                        this.checkAddressFields();

                        nextElement = option.parentNode.nextElementSibling;
                        if (nextElement && (nextElement.length > 0 || nextElement.classList.contains('newAddress'))) {
                            inputFields = option.parentNode.nextSibling.querySelectorAll('input');

                            inputFields.forEach(input => {
                                input.addEventListener('change', e => {
                                    if (!checkValid.checkForErrors()) {
                                        this.checkAddressFields();
                                    }
                                });
                            });
                        }
                    });
                });

                shippingAddressOption.forEach(option => {

                    option.addEventListener('change', e => {
                        this.checkAddressFields();
                        if (option.id == 'newShippingAddress') {
                            inputFields = option.parentNode.nextSibling.querySelectorAll('input');

                            inputFields.forEach(input => {
                                input.addEventListener('change', e => {
                                    if (!checkValid.checkForErrors()) {
                                        this.checkAddressFields();
                                    }
                                });
                            });
                        }
                    });
                });

                if (invoiceOption !== null)
                    invoiceOption.addEventListener('change', e => {
                        this.checkAddressFields();
                    });

                paymentOption.forEach(option => {
                    option.addEventListener('change', e => {
                        this.checkPaymentCost();
                    });
                });
            }, 500);
        },
        onCheckOutError(status, e) {
            this.errorCode = status;
            this.errorType = e.title;
            this.error = e;
            if (this.errorType == 'QuantityNotAvailableException')
                this._findProductsByIds(e.errors.ProductIds, false, e => {
                    this.errorMessage = "";
                    e.forEach((product) => {
                        this.errorMessage += product.title + ", "
                    });
                    if (this.errorMessage.length > 2)
                        this.errorMessage = this.errorMessage.slice(0, -2)
                });
            this.dataLoaded = true;
        },
        onCheckoutSuccess(e) {
            this.checkout = e;
            this.checkComponents();
            this.buttonLoading = false;

            if (this.checkout.status == "Completed") {
                this.checkout.cartItems = {};
                this.customerData = {};
                this.checkoutData.orderCode = e.orderCode;
                this.dataLoaded = true;
                this.activeStep = "orderplaced";
                return;
            }

            this.shippingAddress = this.checkout.shippingAddress;
            this.selectedBranch = this.checkout.addresses[0];
            this.customerData = this.checkout.customer;

            this.dataLoaded = true;

            let ids = e.cartItems.map(c => c.salesUnitId);
            this._findUnitsByIds(ids, e => this.units = e);

            if (this._global.isAuthenticated && this._settings.isRewardPointsActive) {
                this._getRewardPointsSetup().then(rewardPointsSetup => {
                    this.isPointsRedemptionActive = rewardPointsSetup.redemption.isActive;
                    if (!this.isPointsRedemptionActive) return;
                    this._getRewardPoints().then(rewardPoints => {
                        this.rewardPoints = rewardPoints.totalPoints;
                    });

                    this._getDiscountFromPoints(this.checkout.totalAmount).then(discount => {
                        this.discountFromPoints = discount;
                    });
                });
            }
        },
        redeemCoupon(code) {
            if (!this.isCouponLoading) {
                this.couponCode = code;
                this.isCouponLoading = true;
                this.checkout = {
                    ...this.checkout,
                    discountValue: this.totalRedemptionValue,
                    discountRate: this.totalRedemptionRate
                };

                let loyaltyPricing = {
                    useCoupon: true,
                    usePoints: false,
                    couponCode: code
                }

                if (this.isPointsRedeemed) {
                    loyaltyPricing = {
                        useCoupon: true,
                        usePoints: true,
                        couponCode: code
                    }
                } else {
                    loyaltyPricing = {
                        useCoupon: true,
                        usePoints: false,
                        couponCode: code
                    }
                }

                this.checkout.loyaltyPricing = loyaltyPricing;

                this._updateCheckout(this.checkout, (e) => {
                    this.checkout = e;
                    if (this.checkout.discountRate > 0 || this.checkout.discountValue > 0) {
                        // console.log('coupons: ', this.checkout);  
                        this.couponMessage = 3;
                        this.isCouponRedeemed = true;
                        this.totalRedemptionRate = this.checkout.discountRate;
                        this.totalRedemptionValue = this.checkout.discountValue;
                        this.checkout.reRun = true;
                        this.forceRerender();
                    } else {
                        this.couponMessage = 0;
                    }

                    this.isCouponLoading = false;
                });
            }
        },
        redeemPoints() {
            if (!this.isPointsLoading) {
                this.isPointsLoading = true;
                let loyaltyPricing = {};
                this.checkout = {
                    ...this.checkout,
                    discountValue: this.discountFromPoints
                };

                if (this.isCouponRedeemed) {
                    loyaltyPricing = {
                        useCoupon: true,
                        usePoints: true
                    }
                } else {
                    loyaltyPricing = {
                        useCoupon: false,
                        usePoints: true
                    }
                }

                this.checkout.loyaltyPricing = loyaltyPricing;

                this._updateCheckout(this.checkout, (e) => {
                    this.checkout = e;
                    if (this.checkout.discountRate > 0 || this.checkout.discountValue > 0) {
                        // console.log('points: ', this.checkout);  
                        this.pointsMessage = 3;
                        this.isPointsRedeemed = true;
                        this.finalTotalAmount = this.checkout.totalAmount;
                        this.totalRedemptionRate = this.checkout.discountRate;
                        this.totalRedemptionValue = this.checkout.discountValue;
                        this.checkout.reRun = true;
                        this.forceRerender();
                    } else {
                        this.pointsMessage = 0;
                    }

                    this.isPointsLoading = false;
                })
            }
        },
        async removeCouponByCode(code) {
            if (!this.isCouponLoading) {
                this.couponCode = code;
                this.isCouponLoading = true;

                let loyaltyPricing = {
                    useCoupon: false,
                    usePoints: false,
                    couponCode: code
                }

                this.checkout.loyaltyPricing = loyaltyPricing;

                this._startCheckout((e) => {
                    this.checkout = e;
                    this.isCouponRedeemed = false;
                    this.finalTotalAmount = this.checkout.totalAmount;
                    this.couponMessage = -1;
                    this.isCouponLoading = false;
                    this.couponCode = '';
                    this.coupon = null;
                });
                this.checkout = await this._updateCheckoutAsync(this.checkout);
                this.checkout.reRun = true;
                this.forceRerender();
                this.$emit('update:checkout', this.checkout);
            }
        },
        removePoints() {
            if (!this.isPointsLoading) {
                this.isPointsLoading = true;

                let loyaltyPricing = {
                    useCoupon: false,
                    usePoints: false,
                }

                this.checkout.loyaltyPricing = loyaltyPricing;

                this._startCheckout((e) => {
                    this.checkout = e;
                    this.isPointsRedeemed = false;
                    this.finalTotalAmount = this.checkout.totalAmount;
                    this.pointsMessage = -1;
                    this.isPointsLoading = false;
                });
            }
        },
        toggleNote(event) {
            if (event.target.parentNode.classList.contains('open')) {
                event.target.parentNode.classList.remove('open');
            } else {
                event.target.parentNode.classList.add('open');
            }
        },
        toggleUserSignIn() {
            this.signInUser = !this.signInUser;
            if (this.signInUser && !this.signUpUser) {
                setTimeout(() => {
                    document.querySelector('.signUpButton').addEventListener('click', this.toggleUserSignUp);
                }, 500);
            }
        },
        toggleUserSignUp() {
            this.signInUser = !this.signInUser;
            this.signUpUser = !this.signUpUser;
            if (this.signInUser && !this.signUpUser) {
                setTimeout(() => {
                    document.querySelector('.signUpButton').addEventListener('click', this.toggleUserSignUp);
                }, 500);
            }
        },
        updateCart() {
            this._setCart(this.cartData);
        }
    },
    updated() {
        if (this.dataLoaded)
            this.checkValidCheckout();
    },
    computed: {
        CanCheckout: {
            get() {
                return this._global.isAuthenticated || this.guestCheckout;
            }
        },
        ExpenseAmount: {
            get() {
                return this.checkout.expenseAmount;
            }
        },
        TotalAmount: {
            get() {
                return this.checkout.totalAmount;
            }
        },
        TotalNet: {
            get() {
                return this.checkout.netAmount;
            }
        },
        TotalVat: {
            get() {
                return this.checkout.vatAmount;
            }
        }
    }
}

app.component('checkoutdefault', {
    extends: checkoutdefault,
    template: '#checkoutdefault'
}); 