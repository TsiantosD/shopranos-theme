const filterlistdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            title: this._filterList.record.title,
            description: this.model?.description !== null ? this._filterList.record[this.model?.description] : null,
            isUserLoggedIn: this._global.isAuthenticated,
            filterData: null,
            areProductsCalculated: false,
            maxRetailPrice: null,
            minRetailPrice: null,
            url: null,
            ShowClearFilter: false,
            brands: [],
            categories: [],
            inputText: '',
            additionalFields: this.model?.additionalFields,
            DisplayModeEnum: {
                Grid: 0,
                List: 1
            },
            displayMode: null,
            distances_default: [3, 4, 3, 2],
            distances_one_field: [2, 4, 2, 2],
            distances_two_fields: [1, 3, 2, 2],
            distances_three_fields: [1, 2, 1, 2],
            scrollToTop: this.model?.scrollToTop !== null ? this.model?.scrollToTop : true,
            cartData: null,
            displayHeaders: this.model?.displayHeaders !== null ? this.model?.displayHeaders : false,
            filtersPosition: this.model?.filtersPosition !== null ? this.model?.filtersPosition[0] : 0,
            activeFilters: [],
            filterlistViews: document.querySelectorAll(".filterlist-views>div>div"),
            showFilters: false
        }
    },
    mounted() {
        if (window.location.search.includes('pageSize')) {
            var splitPageSize = window.location.search.split('pageSize=')[1];
            var numPageSize = parseInt(splitPageSize.split('&')[0]);
            this.model.pageSize = numPageSize;
        }
        this.displayMode = this.getDisplayMode();
        this._setupFiltersThenCalculate(e => {
            this.filterData = e;
            this.url = `/${this.filterData?.endPoint}/${this.filterData?.alias}`;
            this.minRetailPrice = this.filterData.minRetailPrice;
            this.maxRetailPrice = this.filterData.maxRetailPrice;
            this.$nextTick(() => {
                this.setupRetailSlider();
                if (document.querySelector(".filterlist-views") !== null)
                    if (localStorage.getItem("filterlist-display-mode") != null) {
                        var num = parseInt(localStorage.getItem("filterlist-display-mode")) + 1;
                        document.querySelector(".filterlist-views>div>div:nth-child(" + num + ")").classList.add('active');
                    } else {
                        document.querySelector(".filterlist-views .preview-grid").classList.add('active');
                    }
            });
            var brandids = [];
            var categoryids = [];
            this._getCart(e => {
                this.cartData = e;
            });

            this.filterData.products.forEach(p => {
                p.productVariants.every(variant => {
                    if (variant.canOrder) {
                        p.productVariants[0] = variant;
                        return false;
                    }
                    return true;

                })
                if (this.cartData === null) {
                    p.productVariants[0].selectedQuantity = this._findSelected(p.productVariants[0], []);
                } else {
                    p.productVariants[0].selectedQuantity = this._findSelected(p.productVariants[0], this.cartData.cartItems);
                }

                if (p.productVariants[0].salesUnitId != null) {

                    this._findUnitsByIds([p.productVariants[0].salesUnitId, p.productVariants[0].unitId], units => {
                        p.productVariants[0].unit = units.find(u => u.id == p.productVariants[0].salesUnitId)?.name;
                    })
                }
            });

            this._findBrandsByIds(brandids, e => {
                this.brands = e;
            })
            this._findCategoriesByIds(categoryids, e => {
                this.categories = e;
            })
            this.checkActiveFilters();
        },
            pricedProducts => {
                if (this.filterData.products?.length > 0) {
                    this.areProductsCalculated = true;
                    this.filterData.products = pricedProducts;
                }
            },
            null, this.model?.pageSize, this.model?.sortOrder
        );

        let queryString = window.location.search;
        let urlParams = new URLSearchParams(queryString);

        if (urlParams.has('s')) {
            if (this.inputText !== urlParams.get('s')) {
                this.inputText = urlParams.get('s');
            }
        }
    },
    methods: {
        CalculateRange(numMin, numMax) {
            let variance = numMax - numMin;
            if (variance <= 1)
                return 2;
            if (variance < 5)
                return variance + 1;
            return 5;
        },
        changeDisplayMode(event, mode) {
            this.displayMode = +mode;
            localStorage.setItem("filterlist-display-mode", mode);

            this.filterlistViews = document.querySelectorAll(".filterlist-views>div>div");
            Array.from(this.filterlistViews).forEach((el) => el.classList.remove('active'));
            event.target.parentNode.classList.add('active');
        },
        checkActiveFilters() {
            this.setActiveFilters();
            if (this.filterData !== null && this.filterData.filters !== null && this.filterData !== undefined && this.filterData.filters !== undefined) {
                var isSelected = this.filterData.filters.some(item => {
                    if (item.values !== undefined) {
                        return item.values.find(val => val.selected === true);
                    } else {
                        return false;
                    }
                });

                if (this.filterData.products.length > 0 && this.filterData.filters.length > 0) {
                    if (this.filtersPosition === 0) {
                        if (this.filterData.filters.find(filter => filter.key === "retailPriceId") !== undefined) {

                            var isRetailPriceFilterMatched = this.filterData.filters.filter(filter => filter.key === "retailPriceId" && this.maxRetailPrice === filter.max && this.minRetailPrice === filter.min);


                            this.ShowClearFilter = isSelected === true || (isRetailPriceFilterMatched === undefined || isRetailPriceFilterMatched.length === 0);
                        } else {
                            this.ShowClearFilter = isSelected === true;
                        }
                    } else if (this.filtersPosition === 1) {
                        this.ShowClearFilter = isSelected === true;
                    }
                }


            } else {
                this.ShowClearFilter = false
            }
        },
        executeFilters() {
            this.areProductsCalculated = false;
            this._sendFilterRequestThenCalculate(this.filterData, e => {
                this.filterData = e;
                this._getCart(e => {
                    this.cartData = e;
                });
                this.filterData.products.forEach(p => {

                    if (this.cartData === null) {
                        p.productVariants[0].selectedQuantity = this._findSelected(p.productVariants[0], []);
                    } else {
                        p.productVariants[0].selectedQuantity = this._findSelected(p.productVariants[0], this.cartData.cartItems);
                    }
                    if (p.productVariants[0].salesUnitId != null)
                        this._findUnitsByIds([p.productVariants[0].salesUnitId], e => {
                            p.productVariants[0].unit = e[0].name;
                        })
                })
                if (this.scrollToTop) {
                    window.scrollTo({
                        top: 100,
                        left: 0,
                        behavior: 'smooth',
                    });
                }
                this.checkActiveFilters()
            },
                pricedProducts => {
                    if (this.filterData.products?.length > 0) {
                        this.areProductsCalculated = true;
                        this.filterData.products = pricedProducts;
                    }
                });
        },
        getCurrentLink() {
            return `/${this.filterData.endPoint}/${this.filterData.alias}`;
        },
        getDisplayMode() {
            let mode;
            if (!this.model?.previewOptions || this.model?.previewOptions === null || this.model?.previewOptions?.length === 0)
                mode = this.DisplayModeEnum.Grid;
            else if (this.model?.previewOptions?.length === 1)
                mode = this.model?.previewOptions[0];
            else if (localStorage.getItem("filterlist-display-mode") != null)
                mode = localStorage.getItem("filterlist-display-mode");
            else
                mode = this.updateDisplayMode(this.model?.previewOptions[0]);
            return +mode;
        },
        getFieldValue(product, name) {
            if (name && name.split(".").length > 1) {
                const keys = name.split(".");
                let property = product;
                for (const key of keys) {
                    property = property[Object.keys(property).find(prop => prop.toLowerCase() === key.toLowerCase())];
                    if (!property || property === null || property === "" || property === " " || property === "0") {
                        return 0;
                    }
                }
                return property || 0;
            } else {
                if (name.toLowerCase() == "brand") {
                    var brand = this.brands.find(b => b.id === product.brandId)
                    return brand?.name;
                }
                if (name.toLowerCase() == "category") {
                    var cat = this.categories.find(c => c.id === product.categoryId)
                    return cat?.title;
                }
                else {
                    var property = product[Object.keys(product).find(key => key.toLowerCase() === name.toLowerCase())];
                    if (!property || property === null || property == "" || property == " " || property == "0")
                        return 0;
                    return property;
                }
            }
        },
        handleFieldUrl(product, field) {
            if (field == "brand") {
                var alias = this.brands.find(b => b.id === product.brandId)?.alias;
                if (alias) {
                    window.location.href = `/brand/${alias}`
                }
            }
            if (field == "category") {
                var alias = this.categories.find(c => c.id === product.categoryId)?.alias
                if (alias) {
                    window.location.href = `/category/${alias}`
                }
            }
        },
        handleInputChange() {
            if (this.inputText)
                this.title = this.inputText;
            else
                this.title = this._filterList.record.title;
            this.filterData.searchText = this.inputText;
            this.sendFilterRequest(1);
        },
        isValidUrl(string) {
            try {
                const url = new URL(string);
                return url.protocol === 'http:' || url.protocol === 'https:';
            } catch (err) {
                return false;
            }
        },
        removeFilter(id) {
            var currSlug = id.split(id.split('-')[0]).pop().slice(1);
            if (currSlug !== 'retailPrice' && currSlug !== 'price') {
                const updatedData = this.filterData.filters.map(x => {
                    if (x.values !== undefined) {
                        x.values.map(y => {
                            if (y.slug === currSlug) {
                                y.selected = false;
                            }
                        })
                    }
                });
            } else if (currSlug == 'retailPrice') {
                const retailSlider = document.querySelector('.retail-price-slider .range-slider-ui');
                retailSlider.noUiSlider.reset();
                this.filterData.minRetailPrice = this.filterData.filters.find(filter => filter.key === "retailPriceId").min;
                this.filterData.maxRetailPrice = this.filterData.filters.find(filter => filter.key === "retailPriceId").max;
            }
            this.sendFilterRequest(1);
        },
        resolveAuthentication(field) {
            if (field.authenticated) {
                if (this.isUserLoggedIn) {
                    return true;
                }
                return false;
            }
            return true;
        },
        retailPriceChanged() {
            this.filterData.minRetailPrice = this.minRetailPrice;
            this.filterData.maxRetailPrice = this.maxRetailPrice;
            this.sendFilterRequest(1);
        },
        sendFilterRequest(newCurrentPage) {
            if (newCurrentPage < 1 || newCurrentPage > this.LastPage)
                return;
            if (!newCurrentPage)
                newCurrentPage = 1;
            this.filterData.page = newCurrentPage;
            this.executeFilters();
        },
        setActiveFilters() {
            if (this.filterData !== null && this.filterData.filters !== null && this.filterData !== undefined && this.filterData.filters !== undefined) {
                this.activeFilters = [];

                this.filterData.filters.find(item => {
                    if (item.values !== undefined) {
                        item.values.find(itemData => {
                            if (itemData.selected === true) {
                                if (!this.activeFilters.includes(itemData)) {
                                    this.activeFilters.push(itemData);
                                }
                            }
                        })
                    }

                });

                if (this.filtersPosition === 0) {
                    var isRetailPriceFilterMatched = this.filterData.filters.filter(filter => filter.key === "retailPriceId" && this.maxRetailPrice === filter.max && this.minRetailPrice === filter.min);

                    if ((isRetailPriceFilterMatched === undefined || isRetailPriceFilterMatched.length === 0 ) && (this.filterData.filters.find(filter => filter.key === "retailPriceId") !== undefined)) {
                        this.activeFilters.push(this.filterData.filters.find(filter => filter.key === "retailPriceId"));                        
                    }
                }
            }
        },
        setPageSize(e) {
            this.filterData.pageSize = e.target.value;
            this.executeFilters()
        },
        setSortOrder(e) {
            this.filterData.sort = e.target.value
            this.executeFilters()
        },
        setupRetailSlider() {
            var rangeSliderWidget = document.querySelectorAll('.retail-price-slider');
            for (var i = 0; i < rangeSliderWidget.length; i++) {
                var rangeSlider = rangeSliderWidget[i].querySelector('.range-slider-ui'),
                    valueMinInput = rangeSliderWidget[i].querySelector('.range-slider-value-min'),
                    valueMaxInput = rangeSliderWidget[i].querySelector('.range-slider-value-max');
                var options = {
                    dataStartMin: this.minRetailPrice,
                    dataStartMax: this.maxRetailPrice,
                    dataMin: parseInt(this.minRetailPrice, 10),
                    dataMax: parseInt(this.maxRetailPrice, 10),
                    dataStep: parseInt(rangeSliderWidget[i].dataset.step, 10)
                };

                var dataCurrency = rangeSliderWidget[i].dataset.currency;
                noUiSlider.create(rangeSlider, {
                    start: [options.dataStartMin, options.dataStartMax],
                    connect: true,
                    step: options.dataStep,
                    pips: {
                        mode: 'count',
                        values: this.CalculateRange(options.dataMin, options.dataMax)
                    },
                    tooltips: true,
                    range: {
                        'min': options.dataMin,
                        'max': options.dataMax
                    },
                    format: {
                        to: (value) => {
                            return this._calculateCurrency(value, 0);
                        },
                        from: (value) => {
                            return Number(value);
                        }
                    }
                });
                rangeSlider.noUiSlider.on('update', (values, handle) => {
                    var value = values[handle];
                    value = value.replace(/\D/g, '');
                    if (handle) {
                        this.maxRetailPrice = Math.round(value);
                    } else {
                        this.minRetailPrice = Math.round(value);
                    }
                });
                rangeSlider.noUiSlider.on('change', () => {
                    this.retailPriceChanged();
                });
                valueMinInput.addEventListener('change', () => {
                    rangeSlider.noUiSlider.set([this.filterData.minRetailPrice, null]);
                });
                valueMaxInput.addEventListener('change', () => {
                    rangeSlider.noUiSlider.set([null, this.maxRetailPrice]);
                });
            }
        },
        tabFilter(index) {
            var tablinks = document.querySelectorAll("#shop-sidebar .tablinks");
            var tabcontent = document.querySelectorAll("#shop-sidebar .tabcontent");

            [].forEach.call(tablinks, function (el) {
                el.classList.remove("open");
            });
            [].forEach.call(tabcontent, function (el) {
                el.classList.remove("open");
            });
            document.querySelector("#shop-sidebar .tablinks[data-link='filter-" + index + "']").classList.add('open');
            document.querySelector("#shop-sidebar .tabcontent#filter-" + index).classList.add('open');
        },
        toggleFilter(event) {
            if (event.target.parentNode.classList.contains('open')) {
                event.target.parentNode.classList.remove('open');
            } else {
                event.target.parentNode.classList.add('open');
            }
        },
        toggleFilters() {
            this.showFilters = !this.showFilters;
        },
        updateDisplayMode(mode) {
            this.displayMode = +mode;
            localStorage.setItem("filterlist-display-mode", mode);
            return mode;
        }
    },
    computed: {
        CurrentPage: {
            get() {
                return this.filterData.page;
            }
        },
        IsPriceSortAllowed: {
            get() {
                return this.isUserLoggedIn;
            }
        },
        IsPriceSortTheOnlyOption: {
            get() {
                return this.model?.sortOptions.length === 1 && this.model?.sortOptions.includes('Price');
            }
        },
        LastPage: {
            get() {
                return this.filterData.pageSize > 0 ? Math.ceil(this.filterData.totalCount === 0 ? 1 : this.filterData.totalCount / this.filterData.pageSize) : 0;
            }
        },
        ListDistances: {
            get() {
                return this.model?.additionalFields ? (this.model?.additionalFields?.length >= 3 ? this.distances_three_fields : (this.model?.additionalFields?.length === 2 ? this.distances_two_fields : (this.model?.additionalFields?.length === 1 ? this.distances_one_field : this.distances_default))) : [1]
            }
        },
        NextPage: {
            get() {
                return this.filterData.page + 1;
            }
        },
        PreviousPage: {
            get() {
                return this.filterData.page - 1;
            }
        },
        ShowFirstPage: {
            get() {
                return this.filterData.page > 1;
            }
        },
        ShowLastPage: {
            get() {
                return this.filterData.page < this.LastPage;
            }
        },
        ShowNextPage: {
            get() {

                return this.filterData.page < this.LastPage - 1;
            }
        },
        ShowPagination: {
            get() {
                return this.filterData.totalCount > this.filterData.pageSize;
            }
        },
        ShowPreviousPage: {
            get() {
                return this.filterData.page > 2;
            }
        }
    }
};

app.component('filterlistdefault', {
    extends: filterlistdefault,
    template: '#filterlistdefault'
});