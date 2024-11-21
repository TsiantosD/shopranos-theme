const myPlugin = {
    install(app, opts) {
        var modal = document.getElementById("campaignModal");
        if (modal) {
            var backdrop = document.createElement("div");
            backdrop.classList.add("modal-backdrop", "fade", "show");
            document.body.appendChild(backdrop);
            modal.style.display = "block";
        }
        
    }
}