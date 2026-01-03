import numpy as np
from tensorflow.keras.applications.resnet50 import (
    ResNet50, preprocess_input, decode_predictions
)
from tensorflow.keras.preprocessing import image
from PIL import Image

model = ResNet50(weights='imagenet')
def generate_tags(image_path, top_k=5):
    try:
        img = Image.open(image_path).convert("RGB")
        img = img.resize((224, 224))

        x= image.img_to_array(img)
        x = np.expand_dims(x, axis=0)
        x = preprocess_input(x)

        preds = model.predict(x)
        decoded = decode_predictions(preds, top=top_k)[0]

        tags= [label.replace("_", " ") for (_, label,prob) in decoded if prob > 0.1]
        return ",".join(set(tags))
    
    except Exception as e:
        print(e)
        return ""