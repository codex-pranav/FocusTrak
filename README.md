# 🚀 FocusTrak

> A modern, fast, and distraction-free desktop productivity app built with **Tauri**, **React**, **TypeScript**, and **SQLite**.

FocusTrak is designed for users who want a lightweight, privacy-focused productivity application that runs natively on Linux without relying on cloud services.

---

## ✨ Features

- ✅ Create, edit, and delete tasks
- 📅 Schedule tasks
- ⭐ Priority management
- 🎯 Status tracking
- 💾 Local SQLite database
- 🌙 Modern responsive UI
- ⚡ Fast native performance powered by Tauri
- 🔒 Offline-first (your data stays on your device)
- 👤 First-run onboarding with personalized profile

---

## 🖥️ Screenshots

> *(Screenshots coming soon)*

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Tauri v2 | Desktop Framework |
| React | Frontend |
| TypeScript | Type Safety |
| Vite | Build Tool |
| SQLite | Local Database |
| Tailwind CSS | UI Styling |
| Rust | Backend |

---

## 📂 Project Structure

```
FocusTrak/
│
├── src/                 # React frontend
├── src-tauri/           # Tauri backend (Rust)
├── public/
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/codex-pranav/FocusTrak.git
cd FocusTrak
```

---

### Install dependencies

```bash
npm install
```

---

### Run in development

```bash
npm run dev
npm run tauri dev
```

---

### Build production app

```bash
npm run tauri build
```

---

## 📦 Installation (Linux)

After building, install the generated package:

```bash
sudo apt install ./src-tauri/target/release/bundle/deb/*.deb
```

---

## 📌 Roadmap

- [x] Task management
- [x] Local SQLite database
- [x] First-run onboarding
- [x] Native desktop application
- [ ] Notifications
- [ ] Recurring tasks
- [ ] Calendar integration
- [ ] Data backup & restore
- [ ] Themes
- [ ] Productivity analytics
- [ ] Auto update

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

Feel free to fork the repository and submit a Pull Request.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## ⭐ Support

If you found this project useful, consider giving it a **⭐ Star** on GitHub.

It helps the project grow and motivates future development.

---

## 👨‍💻 Author

**Pranav Raj**

GitHub: https://github.com/codex-pranav

---

### Made with ❤️ using Tauri + React
