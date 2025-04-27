// D:\React_Nodejs\git repostry\Sayu_Git_Autoshed\AutoShed_Sayu_Thila\Sample_Admin01\FrontEnd\autoshed\src\components\LIC_Component\LicNotification.js

import React, { useState, useEffect } from 'react';
import { Drawer, List, ListItem, Typography, CircularProgress, Divider, Box, IconButton } from '@mui/material';
import { X } from 'lucide-react';
import MessageHistoryService from '../../services/LIC_Services/MessageHistoryService';
import '../../styles/LIC_Styles/LicNotification.css';

const LicNotification = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!isOpen) return;
      
      try {
        setLoading(true);
        
        // Get LIC ID from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const licId = decodedToken.id; // Assuming token contains the LIC ID
        
        const whatsappHistory = await MessageHistoryService.getWhatsAppHistory(licId);
        setMessages(whatsappHistory);
        setError(null);
      } catch (err) {
        console.error('Error fetching WhatsApp history:', err);
        setError('Failed to load WhatsApp messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [isOpen]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      className="notification-drawer"
      classes={{
        paper: 'notification-drawer-paper'
      }}
    >
      <Box className="notification-drawer-header">
        <Typography variant="h6" className="notification-drawer-title">
          Sent WhatsApp Messages
        </Typography>
        <IconButton onClick={onClose} className="notification-drawer-close">
          <X size={20} />
        </IconButton>
      </Box>
      <Divider />
      
      {loading ? (
        <Box className="notification-drawer-loading">
          <CircularProgress size={30} />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Loading messages...
          </Typography>
        </Box>
      ) : error ? (
        <Box className="notification-drawer-error">
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        </Box>
      ) : messages.length === 0 ? (
        <Box className="notification-drawer-empty">
          <Typography variant="body1">
            No sent WhatsApp messages found.
          </Typography>
        </Box>
      ) : (
        <List className="message-list">
          {messages.map((message) => (
            <React.Fragment key={message.id}>
              <ListItem className="message-list-item">
                <Box className="message-item-content">
                  <Typography variant="subtitle1" className="message-item-recipient">
                    To: {message.recipient_name} ({message.recipient_phone})
                  </Typography>
                  <Typography variant="body2" className="message-item-module">
                    Module: {message.module_code || 'N/A'} - {message.viva_type || 'N/A'}
                  </Typography>
                  <Box className="message-item-text">
                    <Typography variant="body2" className="message-content">
                      {message.message_content.substring(0, 100)}
                      {message.message_content.length > 100 ? '...' : ''}
                    </Typography>
                  </Box>
                  <Typography variant="caption" className="message-item-date">
                    Sent: {formatDate(message.sent_at)}
                  </Typography>
                  <Box className="message-item-status" sx={{ 
                    color: message.status === 'success' ? 'green' : 'red' 
                  }}>
                    Status: {message.status === 'success' ? 'Delivered' : 'Failed'}
                  </Box>
                </Box>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
    </Drawer>
  );
};

export default LicNotification;
