document.addEventListener('DOMContentLoaded', () => {
  const loadingElement = document.querySelector('.loading');
  const chatContainer = document.querySelector('.chat-container');
  const messagesElement = document.getElementById('messages');
  const userInputElement = document.getElementById('user-input');

  let lastFetchedDateTime = null;
  let check = "";
  
  const MONGO_USER_TOKEN = 'ENTER MONGODB USER TOKEN'
  const mongoserver = 'http://localhost:3000'
  const flaskserver = 'http://127.0.0.1:5000'
  const chat_id = 'ENTER CHAT ID HERE'

  const fetchAllDataTillTime = async () => {
    try {
      const response = await fetch(mongoserver + '/api/message/' + chat_id, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${MONGO_USER_TOKEN}`,
          'Access-Control-Allow-Origin': '*'
        },
        // body: JSON.stringify({ lastFetchedDateTime }),
      });

      if (response.ok) {
        initialMessages = [];
        const data = await response.json();
        // check = data[0]['content']
        for(let i=0;i < data.length;i++){
          initialMessages.push(data[i]['sender']['name'] + ' says ' + data[i]['content'])
        }
        initialLoadLLM(initialMessages)
        // check = initialMessages.toString()
      } else {
        console.error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  fetchAllDataTillTime();

  // Simulate loading animation
  loadingElement.style.display = 'block';
  setTimeout(() => {
    loadingElement.style.display = 'none';
    chatContainer.style.display = 'block';
  }, 2000); // Show chat after 2 seconds

  userInputElement.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
      const userMessage = event.target.value.trim();
      if (userMessage) {
        addMessageToChat('user', userMessage);
        // console.log("HEREEE")
        await askBot(userMessage)
        addMessageToChat('bot', check); // Echo back the user's message
        event.target.value = '';
      }
    }
  });

  function addMessageToChat(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.textContent = message;
    messagesElement.appendChild(messageElement);
    messagesElement.scrollTop = messagesElement.scrollHeight;
  }

  const initialLoadLLM = async (allMsgs) => {
    const data = {
      messages: allMsgs,
    };
    try {
      const response = await fetch(flaskserver + '/on_load', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
      if (response.ok) {
        initialMessages = [];
        const data = await response.json();
        // check = data['message']
      } else {
        console.error('Failed to load data into LLM');
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const askBot = async (question) => {
    const data = {
      question: question,
    };
    try {
      const response = await fetch(flaskserver + '/get_reply', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
      if (response.ok) {
        initialMessages = [];
        const data = await response.json();
        check = data['response_text']
      } else {
        console.error('Failed to load data into LLM');
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };
});