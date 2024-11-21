const billingretail = {
    props: {
        model: Object,
    },
    data() {
        return {
            checkout: null,
            customerData: null,
            checkoutData: {
                notes: ""
            },
            isLoaded: false,
            user: null,
            selectedBranch: null,
            errorCode1: "ErrorEmptyField",
            errorCode2: "ErrorInputSize",
            isInvoice: false,
            invoiceType: "receipt",
            billingErrors: false,
            shippingErrors: false,
            invoiceErrors: false,
            billingAddressOption: this._global.isAuthenticated ? 'userBillingAddress-0' : 'newBillingAddress',
            shippingAddressOption: "sameasbillingaddress",
            userisauthenticated: this._global.isAuthenticated,
            useraddresses: null,

            BillingName: "",
            BillingLastName: "",
            BillingPhone: "",
            BillingEmail: "",
            BillingAddress1: "",
            BillingAddress2: "",
            BillingCity: "",
            BillingState: "",
            BillingCountry: "",
            BillingZIP: "",
            CompanyName: "",
            Profession: "",
            TaxOffice: "",
            TIN: "",
            CompanyPhone: "",
            CompanyAddress1: "",
            CompanyAddress2: "",
            CompanyCity: "",
            CompanyState: "",
            CompanyCountry: "",
            CompanyZIP: "",
            BillingNameError: "",
            BillingLastNameError: "",
            BillingPhoneError: "",
            BillingEmailError: "",
            BillingAddress1Error: "",
            BillingAddress2Error: "",
            BillingCityError: "",
            BillingStateError: "",
            BillingCountryError: "",
            BillingZIPError: "",
            CompanyNameError: "",
            ProfessionError: "",
            TaxOfficeError: "",
            TINError: "",
            CompanyPhoneError: "",
            CompanyAddress1Error: "",
            CompanyAddress2Error: "",
            CompanyCityError: "",
            CompanyStateError: "",
            CompanyCountryError: "",
            CompanyZIPError: "",
            ValidationClassBillingName: "form-control",
            ValidationClassBillingLastName: "form-control",
            ValidationClassBillingPhone: "form-control",
            ValidationClassBillingEmail: "form-control",
            ValidationClassBillingAddress1: "form-control",
            ValidationClassBillingAddress2: "form-control",
            ValidationClassBillingCity: "form-control",
            ValidationClassBillingState: "form-control",
            ValidationClassBillingCountry: "form-control",
            ValidationClassBillingZIP: "form-control",
            ValidationClassCompanyName: "form-control",
            ValidationClassProfession: "form-control",
            ValidationClassTaxOffice: "form-control",
            ValidationClassTIN: "form-control",
            ValidationClassCompanyPhone: "form-control",
            ValidationClassCompanyAddress1: "form-control",
            ValidationClassCompanyAddress2: "form-control",
            ValidationClassCompanyCity: "form-control",
            ValidationClassCompanyState: "form-control",
            ValidationClassCompanyCountry: "form-control",
            ValidationClassCompanyZIP: "form-control",

            ShippingName: "",
            ShippingLastName: "",
            ShippingPhone: "",
            ShippingEmail: "",
            ShippingAddress1: "",
            ShippingAddress2: "",
            ShippingCity: "",
            ShippingState: "",
            ShippingCountry: "",
            ShippingZIP: "",
            ShippingNameError: "",
            ShippingLastNameError: "",
            ShippingPhoneError: "",
            ShippingEmailError: "",
            ShippingAddress1Error: "",
            ShippingAddress2Error: "",
            ShippingCityError: "",
            ShippingStateError: "",
            ShippingCountryError: "",
            ShippingZIPError: "",
            ValidationClassShippingName: "form-control",
            ValidationClassShippingLastName: "form-control",
            ValidationClassShippingPhone: "form-control",
            ValidationClassShippingEmail: "form-control",
            ValidationClassShippingAddress1: "form-control",
            ValidationClassShippingAddress2: "form-control",
            ValidationClassShippingCity: "form-control",
            ValidationClassShippingState: "form-control",
            ValidationClassShippingCountry: "form-control",
            ValidationClassShippingZIP: "form-control",
        }
    },
    mounted() {
        this.checkout = this.model;
        this._getRetailUserProfile(e => {
            if (e.user) {
                this.user = e.user;
                this.useraddresses = this.user.addresses;
                this.user_addresses();
                this.$emit('loaded');
            } else{
                this.$emit('loaded');
            }
        });

        this.billingAddress = this.checkout.billingAddress;
        if (!this.billingAddress) {
            this.billingAddress = {
                firstName: "",
                lastName: "",
                phoneNumber: "",
                address1: "",
                address2: "",
                city: "",
                country: "",
                postalCode: "",
                state: "",
                email: "",
            }
        }

        this.shippingAddress = this.checkout.shippingAddress;
        if (!this.shippingAddress) {
            this.shippingAddress = {
                firstName: "",
                lastName: "",
                phoneNumber: "",
                address1: "",
                address2: "",
                city: "",
                country: "",
                postalCode: "",
                state: "",
                email: "",
            }
        }

        this.invoiceData = this.checkout.invoiceData;
        if (!this.invoiceData) {
            this.invoiceData = {
                tin: "",
                taxOffice: "",
                companyName: "",
                companyAddress1: "",
                companyAddress2: "",
                companyCity: "",
                companyState: "",
                companyZIP: "",
                companyCountry: "",
                companyPhone: "",
                profession: "",
            }
        }
    },
    methods: {
        assignFields(invoice) {
            this.billingAddress.firstName = this.BillingName;
            this.billingAddress.lastName = this.BillingLastName;
            this.billingAddress.email = this.BillingEmail;
            this.billingAddress.phoneNumber = this.BillingPhone;
            this.billingAddress.address1 = this.BillingAddress1;
            this.billingAddress.address2 = this.BillingAddress2;
            this.billingAddress.city = this.BillingCity;
            this.billingAddress.state = this.BillingState;
            this.billingAddress.country = this.BillingCountry;
            this.billingAddress.postalCode = this.BillingZIP;
            this.checkout.billingAddress = this.billingAddress;
            if (invoice) {
                this.CompanyAddress1 = this.billingAddress.address1;
                this.CompanyAddress2 = this.billingAddress.address2;
                this.CompanyCity = this.billingAddress.city;
                this.CompanyCountry = this.billingAddress.country;
                this.CompanyZIP = this.billingAddress.postalCode;
                this.CompanyState = this.billingAddress.state;
            }

            this.shippingAddress.firstName = this.ShippingName;
            this.shippingAddress.lastName = this.ShippingLastName;
            this.shippingAddress.email = this.ShippingEmail;
            this.shippingAddress.phoneNumber = this.ShippingPhone;
            this.shippingAddress.address1 = this.ShippingAddress1;
            this.shippingAddress.address2 = this.ShippingAddress2;
            this.shippingAddress.city = this.ShippingCity;
            this.shippingAddress.state = this.ShippingState;
            this.shippingAddress.country = this.ShippingCountry;
            this.shippingAddress.postalCode = this.ShippingZIP;
            this.checkout.shippingAddress = this.shippingAddress;
            if (invoice)
                this.checkout.email = this.ShippingEmail;
            this.setInvoiceData();
        },
        changeBillingAddressOption(e) {
            this.billingAddressOption = e.target.value;
            if (this.billingAddressOption == 'newBillingAddress') {
                this.clearShippingFields();
                this.clearBillingFields();
            } else {
                var currAddress = this.user.addresses[this.billingAddressOption.split('-').pop()];

                this.BillingName = currAddress.firstName;
                this.BillingLastName = currAddress.lastName;
                this.BillingEmail = currAddress.email;
                this.BillingPhone = currAddress.phoneNumber;
                this.BillingAddress1 = currAddress.address1;
                this.BillingAddress2 = currAddress.address2;
                this.BillingCity = currAddress.city;
                this.BillingState = currAddress.state;
                this.BillingCountry = currAddress.country;
                this.BillingZIP = currAddress.postalCode;
                if (this.checkout.documentType === 'Invoice') {
                    this.CompanyAddress1 = this.BillingAddress1;
                    this.CompanyAddress2 = this.BillingAddress2;
                    this.CompanyCity = this.BillingCity;
                    this.CompanyState = this.BillingState;
                    this.CompanyCountry = this.BillingCountry;
                    this.CompanyZIP = this.BillingZIP;
                }
            }
            if (this.shippingAddressOption == 'sameasbillingaddress') {
                this.copyBillingToShipping();
            }
            this.assignFields(this.checkout.documentType === 'Invoice');
        },
        changeShippingAddressOption(e) {
            this.shippingAddressOption = e.target.value;
            if (this.shippingAddressOption == 'newShippingAddress') {
                this.clearShippingFields();
            } else if (this.shippingAddressOption == 'sameasbillingaddress') {
                this.copyBillingToShipping();
            } else {
                var currAddress = this.user.addresses[this.shippingAddressOption.split('-').pop()];

                this.ShippingName = currAddress.firstName;
                this.ShippingLastName = currAddress.lastName;
                this.ShippingEmail = currAddress.email;
                this.ShippingPhone = currAddress.phoneNumber;
                this.ShippingAddress1 = currAddress.address1;
                this.ShippingAddress2 = currAddress.address2;
                this.ShippingCity = currAddress.city;
                this.ShippingState = currAddress.state;
                this.ShippingCountry = currAddress.country;
                this.ShippingZIP = currAddress.postalCode;
            }
            this.assignFields(this.checkout.documentType === 'Invoice');
        },
        clearBillingFields() {
            this.BillingName = "";
            this.ValidationClassBillingName = 'form-control';
            this.BillingNameError = '';
            this.BillingLastName = "";
            this.ValidationClassBillingLastName = 'form-control';
            this.BillingLastNameError = '';
            this.BillingEmail = "";
            this.ValidationClassBillingEmail = 'form-control';
            this.BillingBillingEmailError = '';
            this.BillingPhone = "";
            this.ValidationClassBillingPhone = 'form-control';
            this.BillingPhoneError = '';
            this.BillingAddress1 = "";
            this.ValidationClassBillingAddress1 = 'form-control';
            this.BillingAddress1Error = '';
            this.BillingAddress2 = "";
            this.ValidationClassBillingAddress2 = 'form-control';
            this.BillingAddress2Error = '';
            this.BillingCity = "";
            this.ValidationClassBillingCity = 'form-control';
            this.BillingCityError = '';
            this.BillingState = "";
            this.ValidationClassBillingState = 'form-control';
            this.BillingStateError = '';
            this.BillingZIP = "";
            this.ValidationClassBillingZIP = 'form-control';
            this.BillingZIPError = '';
            this.BillingCountry = "";
            this.ValidationClassBillingCountry = 'form-control';
            this.BillingCountryError = '';
        },
        clearInvoiceFields() {
            this.CompanyName = "";
            this.CompanyAddress1 = "";
            this.CompanyAddress2 = "";
            this.CompanyCity = "";
            this.CompanyState = "";
            this.CompanyZIP = "";
            this.CompanyCountry = "";
            this.CompanyPhone = "";
            this.Profession = "";
            this.TaxOffice = "";
            this.TIN = "";
        },
        clearShippingFields() {
            this.ShippingName = "";
            this.ValidationClassShippingName = 'form-control';
            this.ShippingNameError = '';
            this.ShippingLastName = "";
            this.ValidationClassShippingLastName = 'form-control';
            this.ShippingLastNameError = '';
            this.ShippingEmail = "";
            this.ValidationClassShippingEmail = 'form-control';
            this.ShippingShippingEmailError = '';
            this.ShippingPhone = "";
            this.ValidationClassShippingPhone = 'form-control';
            this.ShippingPhoneError = '';
            this.ShippingAddress1 = "";
            this.ValidationClassShippingAddress1 = 'form-control';
            this.ShippingAddress1Error = '';
            this.ShippingAddress2 = "";
            this.ValidationClassShippingAddress2 = 'form-control';
            this.ShippingAddress2Error = '';
            this.ShippingCity = "";
            this.ValidationClassShippingCity = 'form-control';
            this.ShippingCityError = '';
            this.ShippingState = "";
            this.ValidationClassShippingState = 'form-control';
            this.ShippingStateError = '';
            this.ShippingZIP = "";
            this.ValidationClassShippingZIP = 'form-control';
            this.ShippingZIPError = '';
            this.ShippingCountry = "";
            this.ValidationClassShippingCountry = 'form-control';
            this.ShippingCountryError = '';
        },
        copyBillingToShipping() {
            this.ShippingName = this.BillingName;
            this.ShippingLastName = this.BillingLastName;
            this.ShippingEmail = this.BillingEmail;

            this.ShippingPhone = this.BillingPhone;
            this.ShippingAddress1 = this.BillingAddress1;
            this.ShippingAddress2 = this.BillingAddress2;
            this.ShippingCity = this.BillingCity;
            this.ShippingState = this.BillingState;
            this.ShippingCountry = this.BillingCountry;
            this.ShippingZIP = this.BillingZIP;
            if (this.checkout.documentType === 'Invoice') {
                this.CompanyPhone = this.CompanyPhone;
                this.CompanyAddress1 = this.ShippingAddress1;
                this.CompanyAddress2 = this.ShippingAddress2;
                this.CompanyCity = this.ShippingCity;
                this.CompanyState = this.ShippingState;
                this.CompanyCountry = this.ShippingCountry;
                this.CompanyZIP = this.ShippingZIP;
            }
        },
        setInvoiceData() {
            this.invoiceData.tin = this.TIN;
            this.invoiceData.companyName = this.CompanyName;
            this.invoiceData.companyAddress1 = this.CompanyAddress1;
            this.invoiceData.companyAddress2 = this.CompanyAddress2;
            this.invoiceData.companyCity = this.CompanyCity;
            this.invoiceData.companyState = this.CompanyState;
            this.invoiceData.companyZIP = this.CompanyZIP;
            this.invoiceData.companyCountry = this.CompanyCountry;
            this.invoiceData.companyPhone = this.CompanyPhone;
            this.invoiceData.profession = this.Profession;
            this.invoiceData.taxOffice = this.TaxOffice;
            this.checkout.invoiceData = this.invoiceData;
        },
        toggleInvoiceDetails() {
            this.isInvoice = !this.isInvoice;
            this.checkout.documentType = this.invoiceType === "receipt" ? "Invoice" : "Receipt";
            if (!this.isInvoice) {
                this.ValidationClassBillingState = 'form-control is-valid';
                this.BillingStateError = '';
                this.ValidationClassShippingState = 'form-control is-valid';
                this.ShippingStateError = '';
                this.clearInvoiceFields();
            } else {
                this.validateAndSetPrimary('BillingState', this.BillingState, false)
                this.validateAndSetPrimary('ShippingState', this.ShippingState, false)
            }
            this.assignFields(this.isInvoice);
            this.validateAndSetInvoice("CompanyName", this.CompanyName, false);
            this.validateAndSetInvoice("CompanyAddress1", this.CompanyAddress1, false);
            this.validateAndSetInvoice("CompanyAddress2", this.CompanyAddress2, true);
            this.validateAndSetInvoice("CompanyCity", this.CompanyCity, false);
            this.validateAndSetInvoice("CompanyState", this.CompanyState, false);
            this.validateZIP("CompanyZIP", this.CompanyZIP, false);
            this.validateAndSetInvoice("CompanyCountry", this.CompanyCountry, false);
            this.validateAndSetInvoice("CompanyPhone", this.CompanyPhone, true);
            this.validateAndSetInvoice("Profession", this.Profession, false);
            this.validateAndSetInvoice("TaxOffice", this.TaxOffice, false);
            this.validateAndSetInvoice("TIN", this.TIN, false);
        },
        user_addresses() {
            if (this.user && this.user.addresses && this.user.addresses.length > 0) {
                this.billingAddressOption = "userBillingAddress-0";
                const firstAddress = this.user.addresses[0];
                this.BillingName = firstAddress.firstName || "";
                this.BillingLastName = firstAddress.lastName || "";
                this.BillingPhone = firstAddress.phoneNumber || "";
                this.BillingEmail = firstAddress.email || "";
                this.BillingAddress1 = firstAddress.address1 || "";
                this.BillingAddress2 = firstAddress.address2 || "";
                this.BillingCity = firstAddress.city || "";
                this.BillingState = firstAddress.state || "";
                this.BillingZIP = firstAddress.postalCode || "";
                this.BillingCountry = firstAddress.country || "";
                this.copyBillingToShipping();
                this.assignFields(this.checkout.documentType === 'Invoice');
            } else {
                this.billingAddressOption = "newBillingAddress";
            }
        },
        validateAndSetInvoice(prop, val, optional = false) {
            if (val.length === 0) {
                if (!optional) {
                    this[`ValidationClass${prop}`] = 'form-control is-invalid';
                    this[`${prop}Error`] = this.errorCode1;
                    this.invoiceErrors = true;
                }
            } else {
                this[`ValidationClass${prop}`] = 'form-control is-valid';
                this[`${prop}Error`] = '';
                if (this.shippingAddressOption == 'sameasbillingaddress')
                    this.copyBillingToShipping();
            }
            this.assignFields(this.checkout.documentType === 'Invoice');
        },
        validateAndSetPrimary(prop, val, optional = false) {
            if (val.length === 0) {
                if (!optional) {
                    this[`ValidationClass${prop}`] = 'form-control is-invalid';
                    this[`${prop}Error`] = this.errorCode1;
                    if (prop[0] === 'B') {
                        this.billingErrors = true;
                    } else if (prop[0] === 'S') {
                        this.shippingErrors = true;
                    }
                }
            }
            else {
                this[`ValidationClass${prop}`] = 'form-control is-valid';
                this[`${prop}Error`] = '';

                if (this.shippingAddressOption == 'sameasbillingaddress')
                    this.copyBillingToShipping();
            }
            this.assignFields(this.checkout.documentType === 'Invoice');
        },
        validateEmail(prop, val) {
            const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            if (emailRegex.test(val)) {
                this[`ValidationClass${prop}`] = 'form-control is-valid';
                this[`${prop}Error`] = '';
                if (this.shippingAddressOption == 'sameasbillingaddress')
                    this.copyBillingToShipping();
            } else {
                this[`ValidationClass${prop}`] = 'form-control is-invalid';
                if (val.length > 0) {
                    this[`${prop}Error`] = 'Please enter a valid email address';
                } else {
                    this[`${prop}Error`] = this.errorCode1;
                }
                if (prop[0] === 'B') {
                    this.billingErrors = true;
                } else if (prop[0] === 'S') {
                    this.shippingErrors = true;
                }
            }
            this.assignFields(this.checkout.documentType === 'Invoice');
        },
        validateZIP(prop, val) {
            if (/^\d{5}$/.test(val)) {
                this[`ValidationClass${prop}`] = 'form-control is-valid';
                this[`${prop}Error`] = '';
                if (this.shippingAddressOption == 'sameasbillingaddress')
                    this.copyBillingToShipping();
            } else {
                this[`ValidationClass${prop}`] = 'form-control is-invalid';
                if (val.toString().length > 0) {
                    this[`${prop}Error`] = 'ZIP code must be a valid 5-digit number';
                } else {
                    this[`${prop}Error`] = this.errorCode1;
                }
                if (prop[0] === 'B') {
                    this.billingErrors = true;
                } else if (prop[0] === 'S') {
                    this.shippingErrors = true;
                }
            }
            this.assignFields(this.checkout.documentType === 'Invoice');
        },

        // DO NOT REMOVE - Functions below are needed for external component (Checkout) 
        checkForErrors() {
            this.billingErrors = false;
            this.shippingErrors = false;
            this.invoiceErrors = false;

            this.hasInputErrors("BillingName", this.BillingName, false, false);
            this.hasInputErrors("BillingLastName", this.BillingLastName, false, false);
            this.hasInputErrors("BillingPhone", this.BillingPhone, false, false);
            this.hasInputErrors("BillingEmail", this.BillingEmail, false);
            this.hasInputErrors("BillingAddress1", this.BillingAddress1, false, false);
            this.hasInputErrors("BillingAddress2", this.BillingAddress2, true, false);
            this.hasInputErrors("BillingCity", this.BillingCity, false, false);
            this.hasInputErrors("BillingState", this.BillingState, this.checkout.documentType != 'Invoice', false);
            this.hasInputErrors("BillingCountry", this.BillingCountry, false, false);
            this.hasInputErrors("BillingZIP", this.BillingZIP, false);
            this.hasInputErrors("ShippingName", this.ShippingName, false, false);
            this.hasInputErrors("ShippingLastName", this.ShippingLastName, false, false);
            this.hasInputErrors("ShippingPhone", this.ShippingName, false, false);
            this.hasInputErrors("ShippingEmail", this.ShippingEmail, false);
            this.hasInputErrors("ShippingAddress1", this.ShippingAddress1, false, false);
            this.hasInputErrors("ShippingAddress2", this.ShippingAddress2, true, false);
            this.hasInputErrors("ShippingCity", this.ShippingCity, false, false);
            this.hasInputErrors("ShippingState", this.ShippingState, this.checkout.documentType != 'Invoice', false);
            this.hasInputErrors("ShippingCountry", this.ShippingCountry, false, false);
            this.hasInputErrors("ShippingZIP", this.ShippingZIP, false);
            if (this.checkout.documentType === 'Invoice') {
                this.hasInputErrors("CompanyName", this.CompanyName, false, true);
                this.hasInputErrors("CompanyAddress1", this.CompanyAddress1, false, true);
                this.hasInputErrors("CompanyAddress2", this.CompanyAddress2, true, true);
                this.hasInputErrors("CompanyCity", this.CompanyCity, false, true);
                this.hasInputErrors("CompanyState", this.CompanyState, false, true);
                this.hasInputErrors("CompanyZIP", this.CompanyZIP, false, true);
                this.hasInputErrors("CompanyCountry", this.CompanyCountry, false, true);
                this.hasInputErrors("CompanyPhone", this.CompanyPhone, true, true);
                this.hasInputErrors("Profession", this.Profession, false, true);
                this.hasInputErrors("TaxOffice", this.TaxOffice, false, true);
                this.hasInputErrors("TIN", this.TIN, false, true);
            }
        },
        checkValid() {
            this.billingErrors = false;
            this.shippingErrors = false;
            this.invoiceErrors = false;

            this.validateAndSetPrimary("BillingName", this.BillingName, false);
            this.validateAndSetPrimary("BillingLastName", this.BillingLastName, false);
            this.validateAndSetPrimary("BillingPhone", this.BillingPhone, false);
            this.validateEmail("BillingEmail", this.BillingEmail);
            this.validateAndSetPrimary("BillingAddress1", this.BillingAddress1, false);
            this.validateAndSetPrimary("BillingAddress2", this.BillingAddress2, true);
            this.validateAndSetPrimary("BillingCity", this.BillingCity, false);
            this.validateAndSetPrimary("BillingState", this.BillingState, this.checkout.documentType != 'Invoice');
            this.validateAndSetPrimary("BillingCountry", this.BillingCountry, false);
            this.validateZIP("BillingZIP", this.BillingZIP);
            this.validateAndSetPrimary("ShippingName", this.ShippingName, false);
            this.validateAndSetPrimary("ShippingLastName", this.ShippingLastName, false);
            this.validateAndSetPrimary("ShippingPhone", this.ShippingName, false);
            this.validateEmail("ShippingEmail", this.ShippingEmail);
            this.validateAndSetPrimary("ShippingAddress1", this.ShippingAddress1, false);
            this.validateAndSetPrimary("ShippingAddress2", this.ShippingAddress2, true);
            this.validateAndSetPrimary("ShippingCity", this.ShippingCity, false);
            this.validateAndSetPrimary("ShippingState", this.ShippingState, this.checkout.documentType != 'Invoice');
            this.validateAndSetPrimary("ShippingCountry", this.ShippingCountry, false);
            this.validateZIP("ShippingZIP", this.ShippingZIP);
            if (this.isInvoice) {
                this.validateAndSetInvoice("CompanyName", this.CompanyName, false);
                this.validateAndSetInvoice("CompanyAddress1", this.CompanyAddress1, false);
                this.validateAndSetInvoice("CompanyAddress2", this.CompanyAddress2, true);
                this.validateAndSetInvoice("CompanyCity", this.CompanyCity, false);
                this.validateAndSetInvoice("CompanyState", this.CompanyState, false);
                this.validateZIP("CompanyZIP", this.CompanyZIP, false);
                this.validateAndSetInvoice("CompanyCountry", this.CompanyCountry, false);
                this.validateAndSetInvoice("CompanyPhone", this.CompanyPhone, true);
                this.validateAndSetInvoice("Profession", this.Profession, false);
                this.validateAndSetInvoice("TaxOffice", this.TaxOffice, false);
                this.validateAndSetInvoice("TIN", this.TIN, false);
            }

            if (!this.shippingErrors && !this.billingErrors && !this.invoiceErrors) {
                return true;
            } else {
                return false;
            }
        },
        hasInputErrors(prop, val, optional = false, isInvoiceField) {

            if (prop.includes('Email')) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!(emailRegex.test(val))) {
                    if (prop[0] === 'B') {
                        this.billingErrors = true;
                    } else if (prop[0] === 'S') {
                        this.shippingErrors = true;
                    }
                }
            } else if (prop.includes('ZIP')) {
                if (!(/^\d{5}$/.test(val))) {
                    if (prop[0] === 'B') {
                        this.billingErrors = true;
                    } else if (prop[0] === 'S') {
                        this.shippingErrors = true;
                    }
                }
            } else {
                if (val.length === 0) {
                    if (!optional) {
                        if (prop[0] === 'B') {
                            this.billingErrors = true;
                        } else if (prop[0] === 'S') {
                            this.shippingErrors = true;
                        }
                        if (isInvoiceField) {
                            this.invoiceErrors = true;
                        }
                    }
                }
            }
        },
        updateCheckout() {
            return this.checkout;
        }
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

app.component('billingretail', {
    extends: billingretail,
    template: '#billingretail'
});