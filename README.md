# Ubuntu Desktop Todo & Productivity Suite

Welcome to the **Ubuntu Desktop Todo & Productivity Suite**—a premium, feature-rich offline productivity ecosystem designed for developers, students, and professionals running Ubuntu Linux. 

This repository houses **two completely synchronized implementations** of the exact same specification:
1. 🌐 **High-Fidelity Web Applet (React + Tailwind + Motion)**: Implements the identical suite layout, styling, and database flows directly inside your browser container. Enjoy interactive Kanban boards, the custom Command Palette (Ctrl+P), rich text Markdown Notes with automatic save cycles, and beautiful visual statistics with zero installation overhead!
2. 🐍 **Native Desktop Client (Python 3.13 + PySide6 + SQLite + SQLAlchemy + Matplotlib)**: A fully production-ready Ubuntu application. Packages cleanly into a standalone, hardware-accelerated Linux binary using PyInstaller.

---

## 🎨 Design Philosophy & UX Highlights

Inspired by the visual clarity of **Linear**, **Notion**, and **Material Design 3**, our interface sets a new bar for desktop Qt engineering:
* **Rounded Contours**: Modern custom widget frame alignments (no legacy default Windows 95 gradients).
* **Interactive Command Palette (`Ctrl+P`)**: Search commands, toggle light/dark modes, draft tasks, or navigate views instantly.
* **Aura Dark & Clarity Light Themes**: Eye-safe palettes paired with crisp **Inter** typography and **JetBrains Mono** metrics.
* **Native Libnotify Subprocesses**: Binds to Ubuntu's DBus notification daemon (`notify-send`) to alert you when tasks or Pomodoro sessions require focus.

---

## 📂 Project Architecture

Follows a rigorous **Clean Architecture / MVC pattern** separating presentation, database layers, and platform-specific daemons:

```text
todo_app/
│
├── database/
│   ├── connection.py        # SQLite Local Engine & DB Session Creators
│   └── models.py            # Complete SQLAlchemy Schema Models
│
├── utils/
│   └── notifier.py          # Ubuntu native notify-send Subprocess wrappers
│
├── app.py                   # Central PySide6 Main Controller Window & Widgets
├── main.py                  # PySide6 application entry point
│
requirements.txt             # Desktop Python requirements manifest
README.md                    # System instructions, setup, and packaging walks
```

---

## 🛠️ Python Desktop Installation & Run Guide

To run the native **PySide6** desktop client locally on your Ubuntu machine, execute the following commands:

### 1. Install System Dependencies
Make sure Python 3.13, development headers, and the native notifications daemon are installed on your system:
```bash
sudo apt update
sudo apt install python3-pip python3-venv libnotify-bin
```

### 2. Establish Virtual Environment & Install Requirements
```bash
# Clone or export this repository, then change directory to workspace root
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Run the Application
```bash
python3 -m todo_app.main
```
All SQLite files, settings, and documents will persist automatically in your home directory under `~/.local/share/ubuntu_todo_app/production.db`.

---

## 📦 Bundling Standalone Linux Binaries (PyInstaller)

To compile the entire suite into a single, high-performance, standalone Linux binary executable that runs natively on Ubuntu without requiring Python or pip:

```bash
# Install PyInstaller
pip install pyinstaller

# Bundle application
pyinstaller --noconfirm --onedir --windowed \
            --name "UbuntuProductivity" \
            --add-data "todo_app/database:todo_app/database" \
            --clean \
            todo_app/main.py
```
The compiled, runnable binary will compile under `/dist/UbuntuProductivity/UbuntuProductivity`. Double-click or trigger through terminal to launch!

---

## ⌨️ Global Keyboard Shortcut Map

Increase your speed using keyboard hotkey configurations:

| Hotkey Combo | Scope | Operational Target |
| :--- | :--- | :--- |
| `Ctrl + P` | Global | Launch/Dismiss Command Palette |
| `Ctrl + N` | Global | Navigate to Tasks workspace |
| `Ctrl + Shift + D` | Global | Toggle Dark / Light Theme instantly |
| `Ctrl + F` | Tasks Tab | Focus search input immediately |
| `Esc` | Overlays | Dismiss Command Palette or Modals |

---

## 📊 Database Schema Map (SQLite)

Tables mapped in `/todo_app/database/models.py` using **SQLAlchemy ORM**:
1. `users`: Stores user identity metadata.
2. `tasks`: Individual productivity records (durations, due timelines, category pointers).
3. `categories`: Groups like SIH, College, Coding with custom hex coloring.
4. `notes`: Document drafts, Markdown files, and task connections.
5. `attachments`: Files linked to individual task nodes.
6. `tags` & `task_tags`: Multi-tag mappings for flexible task indexing.
7. `settings`: App configuration (theme skin, brand colors, text sizes).
8. `statistics`: Tracks Streaks, Daily completions, and rolling logs.
9. `reminders`: System daemon task dates.
10. `sessions`: Focus sessions log.
