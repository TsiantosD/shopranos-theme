const loyalty = {
    data() {
        return {
            user: null,
            rewardPoints: null,
            pointsToAmountRate: 0,
            minimumRedemptionPoints: 0,
            redeemPoints: [],
            isRewardsLoading: true,
            isCouponsLoading: true,
            coupons: [],
            userCoupons: [],
            isAuthenticated: this._global.isAuthenticated ?? false,
            copiedTooltip: false,
            linkToInfo: this._settings.loyaltyInfoUrl ?? null, 
            linkToTerms: this._settings.loyaltyTermsUrl ?? null,
            isLinkToInfoValid: false,
            isLinkToTermsValid: false,
            historyExist: true, //TODO - Change from back
            redemptions: [{date: '25/01/2024', id: '4MMHY77B', price: '2,00'}] //TODO - Change from back
        }
    },
    beforeMount() {
        if(this._settings.isCouponsActive)   {
            let paramsAll = {
                page: 1,
                pageSize: 10,
                isAuthenticated: this.isAuthenticated,
            }
            this._getCoupons(paramsAll, e => {
                this.coupons = e.model.item1;
                this.isCouponsLoading = false;
            });
        }

        if(this._settings.isRewardPointsActive){
            this.get_RewardPoints();
            this.get_RewardPointsSetup();
        }
    },
    async mounted() {
        this.isLinkToInfoValid = await this.checkURL(this.linkToInfo);
        this.isLinkToTermsValid = await this.checkURL(this.linkToTerms);
    },
    methods: {
        async checkURL(url) {    
            try {         
                url = window.location.origin + url;                
                response = await fetch(url);                
                if (!response.ok) return false;  
            
                return true;   
            } catch (error) {
              console.error("Error checking URL:", error);
              return false;
            }
        },
        async copyCode(e) {    
            var copyText = e.target.querySelector('input');
            copyText.focus();
            copyText.select();
            document.execCommand('copy');
            this.copiedTooltip = true;
        },
        getDate(datetime) {
            const date = new Date(datetime);

            const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
            const day = date.getDate().toString().padStart(2, '0');
            const year = date.getFullYear();

            const dateWithoutTime = `${day}/${month}/${year}`;
            return dateWithoutTime;
        },
        get_RewardPoints()  {
            this._getRewardPoints().then(rewardPoints => {
                this.rewardPoints = rewardPoints.totalPoints;
                this.isRewardsLoading = false;
            });
        },
        get_RewardPointsSetup()  {
            this._getRewardPointsSetup().then(rewardPointsSetup => {
                this.pointsToAmountRate = rewardPointsSetup.redemption.pointsToAmountRate;
                this.minimumRedemptionPoints = rewardPointsSetup.redemption.minRequiredPoints;
                
                for (let index = 1; index < 6; index++) {
                    this.redeemPoints.push({ points: (this.minimumRedemptionPoints * index), price:  (this.minimumRedemptionPoints * index) * (this.pointsToAmountRate)});
                }     
            });
        },
        hideTooltip(){
            this.copiedTooltip = false;
        }
    },
}

app.component('loyalty', {
    extends: loyalty,
    template: '#loyalty'
});