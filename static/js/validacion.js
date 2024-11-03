document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('loginForm');
    const username = document.getElementById('username');
    const password = document.getElementById('password');

    // Función para validar el campo
    function validateField(field, message) {
        if (!field.value) {
            field.setCustomValidity(message);
        } else {
            field.setCustomValidity('');
        }
    }

    // Validación al enviar el formulario
    form.addEventListener('submit', function (event) {
        // Validar ambos campos
        validateField(username, 'Por favor, ingrese su nombre de usuario.');
        validateField(password, 'Por favor, ingrese su contraseña.');

        // Si hay algún mensaje de error, evita el envío del formulario
        if (!username.checkValidity() || !password.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        }
    });

    // Validación en tiempo real
    username.addEventListener('input', function () {
        validateField(username, 'Por favor, ingrese su nombre de usuario.');
    });

    password.addEventListener('input', function () {
        validateField(password, 'Por favor, ingrese su contraseña.');
    });
});

