import numpy as np
from keras.applications.resnet50 import (
    ResNet50, preprocess_input, decode_predictions
)
from keras.preprocessing import image
from PIL import Image

from .storage_utils import open_image_from_field

model = ResNet50(weights='imagenet')


def generate_tags(image_source, top_k=5):
    """image_source: Django ImageField/File, path string, or file-like object."""
    try:
        if hasattr(image_source, "open"):
            pil_img = open_image_from_field(image_source)
        elif isinstance(image_source, str):
            pil_img = Image.open(image_source).convert("RGB")
        else:
            pil_img = Image.open(image_source).convert("RGB")

        pil_img = pil_img.resize((224, 224))

        x = image.img_to_array(pil_img)
        x = np.expand_dims(x, axis=0)
        x = preprocess_input(x)

        preds = model.predict(x, verbose=0)
        decoded = decode_predictions(preds, top=top_k)[0]

        tags = [label.replace("_", " ") for (_, label, prob) in decoded if prob > 0.1]
        return ",".join(set(tags))

    except Exception as e:
        print(e)
        return ""
