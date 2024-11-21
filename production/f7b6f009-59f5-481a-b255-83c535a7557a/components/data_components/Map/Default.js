const mapdefault = {
    props: {
        model: Object,
    },
    data() {
        return {
            address: this.model.address,
            mapSrc: "",
            latitude: this.model.latitude,
            longitude: this.model.longitude,
            zoom: this.model.zoom,
            fullWidth: this.model.mapExtended ? this.model.mapExtended : false,
        }
    },
    mounted() {
        this.mapSrc = this.getMapUrl();
    },
    methods: {
        getAlignmentClass(alignment) {
            switch (alignment) {
                case 1:
                    return 'justify-content-start';
                case 2:
                    return 'justify-content-center';
                case 3:
                    return 'justify-content-end';
                default:
                    return '';
            }
        },
        getMapUrl() {
            var baseUrl = 'https://www.google.com/maps/embed/v1/place?';
            var apiKey = 'key=AIzaSyD5v3eMW9XFHbd3mzsOGx_ePTFrI1YML48';
            var addressUrl;
            if (this.address.address1 || this.address.city || this.address.postalCode) {
                addressUrl = `&q=${this.address.address1},${this.address.city},${this.address.postalCode}`;
            } else if (this.latitude !== null && this.longitude !== null) {
                addressUrl = `&q=${this.latitude},${this.longitude}`;
            }
            return `${baseUrl}${apiKey}${addressUrl}&zoom=${this.zoom}`;
        }
    }
}

app.component('mapdefault', {
    extends: mapdefault,
    template: '#mapdefault'
});