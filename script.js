
"use strict";


const $ = (id) => document.getElementById(id);

const escapeHTML = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[char]);

const formatTime = (date = new Date()) =>
  new Intl.DateTimeFormat("kk-KZ", {
    hour: "2-digit", minute: "2-digit"
  }).format(date);

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const today = () => new Date().toLocaleDateString("kk-KZ", {
  day: "numeric", month: "long", year: "numeric"
});

function makeMessage(id, sender, initials, text, time, mine = false, extra = {}) {
  return {
    id, sender, initials, text, time, mine,
    file: null, reactions: [], ...extra
  };
}



class ChatService {
  static instance;

  constructor() {
    if (ChatService.instance) return ChatService.instance;

    this.listeners = [];
    this.currentChatId = 1;
    this.nextMessageId = 100;
    this.nextChatId = 11;
    this.chats = this.createDemoChats();

    ChatService.instance = this;
  }

  createDemoChats() {
    return [
      {
        id: 1, name: "IT бөлімі", initials: "IT",
        color: "blue", department: "IT бөлімі", group: true,
        members: ["Әлихан Сәрсен", "Дана Ермек", "Акмарал Әкімші"],
        description: "IT жобалары, техникалық тапсырмалар және жүйе жаңартулары.",
        unread: 2, pinned: true, online: true,
        messages: [
          makeMessage(1, "Әлихан Сәрсен", "ӘС", "Сәлем, команда! Бүгінгі жүйе жаңартуы бойынша қысқаша талқылайық.", "09:15"),
          makeMessage(2, "Дана Ермек", "ДЕ", "Сәлем! Жаңа интерфейстің негізгі бөлігін дайындап қойдым. Тексеруге болады.", "09:18"),
          makeMessage(3, "Әлихан Сәрсен", "ӘС", "Керемет! API байланысын да тексеріп шығайық. Түске дейін дайын болсақ жақсы.", "09:20"),
          makeMessage(4, "Акмарал Әкімші", "AA", "Жақсы, қабылдадым. Нәтижені осы чатқа жіберемін.", "09:22", true)
        ]
      },
      {
        id: 2, name: "Қаржы бөлімі", initials: "ҚБ",
        color: "green", department: "Қаржы бөлімі", group: true,
        members: ["Мадина Қасым", "Аружан Нұр", "Акмарал Әкімші"],
        description: "Қаржы есептері, бюджетті жоспарлау және төлемдер туралы жұмыс чаты.",
        unread: 1, pinned: false, online: true,
        messages: [
          makeMessage(5, "Мадина Қасым", "МҚ", "Қайырлы күн! Айлық есептің соңғы нұсқасын дайындадым.", "10:04"),
          makeMessage(6, "Аружан Нұр", "АН", "Рақмет, кестедегі сомаларды да қайта тексеріп шығамын.", "10:07")
        ]
      },
      {
        id: 3, name: "Клиенттер қызметі", initials: "КҚ",
        color: "orange", department: "Клиенттер қызметі", group: true,
        members: ["Айша Мұрат", "Ерлан Бек", "Акмарал Әкімші"],
        description: "Клиенттерге қызмет көрсету, өтініштер және кері байланыс.",
        unread: 3, pinned: false, online: true,
        messages: [
          makeMessage(7, "Айша Мұрат", "АМ", "Бүгін бірнеше жаңа өтініш келіп түсті.", "10:12"),
          makeMessage(8, "Ерлан Бек", "ЕБ", "Өтініштерді санаттарға бөліп, жауаптарды дайындаймын.", "10:14")
        ]
      },
      {
        id: 4, name: "Қауіпсіздік тобы", initials: "ҚТ",
        color: "pink", department: "Қауіпсіздік", group: true,
        members: ["Нұржан Әли", "Самал Омар", "Акмарал Әкімші"],
        description: "Ақпараттық қауіпсіздік пен ішкі ережелерді талқылау.",
        unread: 0, pinned: true, online: false,
        messages: [
          makeMessage(9, "Нұржан Әли", "НӘ", "Қауіпсіздік нұсқаулығын командаға қайта жіберу қажет.", "Кеше"),
          makeMessage(10, "Самал Омар", "СО", "Түсінікті, хабарландыруды бүгін жариялаймын.", "Кеше")
        ]
      },
      {
        id: 5, name: "Хабарландырулар", initials: "ХБ",
        color: "purple", department: "Хабарландырулар", group: true,
        members: ["HR бөлімі", "Акмарал Әкімші"],
        description: "Компанияның ішкі жаңалықтары және маңызды хабарландырулар.",
        unread: 1, pinned: false, online: true,
        messages: [
          makeMessage(11, "HR бөлімі", "HR", "Құрметті әріптестер! Ертең сағат 11:00-де командалық жиналыс өтеді.", "08:30"),
          makeMessage(12, "HR бөлімі", "HR", "Барлығыңыздан уақытында қосылуларыңызды сұраймыз.", "08:31")
        ]
      },
      {
        id: 6, name: "Жоба: Mobile Banking", initials: "MB",
        color: "cyan", department: "IT бөлімі", group: true,
        members: ["Дана Ермек", "Әлихан Сәрсен", "Акмарал Әкімші"],
        description: "Мобильді банкинг жобасының тапсырмалары мен орындалу барысы.",
        unread: 0, pinned: false, online: true,
        messages: [
          makeMessage(13, "Дана Ермек", "ДЕ", "Басты экранның жаңа нұсқасы дайын. Кері байланыс күтемін.", "11:02"),
          makeMessage(14, "Әлихан Сәрсен", "ӘС", "Түстері жақсы үйлескен. Батырмаларды да тексерейік.", "11:05")
        ]
      },
      {
        id: 7, name: "Жетекшімен байланыс", initials: "ЖБ",
        color: "dark", department: "IT бөлімі", group: false,
        members: ["Акмарал Әкімші", "Әлихан Сәрсен"],
        description: "Жұмыс тапсырмаларын және жобалардың мәртебесін талқылау.",
        unread: 0, pinned: false, online: true,
        messages: [
          makeMessage(15, "Әлихан Сәрсен", "ӘС", "Жаңа тапсырманың мерзімін бүгін нақтыласақ болады.", "11:15"),
          makeMessage(16, "Акмарал Әкімші", "AA", "Әрине, түстен кейін талқылайық.", "11:17", true)
        ]
      },
      {
        id: 8, name: "Жұмыс құжаттары", initials: "ЖҚ",
        color: "yellow", department: "Қаржы бөлімі", group: true,
        members: ["Мадина Қасым", "Акмарал Әкімші"],
        description: "Құжаттар мен есептердің тізімі.",
        unread: 0, pinned: false, online: false,
        messages: [
          makeMessage(17, "Мадина Қасым", "МҚ", "Құжаттарды осы жерге тіркей аламыз.", "Кеше"),
          makeMessage(18, "Акмарал Әкімші", "AA", "Жақсы, қабылдадым.", "Кеше", true)
        ]
      },
      {
        id: 9, name: "HR бөлімі", initials: "HR",
        color: "pink", department: "Хабарландырулар", group: true,
        members: ["Самал Омар", "Айша Мұрат", "Акмарал Әкімші"],
        description: "Қызметкерлер, жұмыс кестесі және командалық іс-шаралар.",
        unread: 0, pinned: false, online: true,
        messages: [
          makeMessage(19, "Самал Омар", "СО", "Келесі аптадағы жұмыс кестесі жаңартылды.", "Кеше")
        ]
      },
      {
        id: 10, name: "Жалпы команда", initials: "ЖК",
        color: "blue", department: "IT бөлімі", group: true,
        members: ["Әлихан Сәрсен", "Мадина Қасым", "Акмарал Әкімші"],
        description: "Команда мүшелерінің ортақ жұмыс кеңістігі.",
        unread: 0, pinned: false, online: true,
        messages: [
          makeMessage(20, "Мадина Қасым", "МҚ", "Баршаңызға сәтті жұмыс күні!", "08:45"),
          makeMessage(21, "Акмарал Әкімші", "AA", "Рақмет! Барлығыңызға сәттілік.", "08:48", true)
        ]
      }
    ];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(item => item !== listener);
    };
  }

  notify(event = "change") {
    this.listeners.forEach(listener => listener(event));
  }

  get currentChat() {
    return this.chats.find(chat => chat.id === this.currentChatId) || this.chats[0];
  }

  selectChat(id) {
    const chat = this.chats.find(item => item.id === id);
    if (!chat) return;
    this.currentChatId = id;
    chat.unread = 0;
    this.notify("select");
  }

  sendMessage(text, file = null) {
    const chat = this.currentChat;
    if (!chat || (!text.trim() && !file)) return;

    chat.messages.push(makeMessage(
      this.nextMessageId++,
      "Акмарал Әкімші",
      "AA",
      text.trim(),
      formatTime(),
      true,
      { file }
    ));

    chat.unread = 0;
    this.notify("message");
  }

  deleteMessage(messageId) {
    const chat = this.currentChat;
    chat.messages = chat.messages.filter(message => message.id !== messageId);
    this.notify("delete");
  }

  togglePin(chatId) {
    const chat = this.chats.find(item => item.id === chatId);
    if (!chat) return;
    chat.pinned = !chat.pinned;
    this.notify("pin");
  }

  addReaction(messageId, emoji) {
    const message = this.currentChat.messages.find(item => item.id === messageId);
    if (!message) return;
    const existing = message.reactions.find(item => item.emoji === emoji);
    if (existing) existing.count++;
    else message.reactions.push({ emoji, count: 1 });
    this.notify("reaction");
  }

  createChat(name, department = "IT бөлімі") {
    const cleanName = name.trim();
    if (!cleanName) return null;

    const chat = {
      id: this.nextChatId++,
      name: cleanName,
      initials: cleanName.split(/\s+/).slice(0, 2).map(word => word[0]).join("").toUpperCase(),
      color: ["blue", "green", "purple", "orange"][this.chats.length % 4],
      department,
      group: true,
      members: ["Акмарал Әкімші"],
      description: "Жаңа жұмыс чаты.",
      unread: 0,
      pinned: false,
      online: true,
      messages: []
    };

    this.chats.unshift(chat);
    this.currentChatId = chat.id;
    this.notify("new-chat");
    return chat;
  }
}


class ChatObserver {
  constructor() {
    this.listeners = new Set();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(event) {
    this.listeners.forEach(callback => callback(event));
  }
}



class SendCommand {
  constructor(service, text, file = null) {
    this.service = service;
    this.text = text;
    this.file = file;
  }
  execute() {
    this.service.sendMessage(this.text, this.file);
  }
}

class DeleteCommand {
  constructor(service, messageId) {
    this.service = service;
    this.messageId = messageId;
  }
  execute() {
    this.service.deleteMessage(this.messageId);
  }
}

class PinCommand {
  constructor(service, chatId) {
    this.service = service;
    this.chatId = chatId;
  }
  execute() {
    this.service.togglePin(this.chatId);
  }
}

class ReactionCommand {
  constructor(service, messageId, emoji) {
    this.service = service;
    this.messageId = messageId;
    this.emoji = emoji;
  }
  execute() {
    this.service.addReaction(this.messageId, this.emoji);
  }
}

class CommandInvoker {
  execute(command) {
    command.execute();
  }
}



class ChatMediator {
  constructor(service, invoker) {
    this.service = service;
    this.invoker = invoker;
  }

  send(text, file = null) {
    this.invoker.execute(new SendCommand(this.service, text, file));
  }

  delete(messageId) {
    this.invoker.execute(new DeleteCommand(this.service, messageId));
  }

  pin(chatId) {
    this.invoker.execute(new PinCommand(this.service, chatId));
  }

  react(messageId, emoji) {
    this.invoker.execute(new ReactionCommand(this.service, messageId, emoji));
  }

  select(chatId) {
    this.service.selectChat(chatId);
  }

  create(name, department) {
    return this.service.createChat(name, department);
  }
}



const service = new ChatService();
const observer = new ChatObserver();
const invoker = new CommandInvoker();
const mediator = new ChatMediator(service, invoker);

let activeView = "chats";
let activeFilter = "all";
let activeDepartment = "Барлығы";
let chatSearch = "";
let messageSearch = "";
let infoOpen = true;
let toastTimer;
let pendingFile = null;


service.subscribe(event => observer.notify(event));

observer.subscribe(() => {
  renderAll();
});



function getLastMessage(chat) {
  return chat.messages[chat.messages.length - 1];
}

function getFilteredChats() {
  let chats = [...service.chats];

  if (activeView === "unread" || activeFilter === "unread") {
    chats = chats.filter(chat => chat.unread > 0);
  }
  if (activeView === "pinned" || activeFilter === "pinned") {
    chats = chats.filter(chat => chat.pinned);
  }
  if (activeView === "files") {
    chats = chats.filter(chat => chat.messages.some(message => message.file));
  }
  if (activeDepartment !== "Барлығы") {
    chats = chats.filter(chat => chat.department === activeDepartment);
  }
  if (chatSearch.trim()) {
    const query = chatSearch.toLowerCase();
    chats = chats.filter(chat =>
      chat.name.toLowerCase().includes(query) ||
      chat.department.toLowerCase().includes(query) ||
      chat.messages.some(message => message.text.toLowerCase().includes(query))
    );
  }

  return chats.sort((a, b) => Number(b.pinned) - Number(a.pinned));
}

function renderChats() {
  const list = $("chatList");
  const chats = getFilteredChats();

  $("listCount").textContent = `${chats.length} чат`;
  $("navChatCount").textContent = service.chats.length;

  if (!chats.length) {
    list.innerHTML = `<div class="empty"><i class="fa-regular fa-comments"></i>Чат табылмады.<br>Іздеу сөзін өзгертіп көріңіз.</div>`;
    return;
  }

  list.innerHTML = chats.map(chat => {
    const last = getLastMessage(chat);
    const preview = last ? (last.file ? `📎 ${last.file.name}` : last.text) : "Әзірге хабарлама жоқ";
    return `
      <div class="chat-item ${chat.id === service.currentChatId ? "active" : ""}"
           data-chat-id="${chat.id}" tabindex="0" role="button"
           aria-label="${escapeHTML(chat.name)} чатын ашу">
        <div class="avatar avatar-${escapeHTML(chat.color)}">
          ${escapeHTML(chat.initials)}
          ${chat.online ? '<span class="online-dot"></span>' : ""}
        </div>
        <div class="chat-details">
          <div class="chat-meta">
            <b>${escapeHTML(chat.name)}</b>
            <span class="chat-time">${escapeHTML(last?.time || "")}</span>
          </div>
          <div class="chat-preview">
            <span>${escapeHTML(preview)}</span>
            ${chat.pinned ? '<i class="fa-solid fa-thumbtack pin-mark"></i>' : ""}
            ${chat.unread ? `<span class="unread-count">${chat.unread}</span>` : ""}
          </div>
        </div>
      </div>`;
  }).join("");
}


function renderMessages() {
  const chat = service.currentChat;
  const area = $("messages");

  if (!chat) {
    area.innerHTML = `<div class="empty">Чатты таңдаңыз.</div>`;
    return;
  }

  $("headerName").textContent = chat.name;
  $("headerAvatar").textContent = chat.initials;
  $("headerAvatar").className = `avatar avatar-${chat.color}`;
  $("headerStatus").innerHTML = `<span class="online-dot"></span> ${chat.group ? `${chat.members.length} қатысушы · ${chat.online ? "Белсенді" : "Жұмыс уақытынан тыс"}` : (chat.online ? "Желіде" : "Желіде емес")}`;
  $("pinChatBtn").style.color = chat.pinned ? "#4169db" : "";
  $("pinChatBtn").title = chat.pinned ? "Бекітуді алып тастау" : "Чатты бекіту";

  let messages = chat.messages;
  if (messageSearch.trim()) {
    const query = messageSearch.toLowerCase();
    messages = messages.filter(message =>
      message.text.toLowerCase().includes(query) ||
      message.sender.toLowerCase().includes(query) ||
      (message.file && message.file.name.toLowerCase().includes(query))
    );
  }

  if (!messages.length) {
    area.innerHTML = `<div class="empty"><i class="fa-regular fa-message"></i>${messageSearch ? "Сәйкес хабарлама табылмады." : "Бұл чатта әзірге хабарлама жоқ."}<br>Алғашқы хабарламаны жазыңыз!</div>`;
    renderInfo();
    return;
  }

  let html = `<div class="day-divider"><span>${today()}</span></div>`;

  html += messages.map(message => {
    const fileHTML = message.file ? `
      <div class="file-card">
        <div class="file-icon"><i class="fa-regular fa-file-lines"></i></div>
        <div><b>${escapeHTML(message.file.name)}</b><small>${escapeHTML(message.file.size)}</small></div>
        <i class="fa-solid fa-paperclip"></i>
      </div>` : "";

    const reactionsHTML = message.reactions.map(reaction =>
      `<button class="reaction-chip" data-action="react" data-id="${message.id}" data-emoji="${escapeHTML(reaction.emoji)}">${escapeHTML(reaction.emoji)} ${reaction.count}</button>`
    ).join("");

    return `
      <article class="message-row ${message.mine ? "mine" : ""}">
        <div class="message-avatar">${escapeHTML(message.initials)}</div>
        <div class="message-content">
          <div class="message-top"><b>${escapeHTML(message.sender)}</b><span>${escapeHTML(message.time)}</span></div>
          ${message.text ? `<div class="bubble">${escapeHTML(message.text)}</div>` : ""}
          ${fileHTML}
          ${reactionsHTML ? `<div>${reactionsHTML}</div>` : ""}
          <div class="message-bottom">
            <span>${message.mine ? "Сіз" : "Хабарлама"}</span>
            ${message.mine ? '<i class="fa-solid fa-check-double message-status"></i>' : ""}
          </div>
          <div class="message-tools">
            <button data-action="react" data-id="${message.id}" data-emoji="👍" title="Лайк">👍</button>
            <button data-action="react" data-id="${message.id}" data-emoji="❤️" title="Жүрек">❤️</button>
            <button data-action="react" data-id="${message.id}" data-emoji="👏" title="Қол шапалақ">👏</button>
            ${message.mine ? `<button data-action="delete" data-id="${message.id}" title="Хабарламаны өшіру"><i class="fa-regular fa-trash-can"></i></button>` : ""}
          </div>
        </div>
      </article>`;
  }).join("");

  area.innerHTML = html;
  area.scrollTop = area.scrollHeight;
  renderInfo();
}



function renderInfo() {
  const chat = service.currentChat;
  const panel = $("infoPanel");
  panel.classList.toggle("hidden", !infoOpen);

  if (!infoOpen || !chat) return;

  $("infoContent").innerHTML = `
    <div class="info-main">
      <div class="avatar avatar-${escapeHTML(chat.color)}">${escapeHTML(chat.initials)}</div>
      <b>${escapeHTML(chat.name)}</b>
      <p>${escapeHTML(chat.department)}</p>
    </div>
    <section class="info-section">
      <h4>Чат туралы</h4>
      <p class="info-description">${escapeHTML(chat.description)}</p>
    </section>
    <section class="info-section">
      <h4>Қатысушылар · ${chat.members.length}</h4>
      ${chat.members.map((name, index) => `
        <div class="member-row">
          <div class="member-avatar">${escapeHTML(name.split(/\s+/).map(part => part[0]).slice(0, 2).join(""))}</div>
          <div><b>${escapeHTML(name)}</b><small>${index === 0 ? "Команда мүшесі" : "Қатысушы"}</small></div>
          ${index === 0 ? '<i class="fa-solid fa-circle-check"></i>' : ""}
        </div>`).join("")}
    </section>
    <section class="info-section">
      <h4>Чат әрекеттері</h4>
      <button class="info-action" id="infoPinBtn"><i class="fa-solid fa-thumbtack"></i> ${chat.pinned ? "Бекітуді алып тастау" : "Чатты бекіту"}</button>
      <button class="info-action" id="infoSearchBtn"><i class="fa-solid fa-magnifying-glass"></i> Хабарламадан іздеу</button>
      <button class="info-action" id="infoClearSearchBtn"><i class="fa-solid fa-filter-circle-xmark"></i> Іздеуді тазарту</button>
    </section>`;

  $("infoPinBtn").addEventListener("click", () => mediator.pin(chat.id));
  $("infoSearchBtn").addEventListener("click", openMessageSearch);
  $("infoClearSearchBtn").addEventListener("click", () => {
    messageSearch = "";
    $("messageSearchInput").value = "";
    renderMessages();
    showToast("Хабарлама іздеуі тазартылды");
  });
}

function renderStats() {
  $("statTotal").textContent = service.chats.length;
  $("statUnread").textContent = service.chats.reduce((sum, chat) => sum + chat.unread, 0);
}

function renderAll() {
  renderChats();
  renderMessages();
  renderStats();

  document.querySelectorAll(".nav-item[data-view]").forEach(button => {
    button.classList.toggle("active", button.dataset.view === activeView);
  });

  document.querySelectorAll(".department").forEach(button => {
    button.classList.toggle("active", button.dataset.department === activeDepartment);
  });

  document.querySelectorAll(".filter").forEach(button => {
    button.classList.toggle("active", button.dataset.filter === activeFilter);
  });
}


function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}



$("chatList").addEventListener("click", event => {
  const item = event.target.closest("[data-chat-id]");
  if (!item) return;
  mediator.select(Number(item.dataset.chatId));
});

$("chatList").addEventListener("keydown", event => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const item = event.target.closest("[data-chat-id]");
  if (!item) return;
  event.preventDefault();
  mediator.select(Number(item.dataset.chatId));
});


$("messageForm").addEventListener("submit", event => {
  event.preventDefault();
  const input = $("messageInput");
  const text = input.value.trim();

  if (!text && !pendingFile) {
    showToast("Алдымен хабарлама жазыңыз немесе файл таңдаңыз");
    input.focus();
    return;
  }

  mediator.send(text, pendingFile);
  input.value = "";
  input.style.height = "auto";
  pendingFile = null;
  $("fileInput").value = "";
  $("charCount").textContent = "0 / 2000";
  showToast("Хабарлама жіберілді");
  input.focus();
});

$("messageInput").addEventListener("input", () => {
  const input = $("messageInput");
  if (input.value.length > 2000) input.value = input.value.slice(0, 2000);
  $("charCount").textContent = `${input.value.length} / 2000`;
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 110)}px`;
});

$("messageInput").addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    $("messageForm").requestSubmit();
  }
});


$("searchInput").addEventListener("input", event => {
  chatSearch = event.target.value;
  renderChats();
});


document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    activeView = "chats";
    renderAll();
  });
});


document.querySelectorAll(".nav-item[data-view]").forEach(button => {
  button.addEventListener("click", () => {
    activeView = button.dataset.view;
    activeFilter = "all";
    renderAll();
  });
});


document.querySelectorAll(".department").forEach(button => {
  button.addEventListener("click", () => {
    activeDepartment = button.dataset.department;
    activeView = "chats";
    activeFilter = "all";
    renderAll();
  });
});


$("pinChatBtn").addEventListener("click", () => {
  const chat = service.currentChat;
  if (!chat) return;
  mediator.pin(chat.id);
  showToast(chat.pinned ? "Чат бекітілді" : "Чат бекітуден алынды");
});


$("messages").addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  if (button.dataset.action === "delete") {
    if (confirm("Осы хабарламаны өшіргіңіз келе ме?")) {
      mediator.delete(id);
      showToast("Хабарлама өшірілді");
    }
  }

  if (button.dataset.action === "react") {
    mediator.react(id, button.dataset.emoji);
    showToast("Реакция қосылды");
  }
});


$("newChatBtn").addEventListener("click", () => {
  const name = prompt("Жаңа чаттың атауын енгізіңіз:");
  if (name === null) return;
  if (!name.trim()) {
    showToast("Чат атауын енгізіңіз");
    return;
  }

  const departments = [
    "IT бөлімі", "Қаржы бөлімі", "Клиенттер қызметі",
    "Қауіпсіздік", "Хабарландырулар"
  ];
  const choice = prompt(
    "Қай бөлімге жататынын таңдаңыз:\n1 — IT бөлімі\n2 — Қаржы бөлімі\n3 — Клиенттер қызметі\n4 — Қауіпсіздік\n5 — Хабарландырулар",
    "1"
  );
  if (choice === null) return;

  const index = Number(choice) - 1;
  if (!Number.isInteger(index) || index < 0 || index >= departments.length) {
    showToast("Бөлім нөмірі дұрыс емес. Чат ашылмады.");
    return;
  }

  activeDepartment = "Барлығы";
  activeView = "chats";
  activeFilter = "all";
  const chat = mediator.create(name, departments[index]);
  if (chat) showToast(`«${chat.name}» чаты құрылды`);
});


function openMessageSearch() {
  $("searchMessageBar").classList.remove("hidden");
  $("messageSearchInput").focus();
}

$("searchMessagesBtn").addEventListener("click", openMessageSearch);

$("messageSearchInput").addEventListener("input", event => {
  messageSearch = event.target.value;
  renderMessages();
});

$("closeMessageSearch").addEventListener("click", () => {
  messageSearch = "";
  $("messageSearchInput").value = "";
  $("searchMessageBar").classList.add("hidden");
  renderMessages();
});


$("chatInfoBtn").addEventListener("click", () => {
  infoOpen = !infoOpen;
  renderInfo();
});

$("closeInfoBtn").addEventListener("click", () => {
  infoOpen = false;
  renderInfo();
});


$("closeBannerBtn").addEventListener("click", () => {
  $("chatBanner").classList.add("hidden");
});


document.querySelectorAll("[data-quick]").forEach(button => {
  button.addEventListener("click", () => {
    $("messageInput").value = button.dataset.quick;
    $("messageInput").dispatchEvent(new Event("input"));
    $("messageInput").focus();
  });
});


$("emojiBtn").addEventListener("click", () => {
  const emojis = ["😊", "👍", "❤️", "🎉", "🙏", "👏", "💼", "✅"];
  const choice = prompt(`Эмодзи таңдаңыз:\n${emojis.join(" ")}`, "😊");
  if (choice === null || !choice.trim()) return;

  const input = $("messageInput");
  input.value += choice.trim();
  input.dispatchEvent(new Event("input"));
  input.focus();
});


$("attachBtn").addEventListener("click", () => $("fileInput").click());

$("fileInput").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;

  const allowedTypes = /\.(pdf|doc|docx|xls|xlsx|png|jpg|jpeg|txt)$/i;
  if (!allowedTypes.test(file.name)) {
    showToast("Бұл файл түріне рұқсат берілмеген");
    event.target.value = "";
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    showToast("Файл көлемі 10 MB-тан аспауы керек");
    event.target.value = "";
    return;
  }

  pendingFile = { name: file.name, size: formatBytes(file.size) };
  showToast(`Тіркеуге дайын: ${file.name}`);
});


$("refreshBtn").addEventListener("click", () => {
  renderAll();
  showToast("Чаттар жаңартылды");
});

$("notificationBtn").addEventListener("click", () => {
  const unread = service.chats.reduce((sum, chat) => sum + chat.unread, 0);
  showToast(unread ? `Оқылмаған хабарламалар: ${unread}` : "Жаңа хабарландыру жоқ");
});

$("profileBtn").addEventListener("click", () => {
  showToast("Профиль: Акмарал Әкімші · Демо режимі");
});

$("addDepartmentBtn").addEventListener("click", () => {
  showToast("Бөлімдер оқу жобасында алдын ала бапталған");
});


document.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    $("searchInput").focus();
  }

  if (event.key === "Escape") {
    if (!$("searchMessageBar").classList.contains("hidden")) {
      $("closeMessageSearch").click();
    }
  }
});


renderAll();
showToast("AI Bank Messenger дайын");

