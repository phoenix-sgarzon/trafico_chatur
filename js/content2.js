let perfil;
let cantPagi = 1;

window.addEventListener("load", function () {
    console.log("🔄 Página de seguidos cargada");
    let url = window.location.toString();
    perfil = document.getElementById("user_information_profile_container")?.innerText || "";

    if (url === "https://chaturbate.com/followed-cams/online/" || url.includes("followed-cams/online/?page=")) {
        if (document.querySelectorAll(".paging").length > 0) {
            let paginas = document.querySelectorAll(".paging > li.page_number_container");
            if (paginas.length > 0) {
                cantPagi = paginas.length;
                console.log("📄 Total páginas:", cantPagi);
            }
        }
        mostrarPerfiles();
    }
});

function mostrarPerfiles() {
    try {
        let usuariosActivos = [];
        
        // quitar miniaturas
        document.querySelectorAll(".room_thumbnail").forEach(f => f.remove());

        let nombresUs = document.querySelectorAll("li.roomCard > a");
        let espectadoresUs = document.querySelectorAll("li.roomCard > div.details > ul.sub-info > li.cams");

        for (let i = 0; i < nombresUs.length; i++) {
            let nomUs = nombresUs[i].getAttribute("data-room");
            let espec = parseInt(espectadoresUs[i].textContent.split(" ")[1] || "0", 10);

            usuariosActivos.push({ usuario: nomUs, espectadores: espec });
        }

        console.log("👥 Usuarios activos encontrados:", usuariosActivos);
        sendCommand("usuariosActivos", usuariosActivos, perfil, cantPagi);

    } catch (error) {
        console.error("⚠️ Error en mostrarPerfiles:", error);
        sendCommand("usuariosActivos", [], perfil, cantPagi);
        // En MV3 no puedes cerrar directamente desde el content
        chrome.runtime.sendMessage({ txt: "closeTab" });
    }
}

function sendCommand(command, param, param2, param3) {
    let msg = { txt: command, param, param2, param3 };
    chrome.runtime.sendMessage(msg);
    console.log("📨 Mensaje enviado:", msg);
}
