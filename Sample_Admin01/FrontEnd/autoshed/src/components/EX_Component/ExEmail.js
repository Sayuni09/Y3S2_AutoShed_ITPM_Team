import React, { useState, useEffect, useRef } from 'react';
import '../../styles/EX_Styles/ExEmail.css';
import { X, Clock, Send, Reply, Trash } from 'lucide-react';

const ExEmail = ({ isOpen, onClose, userEmail }) => {
    const [emails, setEmails] = useState([]);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    const dropdownRef = useRef(null);

    // Mock emails data - replace with actual email fetching
    useEffect(() => {
        setEmails([
            {
                id: 1,
                from: 'admin@autoshed.com',
                to: userEmail,
                subject: 'Examination Schedule Update',
                message: 'Dear Examiner,\n\nThis is to inform you about the updated examination schedule for Module A. Please review the attached schedule and confirm your availability.\n\nBest regards,\nAdmin Team',
                time: '2 hours ago',
                status: 'unread',
                thread: []
            },
            {
                id: 2,
                from: 'support@autoshed.com',
                to: userEmail,
                subject: 'Student Rescheduling Request',
                message: 'Hello,\n\nA student has requested to reschedule their examination due to medical reasons. Please review the request and provide your available dates.\n\nRegards,\nSupport Team',
                time: '5 hours ago',
                status: 'unread',
                thread: []
            },
            {
                id: 3,
                from: 'notifications@autoshed.com',
                to: userEmail,
                subject: 'Monthly Report Available',
                message: 'Dear Examiner,\n\nYour monthly examination report is now available. Please login to the dashboard to view the detailed statistics.\n\nThank you,\nSystem Notification',
                time: '1 day ago',
                status: 'read',
                thread: []
            }
        ]);
    }, [userEmail]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
                setSelectedEmail(null);
                setIsReplying(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleEmailClick = (email) => {
        setSelectedEmail(email);
        setIsReplying(false);
        // Mark email as read
        setEmails(emails.map(e => 
            e.id === email.id ? { ...e, status: 'read' } : e
        ));
    };

    const handleReply = () => {
        setIsReplying(true);
    };

    const sendReply = () => {
        if (!replyContent.trim()) return;

        const reply = {
            id: Date.now(),
            from: userEmail,
            to: selectedEmail.from,
            message: replyContent,
            time: 'Just now'
        };

        setEmails(emails.map(email => 
            email.id === selectedEmail.id 
                ? { ...email, thread: [...email.thread, reply] }
                : email
        ));

        setReplyContent('');
        setIsReplying(false);
    };

    const deleteEmail = (emailId) => {
        setEmails(emails.filter(email => email.id !== emailId));
        setSelectedEmail(null);
    };

    if (!isOpen) return null;

    return (
        <div className="email-container" ref={dropdownRef}>
            {selectedEmail ? (
                <div className="email-detail">
                    <div className="email-detail-header">
                        <div className="email-detail-title">
                            <h3>{selectedEmail.subject}</h3>
                            <div className="email-actions">
                                <button className="action-button" onClick={handleReply}>
                                    <Reply size={18} />
                                    <span>Reply</span>
                                </button>
                                <button 
                                    className="action-button delete" 
                                    onClick={() => deleteEmail(selectedEmail.id)}
                                >
                                    <Trash size={18} />
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                        <button className="close-button" onClick={() => setSelectedEmail(null)}>
                            <X size={18} />
                        </button>
                    </div>
                    <div className="email-detail-content">
                        <div className="email-meta">
                            <div>
                                <span className="meta-label">From:</span>
                                <span className="meta-value">{selectedEmail.from}</span>
                            </div>
                            <div>
                                <span className="meta-label">To:</span>
                                <span className="meta-value">{selectedEmail.to}</span>
                            </div>
                            <div className="email-time">
                                <Clock size={14} />
                                <span>{selectedEmail.time}</span>
                            </div>
                        </div>
                        <div className="email-body">
                            {selectedEmail.message.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                        {selectedEmail.thread.length > 0 && (
                            <div className="email-thread">
                                <h4>Previous Replies</h4>
                                {selectedEmail.thread.map(reply => (
                                    <div key={reply.id} className="thread-message">
                                        <div className="thread-header">
                                            <span>{reply.from}</span>
                                            <span>{reply.time}</span>
                                        </div>
                                        <p>{reply.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {isReplying && (
                            <div className="reply-section">
                                <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Type your reply..."
                                    rows={4}
                                />
                                <div className="reply-actions">
                                    <button 
                                        className="cancel-button"
                                        onClick={() => setIsReplying(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        className="send-button"
                                        onClick={sendReply}
                                    >
                                        <Send size={16} />
                                        <span>Send Reply</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    <div className="email-header">
                        <h3>Messages</h3>
                        <button className="close-button" onClick={onClose}>
                            <X size={18} />
                        </button>
                    </div>
                    <div className="email-list">
                        {emails.map((email) => (
                            <div
                                key={email.id}
                                className={`email-item ${email.status}`}
                                onClick={() => handleEmailClick(email)}
                            >
                                <div className="email-content">
                                    <div className="email-sender">{email.from}</div>
                                    <h4>{email.subject}</h4>
                                    <p>{email.message.substring(0, 100)}...</p>
                                    <span className="email-time">
                                        <Clock size={14} />
                                        {email.time}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ExEmail;