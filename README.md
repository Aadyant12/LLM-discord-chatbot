# What MAruBot is?
While we have created MaruBot as a chatbot on Discord; we've also developed a web extension that brings its capabilities to life virtually anywhere. This extension allows MaruBot to retrieve information from platforms that don't have native bot support, as well as from webpages, enabling it to comprehensively answer your queries.

Using MaruBot is super simple on Discord. First, we install MaruBot on the Discord server. Then, any user can send a message tagging @MaruBot on any channel, and MaruBot will quickly respond with a context-aware, personalized message. This message will have a green bubble preceding it, indicating that the bot is using chat history and is confident of the answer, avoiding any hallucination. If the bot does not use the chat context, it will respond with a red bubble preceding the message, which indicates that MaruBot is using the general data it was trained on and is not providing a context-aware answer.

MaruBot accessed using the Chrome extension behaves the same way as on Discord. Here, we provide a web popup to interact with MaruBot.

At its core, MaruBot leverages the power of previous chat history as context, coupled with a Retrieval-Augmented Generation (RAG) model, to accurately and intelligently respond to user questions. The RAG model helps MaruBot identify and prioritize the most relevant previous chat conversations to the user query. It also captures information from any attached documents in the chat history allowing it to provide highly accurate answers.

MaruBot places a strong emphasis on preserving user privacy. It employs robust security measures to ensure that no confidential information, such as phone numbers, email addresses, credit card numbers, or private keys, is exposed. Your private data remains secure and protected at all times.

# How we built it?
We utilized Google's language model, Gemini, a pre-trained language model, to enable MaruBot's prediction capabilities.

To ensure access to the latest context-aware data, we periodically scrape data from Discord server chats and web portals. This data is then parsed, chunked, indexed, and converted into vector embeddings, which are subsequently pushed to our vector database, Annoy DB.

Whenever MaruBot receives a question, we perform context-aware data retrieval from the Annoy DB, retrieving the top k queries with the highest cosine similarity to the user's question. We leverage this data to perform Retrieval-Augmented Generation, providing personalized and intelligent answers to the queries.

Based on the helpfulness of the context in retrieving the data, we mark the response as 'red' or 'green' depending on their confidence level. A green bubble indicates that MaruBot is using the chat history and is confident in its answer, avoiding hallucinations. Conversely, a red bubble signifies that MaruBot is relying on its training data and will not provide a context-aware answer.

Additionally, we implemented a regular expression (regex) to exclude personal user information, such as email addresses, credit card numbers, and private keys, from the retrieval process, ensuring the protection of sensitive data.
