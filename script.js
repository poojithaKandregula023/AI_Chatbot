const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const chatForm = document.querySelector(".chat-form");

// Emoji button
const emojiBtn = document.querySelector("#emoji-picker");

// File input
const fileInput = document.querySelector("#file-input");

// =========================
// GROQ API CONFIG
// =========================
const API_KEY = "YOUR_API_KEY";



const API_URL =
"https://api.groq.com/openai/v1/chat/completions";

// Store user message
let userMessage = "";

// =========================
// OPEN / CLOSE CHATBOT
// =========================

chatbotToggler.addEventListener("click", () => {
  document.body.classList.toggle("show-chatbot");
});

closeBtn.addEventListener("click", () => {
  document.body.classList.remove("show-chatbot");
});

// =========================
// CREATE MESSAGE ELEMENT
// =========================

const createMessageElement = (content, className) => {

  const div = document.createElement("div");

  div.classList.add("message", className);

  div.innerHTML = `
    <div class="message-text">${content}</div>
  `;

  return div;
};

// =========================
// EMOJI SUPPORT
// =========================

// =========================
// REAL EMOJI PICKER
// =========================

const pickerContainer =
document.querySelector(".emoji-picker-container");

let pickerVisible = false;

// Open emoji picker
emojiBtn.addEventListener("click", () => {

  if (!pickerVisible) {

    pickerContainer.classList.add(
      "show-emoji-picker"
    );

    pickerContainer.innerHTML = "";

    const picker =
      new EmojiMart.Picker({

        theme: "light",

        onEmojiSelect: (emoji) => {

          messageInput.value += emoji.native;

          messageInput.focus();

        }

      });

    pickerContainer.appendChild(picker);

    pickerVisible = true;

  } else {

    pickerContainer.classList.remove(
      "show-emoji-picker"
    );

    pickerContainer.innerHTML = "";

    pickerVisible = false;

  }

});

// =========================
// IMAGE UPLOAD SUPPORT
// =========================

fileInput.addEventListener("change", () => {

  const file = fileInput.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {

    const imageMessage =
      createMessageElement(
        `<img src="${reader.result}"
              class="chat-image">`,
        "user-message"
      );

    chatBody.appendChild(imageMessage);

    chatBody.scrollTo({
      top: chatBody.scrollHeight,
      behavior: "smooth"
    });

  };

  reader.readAsDataURL(file);

});

// =========================
// GENERATE AI RESPONSE
// =========================

const generateResponse = async (incomingMessageDiv) => {

  const messageElement =
    incomingMessageDiv.querySelector(".message-text");

  try {

    const response = await fetch(API_URL, {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },

      body: JSON.stringify({

        model: "llama-3.3-70b-versatile",

        messages: [

          {
            role: "system",
            content: "You are a helpful AI chatbot."
          },

          {
            role: "user",
            content: userMessage
          }

        ],

        temperature: 0.7,
        max_tokens: 1024

      })

    });

    const data = await response.json();

    console.log(data);

    // Handle API error
    if (data.error) {

      messageElement.innerText =
        "API Error: " + data.error.message;

      return;
    }

    // Get AI response
    const apiResponse =
      data.choices[0].message.content;

    messageElement.innerText = apiResponse;

  } catch (error) {

    console.log(error);

    messageElement.innerText =
      "Something went wrong. Please try again.";

  }

  chatBody.scrollTo({
    top: chatBody.scrollHeight,
    behavior: "smooth"
  });

};

// =========================
// HANDLE USER MESSAGE
// =========================

const handleOutgoingMessage = (e) => {

  e.preventDefault();

  userMessage = messageInput.value.trim();

  if (!userMessage) return;

  // User message
  const outgoingMessageDiv =
    createMessageElement(
      userMessage,
      "user-message"
    );

  chatBody.appendChild(outgoingMessageDiv);

  // Clear input
  messageInput.value = "";

  // Scroll down
  chatBody.scrollTo({
    top: chatBody.scrollHeight,
    behavior: "smooth"
  });

  // Thinking animation
  setTimeout(() => {

    const incomingMessageDiv =
      createMessageElement(
        "Thinking...",
        "bot-message"
      );

    chatBody.appendChild(incomingMessageDiv);

    chatBody.scrollTo({
      top: chatBody.scrollHeight,
      behavior: "smooth"
    });

    generateResponse(incomingMessageDiv);

  }, 600);

};

// =========================
// FORM SUBMIT
// =========================

chatForm.addEventListener(
  "submit",
  handleOutgoingMessage
);