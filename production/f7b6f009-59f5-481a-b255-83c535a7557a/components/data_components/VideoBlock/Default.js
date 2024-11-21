const videoblockdefault = {
    props: {
        model: Object
    },
    data() {
        return {
            data: this.model,
            videoUrl: this.model.link,
            embeddedUrl: null,
            fullWidth: this.model.videoExtended ? this.model.videoExtended : false,
        }
    },
    mounted() {
        if (this.videoUrl !== null)
            if (this.videoUrl.includes("youtube"))
                this.videoUrl = "https://www.youtube.com/embed/" + this.youtube_parser(this.videoUrl) + "?autoplay=0&mute=1";
            else if (this.videoUrl.includes("vimeo"))
                this.videoUrl = " https://player.vimeo.com/video/" + this.vimeo_parser(this.videoUrl);
        this.embeddedUrl = this.videoUrl;
    },
    methods: {
        getAlignmentClass(alignment) {
            switch (alignment) {
                case 1:
                    return 'align-items-start';
                case 2:
                    return 'align-items-center';
                case 3:
                    return 'align-items-end';
                default:
                    return '';
            }
        },
        vimeo_parser(url) {
            regExp = /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/
            parseUrl = regExp.exec(url)
            return parseUrl[5]
        },
        youtube_parser(url) {
            var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
            var match = url.match(regExp);
            return (match && match[7].length == 11) ? match[7] : false;
        }
    }
}

app.component('videoblockdefault', {
    extends: videoblockdefault,
    template: '#videoblockdefault'
});