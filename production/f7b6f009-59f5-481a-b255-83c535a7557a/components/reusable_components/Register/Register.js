const register = {
    props: {
        model: Object
    },
    data() {
        return {
            id: this.generateUUID(),
            isloading: false,
            signUpEmail: "",
            signUpFirstname: "",
            signUpLastname: "",
            signUpPassword: "",
            signUpReTypePassword: "",
            signUpFirstnameError: -1,
            signUpLastnameError: -1,
            signUpEmailError: -1,
            signUpPasswordError: -1,
            signUpReTypePasswordError: -1,
        }
    },
    methods: {
        async checkForm() {
            const isValid = this.checkFormRegister();
            if (isValid) {
                let info = {
                    Email: this.signUpEmail,
                    Password: this.signUpPassword,
                    FirstName: this.signUpFirstname,
                    LastName: this.signUpLastname,
                    ValidatePassword: this.signUpReTypePassword
                };
                try {
                    let result = await new Promise((resolve, reject) => {
                        this._accountRegister(info, (e) => {
                            if (e.error) {
                                reject(e);
                            } else {
                                resolve(e);
                            }
                        });
                    });

                    if (result.response.status === 200) {
                        this._accountLogin(info, e => {
                            if (e.error) {
                                this.signUpPasswordError = true;
                                document.getElementById("signUpPassword-"+this.id).setCustomValidity('invalid');
                                this.isloading = false;
                            } else {
                                this.isloading = false;
                                if (e.response.status != 200) {
                                    this.signUpPasswordError = true;
                                    return;
                                }
                                window.location.reload();
                            }
                        })
                    } else {
                        this.signUpPasswordError = 1;
                    }
                } catch (error) {
                    
                    this.signUpEmailError = 2;
                    this.isloading = false;
                }
            }
        },
        checkFormRegister() {
            this.signUpEmailError = -1;
            this.signUpPasswordError = -1;
            this.signUpFirstnameError = -1;
            this.signUpLastnameError = -1;
            this.signUpReTypePasswordError = -1;
            var hasErrors = false;

            var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            const passwordRegex = /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[\W_])[\w!@#$%^&*()-=_+[\]{}|;:'",.<>/?`~]+$/;
            console.log(this.signUpEmail);
            
            if (this.signUpEmail.length == 0) {
                this.signUpEmailError = 1;
                document.getElementById("signUpEmail-"+this.id).setCustomValidity('invalid');
                hasErrors = true;
            } else if (!re.test(this.signUpEmail)) {
                this.signUpEmailError = 0;
                document.getElementById("signUpEmail-"+this.id).setCustomValidity('invalid');
                valid = false;
                hasErrors = true;
            }

            if (this.signUpFirstname.length == 0) {
                this.signUpFirstnameError = 1;
                document.getElementById("signUpFirstname-"+this.id).setCustomValidity('invalid');
                hasErrors = true;
            }

            if (this.signUpLastname.length == 0) {
                this.signUpLastnameError = 1;
                document.getElementById("signUpLastname-"+this.id).setCustomValidity('invalid');
                hasErrors = true;
            }

            if (!this.signUpPassword) {
                this.signUpPasswordError = 0;
                hasErrors = true;
                document.getElementById("signUpPassword-"+this.id).setCustomValidity('invalid');
            } else if (this.signUpPassword.length <= 5) {
                hasErrors = true;
                document.getElementById("signUpPassword-"+this.id).setCustomValidity('invalid');
                this.signUpPasswordError = 1;
            } else if (!passwordRegex.test(this.signUpPassword)) {
                hasErrors = true;
                document.getElementById("signUpPassword-"+this.id).setCustomValidity('invalid');
                this.signUpPasswordError = 2;
            } else if (this.signUpPassword !== this.signUpReTypePassword) {
                hasErrors = true;
                document.getElementById("signUpPassword-"+this.id).setCustomValidity('invalid');
                this.signUpPasswordError = 3;
            } else {
                this.signUpPasswordError = 4;
                this.signUpReTypePasswordError = 4;
            }

            if (this.signUpPassword !== this.signUpReTypePassword || this.signUpReTypePassword == 0) {
                hasErrors = true;
                this.signUpReTypePasswordError = 3;
            }

            if (hasErrors)
                return;

            this.isloading = true;

            document.getElementById("signUpEmail-"+this.id).setCustomValidity('');
            document.getElementById("signUpFirstname-"+this.id).setCustomValidity('');
            document.getElementById("signUpLastname-"+this.id).setCustomValidity('');
            document.getElementById("signUpPassword-"+this.id).setCustomValidity('');
            document.getElementById("signUpReTypePassword-"+this.id).setCustomValidity('');

            return true;
        },
        generateUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8); 
                return v.toString(16); 
            });
        },
        toggleVisibility(inputField) {
            var passwordInput = document.getElementById(inputField);
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
            }
            else {
                passwordInput.type = "password";
            }
        },
    },
    watch: {
        password: "validatePassword",
        retypeSingupPassword: "validatePassword"
    }
}

app.component('register', {
    extends: register,
    template: '#register'
});