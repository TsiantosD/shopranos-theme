const navbardefault = {
    props: {
        model: Object,
    },
    data() {
        return {
            timerId: "",
            currentDate: null,
            announcements: [],
            userisauthenticated: this._global.isAuthenticated,
            timerQuantity: "",
            products: [],
            SearchText: "",
            resultsdiv: null,
            navigations: null,
            company: this._company,
            cartData: "",
            cartTotal: 0,
            isLoading: false,
            cartPriceLoading: true,
            cartPriceLoadingProblem: false,
            showFilters: false,
            lists: [],
            imageError: false,
            favImageError: false,
            menuLeft: false,
            menuCenter: false,
            menuRight: false,
            logoLeft: false,
            logoCenter: false,
            logoRight: false,
            searchLeft: false,
            searchCenter: false,
            searchRight: false,
            allElements: false,
            twoElements: false,
            collapsedMenu: false,
            collapsedMenuWithText: false,
            sticky: false,
            fullMenu: false,
            isMinimal: false,
            isRounded: false,
            isSquared: false,
            logoExists: false,
            menuExists: false,
            searchExists: false,
            units: [],
            cartDisplayMode: this.model.cartDisplayMode !== null ? this.model.cartDisplayMode : 0,
            productIds: [],
            parentProducts: null
        }
    },
    mounted() {
        this.setStickyNavBar();
        this.getPositionOfElements(this.model.areas);

        this.$nextTick(function () {
            this.getNumberOfComponents();
            this.setMenuBtnControl();
            this.setViewportRootVariables();
            if (document.querySelector(".menu-wrap").classList.contains('collapsed')) {
                document.querySelector("body").classList.add("withBG");
            }
            if (document.querySelector(".menu-wrap").classList.contains('sticky')) {
                document.querySelector("body").classList.add("isSticky");
                if (this.sticky && this.menuRight) {
                    document.querySelector("body").classList.add("isStickyRight");
                }
            }
            if (document.querySelector(".topbar") !== null) {
                if (document.querySelector(".topbar").nextElementSibling !== null) {
                    if (document.querySelector(".topbar").nextElementSibling.classList.contains('navbar-wrap')) {
                        document.querySelector("header").classList.add("topBarTop");
                    }
                }
            }
        });
        this.currentDate = new Date().toISOString();
        this.getActiveAnnouncements();

        this._getHeaderMenu(e => {
            this.navigations = e;
            window.addEventListener('click', this.handleDropDownClick);
        });
        emitter.on('cart-changed', e => {
            this.cartData = e;
            this.getTotalCartItems();
        });
        this.isLoading = true;
        this._getCart(e => {
            this.cartData = e;
            this.getTotalCartItems();
            this.isLoading = false;
        });
        this._setCartListener(e => {
            this.cartData = e;
            this.getTotalCartItems();
        });
        this._getShoppingLists(e => {
            this.lists = e;
        });
    },
    methods: {
        bodyClassAction(e) {
            if (!document.querySelector(".navbar-wrap").classList.contains('collapsedMenu')) {
                if (!e.target.classList.contains('show')) {
                    document.querySelector("body").classList.remove("openMenu");
                } else {
                    document.querySelector("body").classList.add("openMenu");
                }
            }
            if (!e.target.classList.contains('show')) {
                e.target.parentNode.classList.remove("show");
            } else {
                Array.from(document.querySelectorAll('.navbar-nav>.dropdown')).forEach(el => {
                    el.classList.remove('show');
                });
                e.target.parentNode.classList.add("show");
            }
        },
        calculateNavigation(navItem, i) {
            let navs = [];
            let length = 0;

            if (i == this.calculateRows(navItem) - 1) {
                length = navItem.navigations.length;
            }
            else {
                length = 3 + 3 * i;
            }
            let k = 3 * i;
            for (let j = k; j < length; j++) {
                navs.push(navItem.navigations[j]);
            }
            return navs;
        },
        calculateRows(navItem) {
            return Math.ceil(navItem.navigations.length / 3);
        },
        calculateUnitName(id) {
            let unit = this.units.find(u => u.id === id);
            if (unit !== undefined && unit !== null) {
                if (unit.name !== undefined && unit.name !== null && unit.name !== "") {
                    return `${unit.name}`
                }
            }
        },
        checkCompanyNamePerDevice() {
            if (document.querySelector('.companyName') !== null) {
                var currName = document.querySelector('.companyName').innerText;
                if (currName !== this._getCompanyName(this.company.name)) {
                    document.querySelector('.companyName').innerText = this._getCompanyName(this.company.name);
                }
            }
        },
        checkIfClickable(url) {
            if (window.innerWidth < 992)
                return false;
            if (url == null || url == 'undefined')
                return false;
            let str = url.split('/');
            if (str[str.length - 1] == '#')
                return false;
            return true;
        },
        checkIfCurrentUrl(url) {
            var current = window.location.pathname;
            if (current == url) {
                return true;
            }
            return false;
        },
        checkIfHasLink(url) {
            if (url == null || url == 'undefined' || url == '')
                return false;
            let str = url.split('/');
            if (str[str.length - 1] == '#')
                return false;
            return true;
        },
        createNavLevel(navigations) {
            if (navigations == null || navigations.length == 0)
                return "";
            var str = "";
            for (let j = 0; j < navigations.length; j++) {
                var child = navigations[j];
                var classes = "dropdown";

                if (this.checkIfCurrentUrl(child.url)) {
                    classes = "dropdown active";
                }

                str += `<li class="${classes}">`;

                if (child.navigations == null || child.navigations.length == 0) {

                    if (child.menuIcon !== null) {
                        if (child.menuIcon.link !== null) {
                            str += `<a class="dropdown-item" href="${child.url}" >
                                        <img src="${child.menuIcon.link}" width="24" height="24" alt="${child.menuIcon.alt}"/>
                                        ${child.navigationTitle}
                                    </a>`;
                        } else {
                            str += `<a class="dropdown-item" href="${child.url}" >${child.navigationTitle}</a>`;
                        }
                    } else {
                        str += `<a class="dropdown-item" href="${child.url}" >${child.navigationTitle}</a>`;
                    }
                }
                else {
                    if (child.menuIcon !== null) {
                        if (child.menuIcon.link !== null) {
                            str += `<a class="dropdown-item dropdown-toggle parent-nav" href="${child.url}" data-bs-toggle="dropdown">
                                        <img src="${child.menuIcon.link}" width="24" height="24" alt="${child.menuIcon.alt}"/>
                                        ${child.navigationTitle}
                                    </a>
                                    <ul class="dropdown-menu">  ${this.createNavLevel(child.navigations)}</ul>`;
                        } else {
                            str += `<a class="dropdown-item dropdown-toggle parent-nav" href="${child.url}" data-bs-toggle="dropdown">${child.navigationTitle}</a>
                                    <ul class="dropdown-menu">  ${this.createNavLevel(child.navigations)}</ul>`;
                        }
                    } else {
                        str += `<a class="dropdown-item dropdown-toggle parent-nav" href="${child.url}" data-bs-toggle="dropdown">${child.navigationTitle}</a>
                            <ul class="dropdown-menu">  ${this.createNavLevel(child.navigations)}</ul>`;
                    }
                }
                str += `</li>`;
            }
            return str;
        },
        enterClicked(e) {
            window.location.href = window.location.protocol + "//" + window.location.host + "/search?s=" + this.SearchText;
        },
        getActiveAnnouncements() {
            let params = {
                page: 1,
                pageSize: 10,
                global: true,
                from: `lte:${this.currentDate}`,
                to: `gte:${this.currentDate}`,
                isAuthenticated: this.isAuthenticated,
            }
            this._getActiveAnnouncements(params, list => {
                this.announcements = list.model.item1;
            });
        },
        getCalculatedCart() {
            this.cartPriceLoading = true;
            this._calculateCart(this.onSuccessCalculation, this.onErrorCalculation)
        },
        getCartAfterQuantityChange(currvalue, product) {
            if (this.parentProducts.find(el => el.id === product.productId)) {
                let parentProduct = this.parentProducts.find(el => el.id === product.productId);
                let activeVariantIndex = parentProduct.productVariants.findIndex(el => el.id === product.productVariantId);
                product.selectedQuantity = this._onQuantityChange(currvalue, parentProduct, activeVariantIndex, []);
                product.quantity = product.selectedQuantity;
            }
            clearTimeout(this.timerQuantity);
            this.timerQuantity = setTimeout(() => {
                this._setCart(this.cartData);
            }, 300);

        },
        getCartAfterRemove(variantId) {
            this._removeFromCart(variantId);
        },
        getLists() {
            this._getShoppingLists(e => {
                this.lists = e;
            });
        },
        getMenuDisplayMode(menuMode) {
            if (menuMode == 0) {
                this.fullMenu = true;
            }
            else if (menuMode == 1) {
                this.collapsedMenu = true;
            }
            else if (menuMode == 2) {
                this.collapsedMenuWithText = true;
            }
            else if (menuMode == 3) {
                this.sticky = true;
            }
        },
        getMenuTree(nav) {
            navigations = nav.navigations;
            var str = "<ul>";

            for (let j = 0; j < navigations.length; j++) {
                var child = navigations[j];

                var classes = "dropdown";
                if (this.checkIfCurrentUrl(child.url)) {
                    classes = "dropdown active";
                }

                str += `<li class="${classes}">`;

                if (child.navigations == null || child.navigations.length == 0) {

                    if (child.menuIcon !== null) {
                        if (child.menuIcon.link !== null) {
                            str += `<a class="dropdown-item" href="${child.url}" >
                                        <img src="${child.menuIcon.link}" width="24" height="24" alt="${child.menuIcon.alt}"/>
                                        ${child.navigationTitle}
                                    </a>`;
                        } else {
                            str += `<a class="dropdown-item" href="${child.url}" >${child.navigationTitle}</a>`;
                        }
                    } else {
                        str += `<a class="dropdown-item" href="${child.url}" >${child.navigationTitle}</a>`;
                    }
                } else {
                    str += `<span class="dropdown-item dropdown-toggle parent-nav" data-bs-toggle="dropdown" data-bs-auto-close="outside"></span>`;
                    if (child.menuIcon !== null) {
                        if (child.menuIcon.link !== null) {
                            str += `<a href="${child.url}" class="dropdown-item" :class="{'active' : checkIfCurrentUrl(${child.url})}">
                                        <img src="${child.menuIcon.link}" width="24" height="24" alt="${child.menuIcon.alt}"/>
                                        ${child.navigationTitle}
                                    </a>`;
                        } else {
                            str += `<a href="${child.url}" class="dropdown-item" :class="{'active' : checkIfCurrentUrl(${child.url})}">
                                        ${child.navigationTitle}
                                    </a>`;
                        }
                    } else {
                        str += `<a href="${child.url}" class="dropdown-item" :class="{'active' : checkIfCurrentUrl(${child.url})}">
                                    ${child.navigationTitle}
                                </a>`;
                    }
                    str += `<ul class="dropdown-menu">   ${this.createNavLevel(child.navigations)}</ul>`;
                }
                str += `</li>`;
            }
            str += '</ul>';

            if (nav.banners.length > 0 && this.model.menuDisplayMode !== 3) {
                var banners = nav.banners;
                str += '<div class="banners-wrap">';
                for (let j = 0; j < banners.length; j++) {
                    var banner = banners[j];

                    str += '<div class="banner">';

                    if (banner.link !== "") {
                        str += `<a href="${banner.link}" >`;
                    }

                    if (banner.image.link !== null) {
                        str += `<img src="${banner.image.link}" alt="${banner.image.alt}" />`;
                    } else {
                        str += `<img src="${this._getNoImageUrl()}" />`;
                    }

                    if (banner.link !== null) {
                        str += `</a>`;
                    }

                    str += '</div>';
                }
                str += '</div>';
            }


            return str;
        },
        getNumberOfComponents() {
            const body = document.querySelector("body");
            if (document.querySelectorAll('main.page-wrapper>div>section').length < 2) {
                body.classList.add('singleSection');
            } else {
                body.classList.remove('singleSection');
            }
        },
        getPositionOfElements(array) {
            if (array == null || array.lenth === 0) { return false }

            if (array.length === 3) {
                this.allElements = true;
            }
            if (array.length === 2) {
                this.twoElements = true;
            }

            var index;
            if (array.indexOf(1) > -1) {
                this.menuExists = true;
                this.getMenuDisplayMode(this.model.menuDisplayMode);

                index = array.indexOf(1);
                if (index == 0) {
                    this.menuLeft = true;
                }
                else if (index == 1) {
                    this.menuCenter = true;
                }
                else if (index == 2) {
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
                    this.logoRight = true;
                }
            }

            if (array.indexOf(2) > -1) {
                this.searchExists = true;
                index = array.indexOf(2);
                if (index == 0) {
                    this.searchLeft = true;
                }
                else if (index == 1) {
                    this.searchCenter = true;
                }
                else if (index == 2) {
                    this.searchRight = true;
                }
            }

            return true;
        },
        getTotalCartItems() {
            let count = 0;
            if (this.cartData == null || (this.cartData !== null && this.cartData.cartItems == null)) {
                this.cartTotal = 0;
                return;
            }

            for (var i = 0; i < this.cartData.cartItems.length; i++) {
                count = count + this.cartData.cartItems[i].quantity;
            }
            this.cartTotal = count;
        },
        handleDropDownClick(e) {
            var resultsDivs = document.querySelectorAll('.dropdown-search .dropdown-menu');
            Array.from(resultsDivs).forEach(el => {
                if (!el.contains(e.target))
                    el.style.display = "";
            });
        },
        handleFaviconError() {
            this.favImageError = true;
        },
        handleLogoError() {
            this.imageError = true;
        },
        handleNavCartClick(e) {
            var cart = document.getElementById("navcart");
            var body = document.querySelector("body");
            var cartIcon = document.getElementById("navcart-icon");
            if (cart !== null && cartIcon !== null) {
                if (!cart.contains(e.target) && !cartIcon.contains(e.target)) {
                    cart.style.display = "";
                    body.classList.remove('openCart');
                }
            }
        },
        hasDiscount(item) {
            if (item.discountValue > 0)
                return true;

            return false;
        },
        navigation(item) {
            window.location = item.url;
        },
        onErrorCalculation(e) {
            this.cartPriceLoadingProblem = true
            this.cartPriceLoading = false;
        },
        onSuccessCalculation(e) {
            this.cartData = e;
            this.getTotalCartItems();
            this.cartPriceLoading = false;
            let ids = e.cartItems.map(c => c.salesUnitId);
            this._findUnitsByIds(ids, e => this.units = e);

            this.cartData.cartItems.forEach(variant => {
                if (this.productIds.indexOf(variant.productId) === -1) {
                    this.productIds.push(variant.productId);
                }
                variant.selectedQuantity = variant.quantity;
            })
            this._findProductsByIds(this.productIds, true, e => {
                this.parentProducts = e;
            });
        },
        Search(ev) {
            clearTimeout(this.timerId);
            this.timerId = setTimeout(() => {
                let criteria = {
                    page: 1,
                    pageSize: 16,
                    sort: this.model?.sortOrder ?? '-SortDate',
                    search: this.SearchText,
                };
                this._findProductsByCriteria(criteria, data => {
                    if (data && data.length > 0) {
                        this.products = data
                        this.resultsdiv = ev.target.parentNode.querySelector('.dropdown-search .dropdown-menu');
                        this.resultsdiv.style.display = "block";
                    }
                    else {
                        this.resultsdiv = ev.target.parentNode.querySelector('.dropdown-search .dropdown-menu');
                        this.resultsdiv.style.display = "";
                    }
                });
            }, 400)
        },
        setMenuBtnControl() {
            if (document.querySelector("#toggleMenuBtn") !== null) {
                document.querySelector("#toggleMenuBtn").addEventListener("click", function () {
                    document.querySelector("body").classList.toggle("openMenu");
                    Array.from(document.querySelectorAll('.navbar-nav>.dropdown')).forEach(el => {
                        el.classList.remove('show');
                    });
                });
            }
        },
        setStickyNavBar() {
            const header = document.querySelector("header");
            header.classList.add('sticky-top');

            const navbar = document.querySelector(".navbar-wrap");
            let halfNavbarHeight = navbar.getBoundingClientRect().height / 2;
            var lastScrollTop = 0;

            "load scroll".split(" ").forEach(function (e) {
                window.addEventListener(e, checkNavbar, false);
            });

            function checkNavbar() {
                window.addEventListener("resize", () => { halfNavbarHeight = navbar.getBoundingClientRect().height / 2; }, false);
                if (!document.querySelector("body").classList.contains('openMenu')) {
                    if (window.scrollY > halfNavbarHeight) {
                        var st = window.scrollY || document.documentElement.scrollTop;
                        if (st > lastScrollTop) {
                            header.classList.add('stickyNavbarWrap');
                            navbar.classList.add('stickyNavbar');
                        }
                        lastScrollTop = st;
                    } else if (window.scrollY == 0) {
                        header.classList.remove('stickyNavbarWrap');
                        navbar.classList.remove('stickyNavbar');
                    }
                }
            }

        },
        setViewportRootVariables() {
            var root = document.querySelector(':root');
            var viewportHeight = window.innerHeight * 0.01;
            var topBarHeight = (document.getElementsByClassName('topbar')[0] != null) ? document.getElementsByClassName('topbar')[0].clientHeight : 0;
            var navBarHeight = (document.getElementsByClassName('navbar-wrap')[0] != null) ? document.getElementsByClassName('navbar-wrap')[0].clientHeight : 0;
            if (document.querySelector(".menu-wrap").classList.contains('sticky')) {
                var menuWidth = (document.querySelector('#navbarCollapse .navbar-nav') != null) ? document.querySelector('#navbarCollapse .navbar-nav').clientWidth : 0;
            }

            "load change resize".split(" ").forEach(function (e) {
                window.addEventListener(e, setViewportVariables, false);
            });

            function setViewportVariables() {
                viewportHeight = window.innerHeight * 0.01;
                navBarHeight = (document.getElementsByClassName('navbar-wrap')[0] != null) ? document.getElementsByClassName('navbar-wrap')[0].clientHeight : 0;
                topBarHeight = (document.getElementsByClassName('topbar')[0] != null) ? document.getElementsByClassName('topbar')[0].clientHeight : 0;
                if (document.querySelector(".menu-wrap").classList.contains('sticky')) {
                    menuWidth = (document.querySelector('#navbarCollapse .navbar-nav') != null) ? document.querySelector('#navbarCollapse .navbar-nav').clientWidth : 0;
                    root.style.setProperty('--mw', `${menuWidth}px`);
                }

                root.style.setProperty('--vh', `${viewportHeight}px`);
                root.style.setProperty('--nh', `${navBarHeight}px`);
                root.style.setProperty('--th', `${topBarHeight}px`);
            }
        },
        toggleCart() {
            var body = document.querySelector("body");
            if (window.innerWidth > 992 && window.location.pathname !== "/checkout") {
                var cart = document.getElementById("navcart");
                if (cart.style.display === "block") {
                    cart.style.display = "";
                    body.classList.remove('openCart');
                }
                else {
                    cart.style.display = "block";
                    body.classList.add('openCart');
                }
                this.getCalculatedCart();
            } else {
                window.location.href = "/cart";
            }
        },
        toggleNote(event) {
            if (event.target.parentNode.classList.contains('open')) {
                event.target.parentNode.classList.remove('open');
            } else {
                event.target.parentNode.classList.add('open');
            }
        },
        toggleSearch() {
            if (document.querySelector('.toggleSearch').classList.contains('show')) {
                document.querySelector('.toggleSearch').classList.remove('show');
            } else {
                document.querySelector('.toggleSearch').classList.add('show');
            }
        },
        updateCart() {
            this._setCart(this.cartData);
        }
    },
    created: function () {
        window.addEventListener('click', this.handleNavCartClick);
        window.addEventListener("resize", this.checkCompanyNamePerDevice);
        window.addEventListener("change", this.checkCompanyNamePerDevice);
    },
    updated() {
        this.getNumberOfComponents();
    },
    computed: {
        ActiveCulture: {
            get() {
                return this._getCulture();
            }
        },
        TotalAmount: {
            get() {
                return this.cartData.totalAmount;
            }
        }
    }
};

app.component('navbardefault', {
    extends: navbardefault,
    template: '#navbardefault '
});