const productlistitem = {
    props: {
        model: {
            type: Object,
            required: true
        },
        isCalculated: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            product: this.model,
            brands: [],
            categories: [],
            showAddToListModal: false,
            lists: [],
            isUserLoggedIn: this._global.isAuthenticated,
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
    mounted() {
        this.product.variant = this.product.productVariants[0]
        var brandids = [];
        var categoryids = [];
        if (this.product.brandId) {
            if (!brandids.includes(this.product.brandId)) {
                brandids.push(this.product.brandId)
            }
        }
        if (this.product.categoryId) {
            if (!categoryids.includes(this.product.categoryId)) {
                categoryids.push(this.product.categoryId)
            }
        }
        this._findBrandsByIds(brandids, e => {
            this.brands = e;
        })
        this._findCategoriesByIds(categoryids, e => {
            this.categories = e;
        })
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
        handleImageError(event) {
            event.target.src = this._getNoImageUrl();
        },
        initializeCheckedShoppingLists() {
            this.lists.forEach(list => {
                list.items === null ? list.items = [] : null;
                var exists = list.items.find(i => i.productId === this.product.id && i.productVariantId === this.product.productVariants[this.activeProduct].id);
                exists ? list.checked = true : list.checked = false;
                if(exists && !this.checkIfExistsInList) {
                    this.checkIfExistsInList = true;
                }
            });
        },
        updateShoppingList(list) {
            list.checked = !list.checked;
            var checked = list.checked;
            if (list.checked) {
                list.items.push({
                    productId: this.product.id,
                    productVariantId: this.product.productVariants[this.activeProduct].id,
                });
            } else {
                list.items = list.items.filter(i => i.productid !== this.product.id && i.productVariantId !== this.product.productVariants[this.activeProduct].id);
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
}

app.component('productlistitem', {
    extends: productlistitem,
    template: '#productlistitem'
});