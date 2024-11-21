const transactions = {
    props:
        {},
    data() {
        return {
            userLocale: 'el-GR',
            isLoading: false,

        }
    },
    mounted() {
        this.initDatePicker();
        this.get_transactions();
    },
    methods: {
        initDatePicker() {
            if (this.$refs.datepicker.length === null) return;
            let picker = this.$refs.datepicker;
            var defaults = {
                disableMobile: 'true'
            };
            var userOptions = void 0;
            if (picker.dataset.datepickerOptions != undefined) userOptions = JSON.parse(picker.dataset.datepickerOptions);
            var linkedInput = picker.classList.contains('date-range') ? {
                "plugins": [new rangePlugin({
                    input: picker.dataset.linkedInput
                })]
            } : '{}';
            var options = this._objectSpread(this._objectSpread(this._objectSpread({}, defaults), linkedInput), userOptions);
            var date = new Date();
            var firstDay = new Date(date.getFullYear(), date.getMonth(), 01);
            var dateString = new Date(firstDay.getTime() - (firstDay.getTimezoneOffset() * 60000))
                .toISOString()
                .split("T")[0];
            var todayString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                .toISOString()
                .split("T")[0];
            this.selectedDate = dateString;
            this.selectedToDate = todayString;
            options.defaultDate = [this.selectedDate, this.selectedToDate];
            flatpickr(picker, options);

        },

        _objectSpread(target) {
            let vm = this;
            for (var i = 1; i < arguments.length; i++) {
                var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? this.ownKeys(Object(source), !0).forEach(function (key) {
                    vm._defineProperty(target, key, source[key]);
                }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : this.ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); });
            } return target;
        },
        ownKeys(object, enumerableOnly) {
            var keys = Object.keys(object);
            if (Object.getOwnPropertySymbols) {
                var symbols = Object.getOwnPropertySymbols(object);
                enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols);
            }
            return keys;
        },
        _defineProperty(obj, key, value) {
            if (key in obj) {
                Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
            } else {
                obj[key] = value;
            }
            return obj;
        },
        calculateCurrency(price) {
            return price == null ? "" : this._calculateCurrency(price, 2);
        },
        formatDate(date) {
            var newDate = new Date(date);
            newDate = newDate.getDate() + '/' + (newDate.getMonth() + 1) + '/' + newDate.getFullYear()
            return newDate;
        },
        dateChanged(ev) {
            var dates = ev.target.value.split("to")
            this.selectedDate = dates[0]?.trim();
            this.selectedToDate = dates[1]?.trim();
            this.get_transactions();
        },
        get_transactions() {
            this.isLoading = true;
            this.transactions = null;
            var params = {
                dateFrom: this.selectedDate,
                dateTo: this.selectedToDate
            };
            this._getTransactions(params, e => {
                this.transactions = e.model;
                this.isLoading = false;
                // if (this.transactions != null && this.transactions.length === params.pageSize)
                //     this.showLoadMore = true;
            })
        },
        loadmore() {
            this.currentPage += 1;
            this.get_transactions();
        },
    }
}

app.component('transactions', {
    extends: transactions,
    template: '#transactions'
});