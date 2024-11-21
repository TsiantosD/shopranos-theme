const addresses = {
    data() {
        return {
            newFirstName: '',
            newLastName: '',
            newEmail: '',
            newPhoneNumber: '',
            newAddress: '',
            newCity: '',
            newCountry: '',
            newPostalCode: '',
            newAddress1: "",
            newState: "",

            newFirstNameError: -1,
            newLastNameError: -1,
            newEmailError: -1,
            newPhoneNumberError: -1,
            newAddressError: -1,
            newCityError: -1,
            newCountryError: -1,
            newPostalCodeError: -1,
            
            editFirstName: '',
            editLastName: '',
            editEmail: '',
            editPhoneNumber: '',
            editAddress: '',
            editCity: '',
            editCountry: '',
            editPostalCode: '',
            editNewAddress1: "",
            editState: "",

            editFirstNameError: -1,
            editLastNameError: -1,
            editEmailError: -1,
            editPhoneNumberError: -1,
            editNewAddressError: -1,
            editCityError: -1,
            editCountryError: -1,
            editPostalCodeError: -1,

            checkError: true,
            user: null,
            modalNew: '',
            modalEdit: '',
            resetAddNewModalValues: '',
            editedAddress:'',

            isLoading: true,
            newAddressErrors: false,
            editAddressErrors: false
        }
    },
    mounted() {
        this.retail_user();
    },
    methods: {
        checkField(action, destination, name) {
            
            this[`${destination}Error`] = -1;

            if (name.length === 0) {
                this[`${destination}Error`] = 1;
                this[`${action}AddressErrors`] = true;
            } 
            else if (destination === action + 'Email') {         
                let emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

                if (!emailRegex.test(name)) {
                    this[`${destination}Error`] = 2;
                    this[`${action}AddressErrors`] = true;
                }
            }  
            else if (destination ===  action + 'PostalCode') {
                let postalCodeRegex = /^\d{5}$/;

                if (!postalCodeRegex.test(name)) {
                    this[`${destination}Error`] = 2;
                    this[`${action}AddressErrors`] = true;
                } 
            } 
            
            if(this[`${action}AddressErrors`]) { return false } else { return true }
        },
        checkFieldsValidation(action) {
            this[`${action}AddressErrors`] = false;

            if(action === 'edit') {
                this[`${action}FirstName`] = this.editedAddress.firstName;
                this[`${action}LastName`] = this.editedAddress.lastName;
                this[`${action}Email`] = this.editedAddress.email;
                this[`${action}PhoneNumber`] = this.editedAddress.phoneNumber;
                this[`${action}Address`] = this.editedAddress.address1;
                this[`${action}City`] = this.editedAddress.city;
                this[`${action}Country`] = this.editedAddress.country;
                this[`${action}PostalCode`] = this.editedAddress.postalCode;
            }

            this.checkField(action, `${action}FirstName`, this[`${action}FirstName`]);
            this.checkField(action, `${action}LastName`, this[`${action}LastName`]);
            this.checkField(action, `${action}Email`, this[`${action}Email`]);
            this.checkField(action, `${action}PhoneNumber`, this[`${action}PhoneNumber`]);
            this.checkField(action, `${action}Address`, this[`${action}Address`]);
            this.checkField(action, `${action}City`, this[`${action}City`]);
            this.checkField(action, `${action}Country`, this[`${action}Country`]);
            this.checkField(action, `${action}PostalCode`, this[`${action}PostalCode`]);

            if (
                this.checkField(action, `${action}FirstName`, this[`${action}FirstName`]) &&
                this.checkField(action, `${action}LastName`, this[`${action}LastName`]) &&
                this.checkField(action, `${action}Email`, this[`${action}Email`]) &&
                this.checkField(action, `${action}PhoneNumber`, this[`${action}PhoneNumber`]) &&
                this.checkField(action, `${action}Address`, this[`${action}Address`]) &&
                this.checkField(action, `${action}City`, this[`${action}City`]) &&
                this.checkField(action, `${action}Country`, this[`${action}Country`]) &&
                this.checkField(action, `${action}PostalCode`, this[`${action}PostalCode`])
            ) {
                return true;
            } else {
                return false;
            }
        },
        createNewAddress() {
            let isValid = this.checkFieldsValidation('new');
            
            if (isValid) {
                if (!this.user.addresses) {
                    this.user.addresses = [];
                }

                const newAddressObject = {
                    firstName: this.newFirstName,
                    lastName: this.newLastName,
                    email: this.newEmail,
                    phoneNumber: this.newPhoneNumber,
                    address1: this.newAddress,
                    address2: this.newAddress1,
                    city: this.newCity,
                    country: this.newCountry,
                    postalCode: this.newPostalCode,
                    state: this.newState
                };
                this.user.addresses?.push(newAddressObject);

                const addressesToUpdate = {
                    addresses: this.user.addresses?.map(addr => ({
                        firstName: addr.firstName,
                        lastName: addr.lastName,
                        email: addr.email,
                        phoneNumber: addr.phoneNumber,
                        address1: addr.address1,
                        address2: addr.address2,
                        city: addr.city,
                        country: addr.country,
                        postalCode: addr.postalCode,
                        state: addr.state
                    }))
                };

                this._updateRetailUserProfile(addressesToUpdate, updatedAddresses => {
                    this.user.addresses = updatedAddresses.addresses;
                });

                this.modalCloseNew();
            }
        },
        deleteAddress(index) {
            const addressesCopy = {
                Addresses: [...this.user.addresses],
            };
            // Extract the address to be deleted
            const deletedAddress = addressesCopy.Addresses.splice(index, 1)[0];

            this.user.addresses = addressesCopy.Addresses;

            this._updateRetailUserProfile(addressesCopy, updatedAddresses => {
                this.editedAddress = '';
            });
        },
        modalCloseEdit() {
            this.modalEdit.hide();
        },
        modalCloseNew() {
            this.newfirstName = '';
            this.newLastName = '';
            this.newEmail = '';
            this.newPhoneNumber = '';
            this.newAddress = '';
            this.newAddress1 = '';
            this.newCity = '';
            this.newCountry = '';
            this.newPostalCode = '';
            this.newState = '';

            this.newAddressErrors = false;

            this.modalNew.hide();
        },
        modalOpenEdit(id) {
            this.modalEdit = new bootstrap.Modal(document.getElementById(id));
            this.modalEdit.show();
        },
        modalOpenNew(id) {
            this.modalNew = new bootstrap.Modal(document.getElementById(id));
            this.modalNew.show();
        },
        retail_user() {
            this._getRetailUserProfile(e => {
                this.user = e.user;
                this.isLoading = false;
            });
        },
        saveEditedAddress() {
            let isValid = this.checkFieldsValidation('edit');
            
            if (isValid) {
                index = this.editedAddress.index;

                this.user.addresses[index].firstName = this.editedAddress.firstName;
                this.user.addresses[index].lastName = this.editedAddress.lastName;
                this.user.addresses[index].email = this.editedAddress.email;
                this.user.addresses[index].phoneNumber = this.editedAddress.phoneNumber;
                this.user.addresses[index].address1 = this.editedAddress.address1;
                this.user.addresses[index].address2 = this.editedAddress.address2;
                this.user.addresses[index].city = this.editedAddress.city;
                this.user.addresses[index].country = this.editedAddress.country;
                this.user.addresses[index].postalCode = this.editedAddress.postalCode;
                this.user.addresses[index].state = this.editedAddress.state;

                const addressesToUpdate = {
                    Addresses: this.user.addresses.map((addr) => ({
                        firstName: addr.firstName,
                        lastName: addr.lastName,
                        email: addr.email,
                        phoneNumber: addr.phoneNumber,
                        address1: addr.address1,
                        address2: addr.address2,
                        city: addr.city,
                        country: addr.country,
                        postalCode: addr.postalCode,
                        state: addr.state
                    })),
                };

                this._updateRetailUserProfile(addressesToUpdate, (updatedAddresses) => {
                    this.user.addresses = updatedAddresses.addresses;
                    this.editedAddress = '';
                });

                this.modalCloseEdit();
            }
        },
        startEditing(address, ind) {
            this.editedAddress = {
                firstName: address.firstName,
                lastName: address.lastName,
                email: address.email,
                phoneNumber: address.phoneNumber,
                address1: address.address1,
                address2: address.address2,
                city: address.city,
                country: address.country,
                postalCode: address.postalCode,
                state: address.state,
                index: ind
            };
            this.modalOpenEdit('editAddressForm');
        }
    }
}

app.component('addresses', {
    extends: addresses,
    template: '#addresses'
});