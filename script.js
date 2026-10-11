
"use strict";

/* ==========================================
   1. SINGLETON PATTERN
   Бір ғана ортақ AppStore объектісі болады.
   Чаттар мен хабарламалар осы жерде сақталады.
========================================== */

class AppStore {
  constructor() {
    if (AppStore.instance) return AppStore.instance;

    this.chats = this.createChats();
    this.activeChatId = this.chats[0].id;
    this.listeners = [];
    this.filter = "all";
    this.chatQuery = "";
    this.messageQuery = "";
    AppStore.instance = this;
  }

  static getInstance() {
    if (!AppStore.instance) {
      AppStore.instance = new AppStore();
    }
    return AppStore.instance;
  }

  createChats() {
    const now = Date.now();
    const minutesAgo = (n) => new Date(now - n * 60000);

    const makeMessages = (items) => items.map((item, i) => ({
      id: `${now}-${i}-${Math.random().toString(36).slice(2, 7)}`,
      text: item[0],
      mine: item[1],
      time: minutesAgo(items.length - i),
      read: true
    }));

    const definitions = [
      {
        id: "support", name: "AI Bank қолдау қызметі",
        role: "Ресми банк қолдауы", avatar: "🏦",
        color: "#dff4e8", online: true, unread: 2,
        messages: [
          ["Сәлеметсіз бе! AI Bank қолдау қызметіне қош келдіңіз. Қалай көмектесе аламыз?", false],
          ["Карта бойынша сұрағым бар еді.", true],
          ["Әрине, көмектесуге дайынбыз. Қандай сұрағыңыз бар?", false]
        ]
      },
      {
        id: "aruzhan", name: "Аружан",
        role: "Жеке байланыс", avatar: "👩🏻",
        color: "#fbe7e9", online: true, unread: 1,
        messages: [
          ["Сәлем! Ақша аударымы сәтті орындалды 😊", false],
          ["Рақмет, хабарлағаныңа!", true],
          ["Әрқашан көмектесемін!", false]
        ]
      },
      {
        id: "daniyar", name: "Данияр",
        role: "Жеке байланыс", avatar: "👨🏻",
        color: "#e2edff", online: false, unread: 0,
        messages: [
          ["Сәлем, карта бойынша сұрақ қойсам бола ма?", false],
          ["Иә, айта бер.", true]
        ]
      },
      {
        id: "manager", name: "Жеке менеджер",
        role: "Клиенттерге қызмет көрсету", avatar: "👩🏻‍💼",
        color: "#eee7ff", online: true, unread: 3,
        messages: [
          ["Қайырлы күн! Сіздің өтінішіңіз қарастырылуда.", false],
          ["Жауабы қашан дайын болады?", true],
          ["Жақын уақытта хабарлаймыз.", false]
        ]
      },
      {
        id: "security", name: "Қауіпсіздік қызметі",
        role: "Қауіпсіздік бөлімі", avatar: "🛡️",
        color: "#e2f3f0", online: true, unread: 1,
        messages: [
          ["Қауіпсіздік ескертуі: SMS-код пен құпиясөзді ешкімге бермеңіз.", false],
          ["Түсінікті, рақмет.", true]
        ]
      },
      {
        id: "cards", name: "Карта қызметі",
        role: "Банк карталары", avatar: "💳",
        color: "#e2e9ff", online: true, unread: 0,
        messages: [
          ["Картаға қатысты сұрақтарыңыз болса, жазыңыз.", false],
          ["Жаңа карта ашқым келеді.", true]
        ]
      },
      {
        id: "transfers", name: "Аударымдар",
        role: "Ақша аудару қызметі", avatar: "💸",
        color: "#e2f5dc", online: false, unread: 2,
        messages: [
          ["Соңғы аударым сәтті аяқталды.", false],
          ["Аударымның тарихын қайдан көремін?", true],
          ["Тарих бөлімінен барлық операцияны қарай аласыз.", false]
        ]
      },
      {
        id: "deposits", name: "Депозит бөлімі",
        role: "Жинақ және депозит", avatar: "🏛️",
        color: "#fff0d9", online: true, unread: 0,
        messages: [
          ["Қайырлы күн! Депозит өнімдері туралы ақпарат бере аламыз.", false],
          ["Депозит ашу үшін не істеу керек?", true]
        ]
      },
      {
        id: "payments", name: "Төлемдер",
        role: "Төлем қызметі", avatar: "🧾",
        color: "#e9e6ff", online: true, unread: 0,
        messages: [
          ["Төлемдер бөлімінен коммуналдық қызметтерді төлеуге болады.", false],
          ["Төлем түбіртегін жүктеуге бола ма?", true]
        ]
      },
      {
        id: "loans", name: "Несие бойынша кеңес",
        role: "Кеңес беру қызметі", avatar: "📊",
        color: "#ffeadf", online: false, unread: 1,
        messages: [
          ["Несие шарттары туралы ақпарат қажет пе?", false],
          ["Ай сайынғы төлемді білгім келеді.", true]
        ]
      },
      {
        id: "notifications", name: "Банк хабарландырулары",
        role: "Ресми хабарламалар", avatar: "🔔",
        color: "#fff0c9", online: true, unread: 2,
        messages: [
          ["AI Bank қосымшасының жаңа мүмкіндіктері қолжетімді!", false],
          ["Жаңартулар үшін рақмет.", true]
        ]
      },
      {
        id: "feedback", name: "Ұсыныстар мен пікірлер",
        role: "Кері байланыс", avatar: "💬",
        color: "#dff2f8", online: true, unread: 0,
        messages: [
          ["Банк қызметі туралы пікіріңізді қалдыра аласыз.", false],
          ["Қосымша ыңғайлы екен!", true]
        ]
      }
    ];

    return definitions.map((item) => ({
      ...item,
      messages: makeMessages(item.messages),
      unread: item.unread,
      lastTime: minutesAgo(2 + Math.floor(Math.random() * 50))
    }));
  }

  getActiveChat() {
    return this.chats.find(chat => chat.id === this.activeChatId);
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(fn => fn !== callback);
    };
  }

  notify(eventName, data = {}) {
    this.listeners.forEach(callback => callback(eventName, data));
  }

  addMessage(chatId, text, mine = true) {
    const chat = this.chats.find(chat => chat.id === chatId);
    if (!chat) return null;

    const message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text,
      mine,
      time: new Date(),
      read: true
    };

    chat.messages.push(message);
    chat.lastTime = message.time;

    if (!mine && chatId !== this.activeChatId) {
      chat.unread++;
    }

    this.notify("message-added", { chatId, message });
    return message;
  }

  selectChat(chatId) {
    const chat = this.chats.find(item => item.id === chatId);
    if (!chat) return;

    this.activeChatId = chatId;
    chat.unread = 0;
    this.notify("chat-selected", { chatId });
  }

  markRead(chatId) {
    const chat = this.chats.find(item => item.id === chatId);
    if (chat) chat.unread = 0;
  }

  addChat(name) {
    const cleanName = name.trim();
    if (!cleanName) return null;

    const id = `custom-${Date.now()}`;
    const chat = {
      id,
      name: cleanName,
      role: "Жаңа байланыс",
      avatar: "👤",
      color: "#e6f3eb",
      online: true,
      unread: 0,
      lastTime: new Date(),
      messages: [{
        id: `${id}-welcome`,
        text: `Сәлеметсіз бе! "${cleanName}" чаты ашылды. Хабарлама жаза аласыз.`,
        mine: false,
        time: new Date(),
        read: true
      }]
    };

    this.chats.unshift(chat);
    this.selectChat(id);
    this.notify("chat-added", { chatId: id });
    return chat;
  }
}

const store = AppStore.getInstance();


/* ==========================================
   2. OBSERVER PATTERN
   Store өзгергенде интерфейс жаңартылады.
========================================== */

class ChatObserver {
  constructor(appStore) {
    this.store = appStore;
    this.unsubscribe = this.store.subscribe((eventName, data) => {
      this.update(eventName, data);
    });
  }

  update(eventName, data) {
    renderChatList();

    if (eventName === "chat-selected" ||
        eventName === "message-added" ||
        eventName === "chat-added") {
      renderActiveChat();
    }

    updateCounters();
    updateInfoPanel();
  }
}

const observer = new ChatObserver(store);


/* ==========================================
   3. COMMAND PATTERN
   Жіберу әрекеті жеке Command класы арқылы орындалады.
========================================== */

class SendMessageCommand {
  constructor(appStore, chatId, text) {
    this.store = appStore;
    this.chatId = chatId;
    this.text = text;
  }

  execute() {
    const cleanText = this.text.trim();
    if (!cleanText) return false;

    this.store.addMessage(this.chatId, cleanText, true);
    return true;
  }
}

class CommandInvoker {
  execute(command) {
    return command.execute();
  }
}

const invoker = new CommandInvoker();


/* ==========================================
   4. MEDIATOR PATTERN
   UI әрекеттерін чат логикасымен байланыстырады.
========================================== */

class ChatMediator {
  constructor(appStore, commandInvoker) {
    this.store = appStore;
    this.invoker = commandInvoker;
  }

  openChat(chatId) {
    this.store.selectChat(chatId);
  }

  sendMessage(text) {
    const chat = this.store.getActiveChat();
    if (!chat || !text.trim()) return false;

    const command = new SendMessageCommand(
      this.store,
      chat.id,
      text
    );

    return this.invoker.execute(command);
  }

  createChat(name) {
    return this.store.addChat(name);
  }
}

const mediator = new ChatMediator(store, invoker);


/* ==========================================
   DOM ЭЛЕМЕНТТЕРІ
========================================== */

const $ = (selector) => document.querySelector(selector);

const chatList = $("#chatList");
const chatSearch = $("#chatSearch");
const messageSearch = $("#messageSearch");
const messageSearchBar = $("#messageSearchBar");
const messagesArea = $("#messages");
const messageInput = $("#messageInput");
const messageForm = $("#messageForm");
const activeChatElement = $("#activeChat");
const emptyState = $("#emptyState");
const toastElement = $("#toast");

let currentFilter = "all";
let toastTimer = null;


/* ==========================================
   КӨМЕКШІ ФУНКЦИЯЛАР
========================================== */

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function formatTime(date) {
  const d = new Date(date);
  return d.toLocaleTimeString("kk-KZ", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatPreviewTime(date) {
  const d = new Date(date);
  const today = new Date();

  if (d.toDateString() === today.toDateString()) {
    return formatTime(d);
  }

  return d.toLocaleDateString("kk-KZ", {
    day: "2-digit",
    month: "2-digit"
  });
}

function showToast(message) {
  toastElement.textContent = message;
  toastElement.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastElement.classList.remove("show");
  }, 2600);
}

function getLastMessage(chat) {
  return chat.messages[chat.messages.length - 1];
}


/* ==========================================
   ЧАТТАР ТІЗІМІН ШЫҒАРУ
========================================== */

function renderChatList() {
  const query = store.chatQuery.toLocaleLowerCase("kk-KZ");

  const filtered = store.chats.filter(chat => {
    const matchesQuery =
      chat.name.toLocaleLowerCase("kk-KZ").includes(query) ||
      chat.role.toLocaleLowerCase("kk-KZ").includes(query) ||
      chat.messages.some(msg =>
        msg.text.toLocaleLowerCase("kk-KZ").includes(query)
      );

    const matchesFilter =
      currentFilter === "all" || chat.unread > 0;

    return matchesQuery && matchesFilter;
  });

  $("#chatCount").textContent = `${store.chats.length} байланыс`;

  if (filtered.length === 0) {
    chatList.innerHTML = `
      <div class="no-results">
        🔎<br>Чат табылмады.<br>Басқа сөз жазып көріңіз.
      </div>`;
    return;
  }

  chatList.innerHTML = filtered.map(chat => {
    const last = getLastMessage(chat);
    const preview = last
      ? `${last.mine ? "Сіз: " : ""}${last.text}`
      : "Әзірге хабарлама жоқ";

    return `
      <div class="chat-item ${chat.id === store.activeChatId ? "active" : ""}"
           data-chat-id="${escapeHTML(chat.id)}"
           role="button" tabindex="0"
           aria-label="${escapeHTML(chat.name)} чатын ашу">
        <div class="avatar ${chat.online ? "online" : ""}"
             style="background:${chat.color}">
          ${escapeHTML(chat.avatar)}
        </div>
        <div class="chat-details">
          <div class="chat-title-row">
            <span class="chat-name">${escapeHTML(chat.name)}</span>
            <span class="chat-time">${last ? formatPreviewTime(last.time) : ""}</span>
          </div>
          <div class="chat-preview-row">
            <span class="chat-preview">${escapeHTML(preview)}</span>
            ${chat.unread > 0
              ? `<span class="unread-badge">${chat.unread > 99 ? "99+" : chat.unread}</span>`
              : ""}
          </div>
        </div>
      </div>`;
  }).join("");
}


/* ==========================================
   АШЫҚ ЧАТТЫ ШЫҒАРУ
========================================== */

function renderActiveChat() {
  const chat = store.getActiveChat();

  if (!chat) {
    activeChatElement.classList.add("hidden");
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");
  activeChatElement.classList.remove("hidden");

  $("#activeAvatar").textContent = chat.avatar;
  $("#activeAvatar").style.background = chat.color;
  $("#activeName").textContent = chat.name;

  $("#activeStatus").innerHTML = chat.online
    ? '<span class="online-dot"></span> Онлайн'
    : '<span style="color:#a0aaa3">●</span> Қазір офлайн';

  $("#infoAvatar").textContent = chat.avatar;
  $("#infoAvatar").style.background = chat.color;
  $("#infoName").textContent = chat.name;
  $("#infoRole").textContent = chat.role;

  const query = store.messageQuery.toLocaleLowerCase("kk-KZ");

  const visibleMessages = chat.messages.filter(message =>
    message.text.toLocaleLowerCase("kk-KZ").includes(query)
  );

  if (visibleMessages.length === 0) {
    messagesArea.innerHTML = `
      <div class="no-results">
        ${query ? "Бұл сөзге сәйкес хабарлама табылмады." : "Хабарлама жоқ."}
      </div>`;
  } else {
    messagesArea.innerHTML = visibleMessages.map(message => {
      const sender = message.mine ? "Сіз" : chat.name;
      const avatar = message.mine ? "👤" : chat.avatar;

      const safeText = escapeHTML(message.text);
      let displayedText = safeText;

      if (query) {
        const escapedQuery = escapeHTML(query);
        const regex = new RegExp(
          escapedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "gi"
        );
        displayedText = safeText.replace(regex, match =>
          `<mark class="message-highlight">${match}</mark>`
        );
      }

      return `
        <div class="message-row ${message.mine ? "mine" : ""}">
          <div class="message-avatar"
               style="background:${message.mine ? "#dcece3" : chat.color}">
            ${escapeHTML(avatar)}
          </div>
          <div class="message-content">
            <div class="message-sender">${escapeHTML(sender)}</div>
            <div class="message-bubble">${displayedText}</div>
            <div class="message-meta">
              <span>${formatTime(message.time)}</span>
              ${message.mine ? '<span class="message-check">✓✓</span>' : ""}
            </div>
          </div>
        </div>`;
    }).join("");
  }

  messagesArea.scrollTop = messagesArea.scrollHeight;
  updateInfoPanel();
}

function updateCounters() {
  const unreadTotal = store.chats.reduce(
    (sum, chat) => sum + chat.unread, 0
  );

  $("#unreadFilterCount").textContent = unreadTotal;
  document.title = unreadTotal > 0
    ? `(${unreadTotal}) AI Bank Messenger`
    : "AI Bank Messenger";
}

function updateInfoPanel() {
  const chat = store.getActiveChat();
  if (!chat) return;

  $("#infoMessages").textContent = chat.messages.length;
  $("#infoUnread").textContent = chat.unread;
}


/* ==========================================
   ОҚИҒАЛАР
========================================== */

// Чатты басқанда ашу
chatList.addEventListener("click", event => {
  const item = event.target.closest("[data-chat-id]");
  if (!item) return;

  mediator.openChat(item.dataset.chatId);
});

chatList.addEventListener("keydown", event => {
  if (event.key !== "Enter" && event.key !== " ") return;

  const item = event.target.closest("[data-chat-id]");
  if (!item) return;

  event.preventDefault();
  mediator.openChat(item.dataset.chatId);
});

// Чаттарды іздеу
chatSearch.addEventListener("input", () => {
  store.chatQuery = chatSearch.value.trim();
  renderChatList();
});

// Оқылмаған / барлық чаттар
document.querySelectorAll(".filter-button").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    document.querySelectorAll(".filter-button").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    renderChatList();
  });
});

// Хабарлама жіберу
messageForm.addEventListener("submit", event => {
  event.preventDefault();

  const text = messageInput.value.trim();
  if (!text) {
    showToast("Алдымен хабарлама жазыңыз.");
    messageInput.focus();
    return;
  }

  if (mediator.sendMessage(text)) {
    messageInput.value = "";
    messageInput.focus();
  }
});

// Дайын жауаптар
$("#quickReplies").addEventListener("click", event => {
  const button = event.target.closest("[data-reply]");
  if (!button) return;

  messageInput.value = button.dataset.reply;
  messageInput.focus();
});

// Хабарламалар ішінен іздеу
$("#searchToggle").addEventListener("click", () => {
  messageSearchBar.classList.toggle("hidden");

  if (!messageSearchBar.classList.contains("hidden")) {
    messageSearch.focus();
  } else {
    messageSearch.value = "";
    store.messageQuery = "";
    renderActiveChat();
  }
});

messageSearch.addEventListener("input", () => {
  store.messageQuery = messageSearch.value.trim();
  renderActiveChat();
});

$("#closeMessageSearch").addEventListener("click", () => {
  messageSearch.value = "";
  store.messageQuery = "";
  messageSearchBar.classList.add("hidden");
  renderActiveChat();
});

// Ақпарат панелін ашу / жабу
$("#chatInfoButton").addEventListener("click", () => {
  const panel = $("#infoPanel");

  if (window.innerWidth <= 1100) {
    showToast("Чат ақпараты: " + (store.getActiveChat()?.role || ""));
    return;
  }

  panel.classList.toggle("hidden");
});

$("#closeInfo").addEventListener("click", () => {
  $("#infoPanel").classList.add("hidden");
});

// Жаңа чат жасау
$("#newChatButton").addEventListener("click", () => {
  const name = prompt("Жаңа чаттың атын жазыңыз:");

  if (name === null) return;

  if (!name.trim()) {
    showToast("Чат атауын енгізіңіз.");
    return;
  }

  const existing = store.chats.find(chat =>
    chat.name.toLocaleLowerCase("kk-KZ") ===
    name.trim().toLocaleLowerCase("kk-KZ")
  );

  if (existing) {
    mediator.openChat(existing.id);
    showToast("Бұл чат бұрыннан бар.");
    return;
  }

  mediator.createChat(name);
  showToast("Жаңа чат ашылды!");
});

// Қосымша файл таңдау
$("#attachButton").addEventListener("click", () => {
  $("#fileInput").click();
});

$("#fileInput").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;

  messageInput.value = `📎 ${file.name}`;
  messageInput.focus();
  showToast("Файл атауы хабарламаға қосылды. Жіберу үшін ➤ басыңыз.");
  event.target.value = "";
});

// Профиль
$("#profileButton").addEventListener("click", () => {
  showToast("AI Bank Messenger · Жеке кабинет");
});

// Ctrl+K арқылы чат іздеу
document.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === "k") {
    event.preventDefault();
    chatSearch.focus();
  }

  if (event.key === "Escape") {
    messageSearchBar.classList.add("hidden");
    messageSearch.value = "";
    store.messageQuery = "";
    renderActiveChat();
  }
});


/* ==========================================
   БАСТАПҚЫ КҮЙ
========================================== */

renderChatList();
renderActiveChat();
updateCounters();
updateInfoPanel();

// Бастапқы чаттағы оқылмаған хабарламаларды
// бірінші ашылған сәтте оқылған деп белгілеу.
store.markRead(store.activeChatId);
renderChatList();
updateCounters();
updateInfoPanel();
