
"use strict";

/* =========================================
   1. OBSERVER PATTERN
   Жаңалық болғанда тыңдаушыларға хабар береді
========================================= */

class ChatObserver {
  constructor() {
    this.listeners = [];
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notify(data) {
    this.listeners.forEach(callback => callback(data));
  }
}

const chatObserver = new ChatObserver();


/* =========================================
   2. SINGLETON PATTERN
   ChatService тек бір рет құрылады
========================================= */

class ChatService {
  constructor() {
    if (ChatService.instance) {
      return ChatService.instance;
    }

    this.currentChatId = 1;
    this.nextMessageId = 100;

    this.chats = [
      {
        id: 1,
        name: "Аружан",
        avatar: "А",
        status: "Онлайн",
        messages: [
          {
            id: 1,
            sender: "Аружан",
            text: "Сәлем! Қалың қалай?",
            time: "10:20",
            mine: false
          },
          {
            id: 2,
            sender: "Мен",
            text: "Сәлем! Жақсы, рақмет 😊",
            time: "10:21",
            mine: true
          },
          {
            id: 3,
            sender: "Аружан",
            text: "AI Bank жобасы қалай болып жатыр?",
            time: "10:22",
            mine: false
          }
        ]
      },
      {
        id: 2,
        name: "Данияр",
        avatar: "Д",
        status: "Онлайн",
        messages: [
          {
            id: 4,
            sender: "Данияр",
            text: "Ертең кездесеміз бе?",
            time: "09:45",
            mine: false
          }
        ]
      },
      {
        id: 3,
        name: "AI Bank қолдау",
        avatar: "AI",
        status: "Қолдау қызметі",
        messages: [
          {
            id: 5,
            sender: "AI Bank қолдау",
            text: "Сәлеметсіз бе! Сізге қалай көмектесе аламыз?",
            time: "09:10",
            mine: false
          }
        ]
      },
      {
        id: 4,
        name: "Айгерім",
        avatar: "А",
        status: "Желіде жоқ",
        messages: [
          {
            id: 6,
            sender: "Айгерім",
            text: "Рақмет! Түсінікті болды.",
            time: "Кеше",
            mine: false
          }
        ]
      }
    ];

    ChatService.instance = this;
  }

  static getInstance() {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  getChats() {
    return this.chats;
  }

  getCurrentChat() {
    return this.chats.find(
      chat => chat.id === this.currentChatId
    );
  }

  selectChat(id) {
    const chat = this.chats.find(item => item.id === id);

    if (chat) {
      this.currentChatId = id;
      chatObserver.notify({ type: "chat-selected" });
    }
  }

  addMessage(text) {
    const chat = this.getCurrentChat();

    if (!chat) return;

    const now = new Date();

    chat.messages.push({
      id: this.nextMessageId++,
      sender: "Мен",
      text: text,
      time: now.toLocaleTimeString("kk-KZ", {
        hour: "2-digit",
        minute: "2-digit"
      }),
      mine: true
    });

    chatObserver.notify({
      type: "message-added",
      chatId: chat.id
    });
  }

  deleteMessage(messageId) {
    const chat = this.getCurrentChat();

    if (!chat) return;

    chat.messages = chat.messages.filter(
      message => message.id !== messageId
    );

    chatObserver.notify({
      type: "message-deleted",
      chatId: chat.id
    });
  }

  clearCurrentChat() {
    const chat = this.getCurrentChat();

    if (!chat) return;

    chat.messages = [];

    chatObserver.notify({
      type: "chat-cleared",
      chatId: chat.id
    });
  }
}


/* =========================================
   3. MEDIATOR PATTERN
   Компоненттер арасындағы әрекетті басқарады
========================================= */

class ChatMediator {
  constructor(service) {
    this.service = service;
  }

  sendMessage(text) {
    this.service.addMessage(text);
  }

  deleteMessage(messageId) {
    this.service.deleteMessage(messageId);
  }

  clearChat() {
    this.service.clearCurrentChat();
  }

  openChat(chatId) {
    this.service.selectChat(chatId);
  }
}


/* =========================================
   4. COMMAND PATTERN
   Әр әрекет жеке команда ретінде орындалады
========================================= */

class Command {
  execute() {
    throw new Error("execute() әдісін іске асыру керек");
  }
}

class SendMessageCommand extends Command {
  constructor(mediator, text) {
    super();
    this.mediator = mediator;
    this.text = text;
  }

  execute() {
    this.mediator.sendMessage(this.text);
  }
}

class DeleteMessageCommand extends Command {
  constructor(mediator, messageId) {
    super();
    this.mediator = mediator;
    this.messageId = messageId;
  }

  execute() {
    this.mediator.deleteMessage(this.messageId);
  }
}

class ClearChatCommand extends Command {
  constructor(mediator) {
    super();
    this.mediator = mediator;
  }

  execute() {
    this.mediator.clearChat();
  }
}


/* =========================================
   ҚОСЫМШАНЫ ІСКЕ ҚОСУ
========================================= */

const service = ChatService.getInstance();
const mediator = new ChatMediator(service);

const chatList = document.getElementById("chatList");
const messagesElement = document.getElementById("messages");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const searchInput = document.getElementById("searchInput");
const notice = document.getElementById("notice");

function showNotice(text) {
  notice.textContent = text;

  if (text) {
    setTimeout(() => {
      if (notice.textContent === text) {
        notice.textContent = "";
      }
    }, 2500);
  }
}

function getLastMessage(chat) {
  if (chat.messages.length === 0) {
    return "Хабарлама жоқ";
  }

  return chat.messages[chat.messages.length - 1].text;
}


/* Чаттар тізімін көрсету */

function renderChats() {
  const query = searchInput.value.trim().toLowerCase();

  chatList.replaceChildren();

  const filteredChats = service.getChats().filter(chat =>
    chat.name.toLowerCase().includes(query)
  );

  document.getElementById("chatCount").textContent =
    service.getChats().length;

  if (filteredChats.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "Чат табылмады";
    chatList.appendChild(empty);
    return;
  }

  filteredChats.forEach(chat => {
    const item = document.createElement("div");
    item.className = "chat-item";

    if (chat.id === service.currentChatId) {
      item.classList.add("active");
    }

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = chat.avatar;

    const details = document.createElement("div");
    details.className = "chat-details";

    const name = document.createElement("strong");
    name.textContent = chat.name;

    const preview = document.createElement("p");
    preview.textContent = getLastMessage(chat);

    details.append(name, preview);

    const time = document.createElement("span");
    time.className = "chat-time";

    const lastMessage = chat.messages[chat.messages.length - 1];
    time.textContent = lastMessage ? lastMessage.time : "";

    item.append(avatar, details, time);

    item.addEventListener("click", () => {
      mediator.openChat(chat.id);
    });

    chatList.appendChild(item);
  });
}


/* Таңдалған чаттың хабарламаларын көрсету */

function renderMessages() {
  const chat = service.getCurrentChat();

  if (!chat) return;

  document.getElementById("contactName").textContent = chat.name;
  document.getElementById("headerAvatar").textContent = chat.avatar;
  document.getElementById("contactStatus").textContent = chat.status;

  messagesElement.replaceChildren();

  if (chat.messages.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Бұл чатта әзірге хабарлама жоқ.";
    messagesElement.appendChild(empty);
    return;
  }

  chat.messages.forEach(message => {
    const row = document.createElement("div");
    row.className = "message-row";

    if (message.mine) {
      row.classList.add("mine");
    }

    const sender = document.createElement("span");
    sender.className = "sender";
    sender.textContent = message.sender;

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = message.text;

    const meta = document.createElement("div");
    meta.className = "message-meta";

    const time = document.createElement("span");
    time.textContent = message.time;

    meta.appendChild(time);

    if (message.mine) {
      const deleteButton = document.createElement("button");
      deleteButton.className = "delete-btn";
      deleteButton.type = "button";
      deleteButton.textContent = "Өшіру";

      deleteButton.addEventListener("click", () => {
        const command = new DeleteMessageCommand(
          mediator,
          message.id
        );

        command.execute();
        showNotice("Хабарлама өшірілді");
      });

      meta.appendChild(deleteButton);
    }

    row.append(sender, bubble, meta);
    messagesElement.appendChild(row);
  });

  messagesElement.scrollTop = messagesElement.scrollHeight;
}


/* Observer: өзгеріс болса интерфейсті жаңарту */

chatObserver.subscribe(event => {
  renderChats();
  renderMessages();

  if (event.type === "message-added") {
    showNotice("Хабарлама жіберілді");
  }

  if (event.type === "message-deleted") {
    showNotice("Хабарлама өшірілді");
  }

  if (event.type === "chat-cleared") {
    showNotice("Чат тазаланды");
  }
});


/* Хабарлама жіберу */

messageForm.addEventListener("submit", event => {
  event.preventDefault();

  const text = messageInput.value.trim();

  if (!text) {
    showNotice("Алдымен хабарлама жазыңыз");
    return;
  }

  const command = new SendMessageCommand(mediator, text);
  command.execute();

  messageInput.value = "";
  messageInput.focus();
});


/* Чат іздеу */

searchInput.addEventListener("input", renderChats);


/* Чатты тазалау */

document.getElementById("clearChatBtn").addEventListener("click", () => {
  const confirmed = confirm(
    "Осы чаттағы барлық хабарламаны өшіресіз бе?"
  );

  if (!confirmed) return;

  const command = new ClearChatCommand(mediator);
  command.execute();
});


/* Бастапқы интерфейс */

renderChats();
renderMessages();
