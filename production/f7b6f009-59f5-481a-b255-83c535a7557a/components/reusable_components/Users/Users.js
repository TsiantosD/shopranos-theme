const users = {
    props:
        {},
    data() {
        return {
            globalModel: this._global,
            emailError: false,
            inviteError: false,
            inviteLoading: false,
            customer: null,
            inviteEmail: "",
            selectedInviteRole: null,
            selectedInviteBranch: null,
            user: null,
            users: [],
            selectedRole: null,
            updateLoading: false,
            isLoading: false,
            customerRoles: [],
            currentPage: 1,
            pageCount: null,
            selectedUser: null,

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
        this.get_users();
    },
    methods: {
        async get_users() {
            this.isLoading = true;
            const roles = await this._getCustomerRolesAsync();
            this.customerRoles = roles;

            let params = {
                page: this.currentPage,
                pageSize: 10
            }

            const { data } = await this._getUsersAsync(params);
            this.users = data.item1;
            this.currentPage = data.item2.pageNumber;
            this.pageCount = data.item2.numberOfPages;
        },
        inviteUser() {
            this.inviteLoading = true;
            var hasErrors = false;
            this.inviteError = false;
            this.emailError = false;
            if (this.customer.branches.length === 1) {
                this.selectedInviteBranch = [this.customer.branches[0].id]
            }
            var input = document.getElementById("invite-email");
            var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (!re.test(this.inviteEmail)) {
                // this.emailError = 0;//this.login.InvalidEmailText;
                input.setCustomValidity('invalid');
                this.emailError = true;
                hasErrors = true;
            } else {
                this.emailError = false;
                input.setCustomValidity('');
            }
            if (this.selectedInviteBranch == null && this.customer.branches.length >= 1) {
                hasErrors = true;
                this.inviteBranchError = true;
            } else {
                this.inviteBranchError = false;
            }
            input.reportValidity();
            if (hasErrors) {
                this.inviteLoading = false;
                return;
            }

            var data = [
                {
                    "Email": this.inviteEmail,
                    "CustomerRoleId": this.selectedInviteRole,
                    "IsActive": true,
                    "BranchIds": this.selectedInviteBranch
                }
            ];
            this._sendUserInvitations(data, this.onSuccessInvite, this.onErrorInvite);

        },
        getRole(id) {
            var role = this.customerRoles.find(r => r.id === id);
            if (role !== null) {
                return role.name;
            } else {
                return "";
            }
        },
        closeSelectRoleModal() {
            this.showSelectRoleModal = false;
            this.selectedUser = null;
            this.selectedRole = null;
            this.roleNotPermittedError = false;
            this.$refs.selectRole.style.display = "";
            document.querySelector('.modal-backdrop').remove();
        },
        updateUser() {
            this.updateLoading = true;
            this.selectedUser.customerRoleId = this.selectedRole;
            this._updateUser(this.selectedUser, success => {
                this.get_users();
                this.closeSelectRoleModal();
                this.updateLoading = false;
            }, error => {
                if (error.response.status === 405 || error.response.status === 401 || error.response.status === 403) {
                    this.updateLoading = false;
                    this.roleNotPermittedError = true;
                    this.get_users();
                }
            })
        },
        onSuccessInvite(e) {
            this.selectedInviteRole = null;
            this.inviteEmail = null;
            this.inviteLoading = false;
            this.get_users();
        },
        onErrorInvite(status, data) {
            this.inviteError = true;
            this.inviteLoading = false;
        },
        handleEditRoleModal(user) {
            this.selectedUser = user;
            this.selectedRole = user.customerRoleId;
            this.showSelectRoleModal = true;
            this.$refs.selectRole.style.display = "block";
            var backdrop = document.createElement("div");
            backdrop.classList.add("modal-backdrop", "fade", "show");
            document.body.appendChild(backdrop);
        },
        handleDeleteModal(user) {
            this.selectedUser = user;
            this.showDeleteModal = true;
            var backdrop = document.createElement("div");
            backdrop.classList.add("modal-backdrop", "fade", "show");
            document.body.appendChild(backdrop);
            this.$refs.deleteModal.style.display = "block";

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
            this.get_users();
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

app.component('users', {
    extends: users,
    template: '#users'
});