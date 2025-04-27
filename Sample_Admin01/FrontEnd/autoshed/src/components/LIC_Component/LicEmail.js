// D:\React_Nodejs\git repostry\Sayu_Git_Autoshed\AutoShed_Sayu_Thila\Sample_Admin01\FrontEnd\autoshed\src\components\LIC_Component\LicEmail.js

import React, { useState, useEffect, useRef } from 'react';
import { Drawer, List, ListItem, Typography, CircularProgress, Divider, Box, IconButton } from '@mui/material';
import { X } from 'lucide-react';
import MessageHistoryService from '../../services/LIC_Services/MessageHistoryService';
import '../../styles/LIC_Styles/LicEmail.css';

const LicEmail = ({ isOpen, onClose, userEmail }) => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    const fetchEmails = async () => {
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
        
        const emailHistory = await MessageHistoryService.getEmailHistory(licId);
        setEmails(emailHistory);
        setError(null);
      } catch (err) {
        console.error('Error fetching email history:', err);
        setError('Failed to load email history');
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, [isOpen]);

  // Add auto-scroll to bottom when emails load
  useEffect(() => {
    if (listRef.current && emails.length > 0) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [emails]);

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
      className="email-drawer"
      classes={{
        paper: 'email-drawer-paper'
      }}
    >
      <Box className="email-drawer-header">
        <Typography variant="h6" className="email-drawer-title">
          Sent Emails
        </Typography>
        <IconButton onClick={onClose} className="email-drawer-close">
          <X size={20} />
        </IconButton>
      </Box>
      <Divider />
      
      {loading ? (
        <Box className="email-drawer-loading">
          <CircularProgress size={30} />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Loading emails...
          </Typography>
        </Box>
      ) : error ? (
        <Box className="email-drawer-error">
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        </Box>
      ) : emails.length === 0 ? (
        <Box className="email-drawer-empty">
          <Typography variant="body1">
            No sent emails found.
          </Typography>
        </Box>
      ) : (
        <List className="email-list" ref={listRef}>
          {emails.map((email) => (
            <React.Fragment key={email.id}>
              <ListItem className="email-list-item">
                <Box className="email-item-content">
                  <Typography variant="subtitle1" className="email-item-subject">
                    {email.subject}
                  </Typography>
                  <Typography variant="body2" className="email-item-recipient">
                    To: {email.recipient_name} ({email.recipient_email})
                  </Typography>
                  <Typography variant="body2" className="email-item-module">
                    Module: {email.module_code || 'N/A'} - {email.viva_type || 'N/A'}
                  </Typography>
                  <Typography variant="caption" className="email-item-date">
                    Sent: {formatDate(email.sent_at)}
                  </Typography>
                  <Box className="email-item-status" sx={{ 
                    color: email.status === 'success' ? 'green' : 'red' 
                  }}>
                    Status: {email.status === 'success' ? 'Delivered' : 'Failed'}
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

export default LicEmail;
