const fixedsidemenu = {
    props: {},
    data() {
        return {
            navigations: [],
            navigationPath: []
        }
    },
    methods: {
        isActive(navItem, pos, tabIndex = null) {
            if (this.navigationPath.length > 0) {
                return navItem.navigationTitle == this.navigationPath[pos];
            }
            return tabIndex === 0; //when choosing main tab select the first one as active by default
        },
        search(navItem, target, currpath = []) {
            if (navItem.url == target) {
                return [...currpath, navItem.navigationTitle]
            }
            if (navItem.navigations != null) {
                for (const element of navItem.navigations) {
                    const path = this.search(element, target, [...currpath, navItem.navigationTitle]);
                    if (path.length > 0) {
                        return path;
                    }
                }
            }
            return [];
        }
    },
    mounted() {

        const location = '/' + window.location.pathname.replace(/^\//, '');
        this._getHeaderMenu(e => {
            this.navigations = e;
            for (const el of e) {
                const cur = this.search(el, location);
                if (cur.length > 0) {
                    this.navigationPath = cur;
                }
            }


        });


    }
}

app.component('fixedsidemenu', {
    extends: fixedsidemenu,
    template: '#fixedsidemenu'
});