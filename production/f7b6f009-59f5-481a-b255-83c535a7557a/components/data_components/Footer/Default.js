const footerdefault = {
    props: {
        model: Object,
    },
    data() {
        return {
            navigations: null,
            globaldata: this._global,
            divsperColumn: null,
            email: null,
            emailIsValid: true,
            showEmailValidMessage: false,
            isLoading: false,
            shopranosUrl: null,
            imageError: false,
            menuLeft: false,
            menuCenter: false,
            menuCenterRight: false,
            menuRight: false,
            logoLeft: false,
            logoCenter: false,
            logoCenterRight: false,
            logoRight: false,
            newsletterLeft: false,
            newsletterCenter: false,
            newsletterCenterRight: false,
            newsletterRight: false,
            socialLeft: false,
            socialCenter: false,
            socialCenterRight: false,
            socialRight: false,
            allElements: false,
            twoElements: false,
            threeElements: false,
            logoExists: false,
            menuExists: false,
            newsletterExists: false,
            socialExists: false,
        }
    },
    mounted() {
        this.getPositionOfElements(this.model.areas);
        this.getUrl();
        this._getFooterMenu(e => {
            this.navigations = e;
            if (this.navigations !== null && this.navigations !== undefined) {
                this.divsperColumn = Math.ceil(this.navigations.length / 3);
            }
        });
        this.$nextTick(function () {
            this.setViewportRootVariables();
        });
    },
    methods: {
        getPositionOfElements(array) {
            if (array.length === 4) {
                this.allElements = true;
            }
            if (array.length === 3) {
                this.threeElements = true;
            }
            if (array.length === 2) {
                this.twoElements = true;
            }

            var index;
            if (array.indexOf(1) > -1) {
                this.menuExists = true;
                index = array.indexOf(1);
                if (index == 0) {
                    this.menuLeft = true;
                }
                else if (index == 1) {
                    this.menuCenter = true;
                }
                else if (index == 2) {
                    this.menuCenterRight = true;
                }
                else if (index == 3) {
                    this.menuRight = true;
                }
            }

            if (array.indexOf(0) > -1) {
                this.logoExists = true;
                index = array.indexOf(0);
                if (index == 0) {
                    this.logoLeft = true;
                }
                else if (index == 1) {
                    this.logoCenter = true;
                }
                else if (index == 2) {
                    this.logoCenterRight = true;
                }
                else if (index == 3) {
                    this.logoRight = true;
                }
            }

            if (array.indexOf(2) > -1) {
                this.newsletterExists = true;
                index = array.indexOf(2);
                if (index == 0) {
                    this.newsletterLeft = true;
                }
                else if (index == 1) {
                    this.newsletterCenter = true;
                }
                else if (index == 2) {
                    this.newsletterCenterRight = true;
                }
                else if (index == 3) {
                    this.newsletterRight = true;
                }
            }

            if (array.indexOf(3) > -1) {
                this.socialExists = true;
                index = array.indexOf(3);
                if (index == 0) {
                    this.socialLeft = true;
                }
                else if (index == 1) {
                    this.socialCenter = true;
                }
                else if (index == 2) {
                    this.socialCenterRight = true;
                }
                else if (index == 3) {
                    this.socialRight = true;
                }
            }
        },
        getUrl() {
            var culture = this._getCulture();
            this.shopranosUrl = "https://shopranos.eu/";
            if (culture === "el-GR") {
                this.shopranosUrl = "https://shopranos.gr/"
            }
        },
        handleImageError() {
            this.imageError = true;
        },
        setViewportRootVariables() {
            var root = document.querySelector(':root');
            var footerHeight = (document.querySelector('footer') != null) ? document.querySelector('footer').clientHeight : 0;

            "load change resize".split(" ").forEach(function (e) {
                window.addEventListener(e, setViewportVariables, false);
            });

            function setViewportVariables() {
                footerHeight = (document.querySelector('footer') != null) ? document.querySelector('footer').clientHeight : 0;

                root.style.setProperty('--fh', `${footerHeight}px`);
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
    },
    computed: {
        AllColumns: {
            get() {
                return this.navigations === null ? [] : this.navigations;
            }
        }
    }
}

app.component('footerdefault', {
    extends: footerdefault,
    template: '#footerdefault'
});