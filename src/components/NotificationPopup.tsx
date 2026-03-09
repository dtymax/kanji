import { useState, useEffect } from 'react';
import { useUser, type NotificationEvent } from '../contexts/UserContext';
import './NotificationPopup.css';

export default function NotificationPopup() {
    const { notifications, clearNotifications } = useUser();
    const [visible, setVisible] = useState<NotificationEvent | null>(null);
    const [queue, setQueue] = useState<NotificationEvent[]>([]);

    useEffect(() => {
        if (notifications.length > 0) {
            setQueue(prev => [...prev, ...notifications]);
            clearNotifications();
        }
    }, [notifications, clearNotifications]);

    useEffect(() => {
        if (!visible && queue.length > 0) {
            setVisible(queue[0]);
            setQueue(prev => prev.slice(1));
        }
    }, [visible, queue]);

    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                setVisible(null);
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <div className="notification-overlay" onClick={() => setVisible(null)}>
            <div className={`notification-popup notification-${visible.type}`}>
                {visible.type === 'levelUp' && (
                    <>
                        <div className="notification-icon">⬆️</div>
                        <div className="notification-text">
                            <div className="notification-title">レベルアップ！</div>
                            <div className="notification-detail">Lv.{visible.level} になりました！</div>
                        </div>
                    </>
                )}
                {visible.type === 'newTitle' && (
                    <>
                        <div className="notification-icon">🎖️</div>
                        <div className="notification-text">
                            <div className="notification-title">新しい称号！</div>
                            <div className="notification-detail">「{visible.title}」を獲得しました！</div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
