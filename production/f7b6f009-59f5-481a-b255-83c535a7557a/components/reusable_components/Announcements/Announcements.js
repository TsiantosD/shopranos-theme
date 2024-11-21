const announcements = {
    props:
        {},
    data() {
        return {
            announcements: [],
            selectedAnnouncement: null,
            currentPage: 1,
            pageCount: null,
            totalCount: null,
            isLoading: false,
            globalModel: this._global,
            user: null,
            customer: null
        }
    },
    mounted() {
        if (this.globalModel.operationMode === 'Retail') {
            this._getRetailUserProfile(e => {
                this.user = e.user;
            })
        }
        else {
            this._getUserProfile(e => {
                this.user = e.user;
                this.customer = e.customer;
            })
        }
        this.get_announcements();
    },
    methods: {
        get_announcements() {
            this.isLoading = true;
            var currentDate = new Date().toISOString();
            let params = {
                page: this.currentPage,
                pageSize: 10,
                global: true,
                from: `lte:${currentDate}`,
                to: `gte:${currentDate}`,
                isAuthenticated: true,
            }
            this._getActiveAnnouncements(params, e => {
                this.announcements = e.model.item1;
                this.currentPage = e.model.item2.pageNumber;
                this.pageCount = e.model.item2.numberOfPages;
                this.totalCount = e.model.item2.totalCount;
                this.isLoading = false;
            });
        },
        set_selectedAnnouncement(announcement) {
            this.selectedAnnouncement = announcement;
            var announcementModal = document.getElementById("announcement-details-modal");
            var announcementBootstrapModal = new bootstrap.Modal(announcementModal, {});
            announcementBootstrapModal.show();
            announcementModal.addEventListener('hide.bs.modal', function () {
                var openedAnnouncement = this.announcements.find(a => a.id === announcement.id);
                if (!openedAnnouncement.userIds.includes(this.user.id)) {
                    openedAnnouncement.userIds.push(this.user.id);
                    this._setReadAnnouncementIds([announcement.id]);
                }
                this.selectedAnnouncement = null;
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
            this.get_announcements();
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

app.component('announcements', {
    extends: announcements,
    template: '#announcements'
});