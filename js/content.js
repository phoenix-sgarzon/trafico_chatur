var divmessageBox = ".customInput.noScrollbar.chat-input-field.inputFieldChatPlaceholder.theatermodeInputFieldChat"; //DIV with the message box =>!!!! FREQUENTLY CHANGES !!!!
var btnSend = "span > .SplitMode.Button.SendButton.chat"; //Button SEND/ENVIAR  =>!!!! FREQUENTLY CHANGES !!!!
var btnDisabled = ".send-button.disabled.theatermodeSendButtonChat";

var url_api_modelos = "https://apps.phoenixstd.com/api/modelos.php?username=";
var tabFreq = 10000;
var tabTimeout = 150000; //150000
var testVal = 0;

var delayBeforeFollow = 0; //em millisecondes
var delayBeforeSendMsg = 6000; //em millisecondes

var alreadySendMessageCalled = false;
var onPause = false;

function clickOnAccept() {
    if (document.getElementById('aA')) {
        if (document.getElementById('aA').getElementsByTagName('a')) {
            try {
                document.getElementById('aA').getElementsByTagName('a')[2].click();
                console.log("terms validation (aA) called");
            } catch (error) { }
        }
    } else {
        console.log("Terms not found");
    }

    if (document.getElementById('entrance_terms')) {
        if (document.getElementById('close_entrance_terms') ) {
            try {
                document.getElementById('close_entrance_terms').click();
                console.log("terms validation (entrance_terms) called");
            } catch (error) {}
        }
    }
}

function sendUserBack() {
    var userName = $(".user_information_header_username").text();
    let msg = {
        txt: "bannedUserName",
        tab: 0,
        param: userName,
        param2: ""
    }
    chrome.runtime.sendMessage(msg);
}

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

window.addEventListener('load', (event) => {
    console.log("¡Toda la pagina cargada!");
    clickOnAccept();
    if( !!document.getElementById("vjs_video_3_html5_api") ){
        document.getElementById("vjs_video_3_html5_api").remove();
    }
});

function searchAndSendMessage(ghost){
    let url = window.location.toString();
    var userName = $(".user_information_header_username").text();

    if ( !url.includes(userName) && !url.includes("followed-cams") && url.includes("chaturbate.com") ) {
        console.log("Pidiendo cerrar la pestaña de usuario masculino para " + userName + " de la página " + window.location.toString());

        if( ghost == false ){
            setTimeout(callCloseTab, tabTimeout, userName); 

            if (delayBeforeSendMsg > 0) { 
                var timeOut = randomInteger(delayBeforeSendMsg - 500, delayBeforeSendMsg + 4500);
                setTimeout(callInitMsgProcess, timeOut, userName);
            }
        } else {
            setTimeout(callCloseTab, 250000, userName); 
        }
    
    } else {
        console.log("Página desconocida: " + url);
    }
}

function callInitMsgProcess(userName) {
    if (document.querySelector(divmessageBox)) {
        let url = window.location.toString();

        console.log("pidiendo msj para" + userName + " mostrar " + url);
        let msg = {
            txt: "askForMessage",
            tab: 0,
            param: url,
            param2: userName
        }
        chrome.runtime.sendMessage(msg);
    } else {
        console.log("callInitFollowProcess --> No se puede encontrar el cuadro de texto para los mensajes!");

        if (!alreadySendMessageCalled) {
            var timeOut = randomInteger(delayBeforeSendMsg - 500, delayBeforeSendMsg + 4500);
            setTimeout(callInitMsgProcess, timeOut, userName);
            alreadySendMessageCalled = true;
        }
    }
}

function callCloseTab(userName) {
    let url = window.location.toString();
    console.log("pidiendo cerrar TAB para " + userName + " para url " + url);
    let msg = {
        txt: "closeTab",
        tab: 0,
        param: url,
        param2: userName
    }
    chrome.runtime.sendMessage(msg);
}

function startOpenTabs(userList, userName) {
    console.log("startOpenTabs modelo:" + userName + " usuarios:" + userList);
    var userArray = userList.split("|");

    var first = "https://es.chaturbate.com/" + userArray[0];
    var liens = [];

    for (i = 1; i < userArray.length; i++) {
        if (userArray[i] != "") {
            liens.push("https://es.chaturbate.com/" + userArray[i]);
        }
    }

    var timeOut = randomInteger(tabFreq - 500, tabFreq + 1500);

    console.log("Configuración del tiempo de espera para " + timeOut + "s...");

    onPause = false;
    test = testVal;
    setTimeout(openNextTab, timeOut, liens, test);

    console.log("pidiendo abrir " + first + " para usuario " + userName);
    let msg = {
        txt: "openNewTab",
        tab: liens.length,
        param: first,
        param2: userName
    }

    chrome.runtime.sendMessage(msg);
}

function setPause(p) {
    onPause = p;
}

function openNextTab(liens, t) {
    if (onPause == true) {
        console.log("openNextTab en Pausa... esperando 1 segundo...");
        setTimeout(openNextTab, 1000, liens, t);
        return;
    }

    var nouveauxLiens = liens;
    var test = t;
    var userName = $(".user_information_header_username").text();

    var lien = nouveauxLiens.shift();

    document.title = "Faltan " + nouveauxLiens.length + " por abrir";

    console.log("Para el usuario " + userName + " pidiendo abrir " + lien + " from page " + window.location.toString());
    let msg = {
        txt: "openNewTab",
        tab: nouveauxLiens.length,
        param: lien,
        param2: userName
    }
    chrome.runtime.sendMessage(msg);

    if (test == 0) {
        if (nouveauxLiens.length > 0) {
            var timeOut = randomInteger(tabFreq - 500, tabFreq + 1500);
            console.log("Configuración del tiempo de espera para" + timeOut / 1000 + "second...");
            setTimeout(openNextTab, timeOut, nouveauxLiens, test);
        } else {
            console.log("Preguntar con tiempo de espera para cerrar la ventana para " + userName + " De la página " + window.location.toString());
            setTimeout(callClose, tabTimeout + 3000, userName);
        }

    } else {
        test = test - 1;

        if (test > 0) {
            var timeOut = randomInteger(tabFreq - 500, tabFreq + 1500);
            console.log("Configuración del tiempo de espera (TEST) para " + timeOut / 1000 + "second...");
            setTimeout(openNextTab, timeOut, nouveauxLiens, test);
        } else {
            console.log("Preguntar con tiempo de espera de 60 s para cerrar la ventana (PRUEBA) para " + userName + " De la página " + window.location.toString());
            setTimeout(callClose, 60000, userName);
        }
    }
}

function callClose(userName) {
    let url = window.location.toString();
    console.log("Pidiendo cerrar VENTANA para " + userName + " para url " + url);
    let msg = {
        txt: "closeWindow",
        tab: 0,
        param: url,
        param2: userName
    }
    chrome.runtime.sendMessage(msg);
}

async function revisarModelo( msg, userName ){
    
    await fetch(url_api_modelos + userName, {
        method:'GET'
    })
        .then(response => response.json())
        .then(function (json) {
            if( json["itemCount"] > 0 ){
                if( json["body"]["estado"] == "1" ){
                    chrome.runtime.sendMessage(msg);
                }else{
                    alert("La modelo " + userName + " tiene deshabilitado el trafico");
                }
            }else{
                alert("La modelo " + userName + " No esta esta registrada para trafico");
            }
        })
        .catch(error => alert("No se le puede hacer trafico a esta modelo" + error));
};

chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(request, sender, sendResponse) {
    let url = window.location.toString();
    console.log("trabajando en la página: " + url + " solicitar:" + request.txt);

    let texteToSend = "";

    if (request.txt == "startProcessGoldCont") {
        var userName = $(".user_information_header_username").text();
        if (url.includes(userName)) {
            console.log("Iniciando proceso de trafico de modelo tipo 1 (Premium) para " + userName);
            let msg = {
                txt: "startProcessGold",
                tab: request.tab,
                userName: userName,
                param: request.param,
                param2: request.param2,
                param3: request.param3,
                param4: request.param4,
                param5: request.param5
            }
            revisarModelo(msg, userName);
            
        } else {
            alert("¡Tienes que estar en la biografia de la modelo!");
        }
    } else if (request.txt == "startProcess2Cont") {
        var userName = $(".user_information_header_username").text();
        if (url.includes(userName)) {
            console.log("Iniciando proceso de trafico de modelo tipo 2 (No Premium) para " + userName);
            let msg = {
                txt: "startProcess2",
                tab: request.tab,
                userName: userName,
                param: request.param,
                param2: request.param2,
                param3: request.param3,
                param4: request.param4,
                param5: request.param5
            }
            revisarModelo(msg, userName);
            //chrome.runtime.sendMessage(msg);
        } else {
            alert("¡Tienes que estar en la biografia de la modelo!");
        }
    } else if (request.txt == "startProcessGhost") {
        var userName = $(".user_information_header_username").text();
        if (url.includes(userName)) {
            console.log("Iniciando proceso de trafico sabana " + userName);
            let msg = {
                txt: "startProcess3Ghost",
                tab: request.tab,
                userName: userName,
                param: request.param,
                param2: request.param2,
                param3: request.param3,
                param4: request.param4,
                param5: request.param5
            }
            revisarModelo(msg, userName);
            
        } else {
            alert("¡Tienes que estar en la biografia de la modelo!");
        }
    } else if (request.txt == "openCloseWarning") {
        console.log("openCloseWarning called!");
        clickOnAccept();
    }

    if (request.txt == "sendBackUser") {
        console.log("Enviar usuario de regreso...");
        sendUserBack();
    }
    if (request.txt == "sendNowRandom") {
        console.log("Aleatorio...");
        texteToSend = request.message;
    }
    if (request.txt == "sendNow") {
        console.log("Boton...");
        texteToSend = "Hello baby";
    }
    if (texteToSend != "") {
        console.log("texto a enviar:" + texteToSend);

        if (document.querySelector(divmessageBox)) {

            document.querySelector(divmessageBox).innerHTML = texteToSend;

            if ( !!document.querySelector(".acceptRulesButton") ){
                document.querySelector(".acceptRulesButton").click();
            }

            if ($(btnDisabled)[0])
            {
                let url = window.location.toString();
                console.log("Pidiendo abrir Win y cerrar TAB para" + userName + " para url " + url);

                let msg = {
                    txt: "openWinUser",
                    tab: 0,
                    param: url,
                    param2: userName
                }

                chrome.runtime.sendMessage(msg);

                msg = {
                    txt: "closeTab",
                    tab: 0,
                    param: url,
                    param2: userName
                }

                chrome.runtime.sendMessage(msg);
            } else if ($(btnSend)) {
                $(btnSend)[0].click();

                msg = {
                    txt: "msgSended",
                    tab: 0,
                    param: url,
                    param2: userName,
                    param3: texteToSend
                }

                chrome.runtime.sendMessage(msg);
            }
        } else {
            console.log("Caja no encontrada para enviar!");
        }
    }
}