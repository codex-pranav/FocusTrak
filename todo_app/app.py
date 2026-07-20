import sys
import datetime
import json
import logging
from PySide6.QtCore import Qt, QTimer, QSize, Slot
from PySide6.QtGui import QFont, QIcon, QColor, QPalette, QAction
from PySide6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QLabel, 
    QPushButton, QListWidget, QListWidgetItem, QStackedWidget,
    QLineEdit, QComboBox, QTextEdit, QFormLayout, QDialog,
    QCheckBox, QMessageBox, QFileDialog, QProgressBar, QSlider,
    QSplitter, QTableWidget, QTableWidgetItem
)

# Matplotlib integration for PySide6 as requested
import matplotlib
matplotlib.use('Qt5Agg')
from matplotlib.backends.backend_qtagg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure

# Database schema
from .database.connection import SessionLocal, init_db
from .database.models import User, Task, Category, Note, Settings, Statistics, Session
from .utils.notifier import send_linux_notification

logger = logging.getLogger(__name__)

class ProductivityChart(FigureCanvas):
    """Matplotlib canvas embedded directly inside PySide6 layouts."""
    def __init__(self, parent=None, width=5, height=4, dpi=100):
        fig = Figure(figsize=(width, height), dpi=dpi, facecolor='#1e1e2e')
        self.axes = fig.add_subplot(111)
        self.axes.set_facecolor('#1e1e2e')
        self.axes.tick_params(colors='white')
        self.axes.spines['bottom'].set_color('#313244')
        self.axes.spines['top'].set_color('#313244')
        self.axes.spines['left'].set_color('#313244')
        self.axes.spines['right'].set_color('#313244')
        super().__init__(fig)

    def plot_distributions(self, categories, priorities):
        """Plots high fidelity charts for workspace allocations."""
        self.axes.clear()
        
        # Category bar chart
        names = [c[0] for c in categories] if categories else ["Demo"]
        counts = [c[1] for c in categories] if categories else [1]
        
        # Style layout
        self.axes.bar(names, counts, color='#8b5cf6', width=0.4, edgecolor='#cba6f7')
        self.axes.set_title("Allocations by Category", color='white', fontsize=10, fontweight='bold')
        self.axes.tick_params(axis='x', rotation=15, labelsize=8)
        self.draw()

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Ubuntu Todo & Productivity Suite")
        self.setMinimumSize(1100, 750)
        
        # Database connection
        init_db()
        self.db = SessionLocal()
        self._ensure_default_user_and_categories()

        # Pomodoro variables
        self.pomo_active = False
        self.pomo_time_left = 25 * 60
        self.pomo_timer = QTimer(self)
        self.pomo_timer.timeout.connect(self._pomo_tick)

        # Style Application
        self._apply_theme()
        self._init_ui()
        self._load_data()

    def _ensure_default_user_and_categories(self):
        """Pre-populate the SQLite database with consistent user and requested categories."""
        # Check User
        user = self.db.query(User).filter_by(username="ubuntu_user").first()
        if not user:
            user = User(username="ubuntu_user", email="rajpranav425@gmail.com")
            self.db.add(user)
            self.db.commit()

            # Set Default Settings
            settings = Settings(user_id=user.id, theme="dark", accent_color="#8b5cf6")
            self.db.add(settings)
            self.db.commit()

        # Check default Categories as requested
        default_cats = ["College", "Coding", "Projects", "Health", "Finance", "Shopping", "Personal", "Learning", "SIH"]
        for cat_name in default_cats:
            exists = self.db.query(Category).filter_by(name=cat_name).first()
            if not exists:
                new_cat = Category(name=cat_name, color="#8b5cf6", icon="Folder")
                self.db.add(new_cat)
        self.db.commit()

    def _apply_theme(self):
        """Loads customized dark mode and premium stylesheets with rounded corners."""
        stylesheet = """
        QMainWindow {
            background-color: #0f0f15;
        }
        QWidget {
            color: #cdd6f4;
            font-family: "Inter", sans-serif;
            font-size: 12px;
        }
        QListWidget {
            background-color: #11111a;
            border: 1px solid #313244;
            border-radius: 12px;
            padding: 5px;
        }
        QListWidget::item {
            padding: 10px;
            border-radius: 8px;
            color: #bac2de;
        }
        QListWidget::item:selected {
            background-color: #8b5cf6;
            color: white;
            font-weight: bold;
        }
        QListWidget::item:hover {
            background-color: #1e1e2e;
        }
        QPushButton {
            background-color: #8b5cf6;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 8px 16px;
            font-weight: bold;
        }
        QPushButton:hover {
            background-color: #a78bfa;
        }
        QPushButton:pressed {
            background-color: #7c3aed;
        }
        QLineEdit, QTextEdit, QComboBox {
            background-color: #1e1e2e;
            border: 1px solid #313244;
            border-radius: 8px;
            padding: 8px;
            color: #cdd6f4;
        }
        QLineEdit:focus, QTextEdit:focus {
            border: 1.5px solid #8b5cf6;
        }
        QProgressBar {
            border: 1px solid #313244;
            border-radius: 6px;
            text-align: center;
            background-color: #1e1e2e;
            color: white;
        }
        QProgressBar::chunk {
            background-color: #10b981;
            border-radius: 5px;
        }
        QTableWidget {
            background-color: #11111a;
            border: 1px solid #313244;
            gridline-color: #313244;
            border-radius: 12px;
        }
        QHeaderView::section {
            background-color: #181825;
            color: #cdd6f4;
            padding: 5px;
            border: 1px solid #313244;
        }
        """
        self.setStyleSheet(stylesheet)

    def _init_ui(self):
        """Initializes the layout partitions (Sidebar + Main Content Stack)."""
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        
        layout = QHBoxLayout(main_widget)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # 1. SIDEBAR Navigation
        sidebar_widget = QWidget()
        sidebar_widget.setFixedWidth(240)
        sidebar_widget.setStyleSheet("background-color: #11111a; border-right: 1px solid #1e1e2e;")
        sidebar_layout = QVBoxLayout(sidebar_widget)
        sidebar_layout.setContentsMargins(15, 20, 15, 20)

        # Profile Card
        profile_lbl = QLabel("Raj Pranav")
        profile_lbl.setStyleSheet("font-size: 15px; font-weight: bold; color: white; padding-bottom: 5px;")
        mode_lbl = QLabel("Ubuntu Suite • SINGLE USER")
        mode_lbl.setStyleSheet("font-size: 9px; color: #8b5cf6; font-weight: bold;")
        
        sidebar_layout.addWidget(profile_lbl)
        sidebar_layout.addWidget(mode_lbl)
        sidebar_layout.addSpacing(20)

        # Navigation Catalog List
        self.nav_list = QListWidget()
        self.nav_list.addItem(QListWidgetItem("Dashboard"))
        self.nav_list.addItem(QListWidgetItem("Tasks Manager"))
        self.nav_list.addItem(QListWidgetItem("Pomodoro Focus"))
        self.nav_list.addItem(QListWidgetItem("Notes & Docs"))
        self.nav_list.addItem(QListWidgetItem("Performance Stats"))
        self.nav_list.setCurrentRow(0)
        self.nav_list.currentRowChanged.connect(self._change_view)
        sidebar_layout.addWidget(self.nav_list)
        
        sidebar_layout.addStretch()

        # Shortcuts quick tips
        tips_lbl = QLabel("Ctrl+P : Command Palette\nCtrl+Shift+D : Toggle Theme")
        tips_lbl.setStyleSheet("font-size: 10px; color: #585b70; line-height: 14px;")
        sidebar_layout.addWidget(tips_lbl)

        layout.addWidget(sidebar_widget)

        # 2. MAIN STACKED VIEW Workspace
        self.view_stack = QStackedWidget()
        self.view_stack.setStyleSheet("background-color: #0f0f15;")

        # Views Registration
        self.view_stack.addWidget(self._create_dashboard_widget())
        self.view_stack.addWidget(self._create_tasks_widget())
        self.view_stack.addWidget(self._create_pomodoro_widget())
        self.view_stack.addWidget(self._create_notes_widget())
        self.view_stack.addWidget(self._create_stats_widget())

        layout.addWidget(self.view_stack)

    def _change_view(self, index):
        self.view_stack.setCurrentIndex(index)
        self._load_data()

    # ==========================================
    # VIEW BUILDERS
    # ==========================================

    def _create_dashboard_widget(self):
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(25, 25, 25, 25)

        title_lbl = QLabel("Productivity Dashboard")
        title_lbl.setStyleSheet("font-size: 20px; font-weight: bold; color: white;")
        layout.addWidget(title_lbl)

        # Subtitle
        sub_lbl = QLabel("Track your agenda, active habit cycles, and overdue items.")
        sub_lbl.setStyleSheet("color: #a6adc8; font-size: 11px;")
        layout.addWidget(sub_lbl)
        layout.addSpacing(15)

        # Dashboard grid elements
        h_grid = QHBoxLayout()
        self.streak_card = QLabel("STREAK: 5 Days Consistency")
        self.streak_card.setStyleSheet("background-color: #1e1e2e; padding: 15px; border-radius: 10px; font-weight: bold; text-align: center; border-left: 4px solid #f59e0b;")
        
        self.pending_card = QLabel("PENDING: 3 Tasks Today")
        self.pending_card.setStyleSheet("background-color: #1e1e2e; padding: 15px; border-radius: 10px; font-weight: bold; text-align: center; border-left: 4px solid #8b5cf6;")

        h_grid.addWidget(self.streak_card)
        h_grid.addWidget(self.pending_card)
        layout.addLayout(h_grid)
        layout.addSpacing(20)

        # Agenda Quick Add Bar
        add_lay = QHBoxLayout()
        self.quick_input = QLineEdit()
        self.quick_input.setPlaceholderText("Quick Add Task... e.g. Design UI for college seminar")
        self.quick_btn = QPushButton("Quick Add")
        self.quick_btn.clicked.connect(self._handle_quick_add)
        add_lay.addWidget(self.quick_input)
        add_lay.addWidget(self.quick_btn)
        layout.addLayout(add_lay)

        # Today's agenda list
        agenda_title = QLabel("Today's Agenda Horizon")
        agenda_title.setStyleSheet("font-weight: bold; font-size: 13px; color: white; margin-top: 15px;")
        layout.addWidget(agenda_title)

        self.agenda_list = QListWidget()
        layout.addWidget(self.agenda_list)

        return widget

    def _create_tasks_widget(self):
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(25, 25, 25, 25)

        title_lbl = QLabel("Productivity Tasks Manager")
        title_lbl.setStyleSheet("font-size: 20px; font-weight: bold; color: white;")
        layout.addWidget(title_lbl)

        # Form fields to schedule task
        form_layout = QFormLayout()
        self.task_title_in = QLineEdit()
        self.task_desc_in = QTextEdit()
        self.task_desc_in.setMaximumHeight(80)

        self.task_cat_cb = QComboBox()
        self.task_prio_cb = QComboBox()
        self.task_prio_cb.addItems(["Critical", "High", "Medium", "Low"])

        form_layout.addRow("Task Title:", self.task_title_in)
        form_layout.addRow("Task Description:", self.task_desc_in)
        form_layout.addRow("Category Group:", self.task_cat_cb)
        form_layout.addRow("Priority Level:", self.task_prio_cb)

        layout.addLayout(form_layout)

        btn_lay = QHBoxLayout()
        self.save_task_btn = QPushButton("Schedule Priority Task")
        self.save_task_btn.clicked.connect(self._handle_schedule_task)
        btn_lay.addWidget(self.save_task_btn)
        layout.addLayout(btn_lay)
        layout.addSpacing(15)

        # Tasks Table List
        self.tasks_table = QTableWidget()
        self.tasks_table.setColumnCount(4)
        self.tasks_table.setHorizontalHeaderLabels(["Title", "Category", "Priority", "Status"])
        self.tasks_table.horizontalHeader().setStretchLastSection(True)
        layout.addWidget(self.tasks_table)

        return widget

    def _create_pomodoro_widget(self):
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(25, 25, 25, 25)

        title_lbl = QLabel("Pomodoro Focus Engine")
        title_lbl.setStyleSheet("font-size: 20px; font-weight: bold; color: white;")
        layout.addWidget(title_lbl)

        # Focus state layout
        self.pomo_time_lbl = QLabel("25:00")
        self.pomo_time_lbl.setStyleSheet("font-size: 80px; font-weight: bold; color: #8b5cf6; font-family: monospace; text-align: center;")
        self.pomo_time_lbl.setAlignment(Qt.AlignCenter)
        layout.addWidget(self.pomo_time_lbl)

        # Action Buttons
        btn_lay = QHBoxLayout()
        self.pomo_start_btn = QPushButton("Begin Focus Interval")
        self.pomo_start_btn.clicked.connect(self._handle_pomo_toggle)
        
        self.pomo_reset_btn = QPushButton("Reset Clock")
        self.pomo_reset_btn.setStyleSheet("background-color: #313244;")
        self.pomo_reset_btn.clicked.connect(self._handle_pomo_reset)

        btn_lay.addWidget(self.pomo_start_btn)
        btn_lay.addWidget(self.pomo_reset_btn)
        layout.addLayout(btn_lay)
        layout.addStretch()

        return widget

    def _create_notes_widget(self):
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(25, 25, 25, 25)

        title_lbl = QLabel("Markdown Documentation & Outline Notes")
        title_lbl.setStyleSheet("font-size: 20px; font-weight: bold; color: white;")
        layout.addWidget(title_lbl)

        splitter = QSplitter(Qt.Horizontal)

        # Column A: Notes list catalog
        self.notes_list = QListWidget()
        self.notes_list.itemClicked.connect(self._handle_note_selected)
        splitter.addWidget(self.notes_list)

        # Column B: Note draft editor
        note_edit_widget = QWidget()
        note_edit_layout = QVBoxLayout(note_edit_widget)
        
        self.note_title_in = QLineEdit()
        self.note_title_in.setPlaceholderText("Enter Document title...")
        self.note_content_in = QTextEdit()
        self.note_content_in.setPlaceholderText("Type markdown compatible logs here...")
        
        self.save_note_btn = QPushButton("Autosave Documentation Draft")
        self.save_note_btn.clicked.connect(self._handle_save_note)

        note_edit_layout.addWidget(self.note_title_in)
        note_edit_layout.addWidget(self.note_content_in)
        note_edit_layout.addWidget(self.save_note_btn)

        splitter.addWidget(note_edit_widget)
        layout.addWidget(splitter)

        return widget

    def _create_stats_widget(self):
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(25, 25, 25, 25)

        title_lbl = QLabel("Productivity Statistics")
        title_lbl.setStyleSheet("font-size: 20px; font-weight: bold; color: white;")
        layout.addWidget(title_lbl)

        # Embedding Matplotlib Canvas directly
        self.chart_canvas = ProductivityChart(self, width=5, height=4, dpi=100)
        layout.addWidget(self.chart_canvas)

        return widget

    # ==========================================
    # DATA SYNCHRONIZATION & INTERACTION
    # ==========================================

    def _load_data(self):
        """Pulls and populates the SQLite tables into their corresponding UI elements."""
        try:
            # Load Categories for Task Manager ComboBox
            self.task_cat_cb.clear()
            cats = self.db.query(Category).all()
            for c in cats:
                self.task_cat_cb.addItem(c.name)

            # Load Dashboard Agenda
            self.agenda_list.clear()
            active_tasks = self.db.query(Task).filter_by(status="Pending", recently_deleted=False).all()
            for t in active_tasks:
                self.agenda_list.addItem(f"[{t.priority.upper()}] {t.title} - {t.due_time}")

            # Update Stat cards
            self.pending_card.setText(f"PENDING AGENDA: {len(active_tasks)} Tasks Today")
            self.streak_card.setText("CONSISTENCY STREAK: Active Binds")

            # Load Task list table
            self.tasks_table.setRowCount(0)
            all_tasks = self.db.query(Task).filter_by(recently_deleted=False).all()
            for idx, t in enumerate(all_tasks):
                self.tasks_table.insertRow(idx)
                self.tasks_table.setItem(idx, 0, QTableWidgetItem(t.title))
                self.tasks_table.setItem(idx, 1, QTableWidgetItem(t.category_rel.name if t.category_rel else "Personal"))
                self.tasks_table.setItem(idx, 2, QTableWidgetItem(t.priority))
                self.tasks_table.setItem(idx, 3, QTableWidgetItem(t.status))

            # Load Notes List
            self.notes_list.clear()
            notes = self.db.query(Note).all()
            for n in notes:
                item = QListWidgetItem(n.title)
                item.setData(Qt.UserRole, n.id)
                self.notes_list.addItem(item)

            # Plot dynamic charts on stats widget load
            cat_counts = []
            for c in cats:
                t_count = self.db.query(Task).filter_by(category_id=c.id, recently_deleted=False).count()
                if t_count > 0:
                    cat_counts.append((c.name, t_count))
            
            self.chart_canvas.plot_distributions(cat_counts, [])

        except Exception as e:
            logger.error(f"Error executing data loaders: {e}")

    def _handle_quick_add(self):
        text = self.quick_input.text().strip()
        if not text:
            return

        # Core single user setup
        u = self.db.query(User).filter_by(username="ubuntu_user").first()
        cat = self.db.query(Category).first()

        new_task = Task(
            user_id=u.id,
            category_id=cat.id if cat else None,
            title=text,
            priority="Medium",
            status="Pending",
            due_date=datetime.datetime.utcnow()
        )
        self.db.add(new_task)
        self.db.commit()
        
        self.quick_input.clear()
        self._load_data()
        send_linux_notification("Priority Task Programmed", f"Scheduled: {text}")

    def _handle_schedule_task(self):
        title = self.task_title_in.text().strip()
        if not title:
            return

        u = self.db.query(User).filter_by(username="ubuntu_user").first()
        cat_name = self.task_cat_cb.currentText()
        cat = self.db.query(Category).filter_by(name=cat_name).first()

        new_task = Task(
            user_id=u.id,
            category_id=cat.id if cat else None,
            title=title,
            description=self.task_desc_in.toPlainText().strip(),
            priority=self.task_prio_cb.currentText(),
            status="Pending",
            due_date=datetime.datetime.utcnow()
        )
        self.db.add(new_task)
        self.db.commit()

        self.task_title_in.clear()
        self.task_desc_in.clear()
        self._load_data()
        send_linux_notification("Task Programmed Successfully", f"Registered: {title}")

    # ==========================================
    # POMODORO TIMERS & THREADS
    # ==========================================

    def _handle_pomo_toggle(self):
        if self.pomo_active:
            self.pomo_active = False
            self.pomo_timer.stop()
            self.pomo_start_btn.setText("Begin Focus Interval")
        else:
            self.pomo_active = True
            self.pomo_timer.start(1000)
            self.pomo_start_btn.setText("Pause Focus")

    def _handle_pomo_reset(self):
        self.pomo_active = False
        self.pomo_timer.stop()
        self.pomo_time_left = 25 * 60
        self.pomo_time_lbl.setText("25:00")
        self.pomo_start_btn.setText("Begin Focus Interval")

    def _pomo_tick(self):
        if self.pomo_time_left > 0:
            self.pomo_time_left -= 1
            mins = self.pomo_time_left // 60
            secs = self.pomo_time_left % 60
            self.pomo_time_lbl.setText(f"{mins:02d}:{secs:02d}")
        else:
            self.pomo_timer.stop()
            self.pomo_active = False
            send_linux_notification("Deep Focus Block Complete!", "Time for a short restorative break.")
            self._handle_pomo_reset()

    # ==========================================
    # NOTES DRAFTING
    # ==========================================

    def _handle_note_selected(self, item):
        note_id = item.data(Qt.UserRole)
        note = self.db.query(Note).filter_by(id=note_id).first()
        if note:
            self.note_title_in.setText(note.title)
            self.note_content_in.setText(note.content)

    def _handle_save_note(self):
        title = self.note_title_in.text().strip()
        if not title:
            return

        # Check if active selection edit or fresh insert
        current_item = self.notes_list.currentItem()
        u = self.db.query(User).filter_by(username="ubuntu_user").first()

        if current_item:
            note_id = current_item.data(Qt.UserRole)
            note = self.db.query(Note).filter_by(id=note_id).first()
            if note:
                note.title = title
                note.content = self.note_content_in.toPlainText()
        else:
            new_note = Note(
                user_id=u.id,
                title=title,
                content=self.note_content_in.toPlainText()
            )
            self.db.add(new_note)

        self.db.commit()
        self._load_data()
        QMessageBox.information(self, "Autosave", "Document state synchronized to SQLite database.")

    def closeEvent(self, event):
        """Cleanup session connection pools on window teardown."""
        self.db.close()
        event.accept()
