const announcementmodal = {
    props: {
        model: Object,
        id: String,
        announcement: Object
    },
    data() {
        return {
            currentDate: null,
            announcements: [],
            carouselLoaded: false,
            passedIndexes: [],
            shouldShow: false,
            isAuthenticated: this._global.isAuthenticated ?? false,
            hideAnnouncement: false,
            checkAnnouncementDisplay: '',
            myModal: null
        }
    },
    mounted() {
        if (this.announcement == undefined) {
            if (!this.isAuthenticated) {
                this.checkAnnouncementDisplay = this.getCookie("hideAnnouncements") == '' ? '' : this.getCookie("hideAnnouncements");
            }

            if (window.location.pathname !== '/') {
                return;
            }
            this.passedIndexes.push(0);
            this.myModal = new bootstrap.Modal(document.getElementById("announcement-modal-" + this.id), {});
            var myModal = document.getElementById("announcement-modal-" + this.id);
            var that = this;
            if (this.isAuthenticated) {
                myModal.addEventListener('hide.bs.modal', function () {
                    that.passedIndexes = [...that.passedIndexes];
                    var ids = that.passedIndexes.map(i => that.announcements[i].id);
                    that._setReadAnnouncementIds(ids);
                });
            }
            this.currentDate = new Date().toISOString();
            this.getActiveAnnouncements();
        } else {
            this.myModal = new bootstrap.Modal(document.getElementById("announcement-modal-" + this.id), {});
            this.announcements.push(this.announcement);
        }
    },
    methods: {
        carouselInitialization() {
            this.announcementCarouselSwiper = new Swiper(".announcement-modal-" + this.id, {
                loop: false,
                freeMode: false,
                watchSlidesProgress: true,
                pagination: {
                    el: ".swiper-pagination",
                    clickable: true
                },
                navigation: {
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                },
                slidesPerView: 1,
                slidesPerGroup: 1,
                spaceBetween: 0,
            });
            this.carouselLoaded = true;
            this.showModal();
        },
        closeModal() {
            if (this.hideAnnouncement) {
                if (this.checkAnnouncementDisplay.length !== 0) {
                    var ids = this.announcements.map(i => i.id);
                    this.checkAnnouncementDisplay.split(',').forEach(element => {
                        ids.push(element);
                    });
                } else {
                    var ids = this.announcements.map(i => i.id);
                }
                this.setCookie("hideAnnouncements", ids);
            }
            this.myModal.hide();
        },
        getActiveAnnouncements() {
            let params = {
                page: 1,
                pageSize: 10,
                global: true,
                from: `lte:${this.currentDate}`,
                to: `gte:${this.currentDate}`,
                isAuthenticated: this.isAuthenticated,
                unread: this.isAuthenticated === true ? true : undefined
            }
            this._getActiveAnnouncements(params, list => {
                this.announcements = list.model.item1;

                if (this.checkAnnouncementDisplay !== '' && !this.isAuthenticated) {
                    var idsAnnouncement = this.announcements.map(i => i.id);
                    var cookiesAnnouncement = this.checkAnnouncementDisplay.split(',');
                    var unreadAnnouncementsIds = idsAnnouncement.filter(entry1 => !cookiesAnnouncement.some(entry2 => entry1 === entry2));
                    this.announcements = this.announcements.filter(item => unreadAnnouncementsIds.indexOf(item.id) !== -1);
                }
            });

        },
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
        getCookie(cname) {
            let name = cname + "=";
            let ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        },
        handleImageError(event) {
            event.target.src = this._getNoImageUrl();
        },
        setCookie(cname, cvalue) {
            document.cookie = cname + "=" + cvalue;
        },
        showModal() {
            this.myModal.show();
        }
    },
    updated: function () {
        if (this.announcement == undefined) {
            if (this.announcements.length > 0) {
                !this.carouselLoaded ? this.carouselInitialization() : null;
                this.carouselLoaded = true;
            }
        }
    }
}

app.component('announcementmodal', {
    extends: announcementmodal,
    template: '#announcementmodal'
});