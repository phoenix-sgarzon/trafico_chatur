let dominio = "apps.phoenixstd.com";
let dom = "apps.phoenixstd.com";

let url_cuenta = "https://" + dom + "/api/perfiles-master.php?perfil=";
let url_categorias = "https://" + dominio + "/api/categoria-mensajes.php";
let url_usuarios_activos = 'https://' + dominio + '/api/usuarios-activos.php';
let url_usuarios_activos_trans = 'https://' + dominio + '/api/usuarios-activos-trans.php';

//Codigo a Ejecutar al Cargar la Pagina
let categorias = [];
let perfilesTrafico = [];

fetch(url_categorias)
    .then(response => response.json())
    .then(function (json) {
        mostrarDatosCat(json.body);
    }).catch(error => console.log(error));

// Funcion para Cargar categorias de mensajes al campo <select>
function mostrarDatosCat(data) {
    categorias = data;
    let catMen = document.getElementById("catMensaje");
    var arrayCat = [];

    for (i = 0; i < data.length; i++) {
        arrayCat.push(data[i].categoria);
    }
    categorias.sort();

    for (var i in categorias) {
        catMen.innerHTML += "<option value='" + categorias[i].id + "'>" + categorias[i].categoria + "</option>";
    }
}

window.onload = function () {
    alert("No olvides usar VPN para evitar ser bloqueado !");
}

let userIP = null;

const getIP = async () => {
    return await fetch("https://api.ipify.org?format=json")
        .then(response => response.json());
}

const getInfo = async (ip) => {
    return await fetch("https://ipwhois.app/json/" + ip + "?lang=es")
        .then(response => response.json());
}

$(function () {
    $("#startcustomGold").click(function () {
        getIP().then(response => {
            userIP = response.ip;
            getInfo(userIP).then(location => {
                if (location) {
                    var vpn = location.country;
                    if (vpn !== "Colombia") {
                        var categoriaMen = document.getElementById("catMensaje").selectedOptions[0].innerText;
                        var seleccionCat = document.getElementById("catMensaje").value;
                        seleccionCat = parseInt(seleccionCat.substring(0, 1));
                        var seleccionPer = document.getElementById("perTraf").value;
                        var cuenta = document.getElementById("perTraf").selectedOptions[0].innerText;
                        let acount = url_cuenta + cuenta;
                        fetch(acount, {
                            method:'GET'
                        })
                            .then(response => response.json())
                            .then(function (json) {
                                console.log(json);
                                try{
                                    if (json["body"]["premium"] == 1) {
                                        if (seleccionPer == 1) {
                                            fetch(url_usuarios_activos)
                                                .then(response => response.json())
                                                .then(function (json) {
                                                    if (json.itemCount) {
                                                        var aceptar = confirm('Hay ' + json.itemCount + ' usuarios activos cargados en el stats\x0A\xBFDesea continuar?');
                                                        if (aceptar) {
                                                            sendCBCommand('startProcessGoldCont', seleccionPer, cuenta, vpn, seleccionCat, categoriaMen);
                                                        }
                                                    } else {
                                                        alert('No se han cargado usuarios del stats');
                                                    }
                                                });
                                        }
                                        if (seleccionPer == 2) {
                                            fetch(url_usuarios_activos_trans)
                                                .then(response => response.json())
                                                .then(function (json) {
                                                    if (json.itemCount) {
                                                        var aceptar = confirm('Hay ' + json.itemCount + ' usuarios activos cargados en el stats\x0A\xBFDesea continuar?');
                                                        if (aceptar) {
                                                            
                                                            sendCBCommand('startProcessGoldCont', seleccionPer, cuenta, vpn, seleccionCat, categoriaMen);
                                                        }
                                                    } else {
                                                        alert('No se han cargado usuarios del stats');
                                                    }
                                                });
                                        }
                                    } else {
                                        alert("Para acceder a este trafico requieres tener una cuenta premium, para ello contactate con soporte");
                                    }
                                } catch{
                                    alert("No puedes ejecutar trafico si tu perfil de trafico no ha comprado ningun servicio");
                                }
                            }).catch(error => alert("Ha habido un error -> " + error));

                    } else {
                        alert("Debes tener una VPN Activa para ejecutar esta extension");
                    }
                }
            })
        });
    });

    $("#startcustom2").click(function () {
        getIP().then(response => {
            userIP = response.ip;
            getInfo(userIP).then(location => {
                if (location) {
                    var vpn = location.country;
                    if (vpn !== "Colombia") {
                        var categoriaMen = document.getElementById("catMensaje").selectedOptions[0].innerText;
                        var seleccionCat = document.getElementById("catMensaje").value;
                        seleccionCat = parseInt(seleccionCat.substring(0, 1));
                        var seleccionPer = document.getElementById("perTraf").value;
                        var cuenta = document.getElementById("perTraf").selectedOptions[0].innerText;
                        var acount = url_cuenta + cuenta;
                        fetch(acount, {
                            method:'GET'
                        })
                            .then(response => response.json())
                            .then(function (json) {
                                try{
                                    if (json["body"]["premium"] == 0 || json["body"]["premium"] == 1) {
                                        alert("Accediendo");
                                        sendCBCommand("startProcess2Cont", seleccionPer, cuenta, vpn, seleccionCat, categoriaMen);
                                    }
                                } catch {
                                    alert("No puedes ejecutar trafico si tu perfil de trafico no ha comprado ningun servicio");
                                }
                            }).catch(error => alert("Ha habido un error -> " + error));
                    } else {
                        alert("Debes tener una VPN Activa para ejecutar esta extension");
                    }
                }
            })
        });
    });

    $("#start_ghost").click(function () {
        getIP().then(response => {
            userIP = response.ip;
            getInfo(userIP).then(location => {
                if (location) {
                    var vpn = location.country;
                    if (vpn !== "Colombia") {
                        var seleccionPer = document.getElementById("perTraf").value;
                        var cuenta = document.getElementById("perTraf").selectedOptions[0].innerText;
                        var acount = url_cuenta + cuenta;
                        fetch(acount, {
                            method:'GET'
                        })
                            .then(response => response.json())
                            .then(function (json) {
                                console.log(json);
                                try{
                                    if (json["body"]["premium"] == 0 || json["body"]["premium"] == 1) {
                                        if (seleccionPer == 1) {
                                            fetch(url_usuarios_activos)
                                                .then(response => response.json())
                                                .then(function (json) {
                                                    if (json.itemCount) {
                                                        var aceptar = confirm('Hay ' + json.itemCount + ' usuarios activos cargados en el stats\x0A\xBFDesea continuar?');
                                                        if (aceptar) {
                                                            sendCBCommand("startProcessGhost", seleccionPer, cuenta, vpn, 0, 0);
                                                        }
                                                    } else {
                                                        alert('No se han cargado usuarios del stats');
                                                    }
                                                });
                                        }
                                        if (seleccionPer == 2) {
                                            fetch(url_usuarios_activos_trans)
                                                .then(response => response.json())
                                                .then(function (json) {
                                                    if (json.itemCount) {
                                                        var aceptar = confirm('Hay ' + json.itemCount + ' usuarios activos cargados en el stats\x0A\xBFDesea continuar?');
                                                        if (aceptar) {
                                                            sendCBCommand("startProcessGhost", seleccionPer, cuenta, vpn, 0, 0);
                                                        }
                                                    } else {
                                                        alert('No se han cargado usuarios del stats');
                                                    }
                                                });
                                        }
                                    }
                                } catch {
                                    alert("No puedes ejecutar trafico si tu perfil de trafico no ha comprado ningun servicio");
                                }
                            }).catch(error => alert("Ha habido un error -> " + error));
                    } else {
                        alert("Debes tener una VPN Activa para ejecutar esta extension");
                    }
                }
            })
        });
    });

    $("#stopexec").click(function () {
        let msg = { txt: "stopExec", tab: 0, param: "", param2: "" }
        chrome.runtime.sendMessage(msg);
    });

    $("#verUsu").click(function () {
        chrome.tabs.query({
            currentWindow: true,
            active: true
        }, function(tabs) {
            let msg = { txt: "verUsu", tab: tabs[0].id }
            chrome.runtime.sendMessage(msg, function(response) {
                var element = response.usuariosCargados.map((e, i) => (i + 1 + '. ' + e + '\n')).join(' ');
                alert(
                    "Usuarios Cargados: " + response.usuariosCargados.length + "\n\n"+element
                );
            });
        });
        
    });

    $("#execuser").click(function () {
        let msg = {
            txt: "cargarUsuarios",
            tab: 0,
            param: "",
            param2: ""
        }
        chrome.runtime.sendMessage(msg);
    });

    $("#deleteuser").click(function () {
        var limpiar = confirm("Borrar el registro limpia la base de datos para todas las ejecuciones\n¿Esta seguro de limpiar el listado de usuarios activos?");
        if ( limpiar ) {
            let msg = { txt: "limpiarBD" }
            chrome.runtime.sendMessage(msg);
        }
    });
});

function sendCBCommand(command, param, param2, param3, param4, param5) {
    chrome.tabs.query({
        currentWindow: true,
        active: true
    }, function (tabs) {
        let msg = {
            txt: command,
            tab: tabs[0].id,
            param,
            param2,
            param3,
            param4, 
            param5
        }
        chrome.tabs.sendMessage(tabs[0].id, msg);
        console.log("Mensaje " + command + " " + JSON.stringify(msg) + " enviado!");
    });
}