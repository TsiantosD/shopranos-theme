const singleblogdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            blog: this._singleBlog,
            user: null,
            comments: [],
            totalComments: 0,
            nickname: null,
            comment: "",
            isPostingComment: false,
            nicknameHasValidationError: false,
            commentHasValidationError: false,
            commentPublishedToastClass: "hide",
            blogCategory: null,
            pageCount: null,
            currentPage: 1,
            isLoadingData: false,
            readingTime: false,
            time: { 'hours': -1, 'minutes': -1 }
        }
    },
    mounted() {
        this.getUser();
        this._getBlogCategoryById(this.blog.categoryId, e => this.blogCategory = e);
        if (this.model.allowComments) {
            this.getComments();
        }
        document.querySelector('main.page-wrapper>div').classList.add('overflow-unset');
        this.getReadingTime();
    },
    methods: {
        calculateAuthorData() {
            var data = "";
            if (this.blog.authorFirstName !== null && this.blog.authorFirstName !== undefined) {
                data += this.blog.authorFirstName
            }
            if (this.blog.authorLastName !== null && this.blog.authorLastName !== undefined) {
                if (data.length > 0)
                    data += " " + this.blog.authorLastName;
                else
                    data += this.blog.authorLastName;
            }
            if (this.blog.authorEmail !== null && this.blog.authorEmail !== undefined && data.length === 0) {
                data += this.blog.authorEmail;
            }
            return data;
        },
        calculateCommenterName(comment) {
            var displayName = "";
            if (comment.nickname !== null && comment.nickname !== undefined && comment.nickname.length > 0) {
                return comment.nickname;
            }
            if (comment.firstName !== null && comment.firstName !== undefined && comment.firstName.length > 0) {
                displayName = comment.firstName;
            }
            if (comment.lastName !== null && comment.lastName !== undefined && comment.lastName.length > 0) {
                displayName += " " + comment.lastName;
            }
            return displayName;
        },
        calculateNickname() {
            var nickname = "";
            if (this.user?.firstName !== undefined && this.user?.firstName !== null && this.user?.firstName.length > 0) {
                nickname += this.user.firstName + " ";
            }
            if (this.user?.lastName !== undefined && this.user?.lastName !== null && this.user?.lastName.length > 0) {
                nickname += this.user.lastName;
            }
            if (this.user?.email !== undefined && this.user?.email !== null && this.user?.email.length > 0 && nickname.length === 0) {
                nickname += this.user.email;
            }
            return nickname;
        },
        getComments() {
            let params = {
                status: "approved",
                page: this.currentPage,
                pageSize: 5,
                sort: "-insertDate"
            }
            this.isLoadingData = true;
            this._getComments(this.blog.id, params, e => {
                this.comments = e.item1;
                this.totalComments = e.item2.totalCount;
                this.currentPage = e.item2.pageNumber;
                this.pageCount = e.item2.numberOfPages;
                this.isLoadingData = false;
            });
        },
        getDate(date) {
            date = Date.parse(date);
            date = new Date(date);
            var lang = this._getCulture();

            const options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            };
            return date.toLocaleDateString(lang, options)
        },
        getReadingTime() {
            const text = document.getElementById("article-wrap").innerText;
            const wps = 3.8;
            const words = text.trim().split(/\s+/).length;
            const timeInSeconds = Math.ceil(words / wps);

            const hours = Math.floor(timeInSeconds / 3600);
            const minutes = Math.floor((timeInSeconds % 3600) / 60);
            const seconds = timeInSeconds % 60;

            if (hours > 0)
                this.time.hours = hours
            if (minutes === 0 && seconds > 0)
                this.time.minutes = -2;
            else if (minutes > 0)
                this.time.minutes = minutes + Math.ceil(seconds / 60);

            this.readingTime = true;
        },
        getUser() {
            this._getRetailUserProfile(e => {
                this.user = e.user;
                this.nickname = this.calculateNickname();
            });
        },
        nextPage() {
            if (this.currentPage + 1 <= this.pageCount)
                this.pagination(this.currentPage + 1)
        },
        pagination(page) {
            this.currentPage = page;
            this.getComments();
        },
        postComment() {
            this.isPostingComment = true;
            if (this.userCommentHasValidationError()) {
                this.isPostingComment = false;
                return;
            }
            this.nicknameHasValidationError = false;
            this.commentHasValidationError = false;
            var data = {
                postId: this.blog.id,
                comment: this.comment,
                nickname: this.nickname,
                userId: this.user?.id
            };
            this._postComment(data, e => {
                this.isPostingComment = false;
                this.comment = null;
                this.commentPublishedToastClass = "show";
                setTimeout(() => { this.commentPublishedToastClass = "hide"; }, 4000);
            });
        },
        prevPage() {
            if (this.currentPage - 1 > 0)
                this.pagination(this.currentPage - 1)
        },
        userCommentHasValidationError() {
            var hasError = false;
            if (this.nickname === undefined || this.nickname === null || this.nickname.length === 0) {
                this.nicknameHasValidationError = true;
                hasError = true;
            }
            if (this.comment === undefined || this.comment === null || this.comment.length === 0) {
                this.commentHasValidationError = true;
                hasError = true;
            }
            return hasError;
        }
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

app.component('singleblogdefault', {
    extends: singleblogdefault,
    template: '#singleblogdefault'
});