from flask import Flask, request, jsonify
from annoy import AnnoyIndex
import pickle
import numpy as np
import google.generativeai as genai

G_TOKEN = {{'ENTER YOUR GOOGLE API TOKEN'}}

app = Flask(__name__)

# Load the initial data on server start
# with open("test", "rb") as fp:
#     chat_mess = pickle.load(fp)

GOOGLE_API_KEY = G_TOKEN
genai.configure(api_key=GOOGLE_API_KEY)

# result = genai.embed_content(
#     model="models/embedding-001",
#     content=chat_mess,
#     task_type="retrieval_document",
#     title="Embedding of chat history"
# )

# embeds = np.array(result['embedding'])

# annoy_model = AnnoyIndex(768, metric='angular')

# for i, embed in enumerate(embeds):
#     annoy_model.add_item(i, embed)
# annoy_model.build(i)

# annoy_model.save('embeds.ann')


@app.route('/on_load', methods=['POST'])
def on_load():
    chat_messages = request.json['messages']

    with open("test", "wb") as fp:
        pickle.dump(chat_messages, fp)

    result = genai.embed_content(
        model="models/embedding-001",
        content=chat_messages,
        task_type="retrieval_document",
        title="Embedding of list of paper abstracts"
    )

    embeds = np.array(result['embedding'])

    annoy_model = AnnoyIndex(embeds.shape[1], metric='angular')
    for i, embed in enumerate(embeds):
        annoy_model.add_item(i, embed)
    annoy_model.build(i)

    annoy_model.save('embeds.ann')

    return jsonify({"message": "Data loaded successfully!"})


@app.route('/on_message_send', methods=['POST'])
def on_message_send():
    msg = request.json['message']

    with open("test", "rb") as fp:
        chat_mess = pickle.load(fp)
    chat_mess.append(msg)

    with open("test", "wb") as fp:
        pickle.dump(chat_mess, fp)

    result = genai.embed_content(
        model="models/embedding-001",
        content=chat_mess,
        task_type="retrieval_document",
        title="Embedding of chat history"
    )

    embeds = np.array(result['embedding'])

    annoy_model = AnnoyIndex(768, metric='angular')

    for i, embed in enumerate(embeds):
        annoy_model.add_item(i, embed)
    annoy_model.build(i)

    annoy_model.save('embeds.ann')

    return jsonify({"message": "Message added successfully!"})


@app.route('/get_reply', methods=['POST'])
def get_reply():
    question = request.json['question']

    with open("test", "rb") as fp:
        chat_mess = pickle.load(fp)

    annoy_model_load = AnnoyIndex(768, metric='angular')
    annoy_model_load.load('embeds.ann')

    def get_top_results(query, k):
        query_embed = genai.embed_content(
            model="models/embedding-001",
            content=query,
            task_type="retrieval_query",
        )

        similar_item_ids = annoy_model_load.get_nns_by_vector(query_embed['embedding'], k, include_distances=True)

        query_results = [chat_mess[i] for i in similar_item_ids[0]]

        return ".\n".join(query_results)

    k = 5
    rel_messages = get_top_results(question, k)
    
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
    return jsonify({"response_text": response.text})


if __name__ == '__main__':
    app.run(debug=True)
