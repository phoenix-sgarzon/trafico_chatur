let perfil;
let usuariosActivos = [];
let cantPagi = 1;
window.document.title = 'Cargue de Usuarios';

window.addEventListener("load", function () {
    window.document.title = 'Cargue de Usuarios';
    console.log("All loaded!");
    let url = window.location.toString();
    perfil = document.getElementById("user_information_profile_container").innerText;

    if ( url == "https://chaturbate.com/followed-cams/online/" || url.includes("followed-cams/online/?page=") ) {
        if (document.querySelectorAll(".paging").length > 0 ) {
            cantPagi = document.querySelectorAll(".paging > li.page_number_container");
            if (cantPagi.length != 0) {
                cantPagi = cantPagi.length;
                console.log(cantPagi);
            }
        }

        console.log("Cargando otra pagina de seguidos");
        mostrarPerfiles();
    }
});

function mostrarPerfiles() {
    try {
        var fotos = document.querySelectorAll(".room_thumbnail");
        for (var i = 0; i < fotos.length; i++) {
            fotos[i].remove();
        }

        var nombresUs = document.querySelectorAll("li.roomCard > a");
        var espectadoresUs = document.querySelectorAll("li.roomCard > div.details > ul.sub-info > li.cams");

        for (let i = 0; i < nombresUs.length; i++) {
            var nomUs = nombresUs[i].getAttribute("data-room");
            var espec = parseInt(espectadoresUs[i].textContent.split(' ')[1]);
            dataUsuarios = {
                usuario: nomUs,
                espectadores: espec
            }
            usuariosActivos.push(dataUsuarios);
        }
        
        console.log(usuariosActivos);
        sendCommand("usuariosActivos", usuariosActivos, perfil, cantPagi);
    } catch (error) {
        console.log(error);
        sendCommand("usuariosActivos", usuariosActivos, perfil, cantPagi);
        window.close();
    }
}

function sendCommand(command, param, param2, param3) {
    let msg = {
        txt: command,
        param,
        param2,
        param3
    }
    chrome.runtime.sendMessage(msg);
    console.log("¡Mensaje " + command + " enviado!" + msg.param);
}