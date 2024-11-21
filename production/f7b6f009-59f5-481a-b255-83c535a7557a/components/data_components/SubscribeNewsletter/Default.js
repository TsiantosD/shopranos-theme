const subscribenewsletterdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            header: this.model.header,
            subHeader: this.model.subHeader,
            buttonText: this.model.buttonText,
            email: null,
            emailIsValid: true,
            showEmailValidMessage: false,
            isLoading: false,
            imgUrl: this.model.image != null ? this.model.image.link : null,
            imgAlt: this.model.image != null ? this.model.image.alt : null,
        }
    },
    methods: {
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
        subscribeEmail() {
            this.showEmailValidMessage = false;
            if (this.validEmail(this.email)) {
                this.isLoading = true;
                this._subscribeToNewsletter(this.email, e => {
                    this.email = null;
                    this.showEmailValidMessage = true;
                    this.isLoading = false;
                    setTimeout(() => {
                        this.showEmailValidMessage = false;
                    }, 3000);
                });
            }
        },
        validEmail(email) {
            var valid = true;
            var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (!re.test(email)) {
                this.emailIsValid = false;
                valid = false;
            } else
                this.emailIsValid = true;
            return valid;
        }
    }
}

app.component('subscribenewsletterdefault', {
    extends: subscribenewsletterdefault,
    template: '#subscribenewsletterdefault'
});