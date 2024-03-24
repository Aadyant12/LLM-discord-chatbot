
import discord
from discord.ext import commands

import pandas as pd
import numpy as np

import google.generativeai as genai

from annoy import AnnoyIndex

import pickle
import re

def detect_personal_info(input_string):
    # Regular expressions for detecting phone numbers, email addresses, credit card numbers, and private keys
    phone_pattern = re.compile(r'\b(?:\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-\.\s]??\d{4}|\d{3}[-\.\s]??\d{4})\b')
    email_pattern = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
    credit_card_pattern = re.compile(r'(?:\d[ -]*?){13,16}')
    private_key_pattern = re.compile(r'[0-9a-fA-F]{64}')

    # Detect phone numbers
    phone_numbers = phone_pattern.findall(input_string)

    # Detect email addresses
    emails = email_pattern.findall(input_string)

    # Detect credit card numbers
    credit_cards = credit_card_pattern.findall(input_string)

    # Detect private keys
    private_keys = private_key_pattern.findall(input_string)

    # Print detected information
    if phone_numbers:
        print("Phone Numbers:", phone_numbers)
    else:
        print("No phone numbers found.")
    
    if emails:
        print("Email Addresses:", emails)
    else:
        print("No email addresses found.")
    
    if credit_cards:
        print("Credit Card Numbers:", credit_cards)
    else:
        print("No credit card numbers found.")
    
    if private_keys:
        print("Private Keys:", private_keys)
    else:
        print("No private keys found.")

TOKEN = {{'ENTER YOUR TOKEN HERE'}}

G_TOKEN = {{'ENTER YOUR TOKEN HERE'}}
# API_ENDPOINT = 'http://example.com/post_messages'

intents = discord.Intents.default()
intents.guilds = True
intents.messages = True
intents.message_content = True

bot = commands.Bot(command_prefix='!', intents=intents)

@bot.event
async def on_ready():
  print(f'{bot.user} has connected to Discord!')

all_messages = []
authors = []

@bot.event
async def on_guild_join(guild):

  # print(f'Joined a new guild: {guild.name}')
  # print(f'new guild: {guild}')

  for channel in guild.text_channels:
    # print("Channel ---> ",channel)
    if channel.name == 'hoohacks3':
      async for message in channel.history(limit=None):  # Fetch all messages
        authors.append(str(message.author))
        all_messages.append(str(message.content))

  print(f'Total Messages Collected: {len(all_messages)}')
  # print("Messages:",all_messages)
  final_strings = []
  for i in range(len(authors)):
    if len(all_messages[i]) != 0:
      final_strings.append(str(authors[i]) + " says " + str(all_messages[i]))
  if len(final_strings != 0):
    on_load(final_strings)



@bot.event
async def on_message(message):

  # print(message)
  # bot_user = str(bot.user).split('#')[0]
  # print(bot.user)
  # print(message.content,message.mentions)

  # has attachments 
  if message.attachments:
    # Assuming there's only one attachment, get the first one
    attachment = message.attachments[0]
    
    # Check if the attachment is a file
    if attachment.filename.endswith(('.txt')):
      # Download the file
      await attachment.save(attachment.filename)
      
      # Process the file here, for example, read its content
      with open(attachment.filename, 'r') as file:
          file_content = file.read()
      
      # Do something with the file content
      print(file_content)
      
      # Optionally, you can delete the file after processing
      import os
      os.remove(attachment.filename)

      embed_file(file_content)

  else:
    if "HooHacksBot" in str(message.author):
      print("Discarding=====", message)
      return
    print('mentions')
    print(message.mentions)
    
    if len(message.mentions) > 0 and "HooHacksBot" in message.mentions[0].name :
    # if message.content and message.content[0] == '?':
      # message.content = message.content[1:] + '?'
      # print("bot_message")

      prompt, reply = get_reply(message.content)
      print("prompt=", prompt)
      print("Reply=", reply)
      await message.channel.send(prompt)
      await message.channel.send(reply)
    # if len(message.mentions) > 0 and message.mentions[0].name == bot_user:
    #   print("on_message")
    #   print(generateAnswerAadyant(message.content))
    #   await message.channel.send(generateAnswerAadyant(message.content))
    else:
      # print("general_message")
      textual = str(message.author) + " says " + str(message.content)
      on_message_send(textual)

    
def embed_file(text):
  sentences = []
  new_sentences = re.split(r'[.!?]', text)
  for sentence in new_sentences:
      sentence = sentence.strip()
      if sentence:
          sentences.append(sentence)

  with open("test", "rb") as fp:   # Unpickling
    chat_mess = pickle.load(fp)

  for i in sentences:
    chat_mess.append(i)

  with open("test", "wb") as fp:
    pickle.dump(chat_mess, fp)

  # GOOGLE_API_KEY=G_TOKEN
  # genai.configure(api_key=GOOGLE_API_KEY)

  # result = genai.embed_content(
  #     model="models/embedding-001",
  #     content = chat_mess,
  #     task_type="retrieval_document",
  #     title="Embedding of chat history")

  # embeds = np.array(result['embedding'])

  # annoy_model = AnnoyIndex(768, metric='angular')

  # for i, embed in enumerate(embeds):
  #     annoy_model.add_item(i, embed)
  # annoy_model.build(i)

  # annoy_model.save('embeds.ann')



#receive chat messages in the form of a list
def on_load(msgs):
  chat_messages = msgs
  print(chat_messages)

  with open("test", "wb") as fp:
    pickle.dump(chat_messages, fp)

  # GOOGLE_API_KEY=G_TOKEN
  # genai.configure(api_key=GOOGLE_API_KEY)

  # result = genai.embed_content(
  #     model="models/embedding-001",
  #     content=chat_messages,
  #     task_type="retrieval_document",
  #     title="Embedding of list of paper abstracts")

  # embeds = np.array(result['embedding'])

  # annoy_model = AnnoyIndex(embeds.shape[1], metric='angular')
  # for i, embed in enumerate(embeds):
  #     annoy_model.add_item(i, embed)
  # annoy_model.build(i)

  # annoy_model.save('embeds.ann')



def on_message_send(msg):
  with open("test", "rb") as fp:   # Unpickling
    chat_mess = pickle.load(fp)
  chat_mess.append(msg)

  ##check document directory
  ##parse documents
  ## get list of chunks, chunks
  # for i in chunks:
  #   chat_mess.append(i)

  with open("test", "wb") as fp:
    pickle.dump(chat_mess, fp)

  # GOOGLE_API_KEY=G_TOKEN
  # genai.configure(api_key=GOOGLE_API_KEY)

  # result = genai.embed_content(
  #     model="models/embedding-001",
  #     content = chat_mess,
  #     task_type="retrieval_document",
  #     title="Embedding of chat history")

  # embeds = np.array(result['embedding'])

  # annoy_model = AnnoyIndex(768, metric='angular')

  # for i, embed in enumerate(embeds):
  #     annoy_model.add_item(i, embed)
  # annoy_model.build(i)

  # annoy_model.save('embeds.ann')


def get_reply(question):

  with open("test", "rb") as fp:   # Unpickling
      chat_mess = pickle.load(fp)

  GOOGLE_API_KEY=G_TOKEN
  genai.configure(api_key=GOOGLE_API_KEY)

  result = genai.embed_content(
      model="models/embedding-001",
      content = chat_mess,
      task_type="retrieval_document",
      title="Embedding of chat history")

  embeds = np.array(result['embedding'])

  annoy_model = AnnoyIndex(768, metric='angular')

  for i, embed in enumerate(embeds):
      annoy_model.add_item(i, embed)
  annoy_model.build(i)

  # annoy_model.save('embeds.ann')

  # annoy_model_load = AnnoyIndex(768, metric='angular')
  # annoy_model_load.load('embeds.ann')

  GOOGLE_API_KEY=G_TOKEN
  genai.configure(api_key=GOOGLE_API_KEY)

  def get_top_results(query, k):
    query_embed = genai.embed_content(
        model="models/embedding-001",
        content=query,
        task_type="retrieval_query",)

    # similar_item_ids = annoy_model_load.get_nns_by_vector(query_embed['embedding'], k, include_distances=True)
    similar_item_ids = annoy_model.get_nns_by_vector(query_embed['embedding'], k, include_distances=True)

    query_results = [chat_mess[i] for i in similar_item_ids[0]]

    return ".\n".join(query_results)

  k = 5
  rel_messages = get_top_results(question, k)

  # prompt = f"""Use the following messages to answer the following query. DO NOT USE YOUR OWN KNOWLEDGE.
  # <MESSAGES>: {rel_messages}
  # <QUERY>: {question}
  # """

  prompt = f"""You can use the following context to answer the query. 
  APPLY YOUR OWN KNOWLEDGE if the answer is not in the context.
  <CONTEXT>: {rel_messages}
  <QUERY>: {question}
  """
  
  model = genai.GenerativeModel('gemini-pro')

  response = model.generate_content(prompt, safety_settings=[
        {
            "category": "HARM_CATEGORY_DANGEROUS",
            "threshold": "BLOCK_NONE",
        },
        {
            "category": "HARM_CATEGORY_HARASSMENT",
            "threshold": "BLOCK_NONE",
        },
        {
            "category": "HARM_CATEGORY_HATE_SPEECH",
            "threshold": "BLOCK_NONE",
        },
        {
            "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            "threshold": "BLOCK_NONE",
        },
        {
            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
            "threshold": "BLOCK_NONE",
        },
    ])
  

  if 'does not mention' in  response.text:
    prompt = question

    model = genai.GenerativeModel('gemini-pro')

    response = model.generate_content(prompt, safety_settings=[
          {
              "category": "HARM_CATEGORY_DANGEROUS",
              "threshold": "BLOCK_NONE",
          },
          {
              "category": "HARM_CATEGORY_HARASSMENT",
              "threshold": "BLOCK_NONE",
          },
          {
              "category": "HARM_CATEGORY_HATE_SPEECH",
              "threshold": "BLOCK_NONE",
          },
          {
              "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              "threshold": "BLOCK_NONE",
          },
          {
              "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
              "threshold": "BLOCK_NONE",
          },
      ])
    red_emoji = "\U0001F534"
    return prompt, red_emoji + ' ' + response.text
  else:
    green_emoji = "\U0001F7E2"
    return prompt, green_emoji + ' ' + response.text


bot.run(TOKEN)