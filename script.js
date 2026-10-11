
"use strict";

const $ = (id) => document.getElementById(id);

const escapeHTML = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[char]);

const formatTime = () =>
  new Intl.DateTimeFormat("kk-KZ", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const today = () => new Date().toLocaleDateString("kk-KZ", {
  day: "numeric", month: "long", year: "numeric"
});

function makeMessage(id, sender, initials, text, time, mine = false, extra = {}) {
  return { id, sender, initials, text, time, mine, file: null, reactions: [], ...extra };
}

/* SINGLETON */
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
    const data = [
      ["IT бөлімі", "IT", "blue", "IT бөлімі", true, true, [
        ["Әлихан Сәрсен", "ӘС", "Сәлем, команда! Бүгінгі жүйе жаңартуын талқылайық.", "09:15"],
        ["Дана Ермек", "ДЕ", "Жаңа интерфейсті дайындап қойдым.", "09:18"],
        ["Әлихан Сәрсен", "ӘС", "API байланысын да тексеріп шығайық.", "09:20"],
        ["Акмарал Әкімші", "AA", "Жақсы, қабылдадым.", "09:22", true]
      ]],
      ["Қаржы бөлімі", "ҚБ", "green", "Қаржы бөлімі", true, false, [
        ["Мадина Қасым", "МҚ", "Айлық есептің соңғы нұсқасы дайын.", "10:04"],
        ["Аружан Нұр", "АН", "Сомаларды қайта тексеремін.", "10:07"]
      ]],
      ["Клиенттер қызметі", "КҚ", "orange", "Клиенттер қызметі", true, false, [
        ["Айша Мұрат", "АМ", "Бүгін жаңа өтініштер келді.", "10:12"],
        ["Ерлан Бек", "ЕБ", "Жауаптарды дайындаймын.", "10:14"]
      ]],
      ["Қауіпсіздік тобы", "ҚТ", "pink", "Қауіпсіздік", false, true, [
        ["Нұржан Әли", "НӘ", "Қауіпсіздік нұсқаулығын жіберу қажет.", "Кеше"],
        ["Самал Омар", "СО", "Хабарландыруды бүгін жариялаймын.", "Кеше"]
      ]],
      ["Хабарландырулар", "ХБ", "purple", "Хабарландырулар", true, false, [
        ["HR бөлімі", "HR", "Ертең сағат 11:00-де жиналыс өтеді.", "08:30"],
        ["HR бөлімі", "HR", "Уақытында қосылуларыңызды сұраймыз.", "08:31"]
      ]],
      ["Жоба: Mobile Banking", "MB", "cyan", "IT бөлімі", true, false, [
        ["Дана Ермек", "ДЕ", "Басты экран дайын.", "11:02"],
        ["Әлихан Сәрсен", "ӘС", "Батырмаларды да тексерейік.", "11:05"]
      ]],
      ["Жетекшімен байланыс", "ЖБ", "dark", "IT бөлімі", true, false, [
        ["Әлихан Сәрсен", "ӘС", "Тапсырманың мерзімін нақтылайық.", "11:15"],
        ["Акмарал Әкімші", "AA", "Түстен кейін талқылайық.", "11:17", true]
      ]],
      ["Жұмыс құжаттары", "ЖҚ", "yellow", "Қаржы бөлімі", false, false, [
        ["Мадина Қасым", "МҚ", "Құжаттарды осы жерге тіркей аламыз.", "Кеше"],
        ["Акмарал Әкімші", "AA", "Жақсы, қабылдадым.", "Кеше", true]
      ]],
      ["HR бөлімі", "HR", "pink", "Хабарландырулар", true, false, [
        ["Самал Омар", "СО", "Келесі аптадағы жұмыс кестесі жаңартылды.", "Кеше"]
      ]],
      ["Жалпы команда", "ЖК", "blue", "IT бөлімі", true, false, [
        ["Мадина Қасым", "МҚ", "Баршаңызға сәтті жұмыс күні!", "08:45"],
        ["Акмарал Әкімші", "AA", "Барлығыңызға сәттілік!", "08:48", true]
      ]]
    ];

    return data.map((item, index) => ({
      id: index + 1,
      name: item[0],
      initials: item[1],
      color: item[2],
      department: item[3],
      group: item[4],
      online: item[5],
      members: ["Әлихан Сәрсен", "Дана Ермек", "Акмарал Әкімші"],
      description: `${item[0]} бойынша жұмыс хабарламалары мен тапсырмалар.`,
      unread: index === 0 ? 2 : index === 1 || index === 4 ? 1 : 0,
      pinned: index === 0 || index === 3,
      messages: item[6].map((m, i) =>
        makeMessage(index * 10 + i + 1, m[0], m[1], m[2], m[3], !!m[4])
      )
    }));
  }

  subscribe(fn) {
    this.listeners.push(fn);
  }

  notify() {
    this.listeners.forEach(fn => fn());
  }

  get currentChat() {
    return this.chats.find(c => c.id === this.currentChatId) || this.chats[0];
  }

  selectChat(id) {
    const chat = this.chats.find(c => c.id === id);
    if (!chat) return;
    this.currentChatId = id;
    chat.unread = 0;
    this.notify();
  }

  sendMessage(text, file) {
    if (!text.trim() && !file) return;
    this.currentChat.messages.push(makeMessage(
      this.nextMessageId++,
      profile.name || "Акмарал Әкімші",
      "AA",
      text.trim(),
      formatTime(),
      true,
      { file, reactions: [] }
    ));
    this.currentChat.unread = 0;
    this.notify();
  }

  deleteMessage(id) {
    this.currentChat.messages =
      this.currentChat.messages.filter(m => m.id !== id);
    this.notify();
  }

  togglePin(id) {
    const chat = this.chats.find(c => c.id === id);
    if (chat) {
      chat.pinned = !chat.pinned;
      this.notify();
    }
  }

  addReaction(id, emoji) {
    const message = this.currentChat.messages.find(m => m.id === id);
    if (!message) return;
    const reaction = message.reactions.find(r => r.emoji === emoji);
    if (reaction) reaction.count++;
    else message.reactions.push({ emoji, count: 1 });
    this.notify();
  }

  createChat(name, department) {
    const chat = {
      id: this.nextChatId++,
      name,
      initials: name.split(/\s+/).slice(0, 2).map(s => s[0]).join("").toUpperCase(),
      color: "blue",
      department,
      group: true,
      online: true,
      members: [profile.name || "Акмарал Әкімші"],
      description: "Жаңа жұмыс чаты.",
      unread: 0,
      pinned: false,
      messages: []
    };
    this.chats.unshift(chat);
    this.currentChatId = chat.id;
    this.notify();
    return chat;
  }
}

/* COMMAND */
class SendCommand {
  constructor(service, text, file) {
    this.service = service;
    this.text = text;
    this.file = file;
  }
  execute() {
    this.service.sendMessage(this.text, this.file);
  }
}

class DeleteCommand {
  constructor(service, id) {
    this.service = service;
    this.id = id;
  }
  execute() {
    this.service.deleteMessage(this.id);
  }
}

class CommandInvoker {
  execute(command) {
    command.execute();
  }
}

/* MEDIATOR */
class ChatMediator {
  constructor(service, invoker) {
    this.service = service;
    this.invoker = invoker;
  }
  send(text, file) {
    this.invoker.execute(new SendCommand(this.service, text, file));
  }
  delete(id) {
    this.invoker.execute(new DeleteCommand(this.service, id));
  }
  pin(id) {
    this.service.togglePin(id);
  }
  react(id, emoji) {
    this.service.addReaction(id, emoji);
  }
  select(id) {
    this.service.selectChat(id);
  }
  create(name, department) {
    return this.service.createChat(name, department);
  }
}

/* PROFILE */
let profile = {
  name: "Акмарал",
  email: "admin@aibank.kz",
  role: "Әкімші"
};

try {
  const saved = localStorage.getItem("aiBankDemoAccount");
  if (saved) profile = { ...profile, ...JSON.parse(saved) };
} catch (_) {}

const service = new ChatService();
const invoker = new CommandInvoker();
const mediator = new ChatMediator(service, invoker);

let activeView = "chats";
let activeFilter = "all";
let activeDepartment = "Барлығы";
let chatSearch = "";
let messageSearch = "";
let infoOpen = true;
let pendingFile = null;
let toastTimer;

function showToast(message) {
  const toast = $("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function renderChats() {
  const list = $("chatList");
  let chats = [...service.chats];

  if (activeView === "unread" || activeFilter === "unread")
    chats = chats.filter(c => c.unread > 0);
  if (activeView === "pinned" || activeFilter === "pinned")
    chats = chats.filter(c => c.pinned);
  if (activeView === "files")
    chats = chats.filter(c => c.messages.some(m => m.file));
  if (activeDepartment !== "Барлығы")
    chats = chats.filter(c => c.department === activeDepartment);
  if (chatSearch.trim()) {
    const q = chatSearch.toLowerCase();
    chats = chats.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.messages.some(m => m.text.toLowerCase().includes(q))
    );
  }

  chats.sort((a, b) => Number(b.pinned) - Number(a.pinned));
  $("listCount").textContent = `${chats.length} чат`;
  $("navChatCount").textContent = service.chats.length;

  list.innerHTML = chats.length ? chats.map(chat => {
    const last = chat.messages.at(-1);
    const preview = last ? (last.file ? `📎 ${last.file.name}` : last.text) : "Әзірге хабарлама жоқ";
    return `<div class="chat-item ${chat.id === service.currentChatId ? "active" : ""}"
      data-chat-id="${chat.id}" tabindex="0" role="button">
      <div class="avatar avatar-${escapeHTML(chat.color)}">
        ${escapeHTML(chat.initials)}
        ${chat.online ? '<span class="online-dot"></span>' : ""}
      </div>
      <div class="chat-details">
        <div class="chat-meta"><b>${escapeHTML(chat.name)}</b><span class="chat-time">${escapeHTML(last?.time || "")}</span></div>
        <div class="chat-preview"><span>${escapeHTML(preview)}</span>
          ${chat.pinned ? '<i class="fa-solid fa-thumbtack pin-mark"></i>' : ""}
          ${chat.unread ? `<span class="unread-count">${chat.unread}</span>` : ""}
        </div>
      </div>
    </div>`;
  }).join("") : `<div class="empty">Чат табылмады.</div>`;
}

function renderMessages() {
  const chat = service.currentChat;
  const area = $("messages");
  if (!chat) return;

  $("headerName").textContent = chat.name;
  $("headerAvatar").textContent = chat.initials;
  $("headerAvatar").className = `avatar avatar-${chat.color}`;
  $("headerStatus").innerHTML = `<span class="online-dot"></span> ${chat.group ? "Командалық чат" : "Жеке чат"}`;
  $("pinChatBtn").style.color = chat.pinned ? "#4169db" : "";

  let messages = chat.messages;
  if (messageSearch.trim()) {
    const q = messageSearch.toLowerCase();
    messages = messages.filter(m =>
      m.text.toLowerCase().includes(q) ||
      m.sender.toLowerCase().includes(q) ||
      m.file?.name.toLowerCase().includes(q)
    );
  }

  if (!messages.length) {
    area.innerHTML = `<div class="empty">Хабарлама жоқ. Бірінші болып жазыңыз!</div>`;
    renderInfo();
    return;
  }

  area.innerHTML = `<div class="day-divider"><span>${today()}</span></div>` +
    messages.map(m => `
      <article class="message-row ${m.mine ? "mine" : ""}">
        <div class="message-avatar">${escapeHTML(m.initials)}</div>
        <div class="message-content">
          <div class="message-top"><b>${escapeHTML(m.sender)}</b><span>${escapeHTML(m.time)}</span></div>
          ${m.text ? `<div class="bubble">${escapeHTML(m.text)}</div>` : ""}
          ${m.file ? `<div class="file-card"><div class="file-icon"><i class="fa-regular fa-file-lines"></i></div><div><b>${escapeHTML(m.file.name)}</b><small>${escapeHTML(m.file.size)}</small></div></div>` : ""}
          <div>${m.reactions.map(r => `<button class="reaction-chip" data-action="react" data-id="${m.id}" data-emoji="${escapeHTML(r.emoji)}">${escapeHTML(r.emoji)} ${r.count}</button>`).join("")}</div>
          <div class="message-bottom"><span>${m.mine ? "Сіз" : "Хабарлама"}</span>${m.mine ? '<i class="fa-solid fa-check-double message-status"></i>' : ""}</div>
          <div class="message-tools">
            <button data-action="react" data-id="${m.id}" data-emoji="👍">👍</button>
            <button data-action="react" data-id="${m.id}" data-emoji="❤️">❤️</button>
            <button data-action="react" data-id="${m.id}" data-emoji="👏">👏</button>
            ${m.mine ? `<button data-action="delete" data-id="${m.id}"><i class="fa-regular fa-trash-can"></i></button>` : ""}
          </div>
        </div>
      </article>`).join("");

  area.scrollTop = area.scrollHeight;
  renderInfo();
}

function renderInfo() {
  const chat = service.currentChat;
  $("infoPanel").classList.toggle("hidden", !infoOpen);
  if (!infoOpen || !chat) return;

  $("infoContent").innerHTML = `
    <div class="info-main"><div class="avatar avatar-${chat.color}">${escapeHTML(chat.initials)}</div>
      <b>${escapeHTML(chat.name)}</b><p>${escapeHTML(chat.department)}</p></div>
    <section class="info-section"><h4>Чат туралы</h4><p class="info-description">${escapeHTML(chat.description)}</p></section>
    <section class="info-section"><h4>Қатысушылар · ${chat.members.length}</h4>
      ${chat.members.map(n => `<div class="member-row"><div class="member-avatar">${escapeHTML(n.slice(0, 2))}</div><div><b>${escapeHTML(n)}</b><small>Қатысушы</small></div></div>`).join("")}
    </section>
    <section class="info-section"><h4>Чат әрекеттері</h4>
      <button class="info-action" id="infoPinBtn"><i class="fa-solid fa-thumbtack"></i> ${chat.pinned ? "Бекітуді алып тастау" : "Чатты бекіту"}</button>
      <button class="info-action" id="infoSearchBtn"><i class="fa-solid fa-magnifying-glass"></i> Хабарламадан іздеу</button>
      <button class="info-action" id="infoClearSearchBtn">Іздеуді тазарту</button>
    </section>`;

  $("infoPinBtn").onclick = () => mediator.pin(chat.id);
  $("infoSearchBtn").onclick = openMessageSearch;
  $("infoClearSearchBtn").onclick = () => {
    messageSearch = "";
    $("messageSearchInput").value = "";
    renderMessages();
  };
}

function renderAll() {
  renderChats();
  renderMessages();
  $("statTotal").textContent = service.chats.length;
  $("statUnread").textContent = service.chats.reduce((sum, c) => sum + c.unread, 0);

  document.querySelectorAll(".nav-item[data-view]").forEach(b =>
    b.classList.toggle("active", b.dataset.view === activeView));
  document.querySelectorAll(".department").forEach(b =>
    b.classList.toggle("active", b.dataset.department === activeDepartment));
  document.querySelectorAll(".filter").forEach(b =>
    b.classList.toggle("active", b.dataset.filter === activeFilter));
}

service.subscribe(renderAll);

$("chatList").addEventListener("click", e => {
  const item = e.target.closest("[data-chat-id]");
  if (item) mediator.select(Number(item.dataset.chatId));
});

$("chatList").addEventListener("keydown", e => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const item = e.target.closest("[data-chat-id]");
  if (item) {
    e.preventDefault();
    mediator.select(Number(item.dataset.chatId));
  }
});

/* ХАБАРЛАМА ЖІБЕРУ */
$("messageForm").addEventListener("submit", e => {
  e.preventDefault();
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
  input.focus();
});

$("messageInput").addEventListener("input", () => {
  const input = $("messageInput");
  if (input.value.length > 2000) input.value = input.value.slice(0, 2000);
  $("charCount").textContent = `${input.value.length} / 2000`;
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 110)}px`;
});

$("messageInput").addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    $("messageForm").requestSubmit();
  }
});

$("searchInput").addEventListener("input", e => {
  chatSearch = e.target.value;
  renderChats();
});

document.querySelectorAll(".filter").forEach(b => b.onclick = () => {
  activeFilter = b.dataset.filter;
  activeView = "chats";
  renderAll();
});

document.querySelectorAll(".nav-item[data-view]").forEach(b => b.onclick = () => {
  activeView = b.dataset.view;
  activeFilter = "all";
  renderAll();
});

document.querySelectorAll(".department").forEach(b => b.onclick = () => {
  activeDepartment = b.dataset.department;
  activeView = "chats";
  activeFilter = "all";
  renderAll();
});

$("pinChatBtn").onclick = () => {
  mediator.pin(service.currentChat.id);
  showToast("Чат күйі өзгертілді");
};

$("messages").addEventListener("click", e => {
  const b = e.target.closest("[data-action]");
  if (!b) return;
  const id = Number(b.dataset.id);
  if (b.dataset.action === "delete" && confirm("Хабарламаны өшіресіз бе?")) {
    mediator.delete(id);
    showToast("Хабарлама өшірілді");
  }
  if (b.dataset.action === "react") mediator.react(id, b.dataset.emoji);
});

$("newChatBtn").onclick = () => {
  const name = prompt("Жаңа чаттың атауы:");
  if (!name?.trim()) return;
  const department = prompt("Бөлім атауы:", "IT бөлімі");
  if (!department) return;
  activeDepartment = "Барлығы";
  activeView = "chats";
  activeFilter = "all";
  mediator.create(name.trim(), department);
  showToast("Жаңа чат құрылды");
};

function openMessageSearch() {
  $("searchMessageBar").classList.remove("hidden");
  $("messageSearchInput").focus();
}
$("searchMessagesBtn").onclick = openMessageSearch;
$("messageSearchInput").oninput = e => {
  messageSearch = e.target.value;
  renderMessages();
};
$("closeMessageSearch").onclick = () => {
  messageSearch = "";
  $("messageSearchInput").value = "";
  $("searchMessageBar").classList.add("hidden");
  renderMessages();
};

$("chatInfoBtn").onclick = () => {
  infoOpen = !infoOpen;
  renderInfo();
};
$("closeInfoBtn").onclick = () => {
  infoOpen = false;
  renderInfo();
};
$("closeBannerBtn").onclick = () => $("chatBanner").classList.add("hidden");

document.querySelectorAll("[data-quick]").forEach(b => b.onclick = () => {
  $("messageInput").value = b.dataset.quick;
  $("messageInput").dispatchEvent(new Event("input"));
  $("messageInput").focus();
});

$("emojiBtn").onclick = () => {
  const emoji = prompt("Эмодзи енгізіңіз:", "😊");
  if (emoji) {
    $("messageInput").value += emoji;
    $("messageInput").dispatchEvent(new Event("input"));
    $("messageInput").focus();
  }
};

$("attachBtn").onclick = () => $("fileInput").click();
$("fileInput").onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  if (!/\.(pdf|doc|docx|xls|xlsx|png|jpg|jpeg|txt)$/i.test(file.name)) {
    showToast("Файл түріне рұқсат жоқ");
    e.target.value = "";
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showToast("Файл 10 MB-тан аспауы керек");
    e.target.value = "";
    return;
  }
  pendingFile = { name: file.name, size: formatBytes(file.size) };
  showToast(`Тіркеуге дайын: ${file.name}`);
};

$("refreshBtn").onclick = () => {
  renderAll();
  showToast("Чаттар жаңартылды");
};
$("notificationBtn").onclick = () => {
  const count = service.chats.reduce((sum, c) => sum + c.unread, 0);
  showToast(count ? `Оқылмаған хабарламалар: ${count}` : "Жаңа хабарландыру жоқ");
};
$("addDepartmentBtn").onclick = () => showToast("Бөлімдер демо режимінде");

/* PROFILE MENU */
function updateProfile() {
  const initials = profile.name.trim().split(/\s+/).slice(0, 2).map(s => s[0]).join("").toUpperCase();
  if ($("profileName")) $("profileName").textContent = profile.name;
  if ($("profileRole")) $("profileRole").textContent = profile.role;
  if ($("profileAvatar")) $("profileAvatar").textContent = initials;
  if ($("dropdownName")) $("dropdownName").textContent = profile.name;
  if ($("dropdownEmail")) $("dropdownEmail").textContent = profile.email;
  if ($("dropdownAvatar")) $("dropdownAvatar").textContent = initials;
}

function setupProfileMenu() {
  const button = $("profileButton");
  const dropdown = $("profileDropdown");
  const accountModal = $("accountModal");
  const logoutModal = $("logoutModal");

  if (!button || !dropdown) {
    if ($("profileBtn")) $("profileBtn").onclick = () =>
      showToast("Профиль: Акмарал Әкімші · Демо режимі");
    return;
  }

  button.onclick = e => {
    e.stopPropagation();
    dropdown.classList.toggle("hidden");
  };
  dropdown.onclick = e => e.stopPropagation();
  document.addEventListener("click", () => dropdown.classList.add("hidden"));

  if ($("myAccountButton")) $("myAccountButton").onclick = () => {
    dropdown.classList.add("hidden");
    if (!accountModal) return;
    $("accountModalTitle").textContent = "Менің аккаунтым";
    $("accountName").value = profile.name;
    $("accountEmail").value = profile.email;
    $("passwordLabel")?.classList.add("hidden");
    $("accountPassword")?.classList.add("hidden");
    $("accountPassword").required = false;
    accountModal.classList.remove("hidden");
  };

  if ($("addAccountButton")) $("addAccountButton").onclick = () => {
    dropdown.classList.add("hidden");
    if (!accountModal) return;
    $("accountModalTitle").textContent = "Аккаунт қосу";
    $("accountName").value = "";
    $("accountEmail").value = "";
    $("passwordLabel")?.classList.remove("hidden");
    $("accountPassword")?.classList.remove("hidden");
    $("accountPassword").required = true;
    accountModal.classList.remove("hidden");
  };

  if ($("settingsButton")) $("settingsButton").onclick = () => {
    dropdown.classList.add("hidden");
    showToast("Баптаулар демо режимінде");
  };

  if ($("accountForm")) $("accountForm").onsubmit = e => {
    e.preventDefault();
    const name = $("accountName").value.trim();
    const email = $("accountEmail").value.trim();
    if (!name || !email) return showToast("Барлық өрісті толтырыңыз");

    profile.name = name;
    profile.email = email;
    try {
      localStorage.setItem("aiBankDemoAccount", JSON.stringify(profile));
    } catch (_) {}
    updateProfile();
    accountModal.classList.add("hidden");
    showToast("Профиль сақталды");
  };

  if ($("logoutButton")) $("logoutButton").onclick = () => {
    dropdown.classList.add("hidden");
    if (logoutModal) logoutModal.classList.remove("hidden");
    else showToast("Бұл демо жоба: нақты жүйеден шығу қосылмаған");
  };

  if ($("cancelLogout")) $("cancelLogout").onclick = () =>
    logoutModal?.classList.add("hidden");

  if ($("confirmLogout")) $("confirmLogout").onclick = () => {
    logoutModal?.classList.add("hidden");
    showToast("Демо режимінде нақты сессия жоқ");
  };

  document.querySelectorAll("[data-close-modal]").forEach(b => b.onclick = () => {
    const modal = $(b.dataset.closeModal);
    if (modal) modal.classList.add("hidden");
  });

  updateProfile();
}

document.addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    $("searchInput").focus();
  }
  if (e.key === "Escape") {
    $("searchMessageBar").classList.add("hidden");
    $("accountModal")?.classList.add("hidden");
    $("logoutModal")?.classList.add("hidden");
    $("profileDropdown")?.classList.add("hidden");
  }
});

setupProfileMenu();
renderAll();
