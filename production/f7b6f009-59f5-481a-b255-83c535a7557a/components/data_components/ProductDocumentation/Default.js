const productdocumentationdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            documentation: null,
            textClass: "col-md-7 col-12",
            rightClass: "col-md-5 col-12",
            leftClass: " col-md-5 col-12"
        }
    },
    mounted() {
        this._getProductContent(this._product.id, e => { this.documentation = e; });
    }
}

app.component('productdocumentationdefault', {
    extends: productdocumentationdefault,
    template: '#productdocumentationdefault'
});