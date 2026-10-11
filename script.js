
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
    this.nextMessageId = 1000;

    this.chats = [
      {
        id: 1, name: "IT бөлімі", avatar: "</>",
        department: "IT бөлімі", status: "12 қызметкер · Жұмыс тобы",
        unread: 2, pinned: true, messages: [
          { sender: "Бекзат", avatar: "Б", text: "Сервердің жаңартылуы аяқталды. Тестілеуге дайын.", time: "09:12" },
          { sender: "Әлихан", avatar: "Ә", text: "Жақсы, қазір тексеріп, нәтижесін жазамын.", time: "09:15", mine: true },
          { sender: "Данияр", avatar: "Д", text: "API байланысын да тексеруді ұмытпаңыздар.", time: "09:18" }
        ]
      },
      {
        id: 2, name: "AI Bank қолдау", avatar: "AI",
        department: "Клиенттер қызметі", status: "Қолдау қызметі",
        unread: 3, pinned: true, messages: [
          { sender: "Мадина", avatar: "М", text: "Клиенттердің өтінімдерін өңдеу нұсқаулығы дайын.", time: "09:10" },
          { sender: "Мадина", avatar: "М", text: "Жаңа өтінім формасын тексеріп шығыңыздар.", time: "09:14" }
        ]
      },
      {
        id: 3, name: "Жоба басқару", avatar: "ЖБ",
        department: "Басшылық", status: "8 қызметкер · Жоба тобы",
        unread: 1, pinned: false, messages: [
          { sender: "Данияр", avatar: "Д", text: "Осы аптадағы жұмыс жоспарымен танысыңыздар.", time: "08:55" },
          { sender: "Әлихан", avatar: "Ә", text: "Жоспарды қарап шықтым. Тапсырмаларымды аяқтаймын.", time: "09:02", mine: true }
        ]
      },
      {
        id: 4, name: "Қаржы бөлімі", avatar: "ҚБ",
        department: "Қаржы бөлімі", status: "6 қызметкер · Қаржы тобы",
        unread: 0, pinned: false, messages: [
          { sender: "Салтанат", avatar: "С", text: "Айлық есеп дайын. Соңғы тексеруден кейін жібереміз.", time: "08:48" }
        ]
      },
      {
        id: 5, name: "Қауіпсіздік қызметі", avatar: "ҚҚ",
        department: "Қауіпсіздік", status: "5 қызметкер · Қауіпсіздік",
        unread: 0, pinned: true, messages: [
          { sender: "Ерлан", avatar: "Е", text: "Қауіпсіздік талаптарының жаңартылған нұсқасы жарияланды.", time: "08:40" }
        ]
      },
      {
        id: 6, name: "Клиенттерге қызмет көрсету", avatar: "КҚ",
        department: "Клиенттер қызметі", status: "10 қызметкер",
        unread: 4, pinned: false, messages: [
          { sender: "Аружан", avatar: "А", text: "Жаңа жауап үлгілері дайын.", time: "08:35" }
        ]
      },
      {
        id: 7, name: "Карталар және төлемдер", avatar: "КТ",
        department: "Қаржы бөлімі", status: "7 қызметкер · Төлемдер",
        unread: 0, pinned: false, messages: [
          { sender: "Нұржан", avatar: "Н", text: "Төлем операциялары тексерілді. Қате байқалмады.", time: "Кеше" }
        ]
      },
      {
        id: 8, name: "Құжат айналымы", avatar: "ҚА",
        department: "Әкімшілік", status: "4 қызметкер · Құжаттар",
        unread: 1, pinned: false, messages: [
          { sender: "Руслан", avatar: "Р", text: "Келісімшарт ортақ папкаға жүктелді.", time: "Кеше" }
        ]
      },
      {
        id: 9, name: "HR және персонал", avatar: "HR",
        department: "HR", status: "5 қызметкер · Персонал",
        unread: 0, pinned: false, messages: [
          { sender: "Назерке", avatar: "Н", text: "Оқыту кестесі жаңартылды.", time: "Кеше" }
        ]
      },
      {
        id: 10, name: "Банк жаңалықтары", avatar: "BN",
        department: "Хабарландырулар", status: "Ресми хабарландырулар",
        unread: 2, pinned: true, messages: [
          { sender: "Әкімшілік", avatar: "Ә", text: "Жаңа жұмыс регламентімен танысуларыңызды сұраймыз.", time: "Кеше" }
        ]
      }
    ];

    this.chats.forEach(chat => {
      chat.messages.forEach(message => {
        message.id = this.nextMessageId++;
        message.reactions ||= [];
      });
    });

    this.load();
    ChatService.instance = this;
  }

  static getInstance() {
    return ChatService.instance || new ChatService();
  }

  load() {
    try {
      const saved = localStorage.getItem("aiBankMessenger");
      if (!saved) return;

      const data = JSON.parse(saved);
      if (!Array.isArray(data.chats)) return;

      this.chats = data.chats;
      this.currentChatId = data.currentChatId || 1;
      this.nextId = data.nextId || 100;
      this.nextMessageId = data.nextMessageId || 1000;

      this.chats.forEach(chat => {
        chat.messages ||= [];
        chat.messages.forEach(message => {
          message.reactions ||= [];
        });
      });

      if (!this.currentChat()) {
        this.currentChatId = this.chats[0]?.id || null;
      }
    } catch (error) {
      console.warn("Сақталған деректерді оқу мүмкін болмады.", error);
    }
  }

  save() {
    try {
      localStorage.setItem("aiBankMessenger", JSON.stringify({
        chats: this.chats,
        currentChatId: this.currentChatId,
        nextId: this.nextId,
        nextMessageId: this.nextMessageId
      }));
    } catch (error) {
      console.warn("Деректерді сақтау мүмкін болмады.", error);
    }
  }

  getChats() {
    return this.chats;
  }

  currentChat() {
    return this.chats.find(chat => chat.id === this.currentChatId);
  }

  emit(type = "refresh") {
    this.save();
    observer.notify({ type });
  }

  selectChat(id) {
    this.currentChatId = id;
    const chat = this.currentChat();
    if (!chat) return;

    chat.unread = 0;
    this.emit("refresh");
  }

  send(text, fileName = "") {
    const chat = this.currentChat();
    if (!chat) return;

    chat.messages.push({
      id: this.nextMessageId++,
      sender: "Әлихан",
      avatar: "Ә",
      text,
      fileName,
      time: new Date().toLocaleTimeString("kk-KZ", {
        hour: "2-digit",
        minute: "2-digit"
      }),
      mine: true,
      reactions: []
    });

    this.emit("sent");
  }

  deleteMessage(id) {
    const chat = this.currentChat();
    if (!chat) return;

    chat.messages = chat.messages.filter(message => message.id !== id);
    this.emit("deleted");
  }

  clearChat() {
    const chat = this.currentChat();
    if (!chat) return;

    chat.messages = [];
    this.emit("cleared");
  }

  togglePin() {
    const chat = this.currentChat();
    if (!chat) return;

    chat.pinned = !chat.pinned;
    this.emit("refresh");
  }

  addReaction(id) {
    const chat = this.currentChat();
    const message = chat?.messages.find(item => item.id === id);
    if (!message) return;

    const index = message.reactions.findIndex(item => item.emoji === "👍");

    if (index >= 0) {
      message.reactions.splice(index, 1);
    } else {
      message.reactions.push({ emoji: "👍", count: 1 });
    }

    this.emit("refresh");
  }

  addChat(name, department) {
    const chat = {
      id: this.nextId++,
      name,
      avatar: name.slice(0, 2).toUpperCase(),
      department,
      status: "Жаңа жұмыс тобы",
      unread: 0,
      pinned: false,
      messages: []
    };

    this.chats.unshift(chat);
    this.currentChatId = chat.id;
    this.emit("refresh");
  }
}


class ChatMediator {
  constructor(service) {
    this.service = service;
  }

  send(text, file = "") {
    this.service.send(text, file);
  }

  delete(id) {
    this.service.deleteMessage(id);
  }

  open(id) {
    this.service.selectChat(id);
  }

  pin() {
    this.service.togglePin();
  }

  react(id) {
    this.service.addReaction(id);
  }

  clear() {
    this.service.clearChat();
  }
}


class SendCommand {
  constructor(mediator, text, file = "") {
    this.mediator = mediator;
    this.text = text;
    this.file = file;
  }

  execute() {
    this.mediator.send(this.text, this.file);
  }
}

class DeleteCommand {
  constructor(mediator, id) {
    this.mediator = mediator;
    this.id = id;
  }

  execute() {
    this.mediator.delete(this.id);
  }
}

class PinCommand {
  constructor(mediator) {
    this.mediator = mediator;
  }

  execute() {
    this.mediator.pin();
  }
}

class ReactionCommand {
  constructor(mediator, id) {
    this.mediator = mediator;
    this.id = id;
  }

  execute() {
    this.mediator.react(this.id);
  }
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
  toastTimer = setTimeout(() => {
    element.classList.remove("show");
  }, 2300);
}

function escapeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function lastMessage(chat) {
  const message = chat.messages.at(-1);
  if (!message) return "Хабарлама жоқ";

  return message.fileName
    ? "📎 " + message.fileName
    : message.text;
}

function filteredChats() {
  const query = searchInput.value.trim().toLowerCase();

  return service.getChats().filter(chat => {
    const matchesQuery =
      chat.name.toLowerCase().includes(query) ||
      chat.department.toLowerCase().includes(query) ||
      chat.messages.some(message =>
        (message.text || "").toLowerCase().includes(query) ||
        (message.fileName || "").toLowerCase().includes(query)
      );

    const matchesDepartment =
      activeDepartment === "Барлығы" ||
      chat.department === activeDepartment;

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "unread" && chat.unread > 0) ||
      (activeFilter === "pinned" && chat.pinned);

    const matchesView =
      activeView === "chats" ||
      (activeView === "pinned" && chat.pinned) ||
      (activeView === "files" &&
        chat.messages.some(message => message.fileName)) ||
      (activeView === "announcements" &&
        chat.department === "Хабарландырулар");

    return matchesQuery && matchesDepartment &&
      matchesFilter && matchesView;
  });
}


function renderChats() {
  const chats = filteredChats();
  chatList.replaceChildren();

  const chatNavCount = document.querySelector('[data-view="chats"] b');
  if (chatNavCount) {
    chatNavCount.textContent = service.getChats().length;
  }

  if (!chats.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Сәйкес чат табылмады";
    chatList.append(empty);
    return;
  }

  chats.forEach(chat => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "chat-item" +
      (chat.id === service.currentChatId ? " active" : "");

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
    time.textContent = chat.messages.at(-1)?.time || "";
    meta.append(time);

    if (chat.pinned) {
      const pin = document.createElement("span");
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
    item.addEventListener("click", () => {
      mediator.open(chat.id);
    });

    chatList.append(item);
  });
}


function renderMessages() {
  const chat = service.currentChat();
  if (!chat) {
    messages.replaceChildren();
    return;
  }

  $("contactName").textContent = chat.name;
  $("headerAvatar").textContent = chat.avatar;
  $("contactStatus").textContent = chat.status;
  $("pinChatBtn").textContent = chat.pinned ? "★" : "☆";
  $("pinChatBtn").title = chat.pinned
    ? "Бекітуді алып тастау"
    : "Чатты бекіту";

  $("chatBanner").querySelector("strong").textContent = chat.name;
  $("chatBanner").querySelector("p").textContent =
    chat.department + " · Жұмыс ақпаратын осы чатта талқылаңыз.";

  messages.replaceChildren();

  const visibleMessages = chat.messages.filter(message =>
    (message.text || "").toLowerCase().includes(messageSearch) ||
    (message.fileName || "").toLowerCase().includes(messageSearch)
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
  divider.textContent = "Жұмыс хат алмасуы";
  divider.style.cssText =
    "text-align:center;color:#98a4b5;font-size:10px;margin:4px 0 8px;";
  messages.append(divider);

  visibleMessages.forEach(message => {
    const row = document.createElement("div");
    row.className = "message-row" + (message.mine ? " mine" : "");

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = message.avatar;

    const content = document.createElement("div");
    content.className = "message-content";

    const top = document.createElement("div");
    top.className = "message-name";
    top.textContent = message.sender + " · " + message.time;

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.textContent = message.text || "";

    content.append(top, bubble);

    if (message.fileName) {
      const file = document.createElement("div");
      file.className = "file-card";
      file.style.cssText =
        "margin-top:8px;padding:10px;background:white;border-radius:10px;overflow-wrap:anywhere;";
      file.textContent = "📎 " + message.fileName;
      content.append(file);
    }

    const bottom = document.createElement("div");
    bottom.className = "message-time";

    if (message.reactions?.length) {
      const reactions = document.createElement("div");
      reactions.style.marginBottom = "5px";
      reactions.textContent = message.reactions.map(reaction =>
        typeof reaction === "string"
          ? reaction
          : reaction.emoji + " " + reaction.count
      ).join("  ");
      bottom.append(reactions);
    }

    const tools = document.createElement("div");
    tools.style.cssText = "display:flex;gap:8px;justify-content:flex-end;";

    const reactBtn = document.createElement("button");
    reactBtn.type = "button";
    reactBtn.textContent = "👍";
    reactBtn.title = "Реакция қосу";
    reactBtn.style.cssText =
      "border:0;background:transparent;cursor:pointer;";
    reactBtn.addEventListener("click", () => {
      new ReactionCommand(mediator, message.id).execute();
    });
    tools.append(reactBtn);

    if (message.mine) {
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.textContent = "Өшіру";
      deleteBtn.style.cssText =
        "border:0;background:transparent;color:#d9534f;cursor:pointer;";

      deleteBtn.addEventListener("click", () => {
        if (confirm("Осы хабарламаны өшіресіз бе?")) {
          new DeleteCommand(mediator, message.id).execute();
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

  const info = $("infoContent");
  info.replaceChildren();

  const title = document.createElement("h3");
  title.textContent = chat.name;

  const department = document.createElement("p");
  department.textContent = "Бөлім: " + chat.department;

  const status = document.createElement("p");
  status.textContent = chat.status;

  const count = document.createElement("p");
  count.textContent = "Хабарлама саны: " + chat.messages.length;

  const pinned = document.createElement("p");
  pinned.textContent = chat.pinned
    ? "★ Бекітілген чат"
    : "☆ Бекітілмеген чат";

  const clearButton = document.createElement("button");
  clearButton.type = "button";
  clearButton.className = "filter";
  clearButton.textContent = "Чатты тазалау";

  clearButton.addEventListener("click", () => {
    if (confirm("Осы чаттағы барлық хабарламаны өшіресіз бе?")) {
      mediator.clear();
      toast("Чат тазаланды");
    }
  });

  info.append(title, department, status, count, pinned, clearButton);
}


observer.subscribe(event => {
  renderChats();
  renderMessages();

  if (infoPanel.classList.contains("open")) {
    renderInfo();
  }

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

input.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    $("messageForm").requestSubmit();
  }
});


searchInput.addEventListener("input", renderChats);

document.querySelectorAll(".filter[data-filter]").forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    document.querySelectorAll(".filter[data-filter]").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    renderChats();
  });
});

document.querySelectorAll(".department").forEach(button => {
  button.addEventListener("click", () => {
    activeDepartment = button.dataset.department;

    document.querySelectorAll(".department").forEach(item => {
      item.classList.toggle("selected", item === button);
    });

    renderChats();
  });
});


document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    activeView = button.dataset.view;
    activeDepartment = "Барлығы";

    document.querySelectorAll(".nav-item").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    const titles = {
      chats: "Жұмыс чаттары",
      pinned: "Бекітілген чаттар",
      files: "Құжаттар мен файлдар",
      announcements: "Банк жаңалықтары"
    };

    $("listTitle").textContent = titles[activeView] || "Жұмыс чаттары";
    renderChats();
  });
});


$("pinChatBtn").addEventListener("click", () => {
  new PinCommand(mediator).execute();
  toast(service.currentChat()?.pinned
    ? "Чат бекітілді"
    : "Бекіту алынды");
});

$("chatInfoBtn").addEventListener("click", () => {
  infoPanel.classList.toggle("open");

  if (infoPanel.classList.contains("open")) {
    renderInfo();
  }
});

$("closeInfoBtn").addEventListener("click", () => {
  infoPanel.classList.remove("open");
});


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
  input.value += " 😊";
  input.focus();
});


$("attachBtn").addEventListener("click", () => {
  $("fileInput").click();
});

$("fileInput").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;

  new SendCommand(mediator, "Файл тіркелді:", file.name).execute();
  event.target.value = "";
});


$("newChatBtn").addEventListener("click", () => {
  const name = prompt("Жаңа жұмыс чатының атауын енгізіңіз:");
  if (!name?.trim()) return;

  const chatName = name.trim();

  if (service.chats.some(chat =>
    chat.name.toLowerCase() === chatName.toLowerCase()
  )) {
    toast("Мұндай чат бұрыннан бар");
    return;
  }

  const department = activeDepartment === "Барлығы"
    ? "IT бөлімі"
    : activeDepartment;

  service.addChat(chatName, department);
  toast("Жаңа чат құрылды");
});


document.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
  }

  if (event.key === "Escape") {
    infoPanel.classList.remove("open");
  }
});


renderChats();
renderMessages();
