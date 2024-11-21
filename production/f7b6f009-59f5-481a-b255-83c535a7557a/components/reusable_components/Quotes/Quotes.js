const quotes = {
    props:
        {},
    data() {
        return {
            selectedQuoteStatus: "All",
            quoteStatuses: ["All", "Quoted", "Completed", "Accepted", "Declined"],
            selectedQuoteSort: "UpdateDate",
            quoteSorts: ["ExpirationDate", "UpdateDate",],
            isLoading: false,
            currentPage: 1,
            quotes: [],
            pageCount: null,
            totalCount: null,
        }
    },
    mounted() {
        this.get_quotes();
    },
    methods: {
        changeQuoteStatus(change) {
            let value = change.target.value;
            this.selectedQuoteStatus = value;
            this.currentPage = 1;
            this.get_quotes();
        },
        changeQuoteSort(change) {
            let value = change.target.value;
            this.selectedQuoteSort = value;
            this.currentPage = 1;
            this.get_quotes();
        },
        get_quotes() {
            this.isLoading = true;
            let params = {
                page: this.currentPage,
                pageSize: 10,
                status: this.selectedQuoteStatus !== 'ALL' ? this.selectedQuoteStatus : undefined,
                sort: `-${this.selectedQuoteSort}`
            }

            this._getQuotes(params, e => {
                this.quotes = e.model.item1;
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
            this.get_quotes();
        },
        navigateToQuote(quote) {
            return `/quote/${quote.id}`;
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

app.component('quotes', {
    extends: quotes,
    template: '#quotes'
});