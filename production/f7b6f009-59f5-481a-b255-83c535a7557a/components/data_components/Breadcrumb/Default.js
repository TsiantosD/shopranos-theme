const breadcrumbdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            path: null,
            title: null,
            categories: []
        }
    },
    created: function () {
        this.title = document.title;
        if (this._filterList !== undefined) {
            var paths = window.location.pathname.split('/');
            this.path = paths[1];
            this.path === "brand" ? this.title = this._filterList.record.name : this.title = this._filterList.record.title;
            if (this._filterList.record.treeIds?.length > 1) {
                let categoryIds = this._filterList.record.treeIds.slice(0, -1);
                this._findCategoriesByIds(categoryIds, categories => {
                    this.categories = categories;
                });
            }
        }
        if (this._product !== undefined) {
            this.title = this._product.title;
            this.path = window.location.pathname.split('/')[1];
            if (this._product.pathCategories?.length > 0) {
                this._findCategoriesByIds(this._product.pathCategories, categories => {
                    this.categories = categories;
                });
            }
        }
        if (window.location.pathname.split('/')[1] === "categories") {
            let categoryAlias = window.location.pathname.split('/')[2];
            this.path = window.location.pathname.split('/')[1];
            this._findCategoryByAlias(categoryAlias, category => {
                this.title = category.title;
                if (category.treeIds?.length > 1) {
                    let categoryIds = category.treeIds.slice(0, -1);
                    this._findCategoriesByIds(categoryIds, categories => {
                        this.categories = categories;
                    });
                }
            });
        }
        var paths = window.location.pathname.split('/');
        if (paths[1] === "blog" && paths[2] === "posts" && paths.length === 3) {
            this.path = paths[1];
        }
        if (paths[1] === "blog" && paths[2] === "posts" && paths.length === 4) {
            this.path = "blog/posts";
            this.title = paths[3];
        }
    }
}

app.component('breadcrumbdefault', {
    extends: breadcrumbdefault,
    template: '#breadcrumbdefault'
});