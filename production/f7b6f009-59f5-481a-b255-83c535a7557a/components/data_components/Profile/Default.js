const profiledefault = {
    props: {
        model: Object
    },
    data() {
        return {
            globalModel: this._global,
            activeTab: "",
            user: null,
            customer: null,
            links: ['orders', 'shoppingLists', 'addresses', 'loyalty', 'view'],
            loadingKey: null,
            hideSidebarElements: false
        }
    },
    mounted() {
        this.loadInitialComponent();
        this.tabNavigation();
        emitter.on('cart-changed', e => {
            this.loadingKey = null;
        });
    },
    methods: {
        loadInitialComponent() {
            var path = window.location.pathname.substring(1).split("/");
            
            if (path.length > 0 && this.links.includes(path[1])) {
                this.activeTab = path[1];
                if(path[1] == 'shoppingLists' && path.length > 2) {
                    window.history.replaceState({ view: path[1] }, path[1], '/profile/' + path[1] + '/' + path[2]);
                } else {
                    window.history.replaceState({ view: path[1] }, path[1], '/profile/' + path[1]);
                }
                
            } else {
                this.activeTab = "view"
                window.history.replaceState({ view: 'view' }, 'view', `/profile/view`);
            }

            this._getRetailUserProfile(e => {
                this.user = e.user;
                if (this.activeTab !== null && this.activeTab !== "")
                    document.getElementById(this.activeTab).classList.remove("d-none");
            })
        },
        tabNavigation() {
            var tabs = document.querySelectorAll(".sidebar .nav-link-style");

            Array.from(tabs).forEach(el => {
                if (el.id !== "blog") {
                    el.addEventListener("click", e => {
                        e.preventDefault();
                        if (e.target.id !== "logout") {
                            var hash = el.getAttribute('href').split('#')[1];
                            this.activeTab = hash;
                            this.displayShoppingList = false;
                            window.history.pushState({ view: hash }, hash, `/profile/${hash}`);
                        } else {
                            window.location.href = "/account/logout";
                        }
                    })
                }
            })
            window.addEventListener("popstate", e => {
                if (e.state !== null && e.state.view !== null && e.state.view !== "")
                    this.activeTab = e.state.view
            })
        },
        toggleProfileSidebar() {
            this.hideSidebarElements = !this.hideSidebarElements
        }
    },
    watch: {
        activeTab: function (newHash, oldHash) {
            var showEl = document.getElementById(newHash);
            showEl.classList.remove("d-none");
            if (this.activeTab !== null && this.activeTab !== "" && oldHash !== '') {
                document.getElementById(oldHash).classList.add("d-none");
            }
        }
    }
}

app.component('profiledefault', {
    extends: profiledefault,
    template: '#profiledefault'
});