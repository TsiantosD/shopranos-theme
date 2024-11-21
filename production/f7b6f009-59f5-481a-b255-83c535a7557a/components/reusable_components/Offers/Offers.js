const offers = {
    props:
        {},
    data() {
        return {
            offerStatuses: ["All", "Draft", "Open", "Accepted", "Rejected"],
            offers: [],
            isLoading: false,
            selectedOfferStatus: "All",
            selectedOfferSort: "ExpiresAt",
            currentPage: 1,
            offerSorts: ["ExpiresAt", "UpdateDate",],
            pageCount: null,
            totalCount: null,

        }
    },
    mounted() {
        this.get_offers();
    },
    methods: {
        changeOfferStatus(change) {
            let value = change.target.value;
            this.selectedOfferStatus = value;
            this.currentPage = 1;
            this.get_offers();
        },
        changeOfferSort(change) {
            let value = change.target.value;
            this.selectedOfferSort = value;
            this.currentPage = 1;
            this.get_offers();
        },
        get_offers() {
            this.isLoading = true;
            let params = {
                page: this.currentPage,
                pageSize: 10,
                status: this.selectedOfferStatus !== 'ALL' ? this.selectedOfferStatus : undefined,
                sort: `-${this.selectedOfferSort}`
            }

            this._getOffers(params, e => {
                this.offers = e.model.item1;
                this.currentPage = e.model.item2.pageNumber;
                this.pageCount = e.model.item2.numberOfPages;
                this.totalCount = e.model.item2.totalCount;
                this.isLoading = false;
            });
        },
        nextPage() {
            if (this.currentPage + 1 <= this.pageCount)
                this.pagination(this.currentPage + 1)

        },
        prevPage() {
            if (this.currentPage - 1 > 0)
                this.pagination(this.currentPage - 1)

        },
        pagination(page) {
            this.currentPage = page;
            this.get_offers();
        },
        navigateToOffer(offer) {
            return `/offer/${offer.id}`;
        },
        formatDate(date) {
            var newDate = new Date(date);
            newDate = newDate.getDate() + '/' + (newDate.getMonth() + 1) + '/' + newDate.getFullYear()
            return newDate;
        },
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
        },
    }
}

app.component('offers', {
    extends: offers,
    template: '#offers'
});