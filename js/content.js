// =======================
// CONFIGURACIÓN
// =======================
const SELECTORS = {
    messageBox: ".customInput.noScrollbar.chat-input-field.inputFieldChatPlaceholder.theatermodeInputFieldChat",
    btnSend: "span > .SplitMode.Button.SendButton.chat",
    btnDisabled: ".send-button.disabled.theatermodeSendButtonChat",
    userName: ".user_information_header_username",
    acceptRules: ".acceptRulesButton",
};

const API_MODELOS = "https://apps.phoenixstd.com/api/modelos.php?username=";
const TAB_FREQ = 10000;       // Intervalo entre apertura de tabs
const TAB_TIMEOUT = 150000;   // Tiempo antes de cerrar una pestaña
const DELAY_BEFORE_MSG = 6000; // ms antes de enviar mensaje

let alreadySendMessageCalled = false;
let onPause = false;

// =======================
// HELPERS
// =======================
function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDelay(base) {
    return randomInteger(base - 500, base + 4500);
}

function sendRuntimeMsg(msg) {
    chrome.runtime.sendMessage(msg);
}

// =======================
// VALIDACIONES / TERMS
// =======================
function clickOnAccept() {
    try {
        const aA = document.getElementById('aA');
        if (aA) {
            aA.getElementsByTagName('a')[2]?.click();
            console.log("✔ Terms aceptados (aA).");
        }
        const entrance = document.getElementById('close_entrance_terms');
        if (entrance) {
            entrance.click();
            console.log("✔ Terms aceptados (entrance_terms).");
        }
    } catch (e) {
        console.warn("⚠ No se pudieron aceptar los terms.", e);
    }
}

// =======================
// PROCESO DE MENSAJES
// =======================
function callInitMsgProcess(userName) {
    const msgBox = document.querySelector(SELECTORS.messageBox);
    if (msgBox) {
        const url = window.location.href;
        console.log("📩 Pidiendo mensaje para", userName, "en", url);
        sendRuntimeMsg({ txt: "askForMessage", param: url, param2: userName });
    } else if (!alreadySendMessageCalled) {
        console.log("⚠ Caja de texto no encontrada. Reintentando...");
        setTimeout(() => callInitMsgProcess(userName), randomDelay(DELAY_BEFORE_MSG));
        alreadySendMessageCalled = true;
    }
}

function callCloseTab(userName) {
    const url = window.location.href;
    console.log("❌ Cerrando TAB de", userName, "en", url);
    sendRuntimeMsg({ txt: "closeTab", param: url, param2: userName });
}

// =======================
// APERTURA DE TABS
// =======================
function startOpenTabs(userList, userName) {
    console.log("🚀 Iniciando tráfico para:", userName);
    const users = userList.split("|").filter(Boolean);

    if (users.length === 0) return;

    const [first, ...rest] = users.map(u => `https://es.chaturbate.com/${u}`);
    onPause = false;

    setTimeout(() => openNextTab(rest), randomDelay(TAB_FREQ));

    sendRuntimeMsg({ txt: "openNewTab", tab: rest.length, param: first, param2: userName });
}

function openNextTab(queue) {
    if (onPause) {
        setTimeout(() => openNextTab(queue), 1000);
        return;
    }

    if (queue.length === 0) return;

    const userName = document.querySelector(SELECTORS.userName)?.textContent || "desconocido";
    const nextUrl = queue.shift();

    console.log("➡️ Abriendo:", nextUrl);
    sendRuntimeMsg({ txt: "openNewTab", tab: queue.length, param: nextUrl, param2: userName });

    if (queue.length > 0) {
        setTimeout(() => openNextTab(queue), randomDelay(TAB_FREQ));
    } else {
        setTimeout(() => callClose(userName), TAB_TIMEOUT + 3000);
    }
}

function callClose(userName) {
    const url = window.location.href;
    console.log("❌ Cerrando ventana de", userName);
    sendRuntimeMsg({ txt: "closeWindow", param: url, param2: userName });
}

// =======================
// API VALIDACIÓN DE MODELOS
// =======================
async function revisarModelo(msg, userName) {
    try {
        const res = await fetch(API_MODELOS + userName);
        const json = await res.json();

        if (json.itemCount > 0 && json.body.estado === "1") {
            sendRuntimeMsg(msg);
        } else {
            alert(`⚠ La modelo ${userName} no está habilitada para tráfico.`);
        }
    } catch (e) {
        alert(`⚠ Error al validar modelo: ${e.message}`);
    }
}

// =======================
// LISTENER DE EVENTOS
// =======================
chrome.runtime.onMessage.addListener((request) => {
    const url = window.location.href;
    const userName = document.querySelector(SELECTORS.userName)?.textContent;

    console.log("📨 Mensaje recibido:", request.txt);

    switch (request.txt) {
        case "startProcessGoldCont":
        case "startProcess2Cont":
        case "startProcessGhost":
            if (url.includes(userName)) {
                const msg = { ...request, userName };
                revisarModelo(msg, userName);
            } else {
                alert("⚠ Debes estar en la biografía de la modelo.");
            }
            break;

        case "openCloseWarning":
            clickOnAccept();
            break;

        case "sendBackUser":
            sendUserBack();
            break;

        case "sendNow":
        case "sendNowRandom":
            sendMessage(userName, request.message || "Hello baby");
            break;
    }
});

// =======================
// ENVÍO DE MENSAJES
// =======================
function sendMessage(userName, texteToSend) {
    const msgBox = document.querySelector(SELECTORS.messageBox);

    if (!msgBox) {
        console.log("⚠ Caja de mensajes no encontrada.");
        return;
    }

    msgBox.innerHTML = texteToSend;
    document.querySelector(SELECTORS.acceptRules)?.click();

    if (document.querySelector(SELECTORS.btnDisabled)) {
        console.log("⚠ Botón deshabilitado. Reintentando...");
        sendRuntimeMsg({ txt: "openWinUser", param: window.location.href, param2: userName });
        sendRuntimeMsg({ txt: "closeTab", param: window.location.href, param2: userName });
    } else {
        document.querySelector(SELECTORS.btnSend)?.click();
        sendRuntimeMsg({ txt: "msgSended", param: window.location.href, param2: userName, param3: texteToSend });
    }
}

// =======================
// EVENTOS AL CARGAR
// =======================
window.addEventListener("load", () => {
    console.log("✅ Página cargada completamente.");
    clickOnAccept();

    const video = document.getElementById("vjs_video_3_html5_api");
    if (video) video.remove();
});
