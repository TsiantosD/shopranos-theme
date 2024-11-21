const login = {
    props: {
        model: Object,
        signupInternal: Boolean,
    },
    data() {
        return {
            id: this.generateUUID(),
            wrongCredentials: false,
            passwordLog: "",
            emailLog: "",
            emailError: -1,
            passwordError: -1,
            isloading: false,
            isLocked: false,
            signupInternal: this.signupInternal
        }
    },
    mounted() {
        if(window.location.search.startsWith('?redirect=https://'))
            window.location.href = window.location.search.split('?redirect=https://')[1];
        else if(window.location.search.startsWith('?redirect=http://'))
            window.location.href = window.location.search.split('?redirect=http://')[1];
    },
    methods: {
        checkForm() {
            this.emailError = -1;
            this.passwordError = -1;
            var hasErrors = false;
            this.isLocked = false;

            var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            
            if (this.emailLog.length == 0) {
                this.emailError = 1;
                document.getElementById("emailLog-"+this.id).setCustomValidity('invalid');
                hasErrors = true;
            } else if (!re.test(this.emailLog)) {
                this.emailError = 0;
                document.getElementById("emailLog-"+this.id).setCustomValidity('invalid');
                valid = false;
                hasErrors = true;
            }

            if (this.passwordLog.length == 0) {
                this.passwordError = 0;
                document.getElementById("passwordLog-"+this.id).setCustomValidity('invalid');
                hasErrors = true;
            }

            if (hasErrors)
                return;
            this.isloading = true;
            document.getElementById("passwordLog-"+this.id).setCustomValidity('');
            document.getElementById("emailLog-"+this.id).setCustomValidity('');

            let info = {
                Email: this.emailLog,
                Password: this.passwordLog,
            };

            this._accountLogin(info, e => {
                if (e.error) {
                    if (e.response && e.response.status === 409) {
                        this.isLocked = true;
                        this.isloading = false;
                        return;
                    }
                    this.wrongCredentials = true;
                    this.isloading = false;
                } else {
                    this.isloading = false;
                    if (e.response.status != 200) {
                        this.passwordError = 1;
                        return;
                    }
                    else {
                        this.emailError = -1;
                        this.passwordError = -1;
                        
                        if(window.location.search.startsWith('?redirect=https://'))
                            window.location.href = window.location.search.split('?redirect=')[1];
                        else if(window.location.search.startsWith('?redirect=http://'))
                            window.location.href = window.location.search.split('?redirect=')[1];
                        else
                            window.location.href = "/checkout";
                            
                    }
                }
            })
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
        }
    }
}

app.component('login', {
    extends: login,
    template: '#login'
});