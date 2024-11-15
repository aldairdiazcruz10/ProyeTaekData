
let videoElement = document.getElementById("video");
let brightnessSlider = document.getElementById("brightness-slider");
let speedSlider = document.getElementById("speed-slider");
let phaseLabel = document.getElementById("phase-label");
let supportKneeBar = document.getElementById("support-knee-bar");
let executionKneeBar = document.getElementById("execution-knee-bar");

let poseDetector;
let analysisEnabled = false;
let brightness = 0;

async function setupPoseDetector() {
    const model = poseDetection.SupportedModels.MoveNet;
    poseDetector = await poseDetection.createDetector(model);
}

async function startAnalysis() {
    analysisEnabled = true;
    await analyzePose();
}

async function analyzePose() {
    if (analysisEnabled) {
        const poses = await poseDetector.estimatePoses(videoElement);

        if (poses && poses.length > 0) {
            const landmarks = poses[0].keypoints;

            // Procesa ángulos y fases
            updateProgressBars(landmarks);
            detectPhase(landmarks);
        }
        requestAnimationFrame(analyzePose);
    }
}

function loadVideo() {
    // Aquí, el usuario seleccionará un archivo de video
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        videoElement.src = URL.createObjectURL(file);
    };
    input.click();
}

function playVideo() {
    videoElement.play();
}

function pauseVideo() {
    videoElement.pause();
}

function updateBrightness() {
    brightness = parseInt(brightnessSlider.value);
    videoElement.style.filter = `brightness(${brightness}%)`;
}

brightnessSlider.addEventListener("input", updateBrightness);

function detectPhase(landmarks) {
    // Detectar la fase del movimiento usando los puntos clave
    let kneeAngle = calculateAngle(landmarks[11], landmarks[13], landmarks[15]);  // Ejemplo usando cadera, rodilla y tobillo
    if (kneeAngle < 30) phaseLabel.textContent = "Fase: Preparatoria";
    else if (kneeAngle < 90) phaseLabel.textContent = "Fase: Inicial";
    else if (kneeAngle >= 90) phaseLabel.textContent = "Fase: Impacto";
}

function updateProgressBars(landmarks) {
    // Calcula el ángulo de la rodilla de apoyo y ejecución
    let supportKneeAngle = calculateAngle(landmarks[11], landmarks[13], landmarks[15]);
    let executionKneeAngle = calculateAngle(landmarks[12], landmarks[14], landmarks[16]);

    // Actualiza barras con base en el ángulo
    supportKneeBar.style.width = `${supportKneeAngle}%`;
    executionKneeBar.style.width = `${executionKneeAngle}%`;
}

function calculateAngle(pointA, pointB, pointC) {
    // Calcula el ángulo entre tres puntos
    let dx1 = pointA.x - pointB.x;
    let dy1 = pointA.y - pointB.y;
    let dx2 = pointC.x - pointB.x;
    let dy2 = pointC.y - pointB.y;
    let dotProduct = dx1 * dx2 + dy1 * dy2;
    let mag1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    let mag2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    return Math.acos(dotProduct / (mag1 * mag2)) * (180 / Math.PI);
}

setupPoseDetector();

    async function setupPoseDetector() {
        const model = poseDetection.SupportedModels.MoveNet;
        poseDetector = await poseDetection.createDetector(model);
    }

    async function startAnalysis() {
        analysisEnabled = true;
        await analyzePose();
    }

    async function analyzePose() {
        if (analysisEnabled) {
            const poses = await poseDetector.estimatePoses(videoElement);

            if (poses && poses.length > 0) {
                const landmarks = poses[0].keypoints;

                // Procesa ángulos y fases
                updateProgressBars(landmarks);
                detectPhase(landmarks);
            }
            requestAnimationFrame(analyzePose);
        }
    }

    function loadVideo() {
        // Aquí, el usuario seleccionará un archivo de video
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            videoElement.src = URL.createObjectURL(file);
        };
        input.click();
    }

    function playVideo() {
        videoElement.play();
    }

    function pauseVideo() {
        videoElement.pause();
    }

    function updateBrightness() {
        brightness = parseInt(brightnessSlider.value);
        videoElement.style.filter = `brightness(${brightness}%)`;
    }

    brightnessSlider.addEventListener("input", updateBrightness);

    function detectPhase(landmarks) {
        // Detectar la fase del movimiento usando los puntos clave
        let kneeAngle = calculateAngle(landmarks[11], landmarks[13], landmarks[15]);  // Ejemplo usando cadera, rodilla y tobillo
        if (kneeAngle < 30) phaseLabel.textContent = "Fase: Preparatoria";
        else if (kneeAngle < 90) phaseLabel.textContent = "Fase: Inicial";
        else if (kneeAngle >= 90) phaseLabel.textContent = "Fase: Impacto";
    }

    function updateProgressBars(landmarks) {
        // Calcula el ángulo de la rodilla de apoyo y ejecución
        let supportKneeAngle = calculateAngle(landmarks[11], landmarks[13], landmarks[15]);
        let executionKneeAngle = calculateAngle(landmarks[12], landmarks[14], landmarks[16]);

        // Actualiza barras con base en el ángulo
        supportKneeBar.style.width = `${supportKneeAngle}%`;
        executionKneeBar.style.width = `${executionKneeAngle}%`;
    }

    function calculateAngle(pointA, pointB, pointC) {
        // Calcula el ángulo entre tres puntos
        let dx1 = pointA.x - pointB.x;
        let dy1 = pointA.y - pointB.y;
        let dx2 = pointC.x - pointB.x;
        let dy2 = pointC.y - pointB.y;
        let dotProduct = dx1 * dx2 + dy1 * dy2;
        let mag1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
        let mag2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        return Math.acos(dotProduct / (mag1 * mag2)) * (180 / Math.PI);
    }

    setupPoseDetector();
    const responses = {
        saludo: ["¡Hola! ¿En qué puedo ayudarte?", "Hola, ¿cómo estás?", "¡Buenas! ¿Qué necesitas?"],
        despedida: ["¡Hasta luego!", "Adiós, cuídate.", "Nos vemos, ¡que tengas un buen día!"],
        preguntas: {
            "cómo estás": ["Estoy aquí para ayudarte, ¿en qué te puedo servir?", "Todo bien, ¡listo para responder tus preguntas!"],
            "qué puedes hacer": ["Puedo responder preguntas simples y charlar un rato. ¿Qué quieres saber?", "Estoy aquí para ayudarte con información general. Pregunta lo que necesites."],
            "cuál es tu nombre": ["Puedes llamarme IA Simulada.", "Soy una IA creada para responderte."],
        },
        default: ["Lo siento, no entiendo. ¿Podrías reformular?", "Interesante, ¿puedes decirme más?", "No estoy seguro de entender, ¿quieres preguntar otra cosa?"]
    };

    function getResponse(message) {
        message = message.toLowerCase();

        // Respuestas predefinidas según palabras clave
        if (message.includes("hola") || message.includes("buenos días") || message.includes("buenas tardes")) {
            return responses.saludo[Math.floor(Math.random() * responses.saludo.length)];
        }
        if (message.includes("adiós") || message.includes("hasta luego")) {
            return responses.despedida[Math.floor(Math.random() * responses.despedida.length)];
        }

        // Buscar en las preguntas
        for (let question in responses.preguntas) {
            if (message.includes(question)) {
                const res = responses.preguntas[question];
                return res[Math.floor(Math.random() * res.length)];
            }
        }

        // Respuesta por defecto si no se reconoce la pregunta
        return responses.default[Math.floor(Math.random() * responses.default.length)];
    }

    function sendMessage() {
        const userInput = document.getElementById("user-input");
        const chatLog = document.getElementById("chat-log");
        const message = userInput.value.trim();

        if (message) {
            // Mostrar mensaje del usuario
            const userMessage = document.createElement("div");
            userMessage.className = "message user";
            userMessage.textContent = message;
            chatLog.appendChild(userMessage);

            // Obtener y mostrar respuesta de la "IA"
            const botMessage = document.createElement("div");
            botMessage.className = "message bot";
            botMessage.textContent = getResponse(message);
            chatLog.appendChild(botMessage);

            // Limpiar el campo de entrada y hacer scroll hacia abajo
            userInput.value = "";
            chatLog.scrollTop = chatLog.scrollHeight;
        }
    }

    // Permitir envío de mensaje al presionar Enter
    document.getElementById("user-input").addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            sendMessage();
        }
    });