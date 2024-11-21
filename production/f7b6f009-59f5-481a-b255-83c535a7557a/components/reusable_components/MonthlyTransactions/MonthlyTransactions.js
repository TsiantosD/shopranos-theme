const monthlytransactions = {
    props:
        {},
    data() {
        return {
            balsheet: null,
            currentSheetData: null,
            currentSheetKey: null,
            isLoading: false,

        }
    },
    mounted() {
        this.get_monthlytransactions();
    },
    methods: {
        calculateCurrency(price) {
            return this._calculateCurrency(price, 2);
        },
        changeBalanceSheetYear(ev) {
            this.currentSheetData = this.balsheet.get(ev.target.value)
        },
        get_monthlytransactions() {
            this.isLoading = true;
            this._getBalance(e => {
                if (e != null && e.model != null) {
                    const groupByYear = e.model.reduce(
                        (entryMap, b) => entryMap.set(b.fiscalYear, [...entryMap.get(b.fiscalYear) || [], b]),
                        new Map()
                    );
                    this.balsheet = groupByYear;
                    const [firstValue] = this.balsheet.values();
                    const [firstKey] = this.balsheet.keys();
                    this.currentSheetData = firstValue;
                    this.currentSheetKey = firstKey;
                }
                this.isLoading = false;
            })
        },
    },
    computed: {
        GetTotalDebit: {
            get() {
                let total = 0;
                var sheets = Array.from(this.balsheet.values());
                sheets.forEach(s => s.map(b => total += b.debit))
                return total;
            }
        },
        GetTotalCredit: {
            get() {
                let total = 0;
                var sheets = Array.from(this.balsheet.values());
                sheets.forEach(s => s.map(b => total += b.credit))
                return total;
            }
        },
    }
}

app.component('monthlytransactions', {
    extends: monthlytransactions,
    template: '#monthlytransactions'
});