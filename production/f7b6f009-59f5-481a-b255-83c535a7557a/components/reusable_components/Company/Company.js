const company = {
    props:
        {},
    data() {
        return {
            user: null,
            customer: null,

        }
    },
    mounted() {
        this._getUserProfile(e => {
            this.user = e.user;
            this.customer = e.customer;
        })
    }
}

app.component('company', {
    extends: company,
    template: '#company'
});