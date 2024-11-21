const orders = {
    data() {
        return {
            orders: [],
            modal: null,
            showModal: false,
            isLoading: false,
            isLoadingMore: false,
            selectedOrder: null,
            currentPage: 1,
            pageCount: 1,
            productLinks: {},
            orderQuantitySteps: {},
            minOrderQuantities: {},
            searchText: "",
            timerId: "",
            allOrder: null,
            perPage: 2,
        }
    },
    mounted() {
        this.getOrders();
        this.getAllOrders();
        this.modal = document.getElementById("order-details");
    },
    methods: {
        async addToCart(order) {
            try {
                if (order.lines !== null && order.lines.length > 0) {
                    var cartItems = [];
                    order.lines.forEach(line => {
                        var cartitem = new Object();
                        cartitem.productVariantId = line.productVariantId;
                        cartitem.productId = line.productId;
                        cartitem.quantity = line.quantity;
                        cartItems.push(cartitem);

                    })
                    await this._addToCartMulti(cartItems);
                }
            }
            catch (error) {
            }
        },
        calculateCurrency(price) {
            return this._calculateCurrency(price, 2);
        },
        async checkout(order) {
            try {
                await this.addToCart(order);
                window.location.href = "/checkout";
            }
            catch (error) {
            }
        },
        closeModal() {
            this.showModal = !this.showModal;
            this.modal.style.display = "";
            document.querySelector('.modal-backdrop').remove();
        },
        async fetchProductPrices(product) {
            let prod = await this.getProduct(product);
            this.orderQuantitySteps[product.productId] = prod.productVariants.find(e => e.id === product.productVariantId).orderQuantityStep;
            this.minOrderQuantities[product.productId] = prod.productVariants.find(e => e.id === product.productVariantId).minOrderQuantity;
        },
        async fetchProductUrl(productId) {
            if (!this.productLinks[productId]) {
                try {
                    const url = await this.getUrlOfProduct(productId);
                    this.productLinks[productId] = url;
                } catch (error) {
                    this.productLinks[productId] = '#';
                }
            }
        },
        formatDate(date) {
            var newDate = new Date(date);
            newDate = newDate.getDate() + '/' + (newDate.getMonth() + 1) + '/' + newDate.getFullYear()
            return newDate;
        },
        async getCartAfterQuantityChange(currvalue, product) {
            let parentProduct = await this.getProduct(product);
            let activeVariantIndex = parentProduct.productVariants.findIndex(el => el.id === product.productVariantId);
            product.selectedQuantity = this._onQuantityChange(currvalue, parentProduct, activeVariantIndex, []);
            product.quantity = product.selectedQuantity;
        },
        getOrders() {
            this.isLoading = true;

            let params = {
                page: this.currentPage,
                pageSize: 4
            }

            this._getOrders(params, e => {
                this.isLoading = false;
                if(this.orders.length > 0) {
                    this.orders = this.orders.concat(e.model.item1);
                } else {
                    this.orders = e.model.item1;
                }
                this.currentPage = e.model.item2.pageNumber;
                this.pageCount = e.model.item2.numberOfPages;
                this.totalCount = e.model.item2.totalCount;
            });
        },
        getAllOrders() {
            let params = {
                page: 1,
                pageSize: 10000000
            }

            this._getOrders(params, e => {
                this.allOrder = e.model.item1;
            });
        },
        getMoreOrders() {
            if (!this.isLoadingMore) {
                this.isLoadingMore = true;
                setTimeout(() => {
                    this.currentPage++;
                    this.getOrders();
                    this.isLoadingMore = false;
                }, 1000);
            }
        },
        async getProduct(product) {
            return new Promise((resolve, reject) => {
                this._findProductsByIds([product.productId], false, (response) => {
                    if (response && response.length > 0) {
                        resolve(response[0]);
                    } else {
                        reject(new Error('Product not found'));
                    }
                });
            });
        },
        async getUrlOfProduct(productId) {
            return new Promise((resolve, reject) => {
                this._findProductsByIds([productId], false, (response) => {
                    if (response && response.length > 0) {
                        resolve('/' + response[0].link);
                    } else {
                        reject(new Error('Product not found'));
                    }
                });
            });
        },
        getUserById() {
            this._getRetailUserProfile(e => {
                this.user = e.user;
                this.showModal = !this.showModal;
            });
        },
        handleScroll() {
          const scrollContainer = this.$refs.scrollContainer;
          if (scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight && (this.currentPage + 1 <= this.pageCount)) {
            this.getMoreOrders();
          }
        },
        nextPage() {
            if (this.currentPage + 1 <= this.pageCount)
                this.pagination(this.currentPage + 1)
        },
        pagination(page) {
            this.currentPage = page;
            this.getOrders();
        },
        prevPage() {
            if (this.currentPage - 1 > 0)
                this.pagination(this.currentPage - 1)
        },
        search() {
            if (this.searchText !== '') {
                this.orders = this.allOrder.filter(el => el.code.includes(this.searchText));
                this.totalCount = this.orders.length;
            } else {
                this.currentPage = 1;
                this.orders = [];
                this.getOrders();
            }
        },
        showOrder(order) {
            var backdrop = document.createElement("div");
            backdrop.classList.add("modal-backdrop", "fade", "show");
            document.body.appendChild(backdrop);
            this.modal.style.display = "block";
            this.selectedOrder = order;
            this.selectedOrder.lines.forEach(line => {
                this.fetchProductUrl(line.productId);
                this.fetchProductPrices(line);
            })

            if (order.userId) {
                this.getUserById(order.userId);
            } else {
                this.showModal = !this.showModal;
            }
        }
    },
    computed: {
        FirstPage: {
            get() {
                return 1;
            }
        },
        NextPage: {
            get() {
                return this.currentPage + 1;
            }
        },
        PreviousPage: {
            get() {
                return this.currentPage - 1;
            }
        },
        LastPage: {
            get() {
                return this.pageCount;
            }
        },
        ShowFirstPage: {
            get() {
                return this.currentPage > 1;
            }
        },
        ShowLastPage: {
            get() {
                return this.currentPage < this.LastPage;
            }
        },
        ShowNextPage: {
            get() {

                return this.currentPage < this.LastPage - 1;
            }
        },
        ShowPreviousPage: {
            get() {
                return this.currentPage > 2;
            }
        },
        ShowNext: {
            get() {
                return this.currentPage < this.LastPage;
            }
        },
        ShowPrevious: {
            get() {
                return this.currentPage > 1;
            }
        }
    }
}

app.component('orders', {
    extends: orders,
    template: '#orders'
});