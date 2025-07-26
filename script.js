/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const chatEndpoint = "https://api.openai.com/v1/chat/completions"; // Fixed typo: vi -> v1

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

// Function to send user input to OpenAI and fetch response
async function getAIResponse(userMessage) {
  try {
    const response = await fetch(chatEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`, // Use the API key from secrets.js
      },
      body: JSON.stringify({
        model: "gpt-4o", // Use gpt-4o model as specified in instructions
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant for L'Oréal customers.",
          },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`API Error: ${data.error?.message || "Unknown error"}`);
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return "Sorry, I encountered an error. Please try again.";
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

  // Add user message to chat window with styling class
  chatWindow.innerHTML += `<div class="msg user"><strong>You:</strong> ${userMessage}</div>`;

  // Clear input field
  userInput.value = "";

  // Show loading message with bot styling class
  chatWindow.innerHTML += `<div class="msg bot"><strong>L'OREAL Advisor:</strong> <em>Thinking...</em></div>`;

  // Get AI response
  const botReply = await getAIResponse(userMessage);

  // Remove loading message and add actual response
  const messages = chatWindow.children;
  messages[messages.length - 1].innerHTML = `<strong>L'OREAL Advisor:</strong> ${botReply}`;

  // Scroll to bottom of chat
  chatWindow.scrollTop = chatWindow.scrollHeight;
});
