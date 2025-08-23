let dominio = "apps.phoenixstd.com";

let maquina = 8;
let sede = "Angeles 7.";
let perfilTra = "";
let vpn = "";
let categoriaMsg = "";
let seleccionCat = 1;
let nombreCategoria = "";

var windowsCount = 3;
var generalTimeout = 20; // in minutes

let url_api_mensaje = "https://" + dominio + "/api/mensajes.php?id_categoria=";
let url_api_stats = "https://" + dominio + "/api/stats.php";
let url_usuarios_activos = 'https://' + dominio + '/api/usuarios-activos.php';
let url_usuarios_activos_trans = 'https://' + dominio + '/api/usuarios-activos-trans.php';

var windowList = [];
var stopExec = false;
var seqWindow = 0;
let countMsg = 0;

let usuariosaRevisar = [];
let usuariosaRevisarNombres = [];

let windowIDPrin;

let datosUsuariosActivos = [];
let windowIdUsuariosActivos;
let tabwindowIdUsuariosActivos;
let traficoGhost = false;

console.log('background corriendo');

function getCurrentDateTimeString() {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return date + ' ' + time;
}

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if ( msg.txt == "openCloseWarning" ) {
        console.log('openCloseWarning recibido en segundo plano para la pestaña ' + msg.tab);
        let m = {
            txt: "openCloseWarning"
        }
        chrome.tabs.sendMessage(msg.tab, m);

    } else if ( msg.txt == "startProcessGold" ) {
        console.log(`Iniciando Cargue de usuarios Activos:  ${getCurrentDateTimeString()}`);
        perfilTra = msg.param2;
        vpn = msg.param3;
        seleccionCat = msg.param4;
        categoriaMsg = msg.param5;

        stopExec = false;
        StarProcess(1, msg.param, msg.userName, msg.param);

    } else if ( msg.txt == "startProcess2" ) {
        perfilTra = msg.param2;
        vpn = msg.param3;
        seleccionCat = msg.param4;
        categoriaMsg = msg.param5;
        stopExec = false;
        
        if(usuariosaRevisar.length !== 0){
            StarProcess(2, msg.param, msg.userName, msg.param);
        }else{
            console.log("No hay datos cargados");
        }

    } else if ( msg.txt == "startProcess3Ghost" ) {
        perfilTra = msg.param2;
        vpn = msg.param3;
        seleccionCat = msg.param4;
        categoriaMsg = msg.param5;
        stopExec = false;
    
        StarProcess(3, msg.param, msg.userName, msg.param);

    } else if (msg.txt == "stopExec") {
        console.log('recibido en segundo plano ' + msg.txt);
        stopExec = true;

    } else if (msg.txt == "openNewTab") {
        if(stopExec == false){
            var userName = msg.param2;

            if (!userName) {
                userName = "";
            }

            if (stopExec) {
                console.log("¡Se detiene la apertura de nuevas ventanas!");
                return;
            }

            var winIndex = msg.tab % windowsCount;

            console.log("Recibido de la pestaña:" + sender.tab.id + " abrir nueva pestaña en ventana de inicio:" + winIndex + " para usuario " + userName + " con el link " + msg.param + " cuenta restante " + msg.tab);

            if (windowList[winIndex] == 0) {
                chrome.windows.create({
                        url: msg.param,
                        type: "normal",
                        focused: true
                    },
                    function(window) {
                        windowList[winIndex] = window.id;
                        tabwindowId1 = window.tabs[0].id;

                        function funcPagPrin( traficoGhost ) {
                            window.addEventListener('load', (event) => {
                                searchAndSendMessage( traficoGhost );
                            });
                        };
                        chrome.scripting.executeScript({
                            target: { tabId: tabwindowId1 },
                            function: funcPagPrin,
                            args: [traficoGhost],
                        });
                    }
                );
            } else {

                chrome.tabs.create({
                    "url": msg.param,
                    "windowId": windowList[winIndex],
                    "active": true,
                    "selected": true
                },
                    function( window ) {
                        function funcPagPrin( traficoGhost ) {
                            window.addEventListener('load', (event) => {
                                searchAndSendMessage( traficoGhost );
                            });
                        };
                        chrome.scripting.executeScript({
                            target: { tabId: window.id },
                            function: funcPagPrin,
                            args: [traficoGhost],
                        });
                    }
                );
            }
        }

    } else if (msg.txt == "closeWindow") {
        var userName = msg.param2;

        if (!userName) {
            userName = "";
        }

        console.log("Recibido de la pestaña:" + sender.tab.id + " cerra ventana " + sender.tab.windowId + " para usuario " + userName);
        chrome.windows.remove(sender.tab.windowId);

    } else if (msg.txt == "closeTab") {
        var userName = msg.param2;

        if (!userName) {
            userName = "";
        }
        console.log("Recibido de la pestaña:" + sender.tab.id + " cerrar pestaña en ventana " + sender.tab.windowId + " para usuario " + userName);
        chrome.tabs.remove(sender.tab.id);

    } else if (msg.txt == "askForMessage") {
        var userName = msg.param2;

        if (!userName) {
            userName = "";
        }

        if (userName != "") {
            countMsg += 1;
            console.log("Cantidad de mensajes enviados a usuarios " + countMsg);
            console.log("Recibido de la pestaña:" + sender.tab.id + " for user " + userName + " request to get Message");
            getMessageForUser(userName, sender.tab.id);
        }
    } else if (msg.txt == "openWinUser") {
        if(stopExec == false){
            var newPage = msg.param;

            if (newPage) {
                console.log("Opening user page " + newPage);

                chrome.tabs.create({
                    "url": newPage,
                    "windowId": sender.tab.windowId,
                    "active": true,
                    "selected": true,
                    "openerTabId": sender.tab.id
                });
            }
        }
    } else if (msg.txt == "msgSended") {
        if(stopExec == false){
            console.log("\n\nUrl:" + msg.param + "\nUsuario: " + msg.param2 + "\nCategoria Mensaje: " + categoriaMsg + "\nMensaje: '" + msg.param3 + "'\n\n");

            if (seqWindow) {
                chrome.scripting.executeScript({
                    target: { tabId: seqWindow },
                    func: (newTitle) => { document.title = newTitle; },
                    args: ["Trafico (" + countMsg + ")"]
                });
            }
        }
    }
});

function getMessageForUser(userName, tabtonotify) {
    var link = url_api_mensaje + seleccionCat + "&estudio=phoenix";
    console.log(link);
    fetch(link)
        .then(response => response.json())
        .then(function(json) {
            console.log("JSON: " + JSON.stringify(json));
            if( json["itemCount"] > 0 ){
                var msg = json["body"];
                if (msg.mensaje) {
                    let smsg = {
                        txt: "sendNowRandom",
                        message: msg.mensaje,
                        categoria: seleccionCat
                    }
                    
                    chrome.tabs.sendMessage(tabtonotify, smsg);
                    console.log("Mensaje '" + msg.mensaje + "' enviado!");
                } else {
                    console.log("Ningún mensaje recibido");
                }
            }else{
                console.log("Ningún mensaje recibido");
            }
        }).catch(error => console.log(error));
}

function sendStatCommand(userName, command, dur, tabstoopen) {
    console.log("duracion" + dur);
    console.log("userName" + userName);
    console.log("perfil Trafico" + dominio);
    var link = url_api_stats;
    console.log(link);

    const data = new FormData();
    data.append('modelo', userName);
    data.append('duracion', dur);
    data.append('perfil_trafico', perfilTra);
    data.append('sede', sede);
    data.append('maquina', maquina);
    data.append('vpn', vpn);
    
    if( categoriaMsg != 0 ) {
        data.append('categoriaMen', categoriaMsg);    
    } else {
        data.append('categoriaMen', "Sabana");
    }
    
    console.log(JSON.stringify(data));
    fetch(url_api_stats, {
        method:'POST',
        body: data
    })
        .then(response => response.text())
        .then(function(json) {
            console.log("Comando Stats " + command + " Para " + userName + " Enviado.");
        }).catch(error => console.log(error));
}

function funcShuffle(a, b) {
    return 0.5 - Math.random();
}

function GetUsersString(usersaArray) {
    let chunk = 25;
    var users = "";
    usersaArray.reverse();

    while (usersaArray.length > 0) {

        let tempArray = usersaArray.splice(0, chunk);
        let tempArray2 = tempArray.sort(funcShuffle);

        for (var m = tempArray2.length - 1; m >= 0; m--) {
            users = users + tempArray2[m].nombreUsuario + "|";
        }
    }

    console.log("GetUsersString " + users);
    return users;
}

function StarProcess(tipoCargue, tabsToOpen, userName, selec_trafico) {
    seqWindow = 0;
    
    if (selec_trafico == 1) {
        var link = url_usuarios_activos;
    } else if (selec_trafico == 2) {
        var link = url_usuarios_activos_trans;
    }

    console.log(link);

    if( tipoCargue == 1 ){    
        fetch(link)
            .then(response => response.json())
            .then(function(json) {
                console.log("StarProcess  Users:" + JSON.stringify(json));
                var jusers = json;
                var users = GetUsersString(jusers["body"]);
    
                sendStatCommand(userName, "START", 15, "Users-" + jusers.length);
    
                var newPage = "https://es.chaturbate.com/followed-cams/online";
    
                console.log("Abriendo page " + newPage);
    
                windowList = [];
    
                for (var i = 0; i < windowsCount; i++) {
                    windowList[i] = 0;
                }
    
                chrome.windows.create({
                        url: newPage,
                        type: "normal",
                        focused: true
                    },
                    function(win) {
    
                        var Tabid = win.tabs[0].id;
    
                        seqWindow = Tabid;
    
                        var timeOutGlobalClose = 60000 * generalTimeout;
    
                        function functionToExecute(users, userName, timeOutGlobalClose) {
                            setTimeout(startOpenTabs, 3000, users, userName);
                            setTimeout(callClose, timeOutGlobalClose, userName);
                        };
                        chrome.scripting.executeScript({
                            target: { tabId: Tabid },
                            function: functionToExecute,
                            args: [users, userName, timeOutGlobalClose],
                        });
                    }
                );
            }).catch(error => console.log(error));

    } else if ( tipoCargue == 3 ){
        traficoGhost = true;
        fetch(link)
            .then(response => response.json())
            .then(function(json) {
                console.log("Iniciar proceso de usuarios:" + JSON.stringify(json));
                var jusers = json;
                var users = GetUsersString(jusers["body"]);
    
                sendStatCommand(userName, "START", 15, "Users-" + jusers.length);
    
                var newPage = "https://es.chaturbate.com/followed-cams/online";
    
                console.log("Abriendo pagina " + newPage);
    
                windowList = [];
    
                for (var i = 0; i < windowsCount; i++) {
                    windowList[i] = 0;
                }
    
                chrome.windows.create({
                        url: newPage,
                        type: "normal",
                        focused: true
                    },
                    function(win) {
    
                        var Tabid = win.tabs[0].id;
    
                        seqWindow = Tabid;
    
                        var timeOutGlobalClose = 60000 * 30;
    
                        function functionToExecute(users, userName, timeOutGlobalClose) {
                            setTimeout(startOpenTabs, 3000, users, userName);
                            setTimeout(callClose, timeOutGlobalClose, userName);
                        };
                        chrome.scripting.executeScript({
                            target: { tabId: Tabid },
                            function: functionToExecute,
                            args: [users, userName, timeOutGlobalClose],
                        });
                    }
                );
            }).catch(error => console.log(error));
    } 
}

chrome.action.onClicked.addListener(buttonClicked);

function buttonClicked(tab) {
    let msg = {
        txt: "sendNow"
    }
    chrome.tabs.sendMessage(tab.id, msg);
}