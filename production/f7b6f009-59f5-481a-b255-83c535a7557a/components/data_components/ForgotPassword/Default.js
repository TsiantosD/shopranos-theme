const forgotpassworddefault = {
    props: {
        model: Object
    },
    data() {
        return {
            model: this.model,
            email: "",
            emailError: -1,
            isloading: false,
        }
    },
    methods: {
        checkForm(e) {
            this.emailError = -1;
            var hasErrors = false;

            var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            if (this.email.length == 0) {
                this.emailError = 1;
                valid = false;
                hasErrors = true;
            }
            else if (!re.test(this.email)) {
                this.emailError = 0;
                valid = false;
                hasErrors = true;
            }

            if (hasErrors) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            this.isloading = true;

            let info = {
                Email: this.email
            };

            this._accountForgotPassword(info, e => {
                if (e.error) {
                    this.emailError = 3;
                    this.isloading = false;
                    document.getElementById("recover-email").setCustomValidity('no-validation');
                } else {
                    this.isloading = false;
                    if (e.response.status != 200) {
                        this.emailError = 2;
                        return;
                    }
                    window.location.href = "/";
                }
            })
        }
    }
}

app.component('forgotpassworddefault', {
    extends: forgotpassworddefault,
    template: '#forgotpassworddefault'
});