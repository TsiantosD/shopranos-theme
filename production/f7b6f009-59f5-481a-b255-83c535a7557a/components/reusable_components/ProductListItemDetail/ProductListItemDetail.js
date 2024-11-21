const productlistitemdetail = {
    props: {
        model: Object,
        additionalFields: Array,
        brands: Array,
        categories: Array,
        isCalculated: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            product: this.model,
            title: this._filterList.record.title,
            lists: [],
            isUserLoggedIn: this._global.isAuthenticated,
            maxPrice: null,
            minPrice: null,
            url: null,
            showAddToListModal: false,
            lists: [],
            checkIfExistsInList: false,
            activeProduct: 0
        }
    },
    beforeMount() {
        if (this.isUserLoggedIn) {
            this._getShoppingLists(e => {
                this.lists = e;
                this.initializeCheckedShoppingLists();
            });
        }
    },
    methods: {
        checkStyle() {
            if (this.checkIfExistsInList) {
                return 'listActive'
            } 
        },
        closeAddToListModal() {
            this.showAddToListModal = false;
            this.$refs.addToList.style.display = "";
            document.querySelector('.modal-backdrop').remove();
        },
        createList() {
            if (this.title !== null && this.title !== "") {
                let data = { title: this.title };
                this._createShoppingList(data, e => {
                    this.title = '';
                    this._getShoppingLists(e => {
                        this.lists = e;
                        this.initializeCheckedShoppingLists();
                    });
                });
            }

        },
        getFieldValue(product, name) {
            if (name && name.split(".").length > 1) {
                const keys = name.split(".");
                let property = this.product;
                for (const key of keys) {
                    property = property[Object.keys(property).find(prop => prop.toLowerCase() === key.toLowerCase())];
                    if (!property || property === null || property === "" || property === "" || property === "0")
                        return 0;
                }
                return property ?? 0;
            } else {
                if (name.toLowerCase() == "brand") {
                    // var brand = this.brands.find(b => b.id === product.brandId)
                    // return brand?.name;
                    return this.product.brand?.name;
                }
                if (name.toLowerCase() == "category") {
                    // var cat = this.categories.find(c => c.id === product.categoryId)
                    // return cat?.title;
                    return this.product.category?.title;
                }
                else {
                    var property = product[Object.keys(product).find(key => key.toLowerCase() === name.toLowerCase())];
                    if (!property || property === null || property == "" || property == "" || property == "0")
                        return 0;
                    return property;
                }
            }
        },
        handleAddToListModal() {
            this._getShoppingLists(e => {
                this.lists = e;
                this.initializeCheckedShoppingLists();
            });
            const body = document.querySelector("body");
            this.showAddToListModal = true;
            this.$refs.addToList.style.display = "block";
            var backdrop = document.createElement("div");
            backdrop.classList.add("modal-backdrop", "fade", "show");
            document.body.appendChild(backdrop);
            body.appendChild(this.$refs.addToList)

        },
        handleFieldUrl(product, field) {
            if (field == "brand") {
                if (this.product.brand?.alias) {
                    window.location.href = `/brand/${this.product.brand.alias}`;
                }
            }
            if (field == "category") {
                if (this.product.brand?.alias) {
                    window.location.href = `/category/${this.product.brand.alias}`;
                }
            }
        },
        isValidUrl(string) {
            try {
                const url = new URL(string);
                return url.protocol === 'http:' || url.protocol === 'https:';
            } catch (err) {
                return false;
            }
        },
        initializeCheckedShoppingLists() {
            this.lists.forEach(list => {
                list.items === null ? list.items = [] : null;
                var exists = list.items.find(i => i.productId === this._product.id && i.productVariantId === this._product.productVariants[this.activeProduct].id);
                exists ? list.checked = true : list.checked = false;
                if(exists && !this.checkIfExistsInList) {
                    this.checkIfExistsInList = true;
                }
            });
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
        updateShoppingList(list) {
            list.checked = !list.checked;
            var checked = list.checked;
            if (list.checked) {
                list.items.push({
                    productId: this._product.id,
                    productVariantId: this._product.productVariants[this.activeProduct].id,
                });
            } else {
                list.items = list.items.filter(i => i.productid !== this._product.id && i.productVariantId !== this._product.productVariants[this.activeProduct].id);
            }
            this._updateShoppingList(list, e => {
                list = e;
                if (checked) {
                    var tooltiptextClassAded = document.getElementById(`${list.id}-tooltip-text-added`);
                    tooltiptextClassAded.className = "ms-2 tooltiptext-custom";
                    setTimeout(() => tooltiptextClassAded.className = "ms-2 d-none", 2000);

                } else {
                    var tooltiptextClasstRemoved = document.getElementById(`${list.id}-tooltip-text-removed`);
                    tooltiptextClasstRemoved.className = "ms-2 tooltiptext-custom";
                    setTimeout(() => tooltiptextClasstRemoved.className = "ms-2 d-none", 2000);
                }
            })
            this.checkIfExistsInList = false;
            this.initializeCheckedShoppingLists();
        }
    }
};

app.component('productlistitemdetail', {
    extends: productlistitemdetail,
    template: '#productlistitemdetail'
});