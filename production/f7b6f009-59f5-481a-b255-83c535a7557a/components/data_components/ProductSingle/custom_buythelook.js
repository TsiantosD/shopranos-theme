const productsinglecustom_buythelook = {
    props: {
        model: Object,
    },
    data() {
        return {
            productData: this._product,
            bundleProduct: null,
            activeBundleProduct: 0,
            activeBundleVariantId: '',
            selectedBundleQuantity: 0,
            totalBundleProductQuantity: 0,
            variantId: null,
            cartData: "",
            variant: null,
            isLoading: false,
            activeProduct: 0,
            selectedQuantity: 0,
            lists: [],
            isUserLoggedIn: this._global.isAuthenticated,
            imageList: [],
            showAddToListModal: false,
            orderQuantityStep: this._product.productVariants[0].orderQuantityStep,
            title: "",
            brand: null,
            category: null,
            mainSwiperImages: [],
            mainSwiper: null,
            hasFound: false,
            activeVariantId: '',
            dimension1Array: [],
            dimension2Array: [],
            inputChange: '',
            masterRelatedProducts: [],
            totalProductQuantity: 0,
            checkIfExistsInList: false
        }
    },
    beforeMount() {
        this._getCart(e => {
            this.cartData = e;

            if (this.cartData === null) {
                this.selectedQuantity = this._findSelected(this._product.productVariants[this.activeProduct], []);
            } else {
                this.selectedQuantity = this._findSelected(this._product.productVariants[this.activeProduct], this.cartData.cartItems);
                if (this.cartData.cartItems.find((p) => p.productVariantId === this._product.productVariants[this.activeProduct].id))
                    this.totalProductQuantity = this.cartData.cartItems.find((p) => p.productVariantId === this._product.productVariants[this.activeProduct].id).quantity;
            }
        });

        this._product.productVariants[this.activeProduct].selectedQuantity = this.selectedQuantity
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const sku = urlParams.get('sku');
        if (sku !== null) {
            var variant = this.productData.productVariants.find(v => v.sku === sku);
            if (variant !== null && variant !== undefined) {
                this.variant = variant;
                this.variantId = this.variant.id;
            }
        }
        if (this.isUserLoggedIn) {
            this._getShoppingLists(e => {
                this.lists = e;
                this.initializeCheckedShoppingLists();
            });
        }
        this.productData.variant = this._product.productVariants[this.activeProduct];
        if (this.productData.variant.salesUnitId != null) {
            this._findUnitsByIds([this.productData.variant.salesUnitId, this.productData.variant.unitId], units => {
                this.productData.variant.unit = units.find(u => u.id == this.productData.variant.salesUnitId)?.name;
                var unit = units.find(u => u.id == this.productData.variant.unitId);
                this.productData.variant.unitPriceWithDescr = `${this.calculateCurrency(this.productData.variant.unitPrice)} / ${unit?.name}`;
            })
        }
        this._findBrandsByIds([this.productData?.brandId], e => {
            this.brand = e[this.activeProduct];
        })
        this._findCategoriesByIds([this.productData?.categoryId], e => {
            this.category = e[this.activeProduct];
        })

        this.productData.productVariants.forEach(variant => {
            if (this.cartData === null) {
                variant.selectedQuantity = this._findSelected(variant, []);
            } else {
                variant.selectedQuantity = this._findSelected(variant, this.cartData.cartItems);
            }
        })
    },
    mounted() {        
        this.$nextTick(function () {
            this.mainSwiperImages = document.querySelectorAll('.main-product-swiper img');

            var gallery = document.querySelectorAll('.gallery');
            if (gallery.length) {
                for (var i = 0; i < gallery.length; i++) {
                    lightGallery(gallery[i], {
                        selector: '.gallery-item',
                        download: false,
                    });
                }
            }
            this.initiateSwiper();

            if (this.checkVariantProduct(false, this.productData)) {
                this.setVariants(this.productData, '.product-variants');
                this.productData.productVariants.forEach(variant => {
                    if (variant.retail !== null && variant.retail.salesUnitId != null) {
                        this._findUnitsByIds([variant.retail.salesUnitId, this.productData.variant.unitId], units => {
                            variant.retail.unit = units.find(u => u.id == variant.retail.salesUnitId)?.name;
                            var unit = units.find(u => u.id == variant.retail.unitId);
                            variant.retail.unitPriceWithDescr = `${this.calculateCurrency(variant.retail.unitPrice)} / ${unit?.name}`;
                        })
                    }
                });
            }
        
            if (this.productData.id === "09a0aaba-3506-4b59-9564-a4d76ad6ed8c") {
                this.fetchProductDetails();
            }
        });
        if (this.productData.mediaItems != null)
            this.imageList = this.productData.mediaItems.filter(i => (i.mediaType == 0 || i.mediaType == "Image"));

        this.addToCartEvent();
        emitter.on('stop-load', e => {
            this.isLoading = false;
        });
        this._setLastVisited(this._product.id, this._product.productVariants[this.activeProduct].id);
        if (this.model.showRelatedProducts) {
            this.getMasterIdRelatedProducts();
        }
    },
    methods: {
        async addAllToCart(e) {
            var clickedElement = e.target;
            clickedElement.classList.add('clicked');
            clickedElement.classList.add('disabled');
            await this._addToCartAsync(this.productData.id, this.productData.productVariants[this.activeProduct].id, this.productData.productVariants[this.activeProduct].selectedQuantity);
            await this._addToCartAsync(this.bundleProduct.id, this.bundleProduct.productVariants[this.activeBundleProduct].id, this.bundleProduct.productVariants[this.activeBundleProduct].selectedQuantity);

            setTimeout(() => {
                this._getCart(e => {
                    this.cartData = e;
                });

                clickedElement.classList.remove('clicked');
                clickedElement.classList.remove('disabled');
                clickedElement.classList.remove('btn-secondary');
                clickedElement.classList.add('btn-primary');
                clickedElement.querySelector('.cart-item-circle').classList.remove('d-none');
                clickedElement.querySelector('.s-plus').classList.add('d-none');
                if (this.cartData === null) {
                    this.productData.productVariants[this.activeProduct].selectedQuantity = this._findSelected(this.productData.productVariants[this.activeProduct], []);
                    this.bundleProduct.productVariants[this.activeBundleProduct].selectedQuantity = this._findSelected(this.bundleProduct.productVariants[this.activeBundleProduct], []);
                } else {
                    this.productData.productVariants[this.activeProduct].selectedQuantity = this._findSelected(this.productData.productVariants[this.activeProduct], this.cartData.cartItems);
                    this.bundleProduct.productVariants[this.activeBundleProduct].selectedQuantity = this._findSelected(this.bundleProduct.productVariants[this.activeBundleProduct], this.cartData.cartItems);
                    if (this.cartData.cartItems.find((p) => p.productVariantId === this._product.productVariants[this.activeProduct].id) !== undefined) {
                        this.totalProductQuantity = this.cartData.cartItems.find((p) => p.productVariantId === this._product.productVariants[this.activeProduct].id).quantity;
                    }
                    if (this.cartData.cartItems.find((p) => p.productVariantId === this.bundleProduct.productVariants[this.activeBundleProduct].id) !== undefined) {
                        this.totalBundleProductQuantity = this.cartData.cartItems.find((p) => p.productVariantId === this.bundleProduct.productVariants[this.activeBundleProduct].id).quantity;
                    }
                }

            }, 1500);
        },
        async addToCart(e) {
            var clickedElement = e.target;
            clickedElement.classList.add('clicked');
            clickedElement.classList.add('disabled');
            await this._addToCartAsync(this.productData.id, this.productData.productVariants[this.activeProduct].id, this.productData.productVariants[this.activeProduct].selectedQuantity);

            setTimeout(() => {
                this._getCart(e => {
                    this.cartData = e;
                });

                clickedElement.classList.remove('clicked');
                clickedElement.classList.remove('disabled');
                clickedElement.classList.remove('btn-secondary');
                clickedElement.classList.add('btn-primary');
                clickedElement.querySelector('.cart-item-circle').classList.remove('d-none');
                clickedElement.querySelector('.s-plus').classList.add('d-none');
                if (this.cartData === null) {
                    this.productData.productVariants[this.activeProduct].selectedQuantity = this._findSelected(this.productData.productVariants[this.activeProduct], []);
                } else {
                    this.productData.productVariants[this.activeProduct].selectedQuantity = this._findSelected(this.productData.productVariants[this.activeProduct], this.cartData.cartItems);
                    if (this.cartData.cartItems.find((p) => p.productVariantId === this._product.productVariants[this.activeProduct].id) !== undefined) {
                        this.totalProductQuantity = this.cartData.cartItems.find((p) => p.productVariantId === this._product.productVariants[this.activeProduct].id).quantity;
                    }
                }

            }, 1500);
        },
        addToCartEvent() {
            let cartButtons = document.querySelectorAll('.cart-button');
            let qtyInput = document.querySelector('.product-quantity input');
            cartButtons.forEach(button => {
                button.addEventListener('click', e => {
                    button.classList.add('clicked');
                    button.classList.add('disabled');
                    setTimeout(() => {
                        button.classList.remove('clicked');
                        button.classList.remove('disabled');
                        this._getCart(e => {
                            this.cartData = e;

                            this.productData.productVariants[this.activeProduct].selectedQuantity = this._findSelected(this._product.productVariants[this.activeProduct], this.cartData.cartItems);
                            qtyInput.value = this.productData.productVariants[this.activeProduct].selectedQuantity;
                            if (this.productData.productVariants[this.activeProduct].selectedQuantity === 0) {
                                this.productData.productVariants[this.activeProduct].canOrder = false;
                                button.classList.add('disabled');
                            } else {
                                button.classList.remove('disabled');
                            }
                        });

                    }, 2700)
                });
            });
        },
        async addToCartMultiple(product) {
            document.getElementById("cart-" + product.productVariants[0].id).classList.toggle("hidden");
            document.getElementById("spinner-" + product.productVariants[0].id).classList.toggle("hidden");
            await this._addToCartAsync(product.id, product.productVariants[0].id, product.productVariants[0].selectedQuantity);
            product.productVariants[0].selectedQuantity = product.productVariants[0].suggestedOrderQuantity !== null && product.productVariants[0].suggestedOrderQuantity > 0 ? product.productVariants[0].suggestedOrderQuantity : (product.productVariants[0].orderQuantityStep !== null && product.productVariants[0].orderQuantityStep > 0 ? product.productVariants[0].orderQuantityStep : 1);
            document.getElementById("cart-" + product.productVariants[0].id).classList.toggle("hidden");
            document.getElementById("spinner-" + product.productVariants[0].id).classList.toggle("hidden");
        },
        calculateCurrency(price) {
            return this._calculateCurrency(price)
        },
        checkStyle() {
            if (this.checkIfExistsInList) {
                return 'listActive'
            }
        },
        checkVariantProduct(isFound, data) {
            var foundVar = isFound;
            if (!foundVar) {
                var flag = false;
                foundVar = true;

                if (data.productVariants.length > 1) {
                    data.productVariants.forEach(variant => {
                        if (!flag) {
                            if (variant.canOrder) {
                                this.activeVariantId = variant.dimension1ItemId;
                                flag = true;
                            }
                        }
                    });
                }

                return flag;
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
        async fetchProductDetails() {
            
            let criteria = {
                page: 1,
                pageSize: 1,
                sort: '-SortDate',
                search: "ASOS DESIGN Nobu",
            };
            this._findProductsByCriteria(criteria, data => {
                this.bundleProduct = data[0];
                this._getCart(e => {
                    this.cartData = e;
        
                    if (this.cartData === null) {
                        this.selectedBundleQuantity = this._findSelected(this.bundleProduct.productVariants[this.activeBundleProduct], []);
                    } else {
                        this.selectedBundleQuantity = this._findSelected(this.bundleProduct.productVariants[this.activeBundleProduct], this.cartData.cartItems);
                        if (this.cartData.cartItems.find((p) => p.productVariantId === this.bundleProduct.productVariants[this.activeBundleProduct].id))
                            this.totalBundleProductQuantity = this.cartData.cartItems.find((p) => p.productVariantId === this.bundleProduct.productVariants[this.activeBundleProduct].id).quantity;
                    }
                });
            })

            // const alias = "asos-design-nobu-strappy-tie-leg-heeled-sandals-in-gold";
            // const lang = this._getCulture(); // Adjust this to get the language in your Vue component

            // try {
            //     // Send the GET request with alias and extended parameters
            //     const response = await axios.get(`/api/extended/${alias}`, {
            //         params: {
            //             lang: lang,
            //             extend: "StockAvailability,AttributesInProduct,IcoTags,Dimensions"
            //         }
            //     });
                
            //     // Check for a valid product response
            //     if (!response.data) {
            //         throw new Error("Product not found");
            //     }

            //     // Track or process product data if needed
            //     console.log("Product Data:", response.data);

            //     return response.data; // Return or use product data as needed
            // } catch (error) {
            //     if (error.response && error.response.status === 404) {
            //         console.error("Product not found");
            //     } else {
            //         console.error("Error fetching product details:", error.message);
            //     }
            // }


            // let criteria = {
            //     page: 1,
            //     pageSize: 1,
            //     sort: '-SortDate',
            //     search: "ASOS DESIGN Nobu",
            // };
            // this._findProductsByCriteria(criteria, data => {
            //     this.bundleProduct = data[0];
            //     console.log("bundleProduct: ", this.bundleProduct);
            
            //     // if (this.checkVariantProduct(false, this.bundleProduct)) {
            //     //     this.setVariants(this.bundleProduct, '.bundle-product-variants');
            //     //     this.bundleProduct.productVariants.forEach(variant => {
            //     //         if (variant.retail !== null && variant.retail.salesUnitId != null) {
            //     //             this._findUnitsByIds([variant.retail.salesUnitId, this.productData.variant.unitId], units => {
            //     //                 variant.retail.unit = units.find(u => u.id == variant.retail.salesUnitId)?.name;
            //     //                 var unit = units.find(u => u.id == variant.retail.unitId);
            //     //                 variant.retail.unitPriceWithDescr = `${this.calculateCurrency(variant.retail.unitPrice)} / ${unit?.name}`;
            //     //             })
            //     //         }
            //     //     });
            //     // }
            // })
        },
        getActiveImage(mediaItemId) {
            var slidePosition = 1;

            if (this.mainSwiper == null) {
                this.mainSwiperImages = document.querySelectorAll('.main-product-swiper img');
            } else {
                this.mainSwiperImages = this.mainSwiper.el.querySelectorAll('img');
            }


            if (mediaItemId !== null) {
                var getVariantLinkedImageLink = this.productData.mediaItems.find((value) => value.id === mediaItemId).link;

                this.mainSwiperImages.forEach((element, index) => {
                    if (element.src === getVariantLinkedImageLink) {
                        slidePosition = index;
                    }
                });
            }

            return slidePosition;
        },
        getFieldValue(name) {
            if (name && name.split(".").length > 1) {
                const keys = name.split(".");
                let property = this.productData;
                for (const key of keys) {
                    property = property[Object.keys(property).find(prop => prop.toLowerCase() === key.toLowerCase())];
                    if (!property || property === null || property === "" || property === " " || property === "0")
                        return 0
                }
                return property || 0;
            } else {
                if (name.toLowerCase() == "brand") {
                    return this.brand?.name;
                }
                if (name.toLowerCase() == "category") {
                    return this.category?.title;
                }
                else {
                    var property = this.productData[Object.keys(this.productData).find(key => key.toLowerCase() === name.toLowerCase())];
                    if (!property || property === null || property === "" || property === " " || property === "0")
                        return 0;
                    return property || 0;
                }
            }
        },
        getMasterIdRelatedProducts() {
            if (this._product?.masterId == null) {
                this._product.productVariants[0].selectedQuantity = this._product.productVariants[0].suggestedOrderQuantity !== null && this._product.productVariants[0].suggestedOrderQuantity > 0 ? this._product.productVariants[0].suggestedOrderQuantity : (this._product.productVariants[0].minOrderQuantity !== null && this._product.productVariants[0].minOrderQuantity > 0 ? this._product.productVariants[0].minOrderQuantity : (this._product.productVariants[0].orderQuantityStep !== null && this._product.productVariants[0].orderQuantityStep > 0 ? this._product.productVariants[0].orderQuantityStep : 1));
                this.masterRelatedProducts.push(this._product);
                this.getRelatedProducts(this._product?.id);
            }
            else
                this.getRelatedProducts(this._product?.masterId);
        },
        getRelatedProducts(id) {
            this._getMasterIdRelatedProducts(id, e => {
                if (e.data.length > 0) {
                    this.masterRelatedProducts = e.data;
                    this.masterRelatedProducts = this.masterRelatedProducts.sort((a, b) => {
                        if (a.productVariants[0].sku < b.productVariants[0].sku) {
                            return -1;
                        }
                        if (a.productVariants[0].sku > b.productVariants[0].sku) {
                            return 1;
                        }
                        return 0;
                    });
                    this.masterRelatedProducts = this.masterRelatedProducts.filter(r => r.id != this._product.id);
                    this.masterRelatedProducts.unshift(this._product);
                    this.masterRelatedProducts.forEach(p => {
                        p.productVariants[0].selectedQuantity = p.productVariants[0].suggestedOrderQuantity !== null && p.productVariants[0].suggestedOrderQuantity > 0 ? p.productVariants[0].suggestedOrderQuantity : (this._product.productVariants[0].minOrderQuantity !== null && p.productVariants[0].minOrderQuantity > 0 ? p.productVariants[0].minOrderQuantity : (p.productVariants[0].orderQuantityStep !== null && p.productVariants[0].orderQuantityStep > 0 ? p.productVariants[0].orderQuantityStep : 1));
                        if (p.productVariants[0].salesUnitId != null) {
                            this._findUnitsByIds([p.productVariants[0].salesUnitId, p.productVariants[0].unitId], units => {
                                p.productVariants[0].unit = units.find(u => u.id == p.productVariants[0].salesUnitId)?.name;
                            })
                        }
                    });
                }
            })
        },
        getVariantCode(numType) {
            if (numType === 0 || numType === 'Text') {
                return 'text';
            } else if (numType === 1 || numType === 'Items') {
                return 'items';
            } else if (numType === 2 || numType === 'Color') {
                return 'color';
            } else if (numType === 3 || numType === 'Size') {
                return 'size';
            }
        },
        handleAddToListModal() {
            this._getShoppingLists(e => {
                this.lists = e;
                this.initializeCheckedShoppingLists();
            });
            this.showAddToListModal = true;
            this.$refs.addToList.style.display = "block";
            var backdrop = document.createElement("div");
            backdrop.classList.add("modal-backdrop", "fade", "show");
            document.body.appendChild(backdrop);
        },
        initializeCheckedShoppingLists() {
            this.checkIfExistsInList = false;
            this.lists.forEach(list => {
                list.items === null ? list.items = [] : null;
                var exists = list.items.find(i => i.productId === this._product.id && i.productVariantId === this._product.productVariants[this.activeProduct].id);
                exists ? list.checked = true : list.checked = false;
                if (exists && !this.checkIfExistsInList) {
                    this.checkIfExistsInList = true;
                }
            });
        },
        initiateSwiper() {
            if (this.imageList != null && this.imageList.length > 1) {
                this.sideSwiper = new Swiper(".side-product-swiper", {
                    loop: true,
                    spaceBetween: 12,
                    slidesPerView: 4,
                    freeMode: false,
                    watchSlidesProgress: true,
                    breakpoints: {
                        700: {
                            spaceBetween: 12,
                            slidesPerView: 5,
                        },
                        1100: {
                            spaceBetween: 24,
                            slidesPerView: 3,
                        },
                    }
                });
                this.mainSwiper = new Swiper(".main-product-swiper", {
                    loop: true,
                    spaceBetween: 0,
                    initialSlide: this.getActiveImage(this.productData.productVariants[this.activeProduct].mediaItem.id),
                    thumbs: {
                        swiper: this.sideSwiper,
                    },
                });
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
        onErrorCalculation(e) {
        },
        onMasterQuantityChange(currvalue, product) {
            this._calculateCart(this.onSuccessCalculation, this.onErrorCalculation);
            this._getCart(e => {
                this.cartData = e;
                if (this.cartData === null) {
                    this._onQuantityChange(currvalue, product, 0, []);
                } else {
                    this._onQuantityChange(currvalue, product, 0, this.cartData.cartItems);
                }
            });
        },
        onSuccessCalculation(e) {
            this.cartData = e;
        },
        onQuantityChange(currvalue) {
            this._calculateCart(this.onSuccessCalculation, this.onErrorCalculation);
            this._getCart(e => {
                this.cartData = e;
                if (this.cartData === null) {
                    this._onQuantityChange(currvalue, this.productData, this.activeProduct, []);
                } else {
                    this._onQuantityChange(currvalue, this.productData, this.activeProduct, this.cartData.cartItems);
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
        setActiveProduct(currDimensionItemId) {

            var flagChecked = false;

            if (this.dimension1Array.includes(currDimensionItemId)) {

                if (document.getElementById(currDimensionItemId) !== null) {
                    document.getElementById(currDimensionItemId).checked = "checked";

                    if (this.dimension2Array.length > 0) {
                        this.productData.productVariants.forEach(variant => {
                            if (variant.canOrder) {
                                var dimensionItemId2 = variant.dimension2ItemId;
                                document.getElementById(dimensionItemId2).disabled = "disabled";
                            }
                        });
                        this.productData.productVariants.forEach(variant => {
                            if (variant.canOrder) {
                                var dimensionItemId2 = variant.dimension2ItemId;
                                if (variant.dimension1ItemId === currDimensionItemId) {
                                    if (!flagChecked) {
                                        flagChecked = true;
                                        this.activeProduct = this.productData.productVariants.findIndex(e => (e.dimension1ItemId === currDimensionItemId) && (e.dimension2ItemId === dimensionItemId2));
                                        document.getElementById(dimensionItemId2).checked = "checked";
                                    }
                                    document.getElementById(dimensionItemId2).disabled = false;
                                }
                            }
                        });
                    } else {
                        this.activeProduct = this.productData.productVariants.findIndex(e => (e.dimension1ItemId === currDimensionItemId));
                    }
                    this.updateActiveVariantInfo();

                }
            } else if (this.dimension2Array.includes(currDimensionItemId)) {
                if (document.getElementById(currDimensionItemId) !== null) {
                    document.getElementById(currDimensionItemId).checked = "checked";

                    if (this.dimension1Array.length > 0) {
                        if (document.querySelector('.attribute:first-child input:checked') !== null) {
                            var dimensionItemId1 = document.querySelector('.attribute:first-child input:checked').id;
                            this.activeProduct = this.productData.productVariants.findIndex(e => (e.dimension2ItemId === currDimensionItemId) && (e.dimension1ItemId === dimensionItemId1));
                        } else {
                            this.activeProduct = 0;
                        }

                    } else {
                        this.activeProduct = this.productData.productVariants.findIndex(e => (e.dimension2ItemId === currDimensionItemId));
                    }
                    this.updateActiveVariantInfo();
                }
            }

            if (this.cartData !== null && this.cartData.cartItems.find((p) => p.productVariantId === this.productData.productVariants[this.activeProduct].id) !== undefined) {
                this.totalProductQuantity = this.cartData.cartItems.find((p) => p.productVariantId === this.productData.productVariants[this.activeProduct].id).quantity;
            } else {
                this.totalProductQuantity = 0;
            }

            if (document.querySelector('.product-single .product-info .product-cart-qty button.cart-icon') !== null) {
                if (this.totalProductQuantity > 0) {
                    document.querySelector('.product-single .product-info .product-cart-qty button.cart-icon').classList.remove('btn-secondary');
                    document.querySelector('.product-single .product-info .product-cart-qty button.cart-icon').classList.add('btn-primary');
                    document.querySelector('.product-single .product-info .product-cart-qty button.cart-icon').querySelector('.cart-item-circle').classList.remove('d-none');
                    document.querySelector('.product-single .product-info .product-cart-qty button.cart-icon').querySelector('.s-plus').classList.add('d-none');
                } else {
                    document.querySelector('.product-single .product-info .product-cart-qty button.cart-icon').classList.remove('btn-primary');
                    document.querySelector('.product-single .product-info .product-cart-qty button.cart-icon').classList.add('btn-secondary');
                    document.querySelector('.product-single .product-info .product-cart-qty button.cart-icon').querySelector('.s-plus').classList.remove('d-none');
                    document.querySelector('.product-single .product-info .product-cart-qty button.cart-icon').querySelector('.cart-item-circle').classList.add('d-none');
                }
            }
        },
        setVariants(data, classes) {
            var str = "";
            var uniqueDims1 = [];
            var uniqueDims2 = [];
            
            if (data.dimension1 !== null && this.productData.variant.dimension1ItemId) {
                str += `<div class="attribute ${this.getVariantCode(data.dimension1.type)}">
                    <p class="variantName">${data.dimension1.name}</p>
                    <div class="variantValues">`;

                data.dimension1.items.forEach(dimensionItem => {
                    data.productVariants.forEach(variant => {
                        if ((variant.dimension1ItemId == dimensionItem.id) && !uniqueDims1.includes(dimensionItem.id)) {
                            uniqueDims1.push(dimensionItem.id);
                            if (!this.dimension1Array.includes(dimensionItem.id)) {
                                this.dimension1Array.push(dimensionItem.id);
                            }

                            str += `<div class="variantValue">
                                <input type="radio" name="${data.dimension1.name}" id="${dimensionItem.id}">
                                <label for="${dimensionItem.value}">`;

                            if (data.dimension1.name === 'Color') {
                                str += `<span style="--bgColor:${dimensionItem.textColor}">
                                        <span>${dimensionItem.value}</span>
                                    </span>`;
                            } else {
                                str += `<span>${dimensionItem.value}</span>`;
                            }

                            str += `</label>
                            </div>`;
                        }
                    });
                });

                str += `</div>
                </div>`;
            }

            if (data.dimension2 !== null && this.productData.variant.dimension2ItemId) {

                str += `<div class="attribute ${this.getVariantCode(data.dimension2.type)}">
                    <p class="variantName">${data.dimension2.name}</p>
                    <div class="variantValues">`;

                data.dimension2.items.forEach(dimensionItem => {
                    data.productVariants.forEach(variant => {
                        if ((variant.dimension2ItemId == dimensionItem.id) && !uniqueDims2.includes(dimensionItem.id)) {
                            uniqueDims2.push(dimensionItem.id);
                            if (!this.dimension2Array.includes(dimensionItem.id)) {
                                this.dimension2Array.push(dimensionItem.id);
                            }

                            str += `<div class="variantValue">
                                <input type="radio" name="${data.dimension2.name}" id="${dimensionItem.id}">
                                <label for="${dimensionItem.value}">`;

                            if (data.dimension2.name === 'Color') {
                                str += `<span style="--bgColor:${dimensionItem.textColor}">
                                        <span>${dimensionItem.value}</span>
                                    </span>`;
                            } else {
                                str += `<span>${dimensionItem.value}</span>`;
                            }

                            str += `</label>
                            </div>`;
                        }
                    });

                });

                str += `</div>
                </div>`;
            }

            document.querySelector(classes).innerHTML = str;

            uniqueDims1.every((dim, index) => {
                if (data.productVariants.find(el => el.dimension1ItemId === dim).canOrder) {
                    this.setActiveProduct(uniqueDims1[index]);
                    return false;
                }

                return true;
            })

            uniqueDims1.forEach((dim, index) => {
                if (
                    (data.productVariants.find(el => el.dimension1ItemId === dim).selectedQuantity === undefined || data.productVariants.find(el => el.dimension1ItemId === dim).selectedQuantity < 1) &&
                    ((data.productVariants.find(el => el.dimension1ItemId === dim).sellOutOfStock === undefined || !data.productVariants.find(el => el.dimension1ItemId === dim).sellOutOfStock) && data.productVariants.find(el => el.dimension1ItemId === dim).quantity < 1)
                ) {
                    data.productVariants.find(el => el.dimension1ItemId === dim).canOrder = false;
                }
                if (!(data.productVariants.find(el => el.dimension1ItemId === dim).canOrder) && !data.productVariants.find(el => el.dimension1ItemId === dim).sellOutOfStock) {
                    document.getElementById(dim).disabled = "disabled";
                }
            })

            if (document.querySelectorAll('.variantValues').length > 0) {
                document.querySelectorAll('.variantValues input').forEach(attributeInput => {
                    attributeInput.addEventListener('change', (event) => {
                        this.setActiveProduct(event.target.id);
                    });
                });
                document.querySelectorAll('.variantValues label').forEach(attributeLabel => {
                    if (attributeLabel.previousElementSibling.getAttribute('name') !== 'Color') {
                        if (attributeLabel.querySelector('span').innerText.length <= 3) {
                            attributeLabel.classList.add('rounded');
                        }
                    }
                });
            }


            return str;
        },
        updateActiveVariantInfo() {
            if (this.productData.productVariants[this.activeProduct].mediaItem.id !== null) {
                this.mainSwiper.slideTo(this.getActiveImage(this.productData.productVariants[this.activeProduct].mediaItem.id));
            }

            if (this.cartData === null) {
                this.selectedQuantity = this._findSelected(this._product.productVariants[this.activeProduct], []);
            } else {
                this.selectedQuantity = this._findSelected(this._product.productVariants[this.activeProduct], this.cartData.cartItems);
                if (this.cartData.cartItems.find((p) => p.productVariantId === this._product.productVariants[this.activeProduct].id) !== undefined) {
                    this.totalProductQuantity = this.cartData.cartItems.find((p) => p.productVariantId === this._product.productVariants[this.activeProduct].id).quantity;
                }
            }
            this.initializeCheckedShoppingLists();

            this._product.productVariants[this.activeProduct].selectedQuantity = this.selectedQuantity;
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
                    tooltiptextClassAded.className = "ms-2 text-primary";
                    setTimeout(() => tooltiptextClassAded.className = "ms-2 text-primary d-none", 2000);
                } else {
                    var tooltiptextClasstRemoved = document.getElementById(`${list.id}-tooltip-text-removed`);
                    tooltiptextClasstRemoved.className = "ms-2 text-primary";
                    setTimeout(() => tooltiptextClasstRemoved.className = "ms-2 text-primary d-none", 2000);
                }
            })
            this.checkIfExistsInList = false;
            this.initializeCheckedShoppingLists();
        }
    },
    updated() {
        if (document.querySelector('#but-' + this.productData.productVariants[this.activeProduct].id) !== null && this.totalProductQuantity > 0) {
            document.querySelector('#but-' + this.productData.productVariants[this.activeProduct].id).classList.remove('btn-secondary');
            document.querySelector('#but-' + this.productData.productVariants[this.activeProduct].id).classList.add('btn-primary');
            document.querySelector('#but-' + this.productData.productVariants[this.activeProduct].id).querySelector('.cart-item-circle').classList.remove('d-none');
            document.querySelector('#but-' + this.productData.productVariants[this.activeProduct].id).querySelector('.s-plus').classList.add('d-none');
        }
        if (this.bundleProduct && document.querySelector('#but-' + this.bundleProduct.productVariants[this.activeBundleProduct].id) !== null && this.totalBundleProductQuantity > 0) {
            document.querySelector('#but-' + this.bundleProduct.productVariants[this.activeBundleProduct].id).classList.remove('btn-secondary');
            document.querySelector('#but-' + this.bundleProduct.productVariants[this.activeBundleProduct].id).classList.add('btn-primary');
            document.querySelector('#but-' + this.bundleProduct.productVariants[this.activeBundleProduct].id).querySelector('.cart-item-circle').classList.remove('d-none');
            document.querySelector('#but-' + this.bundleProduct.productVariants[this.activeBundleProduct].id).querySelector('.s-plus').classList.add('d-none');
        }
    }
}

app.component('productsinglecustom_buythelook', {
    extends: productsinglecustom_buythelook,
    template: '#productsinglecustom_buythelook'
});