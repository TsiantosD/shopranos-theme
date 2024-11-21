const blogcategorylistdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            blogCategoryList: []
        }
    },
    mounted() {
        this._getBlogCategoryList(e => {
            this.blogCategoryList = e.item1;
        });
    }
}

app.component('blogcategorylistdefault', {
    extends: blogcategorylistdefault,
    template: '#blogcategorylistdefault'
});