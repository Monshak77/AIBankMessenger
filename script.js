"use strict";



class ChatObserver {
  constructor() {
    this.listeners = [];
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notify(event) {
    this.listeners.forEach(callback => callback(event));
  }
}

const observer = new ChatObserver();



class ChatService {
  constructor() {
    if (ChatService.instance) return ChatService.instance;

    this.currentChatId = 1;
    this.nextId = 100;
    this.chats = [
      {
        id: 1, name: "IT бөлімі", avatar: "</>", department: "IT бөлімі",
        status: "12 қызметкер · Жұмыс тобы", unread: 2, pinned: true,
        messages: [
          { id: 1, sender: "Бекзат", avatar: "Б", text: "Сервердің жаңартылуы аяқталды. Тестілеуге дайын.", time: "09:12", mine: false, reactions: ["👍 2"] },
          { id: 2, sender: "Әлихан", avatar: "Ә", text: "Жақсы, қазір тексеріп, нәтижесін жазамын.", time: "09:15", mine: true, reactions: [] },
          { id: 3, sender: "Данияр", avatar: "Д", text: "API байланысын да тексеруді ұмытпаңыздар. Есеп түске дейін қажет.", time: "09:18", mine: false, reactions: ["✓ 1"] }
        ]
      },
      {
        id: 2, name: "AI Bank қолдау", avatar: "AI", department: "Клиенттер қызметі",
        status: "Қолдау қызметі", unread: 3, pinned: true,
        messages: [
          { id: 4, sender: "Мадина", avatar: "М", text: "Клиенттердің өтінімдерін өңдеу бойынша жаңартылған нұсқаулық дайын.", time: "09:10", mine: false, reactions: [] },
          { id: 5, sender: "Мадина", avatar: "М", text: "Жаңа өтінім формасын жұмыс тобына жібердім. Тексеріп шығыңыздар.", time: "09:14", mine: false, reactions: ["👍 3"] }
        ]
      },
      {
        id: 3, name: "Жоба басқару", avatar: "ЖБ", department: "Басшылық",
        status: "8 қызметкер · Жоба тобы", unread: 1, pinned: false,
        messages: [
          { id: 6, sender: "Данияр", avatar: "Д", text: "AI Bank жүйесінің осы аптадағы жоспарымен танысып шығыңыздар.", time: "08:55", mine: false, reactions: [] },
          { id: 7, sender: "Әлихан", avatar: "Ә", text: "Жоспарды қарап шықтым. Өз тапсырмаларымды бүгін аяқтаймын.", time: "09:02", mine: true, reactions: [] }
        ]
      },
      {
        id: 4, name: "Қаржы бөлімі", avatar: "ҚБ", department: "Қаржы бөлімі",
        status: "6 қызметкер · Қаржы тобы", unread: 0, pinned: false,
        messages: [
          { id: 8, sender: "Салтанат", avatar: "С", text: "Айлық есеп дайын. Соңғы тексеруден кейін басшылыққа жібереміз.", time: "08:48", mine: false, reactions: [] }
        ]
      },
      {
        id: 5, name: "Қауіпсіздік қызметі", avatar: "ҚҚ", department: "Қауіпсіздік",
        status: "5 қызметкер · Қауіпсіздік", unread: 0, pinned: true,
        messages: [
          { id: 9, sender: "Ерлан", avatar: "Е", text: "Қауіпсіздік саясатының жаңартылған талаптары жарияланды. Құжатпен танысуларыңызды сұраймыз.", time: "08:40", mine: false, reactions: [] }
        ]
      },
      {
        id: 6, name: "Клиенттерге қызмет көрсету", avatar: "КҚ", department: "Клиенттер қызметі",
        status: "10 қызметкер · Қызмет көрсету", unread: 4, pinned: false,
        messages: [
          { id: 10, sender: "Аружан", avatar: "А", text: "Клиенттердің жиі қоятын сұрақтары бойынша жаңа жауап үлгілері дайын.", time: "08:35", mine: false, reactions: [] }
        ]
      },
      {
        id: 7, name: "Карталар және төлемдер", avatar: "КТ", department: "Қаржы бөлімі",
        status: "7 қызметкер · Төлемдер", unread: 0, pinned: false,
        messages: [
          { id: 11, sender: "Нұржан", avatar: "Н", text: "Төлем операцияларының тестілеу нәтижелері тіркелді. Қате байқалмады.", time: "Кеше", mine: false, reactions: ["👍 1"] }
        ]
      },
      {
        id: 8, name: "Құжат айналымы", avatar: "ҚА", department: "Әкімшілік",
        status: "4 қызметкер · Құжаттар", unread: 1, pinned: false,
        messages: [
          { id: 12, sender: "Руслан", avatar: "Р", text: "Келісімшарттың соңғы нұсқасы ортақ папкаға жүктелді. Тексеруге жіберілді.", time: "Кеше", mine: false, reactions: [] }
        ]
      },
      {
        id: 9, name: "HR және персонал", avatar: "HR", department: "HR",
        status: "5 қызметкер · Персонал", unread: 0, pinned: false,
        messages: [
          { id: 13, sender: "Назерке", avatar: "Н", text: "Қызметкерлердің оқыту кестесі жаңартылды. Ұсыныстарыңызды осы чатқа қалдырыңыздар.", time: "Кеше", mine: false, reactions: [] }
        ]
      },
      {
        id: 10, name: "Банк жаңалықтары", avatar: "BN", department: "Хабарландырулар",
        status: "Ресми хабарландырулар", unread: 2, pinned: true,
        messages: [
          { id: 14, sender: "Әкімшілік", avatar: "Ә", text: "Жаңа ішкі жұмыс регламенті жарияланды. Барлық бөлім қызметкерлеріне танысу ұсынылады.", time: "Кеше", mine: false, reactions: [] }
        ]
      }
    ];

    ChatService.instance = this;
  }

  static getInstance() {
    if (!ChatService.instance) new ChatService();
    return ChatService.instance;
  }

  getChats() { return this.chats; }

  currentChat() {
    return this.chats.find(chat => chat.id === this.currentChatId);
  }

  selectChat(id) {
    this.currentChatId = id;
    const chat = this.currentChat();
    if (chat) chat.unread = 0;
    observer.notify({ type: "refresh" });
  }

  send(text, fileName = "") {
    const chat = this.currentChat();
    if (!chat) return;

    chat.messages.push({
      id: this.nextId++,
      sender: "Әлихан",
      avatar: "Ә",
      text,
      fileName,
      time: new Date().toLocaleTimeString("kk-KZ", {
        hour: "2-digit", minute: "2-digit"
      }),
      mine: true,
      reactions: []
    });

    observer.notify({ type: "sent" });
  }

  deleteMessage(id) {
    const chat = this.currentChat();
    if (!chat) return;
    chat.messages = chat.messages.filter(message => message.id !== id);
    observer.notify({ type: "deleted" });
  }

  clearChat() {
    const chat = this.currentChat();
    if (!chat) return;
    chat.messages = [];
    observer.notify({ type: "cleared" });
  }

  togglePin() {
    const chat = this.currentChat();
    if (!chat) return;
    chat.pinned = !chat.pinned;
    observer.notify({ type: "refresh" });
  }

  addReaction(id) {
    const chat = this.currentChat();
    const message = chat?.messages.find(item => item.id === id);
    if (!message) return;

    const index = message.reactions.findIndex(r => r.startsWith("👍"));
    if (index >= 0) {
      message.reactions.splice(index, 1);
    } else {
      message.reactions.push("👍 1");
    }
    observer.notify({ type: "refresh" });
  }
}



class ChatMediator {
  constructor(service) { this.service = service; }
  send(text, file = "") { this.service.send(text, file); }
  delete(id) { this.service.deleteMessage(id); }
  open(id) { this.service.selectChat(id); }
  pin() { this.service.togglePin(); }
  react(id) { this.service.addReaction(id); }
  clear() { this.service.clearChat(); }
}



class SendCommand {
  constructor(mediator, text, file = "") {
    this.mediator = mediator;
    this.text = text;
    this.file = file;
  }
  execute() { this.mediator.send(this.text, this.file); }
}

class DeleteCommand {
  constructor(mediator, id) {
    this.mediator = mediator;
    this.id = id;
  }
  execute() { this.mediator.delete(this.id); }
}

class PinCommand {
  constructor(mediator) { this.mediator = mediator; }
  execute() { this.mediator.pin(); }
}

class ReactionCommand {
  constructor(mediator, id) {
    this.mediator = mediator;
    this.id = id;
  }
  execute() { this.mediator.react(this.id); }
}

const service = ChatService.getInstance();
const mediator = new ChatMediator(service);

const $ = id => document.getElementById(id);
const chatList = $("chatList");
const messages = $("messages");
const searchInput = $("searchInput");
const input = $("messageInput");
const infoPanel = $("infoPanel");

let activeFilter = "all";
let activeDepartment = "Барлығы";
let activeView = "chats";
let messageSearch = "";
let toastTimer;

function toast(text) {
  const element = $("toast");
  element.textContent = text;
  element.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove("show"), 2300);
}

function escapeText(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[char]);
}

function lastMessage(chat) {
  const message = chat.messages.at(-1);
  if (!message) return "Хабарлама жоқ";
  return message.fileName ? "📎 " + message.fileName : message.text;
}

function filteredChats() {
  const query = searchInput.value.trim().toLowerCase();

  return service.getChats().filter(chat => {
    const matchesQuery =
      chat.name.toLowerCase().includes(query) ||
      chat.department.toLowerCase().includes(query) ||
      chat.messages.some(message => message.text.toLowerCase().includes(query));

    const matchesDepartment =
      activeDepartment === "Барлығы" || chat.department === activeDepartment;

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "unread" && chat.unread > 0) ||
      (activeFilter === "pinned" && chat.pinned);

    const matchesView =
      activeView === "chats" ||
      (activeView === "pinned" && chat.pinned) ||
      (activeView === "files" && chat.messages.some(message => message.fileName)) ||
      (activeView === "announcements" && chat.department === "Хабарландырулар");

    return matchesQuery && matchesDepartment && matchesFilter && matchesView;
  });
}

function renderChats() {
  const chats = filteredChats();
  chatList.replaceChildren();

  $("chatCount");
  document.querySelector('[data-view="chats"] b').textContent =
    service.getChats().length;

  if (!chats.length) {
    chatList.innerHTML = '<div class="empty">Сәйкес чат табылмады</div>';
    return;
  }

  chats.forEach(chat => {
    const item = document.createElement("div");
    item.className = "chat-item" + (chat.id === service.currentChatId ? " active" : "");

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = chat.avatar;

    const details = document.createElement("div");
    details.className = "chat-details";

    const name = document.createElement("strong");
    name.textContent = chat.name;

    const preview = document.createElement("p");
    preview.textContent = lastMessage(chat);

    details.append(name, preview);

    const meta = document.createElement("div");
    meta.className = "chat-meta";

    const time = document.createElement("span");
    time.className = "chat-time";
    time.textContent = chat.messages.at(-1)?.time || "";

    meta.append(time);

    if (chat.pinned) {
      const pin = document.createElement("span");
      pin.className = "pin-mark";
      pin.textContent = "★";
      meta.append(pin);
    }

    if (chat.unread) {
      const unread = document.createElement("span");
      unread.className = "unread-count";
      unread.textContent = chat.unread;
      meta.append(unread);
    }

    item.append(avatar, details, meta);
    item.addEventListener("click", () => mediator.open(chat.id));
    chatList.append(item);
  });
}

function renderMessages() {
  const chat = service.currentChat();
  if (!chat) return;

  $("contactName").textContent = chat.name;
  $("headerAvatar").textContent = chat.avatar;
  $("contactStatus").textContent = chat.status;
  $("pinChatBtn").textContent = chat.pinned ? "★" : "☆";
  $("pinChatBtn").title = chat.pinned ? "Бекітуді алып тастау" : "Чатты бекіту";

  $("chatBanner").querySelector("strong").textContent = chat.name;
  $("chatBanner").querySelector("p").textContent =
    chat.department + " · Жұмысқа қатысты ақпаратты осы чатта талқылаңыз.";

  messages.replaceChildren();

  const visibleMessages = chat.messages.filter(message =>
    message.text.toLowerCase().includes(messageSearch.toLowerCase()) ||
    (message.fileName || "").toLowerCase().includes(messageSearch.toLowerCase())
  );

  if (!visibleMessages.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = messageSearch
      ? "Іздеуге сәйкес хабарлама табылмады."
      : "Бұл чатта хабарлама жоқ. Әңгімені бастаңыз!";
    messages.append(empty);
    return;
  }

  const divider = document.createElement("div");
  divider.className = "day-divider";
  divider.innerHTML = "<span>Жұмыс хат алмасуы</span>";
  messages.append(divider);

  visibleMessages.forEach(message => {
    const row = document.createElement("div");
    row.className = "message-row" + (message.mine ? " mine" : "");

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = message.avatar;

    const content = document.createElement("div");
    content.className = "message-content";

    const top = document.createElement("div");
    top.className = "message-top";
    top.innerHTML = `<strong>${escapeText(message.sender)}</strong><time>${escapeText(message.time)}</time>`;

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = message.text;

    content.append(top, bubble);

    if (message.fileName) {
      const file = document.createElement("div");
      file.className = "file-card";
      file.innerHTML = `<div class="file-icon">▤</div><div><strong>${escapeText(message.fileName)}</strong><small>Файл тіркелді · Демо-нұсқа</small></div>`;
      content.append(file);
    }

    const bottom = document.createElement("div");
    bottom.className = "message-bottom";

    if (message.reactions.length) {
      const reaction = document.createElement("span");
      reaction.className = "message-status";
      reaction.textContent = message.reactions.join("  ");
      bottom.append(reaction);
    }

    const tools = document.createElement("div");
    tools.className = "message-tools";

    const reactBtn = document.createElement("button");
    reactBtn.textContent = "👍";
    reactBtn.title = "Реакция қосу";
    reactBtn.addEventListener("click", () =>
      new ReactionCommand(mediator, message.id).execute()
    );
    tools.append(reactBtn);

    if (message.mine) {
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Өшіру";
      deleteBtn.addEventListener("click", () => {
        if (confirm("Осы хабарламаны өшіресіз бе?")) {
          new DeleteCommand(mediator, message.id).execute();
          toast("Хабарлама өшірілді");
        }
      });
      tools.append(deleteBtn);
    }

    bottom.append(tools);
    content.append(bottom);
    row.append(avatar, content);
    messages.append(row);
  });

  messages.scrollTop = messages.scrollHeight;
}

function renderInfo() {
  const chat = service.currentChat();
  if (!chat) return;

  $("infoContent").innerHTML = `
    <div class="info-section">
      <div class="avatar" style="margin-bottom:12px">${escapeText(chat.avatar)}</div>
      <h4>${escapeText(chat.name)}</h4>
      <p>${escapeText(chat.status)}</p>
      <p>Бөлім: ${escapeText(chat.department)}</p>
    </div>
    <div class="info-section">
      <h4>Чат функциялары</h4>
      <p>★ ${chat.pinned ? "Бекітілген чат" : "Бекітілмеген чат"}</p>
      <p>Хабарлама саны: ${chat.messages.length}</p>
      <p>Оқылмаған: ${chat.unread}</p>
    </div>
    <div class="info-section">
      <h4>Қатысушылар</h4>
      ${["Әлихан", "Данияр", "Аружан", "Бекзат"].map((name, index) =>
        `<div class="member-row"><div class="avatar">${name[0]}</div><span>${name}${index === 0 ? " (Сіз)" : ""}</span></div>`
      ).join("")}
    </div>
    <div class="info-section">
      <button id="clearCurrentChat" class="filter">Чатты тазалау</button>
    </div>`;

  $("clearCurrentChat").addEventListener("click", () => {
    if (confirm("Осы чаттағы барлық хабарламаны өшіресіз бе?")) {
      mediator.clear();
      toast("Чат тазаланды");
    }
  });
}


observer.subscribe(event => {
  renderChats();
  renderMessages();

  if (infoPanel.classList.contains("open")) renderInfo();

  if (event.type === "sent") toast("Хабарлама жіберілді");
  if (event.type === "deleted") toast("Хабарлама өшірілді");
  if (event.type === "cleared") toast("Чат тазаланды");
});


$("messageForm").addEventListener("submit", event => {
  event.preventDefault();
  const text = input.value.trim();

  if (!text) {
    toast("Алдымен хабарлама жазыңыз");
    return;
  }

  new SendCommand(mediator, text).execute();
  input.value = "";
  input.focus();
});


searchInput.addEventListener("input", renderChats);

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    if (!button.dataset.filter) return;
    activeFilter = button.dataset.filter;
    document.querySelectorAll(".filter[data-filter]").forEach(item =>
      item.classList.toggle("active", item === button)
    );
    renderChats();
  });
});

document.querySelectorAll(".department").forEach(button => {
  button.addEventListener("click", () => {
    activeDepartment = button.dataset.department;
    document.querySelectorAll(".department").forEach(item =>
      item.classList.toggle("selected", item === button)
    );
    renderChats();
  });
});


document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    activeView = button.dataset.view;
    activeDepartment = "Барлығы";

    document.querySelectorAll(".nav-item").forEach(item =>
      item.classList.toggle("active", item === button)
    );
    document.querySelectorAll(".department").forEach(item =>
      item.classList.toggle("selected", item.dataset.department === "Барлығы")
    );

    const titles = {
      chats: "Жұмыс чаттары",
      pinned: "Бекітілген чаттар",
      files: "Құжаттар мен файлдар",
      announcements: "Банк жаңалықтары"
    };
    $("listTitle").textContent = titles[activeView];
    renderChats();
  });
});


$("pinChatBtn").addEventListener("click", () =>
  new PinCommand(mediator).execute()
);


$("chatInfoBtn").addEventListener("click", () => {
  infoPanel.classList.toggle("open");
  if (infoPanel.classList.contains("open")) renderInfo();
});

$("closeInfoBtn").addEventListener("click", () =>
  infoPanel.classList.remove("open")
);


$("searchMessagesBtn").addEventListener("click", () => {
  $("searchMessageBar").classList.toggle("hidden");
  if ($("searchMessageBar").classList.contains("hidden")) {
    messageSearch = "";
    $("messageSearchInput").value = "";
    renderMessages();
  } else {
    $("messageSearchInput").focus();
  }
});

$("closeMessageSearch").addEventListener("click", () => {
  messageSearch = "";
  $("messageSearchInput").value = "";
  $("searchMessageBar").classList.add("hidden");
  renderMessages();
});

$("messageSearchInput").addEventListener("input", event => {
  messageSearch = event.target.value.trim().toLowerCase();
  renderMessages();
});


document.querySelectorAll("[data-quick]").forEach(button => {
  button.addEventListener("click", () => {
    input.value = button.dataset.quick;
    input.focus();
  });
});


$("emojiBtn").addEventListener("click", () => {
  input.value += " 👍";
  input.focus();
});

$("attachBtn").addEventListener("click", () => $("fileInput").click());

$("fileInput").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;

  const command = new SendCommand(mediator, "Жұмыс файлы тіркелді:", file.name);
  command.execute();
  event.target.value = "";
  toast("Файл атауы чатқа қосылды");
});


$("newChatBtn").addEventListener("click", () => {
  const name = prompt("Жаңа жұмыс чатының атауын енгізіңіз:");
  if (!name || !name.trim()) return;

  const chatName = name.trim();

  if (service.chats.some(chat => chat.name.toLowerCase() === chatName.toLowerCase())) {
    toast("Мұндай чат бар");
    return;
  }

  const id = service.nextId++;
  service.chats.unshift({
    id,
    name: chatName,
    avatar: chatName.slice(0, 2).toUpperCase(),
    department: activeDepartment === "Барлығы" ? "IT бөлімі" : activeDepartment,
    status: "Жаңа жұмыс тобы",
    unread: 0,
    pinned: false,
    messages: []
  });

  mediator.open(id);
  toast("Жаңа жұмыс чаты құрылды");
});


renderChats();
renderMessages();
