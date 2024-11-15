from flask import Flask, render_template, request, redirect,url_for, flash,jsonify
import mysql.connector
import base64
import tensorflow as tf
from PIL import Image
import numpy as np
from datetime import datetime
#para poder trabajar con mail
from flask_mail import Mail , Message
from flask_sqlalchemy import SQLAlchemy

#Parte adicional para insertar a un nuevo usuario
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'kingaldair'

def connect_to_db():
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database='proyecto_tesis'
    )


#Configuracion de Correo enviar usuaruio y contraseña
# Configuración de Mail
app.config['MAIL_SERVER'] = 'smtp.gmail.com' #es si quieres utilizar gmail, outool  o hotmail
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'aldairdiazcruz9@gmail.com'
app.config['MAIL_PASSWORD'] = 'bjem hugr cruk aksx'
app.config['MAIL_DEFAULT_SENDER'] = 'aldairdiazcruz9@gmail.com'

# Inicializar Flask-Mail
mail = Mail(app)

# Habilitar el nivel de depuración en el servidor SMTP
#-pendiendte si se puede eliminar 
mail.debug = 1  # Activa la depuración SMTP



#parte para que funcione la insercion de nuevo usuario 
import time 
# Función para insertar usuario en la base de datos
def insert_user(username, email, password_hash):
    connection = connect_to_db()
    cursor = connection.cursor()
    try:
        start_time = time.time()
        cursor.execute("INSERT INTO users (username, email, password) VALUES (%s, %s, %s)", (username, email, password_hash))
        connection.commit()
        print(f"Tiempo de insercion: {time.time()- start_time} segundos") #tiempo que tardo la operacion en realizarse 
        return True
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        connection.rollback()
        return False
    finally:
        connection.close()

#parte para lo que es el envio de correos
from threading import Thread
def send_async_email(app, msg):
    with app.app_context():
        mail.send(msg)
# Función para enviar correo con usuario y contraseña en texto plano
def send_registration_email(username, email, password):
    msg = Message(
        subject="Bienvenido a nuestra aplicación TaekData",
        recipients=[email],
        #html=f"<p>Hola {username},</p><p>Gracias por registrarte.</p><p>Tu contraseña es: {password}</p>"
        sender= "aldairdiazcruz9@gmail.com"   
    )
    
    msg.html = render_template ('mensaje.html', username=username, email=email, password=password )
    #Thread(target=send_async_email, args=(app, msg)).start()
    mail.send(msg)

#Registro de nuevo usuario
# Ruta para el registro de usuarios
# Ruta para el registro de usuarios
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        confirm_password = request.form['confirm_password']

        # Validar que las contraseñas coincidan
        if password != confirm_password:
            flash('Las contraseñas no coinciden', 'error')
            return render_template('registro.html')

        # Hashear la contraseña antes de guardarla
        password_hash = generate_password_hash(password)

        # Insertar usuario en la base de datos
        if insert_user(username, email, password_hash):
            # Enviar correo con el usuario y la contraseña en texto plano
            send_registration_email(username, email, password)
            flash('Registro exitoso. Se ha enviado un correo con tus credenciales.', 'success')
            return redirect(url_for('register'))  # Puedes redirigir a una página de inicio de sesión
        else:
            flash('Hubo un problema al registrar el usuario.', 'error')

    return render_template('registro.html')

#-----------------#

model = tf.keras.models.load_model('taekwondo_postures_model.keras')
#parte añadida 


@app.route('/analizar_pose', methods=['POST'])
def analizar_pose():
    image_file = request.files['image']
    image = Image.open(image_file).resize((224, 224))
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)  # Añadir dimensión extra para lote
    
    prediction = model.predict(image)
    predicted_class = np.argmax(prediction)
    #parte añadida
    return jsonify({'pose': str(predicted_class)})

#base para conseguir los estudiantes 
def check_user(username, password):
    connection = connect_to_db()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    connection.close()
    

    #si el usuario existe, comparamos la contraseña ingresada con el hash en la base 
    if user and check_password_hash(user['password'], password):
        return True
    else:
        return False
#---------
    
#formulario si es que sale error
@app.route('/login_form')
def login_form():
    error = request.args.get('error')
    return render_template('login.html', error=error)

#formulario principal pagina 
@app.route('/pagina_principal')
def pagina_principal():
    return render_template('principal.html')

@app.route('/')
def home():
    return render_template('login.html')


@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    
    if check_user(username, password):
        return redirect(url_for('pagina_principal'))

    else:
        return redirect(url_for('login_form'))
    
@app.route('/logout')
def logout():
    #session.pop('logged_in', None)
    return redirect(url_for('home'))

@app.route('/inicio')
def inicio():
    #session.pop('logged_in', None)
    return render_template('inicio.html')

@app.route('/entrenamiento')
def entrenamiento():
    connection = connect_to_db()
    cursor = connection.cursor(dictionary=True)
    #session.pop('logged_in', None)
    cursor.execute("SELECT nombre, apellidos FROM alumnos")  # Selecciona solo nombre y apellidos
    estudiantes = cursor.fetchall()
    # Verifica que los datos se están recuperando correctamente
    print("Datos de estudiantes recuperados:", estudiantes)  # Mensaje de depuración
    
    # Cierra la conexión
    connection.close()
    return render_template('entrenamiento.html',estudiantes=estudiantes )

@app.route('/alumno')
def alumno():
    #obtener la lista de deportista registrados 
    connection = connect_to_db()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM alumnos")
    alumnos = cursor.fetchall()
    connection.close()
    return render_template('ralumno.html' , alumnos=alumnos)






@app.route('/registro_alumno', methods=['POST'])
def register_alumno():
    if request.method == 'POST':
        nombre = request.form['nombre']
        apellidos = request.form['apellidos']
        graduacion = request.form['graduacion']
        tipo_chagui = request.form['tipo_chagui']
        
        connection = connect_to_db()
        cursor = connection.cursor()
        
        try:
            # Insertar el alumno en la base de datos
            cursor.execute("INSERT INTO alumnos (nombre, apellidos, graduacion, tipo_chagui) VALUES (%s, %s, %s, %s)",
                           (nombre, apellidos, graduacion, tipo_chagui))
            connection.commit()
        except mysql.connector.Error as err:
            print(f"Error: {err}")
            connection.rollback()
            flash('Error al registrar el Alumno.' , 'error')
        finally:
            connection.close()
        
        #redirigir a la pagiina del formulario 
        return redirect(url_for('alumno'))





#parte de enviar correo y de pagina de reportes 
@app.route('/enviar_analisis', methods=['POST'])
def enviar_analisis():
    data = request.json
    if not data:
        return jsonify({"error": "No se recibieron datos"}), 400

    nombre = data.get('nombre')
    feedback = data.get('feedback')
    correo = data.get('correo')
    canvas_data = data.get('canvasData')

    # Validar datos
    if not all([nombre, feedback, correo, canvas_data]):
        return jsonify({"error": "Todos los campos son obligatorios"}), 400

    # Convertir el dato del canvas de base64 a imagen
    canvas_data = canvas_data.replace('data:image/png;base64,', '')
    try:
        canvas_image = base64.b64decode(canvas_data)
    except Exception as e:
        return jsonify({"error": "Error al decodificar la imagen"}), 400

    # Guardar temporalmente la imagen del canvas
    canvas_filename = 'analisis.png'
    with open(canvas_filename, 'wb') as f:
        f.write(canvas_image)

    # Conectar a la base de datos y guardar los datos
    connection = connect_to_db()
    cursor = connection.cursor()
    try:
        query = """
            INSERT INTO reportes (nombre, feedback, correo, canvas_data, fecha)
            VALUES (%s, %s, %s, %s, %s)
        """
        fecha = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        values = (nombre, feedback, correo, canvas_data, fecha)
        cursor.execute(query, values)
        connection.commit()
    except mysql.connector.Error as err:
        return jsonify({"error": f"Error al guardar en la base de datos: {err}"}), 500
    finally:
        cursor.close()
        connection.close()

    # Preparar y enviar el correo
    msg = Message(subject="Análisis de Entrenamiento",
                  sender="aldairdiazcruz9@gmail.com",
                  recipients=[correo])
    msg.body = f"Hola {nombre},\n\nAquí tienes el análisis de tu entrenamiento.\n\nRetroalimentación: {feedback}"
    with app.open_resource(canvas_filename) as fp:
        msg.attach("analisis.png", "image/png", fp.read())

    mail.send(msg)

    return jsonify({"message": "El análisis ha sido enviado correctamente y se ha guardado en la base de datos."})



#parte de la pagina de reportes
@app.route('/reportes')
def mostrar_reportes():
    connection = connect_to_db()
    cursor = connection.cursor(dictionary=True)  # Usar `dictionary=True` para devolver los resultados como diccionarios
    cursor.execute("SELECT * FROM reportes")
    reportes = cursor.fetchall()
    # Consulta para obtener nombres únicos de estudiantes
    cursor.execute("SELECT DISTINCT nombre FROM reportes")
    nombres_unicos = cursor.fetchall()
    cursor.close()
    connection.close()

    return render_template('reportes.html', reportes=reportes, nombres_unicos=nombres_unicos)




if __name__ == '__main__':
    app.run(debug=True)