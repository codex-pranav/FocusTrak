import sys
import os
import logging
from PySide6.QtWidgets import QApplication
from .app import MainWindow

# Configure clean terminal logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("todo_app_entry")

def main():
    """
    Main entry point for the desktop Todo & Productivity Suite.
    Loads PySide6 QApplication, initializes widgets, and runs the Qt event loop.
    """
    logger.info("Initializing Ubuntu Productivity Desktop Suite...")
    
    # Initialize the Qt application core
    app = QApplication(sys.argv)
    app.setApplicationName("Ubuntu Todo & Productivity Suite")
    app.setOrganizationName("Ubuntu Productivity")
    
    # Instantiate the main window layout
    window = MainWindow()
    window.show()
    
    # Execute the application block
    logger.info("Application successfully booted. Entering main event loop.")
    sys.exit(app.exec())

if __name__ == "__main__":
    main()
