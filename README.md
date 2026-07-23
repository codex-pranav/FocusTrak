# 🚀 FocusTrak

> A modern, fast, and distraction-free cross-platform productivity app built with **Tauri v2**, **React**, **TypeScript**, **Rust**, and **SQLite**.

FocusTrak is designed for students, developers, and professionals who want a lightweight, privacy-focused productivity application that works completely offline. Manage tasks, organize notes, build habits, stay focused, and track your productivity — all while keeping your data stored locally on your device.

---

## ✨ Features

- ✅ Create, edit, and delete tasks
- 📅 Interactive Calendar
- ⭐ Priority management
- 🎯 Focus Mode (Pomodoro Timer)
- 🔥 Habit Tracker
- 📝 Notes & Documents
- 📊 Productivity Statistics
- ⚙️ Personalized Settings
- 💾 Local SQLite database
- 📱 Linux & Android Support
- ⚡ Fast native performance powered by Tauri
- 🔒 Offline-first (your data stays on your device)

---

# 🖥️ Screenshots

## 🏠 Dashboard

| Desktop | Android |
|----------|----------|
| ![](screenshots/Desktop/desktop-dashboard.png) | ![](screenshots/Mobile/android-dashboard.jpeg) |

---

## 📝 Task Management

| Desktop | Android |
|----------|----------|
| ![](screenshots/Desktop/desktop-task-management.png) | ![](screenshots/Mobile/android-task-management.jpeg) |

---

## ➕ Create Task

| Desktop | Android |
|----------|----------|
| ![](screenshots/Desktop/desktop-create-task.png) | ![](screenshots/Mobile/android-create-task.jpeg) |

---

## 📅 Calendar

| Desktop | Android |
|----------|----------|
| ![](screenshots/Desktop/desktop-calendar.png) | ![](screenshots/Mobile/android-calendar.jpeg) |

---

## 🎯 Focus Mode

| Desktop | Android |
|----------|----------|
| ![](screenshots/Desktop/desktop-focus.png) | ![](screenshots/Mobile/android-focus.jpeg) |

---

## 🔥 Habit Tracker

| Desktop | Android |
|----------|----------|
| ![](screenshots/Desktop/desktop-habits.png) | ![](screenshots/Mobile/android-habits.jpeg) |

---

## 📝 Notes & Documents

| Desktop | Android |
|----------|----------|
| ![](screenshots/Desktop/desktop-notes&Docs.png) | ![](screenshots/Mobile/android-notes&Docs.jpeg) |

---

## 📊 Productivity Statistics

| Desktop | Android |
|----------|----------|
| ![](screenshots/Desktop/desktop-stats.png) | ![](screenshots/Mobile/android-stats.jpeg) |

---

## ⚙️ Settings

| Desktop | Android |
|----------|----------|
| ![](screenshots/Desktop/desktop-settings.png) | ![](screenshots/Mobile/android-settings.jpeg) |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Tauri v2 | Cross-platform Framework |
| React | Frontend |
| TypeScript | Type Safety |
| Vite | Build Tool |
| SQLite | Local Database |
| Tailwind CSS | UI Styling |
| Rust | Backend |

---

## 📂 Project Structure

```text
FocusTrak/
│
├── src/                 # React frontend
├── src-tauri/           # Tauri backend (Rust)
├── screenshots/
│   ├── Desktop/
│   └── Mobile/
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
npm run tauri dev
```

---

### Build production app

#### Linux

```bash
npm run tauri build
```

#### Android

```bash
npm run tauri android build
```

---

## 📦 Installation

### Linux

```bash
sudo apt install ./src-tauri/target/release/bundle/deb/*.deb
```

### Android

Download the latest **FocusTrak.apk** from the **Releases** section and install it on your Android device.

---

## 📌 Roadmap

- [x] Task management
- [x] Interactive Calendar
- [x] Focus Mode
- [x] Habit Tracker
- [x] Notes & Documents
- [x] Productivity Statistics
- [x] Local SQLite database
- [x] Native desktop application
- [x] Android support
- [ ] Notifications
- [ ] Recurring tasks
- [ ] Cloud Sync
- [ ] Backup & Restore
- [ ] Themes
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

### Made with ❤️ using Tauri + React + Rust
