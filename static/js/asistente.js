function toggleAssistant() {
    const dialog = document.getElementById('assistant-dialog');
    dialog.classList.toggle('visible');
}

function handleInput(event) {
    if (event.key === 'Enter') {
        const inputField = document.getElementById('user-input');
        const userMessage = inputField.value.trim();
        if (userMessage) {
            addMessage(userMessage, 'user');
            inputField.value = '';
            generateResponse(userMessage);
        }
    }
}

function addMessage(message, sender) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.className = sender === 'user' ? 'user-message' : 'assistant-message';
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll automático
}

let awaitingEmail = false; // Variable para controlar el estado de espera de correo

function generateResponse(userMessage) {
    // Convertir el mensaje a minúsculas para manejo de casos
    const lowerCaseMessage = userMessage.toLowerCase();

    // Lógica de respuesta según el estado de espera
    if (awaitingEmail) {
        if (validateEmail(userMessage)) {
            addMessage(`Gracias, hemos registrado tu correo: ${userMessage}`, 'assistant');
            awaitingEmail = false; // Resetear el estado
        } else {
            addMessage("El correo proporcionado no es válido. Por favor, ingrésalo nuevamente.", 'assistant');
        }
        return;
    }

     // Respuestas predefinidas
     const responses = {
        "hola": "¡Hola! ¿En qué puedo ayudarte hoy? Si deseas información sobre Taekwondo, escribe 'Quiero saber del Taekwondo' o si tienes un problema, escribe 'Tengo un problema'.",
        "quiero saber del taekwondo": "El Taekwondo es un arte marcial coreano que enfatiza patadas altas, movimientos rápidos y disciplina física y mental.",
        "tengo un problema": "Lamentamos escuchar eso. Por favor, llama al siguiente número para asistencia: 960-508-670.",
        "adios": "¡Hasta luego! Si necesitas más ayuda, estaré aquí.",
        "registrar": "Para registrarte, por favor ingresa tu correo electrónico.",
        "registro": "¡Entendido! Por favor, proporciona tu correo para registrarte.",
        "quisiera retroalimentacion": "Aquí tienes algunos videos de Taekwondo para mejorar tus técnicas: <a href='https://www.youtube.com/watch?v=HaPGZA-RTDc' target='_blank'>Video 1</a>, <a href='https://www.youtube.com/watch?v=l2S91jVBPQI' target='_blank'>Video 2</a>. ¡Espero que te ayuden!"
    };
    
    const response = responses[lowerCaseMessage] || "Lo siento, aún estoy aprendiendo. ¿Puedes intentar con otra pregunta?";

    // Si la respuesta involucra registro, cambiar el estado de espera de correo
    if (lowerCaseMessage === "registrar" || lowerCaseMessage === "registro") {
        awaitingEmail = true;
    }

    addMessage(response, 'assistant');
}

// Función para validar el formato de correo electrónico
function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}
