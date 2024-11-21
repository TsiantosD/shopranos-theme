const profileinfo = {
    data() {
        return {
            user: null,
            modal: null,
            changePassword: false,
            isLoading: false,
            islocked: false,
            badrequest: false,
            showModal: false,
            passwordError: -1,
            changeEmail: "",
            oldPassword: "",
            newPassword: "",
            reTypeNewPassword: "",
            changeEmailError: -1,
            oldPasswordError: -1,
            newPasswordError: -1,
            reTypeNewPasswordError: -1,
            toastSuccessClass: "hide"
        }
    },
    mounted() {
        this._getRetailUserProfile(e => {
            this.user = e.user;      
        })
        this.modal = document.getElementById("profile-pass");
    },
    methods: {
        checkForm() {
            this.changeEmailError = -1;
            this.oldPasswordError = -1;
            this.newPasswordError = -1;
            this.reTypeNewPasswordError = -1;
            var hasErrors = false;
            
            var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            const passwordRegex = /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[\W_])[\w!@#$%^&*()-=_+[\]{}|;:'",.<>/?`~]+$/;

            if (this.changeEmail.length == 0) {
                this.changeEmailError = 1;
                document.getElementById("changeEmail").setCustomValidity('invalid');
                hasErrors = true;
            } else if (!re.test(this.changeEmail)) {
                this.changeEmailError = 0;
                document.getElementById("changeEmail").setCustomValidity('invalid')
                valid = false;
                hasErrors = true;
            } else if (this.changeEmail !== this.user.email) {
                this.changeEmailError = 2;
                document.getElementById("changeEmail").setCustomValidity('invalid')
                valid = false;
                hasErrors = true;
            }

            if (this.oldPassword.length == 0) { 
                this.oldPasswordError = 0;
                document.getElementById("oldPassword").setCustomValidity('invalid')
                hasErrors = true;
            }

            if (this.newPassword.length == 0) {
                this.newPasswordError = 0;
                document.getElementById("newPassword").setCustomValidity('invalid')
                hasErrors = true;
            } else if (this.newPassword.length <= 5) {
                hasErrors = true;
                document.getElementById("newPassword").setCustomValidity('invalid');
                this.newPasswordError = 1;
            } else if (!passwordRegex.test(this.newPassword)) {
                hasErrors = true;
                document.getElementById("newPassword").setCustomValidity('invalid');
                this.newPasswordError = 2;
            } else if (this.newPassword !== this.reTypeNewPassword) {
                hasErrors = true;
                document.getElementById("newPassword").setCustomValidity('invalid');
                this.newPasswordError = 3;
            } else {
                this.newPasswordError = 4;
                this.reTypeNewPasswordError = 4;
            }

            if (this.newPassword !== this.reTypeNewPassword || this.reTypeNewPassword == 0) {
                hasErrors = true;
                this.reTypeNewPasswordError = 3;
            }

            if (hasErrors) 
                return;

            this.isLoading = true;

            document.getElementById("changeEmail").setCustomValidity('');
            document.getElementById("oldPassword").setCustomValidity('');
            document.getElementById("newPassword").setCustomValidity('');
            document.getElementById("reTypeNewPassword").setCustomValidity('');

            let info = {
                // Email: this.changeEmail,
                NewPassword: this.newPassword,
                OldPassword: this.oldPassword,
                ValidatePassword: this.newPassword
            };

            this._changePasswordProfile(info, e => {
                this.changeEmailError = -1;
                this.oldPasswordError = -1;
                this.newPasswordError = -1;
                this.reTypeNewPasswordError = -1;

                if (e.error) {
                    if (e.response && e.response.status === 409) {
                        this.islocked = true;
                    } else {
                        this.badrequest = true;
                    }
                    this.isLoading = false;
                } else {
                    this.isLoading = false;

                    if (e.response.status != 200) {
                        document.getElementById("newPassword").setCustomValidity('invalid')
                        return;
                    } else {
                        this.closeModal();
                        this.toastSuccessClass = "show";
                        setTimeout(() => { this.toastSuccessClass = "hide"; }, 3000);
                    }
                }
            })
        },
        closeModal() {
            this.showModal = !this.showModal;
            this.modal.style.display = "";
            document.querySelector('.modal-backdrop').remove();
        },
        hasLetter(str) {
            return str.match(/[a-z]/i);
        },
        hasNumber(str) {
            return /\d/.test(str);
        },
        hasSymbol(str) {
            var format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

            if (format.test(str)) {
                return true;
            } else {
                return false;
            }
        },
        toggleModalChangePassword() {
            var backdrop = document.createElement("div");
            backdrop.classList.add("modal-backdrop", "fade", "show");
            document.body.appendChild(backdrop);
            this.modal.style.display = "block";
            this.showModal = !this.showModal;
        },
        toggleVisibility(inputField) {
            var passwordInput = document.getElementById(inputField);
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
            }
            else {
                passwordInput.type = "password";
            }
        }
    }
}

app.component('profileinfo', {
    extends: profileinfo,
    template: '#profileinfo'
});