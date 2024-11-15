import os
from load_data import load_data
from cnn_model import create_model

# Rutas a las carpetas del dataset
train_dir = '/Proyecto_de_tesis/VersionEnPython/train'
valid_dir = '/Proyecto_de_tesis/VersionEnPython/valid'
test_dir = '/Proyecto_de_tesis/VersionEnPython/test'

# Cargar los datos
train_generator, valid_generator, test_generator = load_data(train_dir, valid_dir, test_dir)

# Crear el modelo
input_shape = (224, 224, 3)
num_classes = train_generator.num_classes
model = create_model(input_shape=input_shape, num_classes=num_classes)

# Entrenar el modelo
history = model.fit(
    train_generator,
    validation_data=valid_generator,
    epochs=10
)

# Evaluar el modelo en el conjunto de prueba
test_loss, test_acc = model.evaluate(test_generator)
print(f"Test accuracy: {test_acc}")

# Guardar el modelo entrenado
model.save('taekwondo_postures_model.keras')
