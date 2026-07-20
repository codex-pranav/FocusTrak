import subprocess
import shutil
import logging

logger = logging.getLogger(__name__)

def send_linux_notification(title: str, message: str, urgency: str = "normal"):
    """
    Triggers native Linux desktop notification overlay using 'notify-send'.
    Falls back to print logging if 'notify-send' is unavailable.
    
    :param title: Header label of the notification.
    :param message: Descriptive payload of the notification.
    :param urgency: 'low', 'normal', or 'critical' urgency configurations.
    """
    notify_send_bin = shutil.which("notify-send")
    
    if not notify_send_bin:
        logger.warning(f"[Mock Notification] {title} - {message} (notify-send not found)")
        return False
        
    try:
        subprocess.run([
            notify_send_bin,
            title,
            message,
            "-u", urgency,
            "-t", "5000", # dismiss after 5 seconds
            "-a", "Ubuntu Productivity Suite"
        ], check=True)
        return True
    except Exception as e:
        logger.error(f"Failed to dispatch notify-send notification: {e}")
        return False
