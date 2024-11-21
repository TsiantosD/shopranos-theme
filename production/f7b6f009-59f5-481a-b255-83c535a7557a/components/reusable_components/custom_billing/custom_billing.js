const custom_billing  = {
    props:
        {
            model:Object,
        },
    data() {
        return {
            checkout:null,
            customerData: null,
            billingAddress: null,
            checkoutData: {
                notes: ""
            },
            selectedBranch: null,
            errorCode1: "ErrorEmptyField",
            errorCode2: "ErrorInputSize",
            ValidationClassS_Address1: "form-control",
            ValidationClassS_Address2: "form-control",
            ValidationClassS_State: "form-control",
            ValidationClassS_City: "form-control",
            ValidationClassS_Country: "form-control",
            ValidationClassS_ZIP: "form-control",
            B_Address1Error: "",
            B_Address2Error: "",
            B_StateError: "",
            B_CityError: "",
            B_ZIPError: "",
            B_CountryError: "",
            ValidationClassB_Address1: "form-control",
            ValidationClassB_Address2: "form-control",
            ValidationClassB_State: "form-control",
            ValidationClassB_City: "form-control",
            ValidationClassB_Country: "form-control", 
            ValidationClassB_ZIP: "form-control",
            carriers: null,
            isCarriersLoading: false,
            checkout : this.model 

        }
        },
    mounted(){
        this.customerData = this.checkout.customer;
        this.billingAddress = this.checkout.billingAddress;
        this.selectedBranch = this.checkout.addresses[0];
        this.shippingAddress = this.selectedBranch.address;
        // this.checkout.customerBranchId = this.selectedBranch.id;

    },
    methods:{
        // checkValid() {
        //     debugger;
        //     if (this.shippingSameAsBilling) {
        //         if ((this.B_Address1Error == "" && this.B_StateError == "" && this.B_CityError == "" && this.B_ZIPError == "" && this.B_CountryError == "")
        //             && (this.B_Address1 && this.B_State && this.B_City && this.B_ZIP && this.B_Country)) {

        //             return true;
        //         }
        //         else {


        //             this.B_Address1 = this.B_Address1 ? this.B_Address1 : "";
        //             this.B_Address2 = this.B_Address2 ? this.B_Address2 : "";
        //             this.B_State = this.B_State ? this.B_State : "";
        //             this.B_City = this.B_City ? this.B_City : "";
        //             this.B_ZIP = this.B_ZIP ? this.B_ZIP : "";
        //             this.B_Country = this.B_Country ? this.B_Country : "";
        //             return false;
        //         }
        //     }
        //     else {
        //         if ((this.S_Address1Error == "" && this.S_StateError == "" && this.S_CityError == "" && this.S_ZIPError == "" && this.S_CountryError == "")
        //             && (this.S_Address1 && this.S_State && this.S_City && this.S_ZIP && this.S_Country))

        //             return true;
        //         else {


        //             this.B_Address1 = this.B_Address1 ? this.B_Address1 : "";
        //             this.B_Address2 = this.B_Address2 ? this.B_Address2 : "";
        //             this.B_State = this.B_State ? this.B_State : "";
        //             this.B_City = this.B_City ? this.B_City : "";
        //             this.B_ZIP = this.B_ZIP ? this.B_ZIP : "";
        //             this.B_Country = this.B_Country ? this.B_Country : "";


        //             this.S_Address1 = this.S_Address1 ? this.S_Address1 : "";
        //             this.S_Address2 = this.S_Address2 ? this.S_Address2 : "";
        //             this.S_State = this.S_State ? this.S_State : "";
        //             this.S_City = this.S_City ? this.S_City : "";
        //             this.S_ZIP = this.S_ZIP ? this.S_ZIP : "";
        //             this.S_Country = this.S_Country ? this.S_Country : "";
        //             return false;
        //         }

        //     }
        //     return true;
            
        // },
        checkValid() {
            this.checkout.customerBranchId = this.selectedBranch.id !== this.customerData.id ? this.selectedBranch.id : null;
            debugger;
            if (this.shippingSameAsBilling) {
                if (
                    this.B_Address1Error === "" &&
                    this.B_StateError === "" &&
                    this.B_CityError === "" &&
                    this.B_ZIPError === "" &&
                    this.B_CountryError === "" &&
                    this.B_Address1 &&
                    this.B_State &&
                    this.B_City &&
                    this.B_ZIP && 
                    this.B_Country
                ) {
                    this.shippingAddress.address1 = this.B_Address1;
                    this.shippingAddress.address2 = this.B_Address2; 
                    this.shippingAddress.city = this.B_City;
                    this.shippingAddress.country = this.B_Country;
                    this.shippingAddress.postalCode = this.B_ZIP;
                    this.shippingAddress.state = this.B_State;
                    this.checkout.shippingAddress = this.shippingAddress;

                    this.$emit('update:checkout', this.checkout);
                    return true;
                } else {
                    this.B_Address1 = this.B_Address1 ? this.B_Address1 : "";
                    this.B_Address2 = this.B_Address2 ? this.B_Address2 : "";
                    this.B_State = this.B_State ? this.B_State : "";
                    this.B_City = this.B_City ? this.B_City : "";
                    this.B_ZIP = this.B_ZIP ? this.B_ZIP : "";
                    this.B_Country = this.B_Country ? this.B_Country : "";
                    this.shippingAddress.address1 = this.B_Address1;
                    this.shippingAddress.address2 = this.B_Address2;
                    this.shippingAddress.city = this.B_City;
                    this.shippingAddress.country = this.B_Country;
                    this.shippingAddress.postalCode = this.B_ZIP;
                    this.shippingAddress.state = this.B_State;
                    this.checkout.shippingAddress = this.shippingAddress;

                    this.$emit('update:checkout', this.checkout);
                    return false;
                }
            } else {
                if (
                    this.S_Address1Error === "" &&
                    this.S_StateError === "" &&
                    this.S_CityError === "" &&
                    this.S_ZIPError === "" &&
                    this.S_CountryError === "" &&
                    this.S_Address1 &&
                    this.S_State &&
                    this.S_City &&
                    this.S_ZIP &&
                    this.S_Country
                    
                ) {
                    this.shippingAddress.address1 = this.B_Address1;
                    this.shippingAddress.address2 = this.B_Address2;
                    this.shippingAddress.city = this.B_City;
                    this.shippingAddress.country = this.B_Country;
                    this.shippingAddress.postalCode = this.B_ZIP;
                    this.shippingAddress.state = this.B_State;
                    this.checkout.shippingAddress = this.shippingAddress;

                    this.$emit('update:checkout', this.checkout);
                    return true;
                } else {
                    this.B_Address1 = this.B_Address1 ;
                    this.B_Address2 = this.B_Address2 ;
                    this.B_State = this.B_State ;
                    this.B_City = this.B_City ;
                    this.B_ZIP = this.B_ZIP ;
                    this.B_Country = this.B_Country;
        
                    // this.S_Address1 = this.S_Address1 ? this.S_Address1 : "";
                    // this.S_Address2 = this.S_Address2 ? this.S_Address2 : "";
                    // this.S_State = this.S_State ? this.S_State : "";
                    // this.S_City = this.S_City ? this.S_City : "";
                    // this.S_ZIP = this.S_ZIP ? this.S_ZIP : "";
                    // this.S_Country = this.S_Country ? this.S_Country : "";
                    this.shippingAddress.address1 = this.B_Address1;
                    this.shippingAddress.address2 = this.B_Address2;
                    this.shippingAddress.city = this.B_City;
                    this.shippingAddress.country = this.B_Country;
                    this.shippingAddress.postalCode = this.B_ZIP;
                    this.shippingAddress.state = this.B_State;
                    this.checkout.shippingAddress = this.shippingAddress;

                    this.$emit('update:checkout', this.checkout);
                    return true;
                }
                
            }
            
        },
        // checkValid() {
        //     debugger;
        //     //const isBilling = this.shiTTingSameAsBilling;
        //     const bFields = ["B_Address1", "B_Address2", "B_State", "B_City", "B_ZIP", "B_Country"];
        //     const sFields = ["S_Address1", "S_Address2", "S_State", "S_City", "S_ZIP", "S_Country"];
        //     const addressFields =  [...bFields, ...sFields];
            
        //     const isValid = addressFields.every(field => !this[`${field}Error`] && this[field]);
        
        //     if (isValid) {
        //         addressFields.forEach(field => {
        //             this.shippingAddress[field.replace(isBilling ? "B_" : "S_", "")] = this[field] || "";
        //         });
        
        //         this.checkout.shippingAddress = this.shippingAddress;
        //         this.$emit('update:checkout', this.checkout);
        //     }
            
        //     return isValid;
        // },
        
        
        
        customerIsWithoutBranches() {
            return this.customerData.branches == undefined || this.customerData.branches == null || this.customerData.branches.lenght == 0;
        },
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
        BillingAddress: {
            get() {
                this.customerData.billingAddress = this.billingAddress;
                return this.billingAddress;
            },
            set(newVal) {
                this.billingAddress = newVal;
            }
        },
        Branches: {
            get() {
                return this.checkoutData.customer.branches;
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
        B_Address1: {
            get() { return this.selectedBranch?.address?.address1 }
            ,
            set(val) {
                this.selectedBranch.address.address1 = val;
                if (val.length == 0) {
                    this.ValidationClassB_Address1 = "form-control is-invalid";
                    this.B_Address1Error = this.errorCode1;
                }
                else if (val.length < 50 && val.length >= 5) {
                    this.ValidationClassB_Address1 = "form-control is-valid";
                    this.B_Address1Error = "";
                } else {
                    this.ValidationClassB_Address1 = "form-control is-invalid";
                    this.B_Address1Error = this.errorCode2;
                }
            }
        },
        B_Address2: {
            get() { return this.selectedBranch?.address?.address2 }
            ,
            set(val) {
                this.selectedBranch.address.address2 = val;
                /* if (val.length == 0) {
                     this.ValidationClassB_Address2 = "form-control  is-invalid";
                     this.B_Address2Error = this.translations["Input_no_empty"];
                 }
                 else if (val.length < 50 && val.length >= 5) {
                     this.ValidationClassB_Address2 = "form-control is-valid";
                     this.B_Address2Error = "";
                 } else {
                     this.ValidationClassB_Address2 = "form-control is-invalid";
                     this.B_Address2Error = this.translations["Input_size"];
                 }*/
            }
        },

        B_State: {
            get() { return this.selectedBranch?.address?.state }
            ,
            set(val) {
                this.selectedBranch.address.state = val;
                if (val.length == 0) {
                    this.ValidationClassB_State = "form-control  is-invalid";
                    this.B_StateError = this.errorCode1;
                }
                else if (val.length < 50 && val.length >= 5) {
                    this.ValidationClassB_State = "form-control is-valid";
                    this.B_StateError = "";
                } else {
                    this.ValidationClassB_State = "form-control is-invalid";
                    this.B_StateError = this.errorCode2;
                }
            }
        },
        B_City: {
            get() { return this.selectedBranch?.address?.city }
            ,
            set(val) {
                this.selectedBranch.address.city = val;
                if (val.length == 0) {
                    this.ValidationClassB_City = "form-control  is-invalid";
                    this.B_CityError = this.errorCode1;
                }
                else if (val.length < 50 && val.length >= 5) {
                    this.ValidationClassB_City = "form-control is-valid";
                    this.B_CityError = "";
                } else {
                    this.ValidationClassB_City = "form-control is-invalid";
                    this.B_CityError = this.errorCode2;
                }
            }
        },
        B_ZIP: {
        
            get() { return this.selectedBranch?.address?.postalCode }
            ,
            set(val) {
                debugger; 
                this.selectedBranch.address.postalCode = val;
                if (val.length == 0) {
                    this.ValidationClassB_ZIP = "form-control  is-invalid";
                    this.B_ZIPError = this.errorCode1;
                }
                else if (val.length == 5) {
                    this.ValidationClassB_ZIP = "form-control is-valid";
                    this.B_ZIPError = "";
                } else {
                    this.ValidationClassB_ZIP = "form-control is-invalid";
                    this.B_ZIPError = this.errorCode2;
                }
            }
        },


        B_Country: {
            get() { return this.selectedBranch?.address?.country }
            ,
            set(val) {
                this.selectedBranch.address.country = val;
                if (val.length == 0) {
                    this.ValidationClassB_Country = "form-control  is-invalid";
                    this.B_CountryError = this.errorCode1;
                }
                else if (val.length < 50 && val.length >= 2) {
                    this.ValidationClassB_Country = "form-control is-valid";
                    this.B_CountryError = "";
                } else {
                    this.ValidationClassB_Country = "form-control is-invalid";
                    this.B_CountryError = this.errorCode2;
                }
            }
        },
        S_Address1: {
            get() { return this.shippingAddress.address1 }
            ,
            set(val) {
                this.shippingAddress.address1 = val;
                if (val.length == 0) {
                    this.ValidationClassS_Address1 = "form-control  is-invalid";
                    this.S_Address1Error = this.errorCode1;
                }
                else if (val.length < 50 && val.length >= 5) {
                    this.ValidationClassS_Address1 = "form-control is-valid";
                    this.S_Address1Error = "";
                } else {
                    this.ValidationClassS_Address1 = "form-control is-invalid";
                    this.S_Address1Error = this.errorCode2;
                }
            }
        },
        S_Address2: {
            get() { return this.shippingAddress.address2 }
            ,
            set(val) {
                this.shippingAddress.address2 = val;
                /*if (val.length == 0) {
                    this.ValidationClassS_Address2 = "form-control  is-invalid";
                    this.S_Address2Error = this.translations["Input_no_empty"];
                }
                else if (val.length < 50 && val.length >= 5) {
                    this.ValidationClassS_Address2 = "form-control is-valid";
                    this.S_Address2Error = "";
                } else {
                    this.ValidationClassS_Address2 = "form-control is-invalid";
                    this.S_Address2Error = this.translations["Input_size"];
                }*/
            }
        },

        S_State: {
            get() { return this.shippingAddress.state }
            ,
            set(val) {
                this.shippingAddress.state = val;
                if (val.length == 0) {
                    this.ValidationClassS_State = "form-control  is-invalid";
                    this.S_StateError = this.errorCode1;
                }
                else if (val.length < 50 && val.length >= 5) {
                    this.ValidationClassS_State = "form-control is-valid";
                    this.S_StateError = "";
                } else {
                    this.ValidationClassS_State = "form-control is-invalid";
                    this.S_StateError = this.errorCode2;
                }
            }
        },
        S_City: {
            get() { return this.shippingAddress.city }
            ,
            set(val) {
                this.shippingAddress.city = val;
                if (val.length == 0) {
                    this.ValidationClassS_City = "form-control  is-invalid";
                    this.S_CityError = this.errorCode1;
                }
                else if (val.length < 50 && val.length >= 5) {
                    this.ValidationClassS_City = "form-control is-valid";
                    this.S_CityError = "";
                } else {
                    this.ValidationClassS_City = "form-control is-invalid";
                    this.S_CityError = this.errorCode2;
                }
            }
        },
        S_ZIP: {
            get() { return this.shippingAddress.postalCode }
            ,
            set(val) {
                this.shippingAddress.postalCode = val;
                if (val.length == 0) {
                    this.ValidationClassS_ZIP = "form-control  is-invalid";
                    this.S_ZIPError = this.errorCode1;
                }
                else if (val.length == 5) {
                    this.ValidationClassS_ZIP = "form-control is-valid";
                    this.S_ZIPError = "";
                } else {
                    this.ValidationClassS_ZIP = "form-control is-invalid";
                    this.S_ZIPError = this.errorCode2;
                }
            }
        },


        S_Country: {
            get() { return this.shippingAddress.country }
            ,
            set(val) {
                this.shippingAddress.country = val;
                if (val.length == 0) {
                    this.ValidationClassS_Country = "form-control is-invalid";
                    this.S_CountryError = this.errorCode1;
                }
                else if (val.length < 50 && val.length >= 2) {
                    this.ValidationClassS_Country = "form-control is-valid";
                    this.S_CountryError = "";
                } else {
                    this.ValidationClassS_Country = "form-control is-invalid";
                    this.S_CountryError = this.errorCode2;
                }
            }
        },
    }
}

app.component('custom_billing', {
    extends: custom_billing,
    template: '#custom_billing'
});