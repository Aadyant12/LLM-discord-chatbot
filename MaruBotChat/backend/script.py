import pickle
import sys
from time import time
from tensorflow.keras.models import load_model
# from tensorflow.keras import backend as K
from transformers import DistilBertTokenizerFast
import tensorflow as tf
import pandas as pd
import transformers
from transformers import TFDistilBertForSequenceClassification
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 
import warnings
warnings.filterwarnings("ignore")
tf.compat.v1.logging.set_verbosity(tf.compat.v1.logging.ERROR)

text_arg = sys.argv
text = text_arg[1]
# text = 'you are shit'

def multi_label_accuracy(y_true: tf.Tensor, y_pred: tf.Tensor) -> tf.Tensor:
    y_pred = tf.math.round(y_pred)
    exact_matches = tf.math.reduce_all(y_pred == y_true, axis=1)
    exact_matches = tf.cast(exact_matches, tf.float32)
    return tf.math.reduce_mean(exact_matches)
MAX_LENGTH = 200
dir_name = os.path.dirname(__file__)
relative_path = os.path.join(dir_name, 'bert_model.h5')
model = load_model(relative_path,
                   custom_objects={"multi_label_accuracy": multi_label_accuracy})
tokenizer = DistilBertTokenizerFast.from_pretrained('distilbert-base-uncased')
# print(0.82,'severe-toxic')

def score_text(text, model, tokenizer):
    padded_encodings = tokenizer.encode_plus(
        text,
        max_length=MAX_LENGTH,
        return_token_type_ids=True,
        return_attention_mask=True,
        truncation=True,
        padding='max_length',
        return_tensors='tf'
    )
    return model(padded_encodings["input_ids"]).numpy()

scores = score_text(text, model, tokenizer)[0]
label_names = ['toxic', 'severe-toxic', 'obscene', 'threat', 'insult', 'identity-hate']
newDf = pd.DataFrame({'scores': scores, 'label_names': label_names})
newDf = newDf.set_index('label_names')

isToxic = 0
messageClass = ''
maxVal = -999999999
for i in zip(newDf.index, newDf['scores']):
  if i[0] == 'toxic':
    isToxic = i[1]
  else:
    if maxVal < i[1]:
      messageClass = i[0]
      maxVal = i[1]
print(round(isToxic,2),messageClass)

