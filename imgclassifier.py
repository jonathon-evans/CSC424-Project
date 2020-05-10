#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sat Apr 25 22:43:52 2020

@author: owner
"""


import os
# os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"   # see issue #152
# os.environ["CUDA_VISIBLE_DEVICES"] = ""
#os.environ["TF_FORCE_GPU_ALLOW_GROWTH"] = 'True'

from secret import USRNAME, PASSWD
from PIL import Image
from sqlalchemy import create_engine
import tensorflow as tf
#import tensorflow.keras
import numpy as np
import re

engine = create_engine('mysql+pymysql://{}:{}@localhost/linetracker'.format(USRNAME,PASSWD))
conn = engine.connect()

# conn.execute(
#     """INSERT INTO fresh
#         VALUES (1,0,"Test")""")

input_data = ["x"]

freshimgs = os.listdir('./ImgDB/FR')
starbimgs = os.listdir('./ImgDB/SB')

# Disable scientific notation for clarity
np.set_printoptions(suppress=True)

# Load the model
#model = tensorflow.keras.models.load_model('./FR_keras_Model/keras_model.h5', compile=False)
frinterpreter = tf.lite.Interpreter(model_path="./FR_keras_Model/FR.tflite")
frinterpreter.allocate_tensors()
input_details = frinterpreter.get_input_details()
output_details = frinterpreter.get_output_details()

sbinterpreter = tf.lite.Interpreter(model_path="./SB_keras_Model/SB.tflite")
sbinterpreter.allocate_tensors()
sbinput_details = sbinterpreter.get_input_details()
sboutput_details = sbinterpreter.get_output_details()

# Create the array of the right shape to feed into the keras model
# The 'length' or number of images you can put into the array is
# determined by the first position in the shape tuple, in this case 1.
data = np.ndarray(shape=(1, 224, 224, 3), dtype=np.float32)

skipfresh = False
if not skipfresh:
    for file in freshimgs:
    
        image = Image.open('./ImgDB/FR/{}'.format(file))#'./Set4/Fresh/FR1583889301.jpg')'./Set4/Fresh/FR1583879701.jpg')
        time = re.search(r"[0-9]+", file)
        time = time.group()
        
        # Make sure to resize all images to 224, 224 otherwise they won't fit in the array
        image = image.crop((280,0,1000,720))
        image = image.resize((224, 224))
        image_array = np.asarray(image)
        
        # Normalize the image
        normalized_image_array = (image_array.astype(np.float32) / 127.0) - 1
        
        # Load the image into the array
        input_data[0] = normalized_image_array
        
        input_shape = input_details[0]['shape']
        #input_data = normalized_image_array
        frinterpreter.set_tensor(input_details[0]['index'], input_data)
        
        # run the inference
        frinterpreter.invoke()
        output_data = frinterpreter.get_tensor(output_details[0]['index'])
        maxi = 0
        pmax = 0.0
        for i in range(5):
            if output_data[0][i] > pmax:
                pmax = output_data[0][i]
                maxi = i 
    
        sclass = ''
        if maxi == 0:
            sclass='Closed'
        elif maxi == 1:
            sclass='NotBusy'
        elif maxi == 2:
            sclass='SomewhatBusy'
        elif maxi == 3:
            sclass='ModeratelyBusy'
        elif maxi == 4:
            sclass='VeryBusy'
        
        dbdata = {
                'time':time,
                'class':maxi,
                'sclass':sclass
                # 'raw':output_data[0]
            }
        conn.execute("""INSERT INTO fresh \nVALUES ({},{},"{}")""".format(time,maxi,sclass))
    
        # result=db.fresh.insert_one(dbdata)
        print(dbdata)

for file in starbimgs:
    
    image = Image.open('./ImgDB/SB/{}'.format(file))
    time = re.search(r"[0-9]+", file)
    time = time.group()
    
    image = image.crop((280,0,1000,720))
    image = image.resize((224, 224))
    image_array = np.asarray(image)
    normalized_image_array = (image_array.astype(np.float32) / 127.0) - 1
    
    input_data[0] = normalized_image_array
    
    input_shape = input_details[0]['shape']
    sbinterpreter.set_tensor(input_details[0]['index'], input_data)
    
    # run the inference
    sbinterpreter.invoke()
    output_data = sbinterpreter.get_tensor(output_details[0]['index'])
    maxi = 0
    pmax = 0.0
    for i in range(5):
        if output_data[0][i] > pmax:
            pmax = output_data[0][i]
            maxi = i 

    sclass = ''
    if maxi == 0:
        sclass='Closed'
    elif maxi == 1:
        sclass='NotBusy'
    elif maxi == 2:
        sclass='SomewhatBusy'
    elif maxi == 3:
        sclass='ModeratelyBusy'
    elif maxi == 4:
        sclass='VeryBusy'
    
    dbdata = {
            'time':time,
            'class':maxi,
            'sclass':sclass
            # 'raw':output_data[0]
        }
    conn.execute("""INSERT INTO starb \nVALUES ({},{},"{}")""".format(time,maxi,sclass))

    # result=db.fresh.insert_one(dbdata)
    print(dbdata)
