const formdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            data: this.model,
            fields: this.model.fields,
            fieldValidated: false,
            toastSuccessClass: "hide",
            toastErrorClass: "hide",
            captchaErrorStyle: "display:none",
            isSaving: false,
            key: null,
            showReCaptcha: false,
            isInvalid: false,
            isInvalidEmail: false,
            isInvalidCheckbox: false,
            formId: `form` + this.model.id,
            selected: false,
            checkActivate: false
        }
    },
    mounted() {
        if (reCaptchaApiKey !== 'undefined' && reCaptchaApiKey !== null && reCaptchaApiKey.length > 0) {
            this.key = reCaptchaApiKey;
            this.showReCaptcha = this.model.showReCaptcha;
        } else {
            this.showReCaptcha = false;
        }
        this.fields.forEach(f => {
            f.hasValidationError = false;
            f.value = '';
        });
    },
    methods: {
        checkForm(e) {
            if (this.showReCaptcha) {
                this.sendMessageWithReCaptcha();
            } else {
                this.sendMessage();
            }
        },
        clearForm() {
            this.toastSuccessClass = "hide";
            this.toastErrorClass = "hide";
            this.fields.forEach(f => { f.value = ''; f.hasValidationError = false; });
        },
        getAlignmentClass(alignment) {
            switch (alignment) {
                case 1:
                    return 'justify-content-start';
                case 2:
                    return 'justify-content-center';
                case 3:
                    return 'justify-content-end';
                default:
                    return '';
            }
        },
        getClass(type, index) {
            switch (type) {
                case 1:
                    var currField = document.querySelector('form#' + this.formId + ' .single-field:nth-child(' + (index + 1) + ')');
                    if (currField !== null) {
                        var nextField = document.querySelector('form#' + this.formId + ' .single-field:nth-child(' + (index + 1) + ')').nextSibling;
                        var prevField = document.querySelector('form#' + this.formId + ' .single-field:nth-child(' + (index + 1) + ')').previousSibling;

                        if (nextField.length == undefined || nextField.length > 0) {
                            if (nextField.querySelector('.form-control').tagName === 'INPUT') {
                                if (nextField.querySelector('.form-control').getAttribute('type') == 'email' || nextField.querySelector('.form-control').getAttribute('type') == 'text') {
                                    return 'half';
                                }
                            }
                        }
                        if (prevField.length > 0 && prevField.querySelector('.form-control').tagName === 'INPUT' && (index + 1) % 2 == 0) {
                            if (prevField.querySelector('.form-control').getAttribute('type') == 'email' || prevField.querySelector('.form-control').getAttribute('type') == 'text') {
                                return 'half';
                            }
                        }
                    }
                    return '';
                case 3:
                    var currField = document.querySelector('form#' + this.formId + ' .single-field:nth-child(' + (index + 1) + ')');
                    if (currField !== null) {
                        var nextField = document.querySelector('form#' + this.formId + ' .single-field:nth-child(' + (index + 1) + ')').nextSibling;
                        var prevField = document.querySelector('form#' + this.formId + ' .single-field:nth-child(' + (index + 1) + ')').previousSibling;

                        if (nextField.length == undefined || nextField.length > 0) {
                            if (nextField.querySelector('.form-control').tagName === 'INPUT') {
                                if (nextField.querySelector('.form-control').getAttribute('type') == 'email' || nextField.querySelector('.form-control').getAttribute('type') == 'text') {
                                    return 'half';
                                }
                            }
                        }
                        if (prevField.length > 0 && prevField.querySelector('.form-control').tagName === 'INPUT' && (index + 1) % 2 == 0) {
                            if (prevField.querySelector('.form-control').getAttribute('type') == 'email' || prevField.querySelector('.form-control').getAttribute('type') == 'text') {
                                return 'half';
                            }
                        }
                    }
                    return '';
                default:
                    return '';
            }
        },
        getFieldValue(name) {
            if (this._product !== null) {
                if (name && name.split(".").length > 1) {
                    const keys = name.split(".");
                    let property = this._product;
                    for (const key of keys) {
                        property = property[Object.keys(property).find(prop => prop.toLowerCase() === key.toLowerCase())];
                        if (!property || property === null || property === "" || property === " " || property === "0") {
                            return 0;
                        }
                    }
                    return property ?? 0;
                } else {
                    var property = this._product[Object.keys(this._product).find(key => key.toLowerCase() === name.toLowerCase())];
                    if (property == "" || property == " " || property == "0")
                        return 0;
                    return property;
                }
            }
        },
        async sendMessage() {
            this.checkActivate = true;
            this.isInvalid = false;
            this.isInvalidEmail = false;
            this.isInvalidCheckbox = false;
            let formIsNotValid = false;

            this.fields.forEach(f => {
                if (f.required && f.value.length === 0 && f.type !== 5) {
                    formIsNotValid = true;
                    f.hasValidationError = true;
                } else if (f.type === 3) {
                    f.hasValidationError = false;
                    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    if (!re.test(f.value)) {
                        formIsNotValid = true;
                        this.isInvalidEmail = true;
                    }
                } else if (f.type === 4) {
                    if (f.hasValidationError)
                        formIsNotValid = true;
                } else if (f.type === 5) {
                    if (f.required && !f.value)
                        this.isInvalidCheckbox = true;
                }
            });

            if (!formIsNotValid) {
                this.fields.forEach(field => {
                    if (field.isHidden) {
                        var propValue = this.getFieldValue(field.field);
                        field.value = propValue !== undefined && propValue !== null ? propValue : "";
                    }
                });
                this.isSaving = true;
                let info = {
                    emailProfileId: this.model.emailProfileId,
                    fields: this.model.fields,
                };

                this._sendEmail(info, (e, code) => {
                    if (!e) {
                        if (code === "415") {
                            this.isInvalid = true;
                        } else if (code === 400) {
                            this.isInvalidEmail = true;
                        }

                        this.toastSuccessClass = "hide";
                        this.toastErrorClass = "show";
                        setTimeout(() => { this.toastErrorClass = "hide"; }, 3000);
                    } else {
                        this.clearForm();
                        this.toastSuccessClass = "show";
                        this.toastErrorClass = "hide";
                        setTimeout(() => { this.toastSuccessClass = "hide"; }, 3000);
                    }
                    this.isSaving = false;
                });
            }
        },
        sendMessageWithReCaptcha() {
            if (grecaptcha.getResponse() === "") {
                this.captchaErrorStyle = "";
            } else {
                this.captchaErrorStyle = "display:none";
                captchaErrorClass = "hide";
                this.sendMessage();
                grecaptcha.reset();
            }
        },
        uploadChange(e, field) {
            if (e.target.files[0].size > 10485760) {
                field.hasValidationError = true;
            } else {
                field.hasValidationError = false;
            }
        }
    }
}

app.component('formdefault', {
    extends: formdefault,
    template: '#formdefault'
});