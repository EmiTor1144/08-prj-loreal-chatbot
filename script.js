/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
// Replace this with your actual Cloudflare Worker URL
const chatEndpoint = "https://loreal-chatbot.emit1144.workers.dev/";

// Conversation context tracking
let conversationHistory = [
  {
    role: "system",
    content:
      "You are a helpful assistant for L'Oréal customers. You can only answer questions about L'Oréal products, skincare, haircare, makeup, beauty tips, and cosmetics. If someone asks about topics unrelated to L'Oréal or beauty (like sports, politics, etc.) politely decline and redirect to asking about L'Oréal-related queries. Remember the user's name if they tell you, and refer to previous conversations naturally. Be personable and build rapport. When mentioning specific L'Oréal product names, wrap them in ** symbols like **True Match Foundation** to highlight them.",
  },
];

// Set initial message with styling
chatWindow.innerHTML = `<div class="initial-message">👋 Hello Gorgeous! How can I help you today?</div>`;

// Function to highlight text within ** symbols in gold
function highlightLorealProducts(text) {
  // Use regex to find text between ** symbols and replace with highlighted version
  const highlightedText = text.replace(
    /\*\*(.*?)\*\*/g,
    '<span class="product-highlight">$1</span>'
  );
  return highlightedText;
}

// Function to clear conversation history (optional feature)
function clearConversationHistory() {
  conversationHistory = [
    {
      role: "system",
      content:
        "You are a helpful assistant for L'Oréal customers. You can only answer questions about L'Oréal products, skincare, haircare, makeup, beauty tips, and cosmetics. If someone asks about topics unrelated to L'Oréal or beauty (like sports, politics, etc.) politely decline and redirect to asking about L'Oréal-related queries. Remember the user's name if they tell you, and refer to previous conversations naturally. Be personable and build rapport. When mentioning specific L'Oréal product names, wrap them in ** symbols like **True Match Foundation** to highlight them.",
    },
  ];
  console.log("Conversation history cleared");
}

// Function to send user input to Cloudflare Worker (which calls OpenAI)
async function getAIResponse(userMessage) {
  try {
    // Add user message to conversation history
    conversationHistory.push({
      role: "user",
      content: userMessage,
    });

    const response = await fetch(chatEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // No Authorization header needed - the Worker handles the API key
      },
      body: JSON.stringify({
        // Send entire conversation history to maintain context
        messages: conversationHistory,
      }),
    });

    const data = await response.json();

    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`API Error: ${data.error?.message || "Unknown error"}`);
    }

    const botReply = data.choices[0].message.content;

    // Add bot response to conversation history
    conversationHistory.push({
      role: "assistant",
      content: botReply,
    });

    return botReply;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return "Sorry, L'Oréal servers down. Come back later.";
  }
}

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get the user's message
  const userMessage = userInput.value.trim();

  // Don't send empty messages
  if (!userMessage) {
    return;
  }

  // Add user message to chat window with styling class and product highlighting
  const highlightedUserMessage = highlightLorealProducts(userMessage);
  chatWindow.innerHTML += `<div class="msg user"><strong>You:</strong> ${highlightedUserMessage}</div>`;

  // Clear input field
  userInput.value = "";

  // Show loading message with bot styling class
  chatWindow.innerHTML += `<div class="msg bot"><strong>L'OREAL Advisor:</strong> <em>Typing...</em></div>`;

  // Get AI response
  const botReply = await getAIResponse(userMessage);

  // Highlight L'Oréal products in bot reply
  const highlightedBotReply = highlightLorealProducts(botReply);

  // Remove loading message and add actual response with product highlighting
  const messages = chatWindow.children;
  messages[
    messages.length - 1
  ].innerHTML = `<strong>L'OREAL Advisor:</strong> ${highlightedBotReply}`;

  // Smooth scroll to bottom of chat
  chatWindow.scrollTo({
    top: chatWindow.scrollHeight,
    behavior: "smooth",
  });
});
