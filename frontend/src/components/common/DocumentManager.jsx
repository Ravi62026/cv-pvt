import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Grid,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Breadcrumbs,
  Link,
  LinearProgress
} from '@mui/material';
import {
  CreateNewFolder,
  UploadFile,
  Delete,
  Edit,
  Download,
  Share,
  MoreVert,
  Folder,
  Description,
  ArrowBack
} from '@mui/icons-material';
import api from '../../utils/api';

const DocumentManager = () => {
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [path, setPath] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newFolderDialog, setNewFolderDialog] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [shareDialog, setShareDialog] = useState(false);
  const [selectedLawyers, setSelectedLawyers] = useState([]);
  const [availableLawyers, setAvailableLawyers] = useState([]);

  useEffect(() => {
    fetchDocuments();
    fetchLawyers();
  }, [currentFolder]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/citizen/documents', {
        params: { folderId: currentFolder }
      });
      setDocuments(response.data.documents);
      setFolders(response.data.folders);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLawyers = async () => {
    try {
      const response = await api.get('/api/citizen/lawyers');
      setAvailableLawyers(response.data);
    } catch (error) {
      console.error('Error fetching lawyers:', error);
    }
  };

  const handleUpload = async (event) => {
    const files = event.target.files;
    const formData = new FormData();
    
    for (let file of files) {
      formData.append('documents', file);
    }
    if (currentFolder) {
      formData.append('folderId', currentFolder);
    }

    try {
      await api.post('/api/citizen/documents/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          setUploadProgress(progress);
        }
      });
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading documents:', error);
    } finally {
      setUploadProgress(0);
    }
  };

  const handleCreateFolder = async () => {
    try {
      await api.post('/api/citizen/documents/folders', {
        name: folderName,
        parentId: currentFolder
      });
      setNewFolderDialog(false);
      setFolderName('');
      fetchDocuments();
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleDelete = async () => {
    try {
      if (selectedItem.type === 'folder') {
        await api.delete(`/api/citizen/documents/folders/${selectedItem.id}`);
      } else {
        await api.delete(`/api/citizen/documents/${selectedItem.id}`);
      }
      setMenuAnchor(null);
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleShare = async () => {
    try {
      await api.post(`/api/citizen/documents/${selectedItem.id}/share`, {
        lawyerIds: selectedLawyers
      });
      setShareDialog(false);
      setSelectedLawyers([]);
    } catch (error) {
      console.error('Error sharing document:', error);
    }
  };

  const handleDownload = async (document) => {
    try {
      const response = await api.get(`/api/citizen/documents/${document.id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const handleFolderClick = (folder) => {
    setCurrentFolder(folder.id);
    setPath([...path, folder]);
  };

  const handlePathClick = (index) => {
    const newPath = path.slice(0, index + 1);
    setPath(newPath);
    setCurrentFolder(newPath[newPath.length - 1]?.id || null);
  };

  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>Document Manager</Typography>
        <Breadcrumbs>
          <Link 
            component="button" 
            onClick={() => {
              setCurrentFolder(null);
              setPath([]);
            }}
          >
            Root
          </Link>
          {path.map((folder, index) => (
            <Link
              key={folder.id}
              component="button"
              onClick={() => handlePathClick(index)}
            >
              {folder.name}
            </Link>
          ))}
        </Breadcrumbs>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<UploadFile />}
          component="label"
        >
          Upload Files
          <input
            type="file"
            hidden
            multiple
            onChange={handleUpload}
          />
        </Button>
        <Button
          variant="outlined"
          startIcon={<CreateNewFolder />}
          onClick={() => setNewFolderDialog(true)}
        >
          New Folder
        </Button>
      </Box>

      {uploadProgress > 0 && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      {loading ? (
        <LinearProgress />
      ) : (
        <List>
          {folders.map(folder => (
            <ListItem
              key={folder.id}
              button
              onClick={() => handleFolderClick(folder)}
              secondaryAction={
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem({ ...folder, type: 'folder' });
                    setMenuAnchor(e.currentTarget);
                  }}
                >
                  <MoreVert />
                </IconButton>
              }
            >
              <ListItemIcon>
                <Folder />
              </ListItemIcon>
              <ListItemText 
                primary={folder.name}
                secondary={`${folder.itemCount || 0} items`}
              />
            </ListItem>
          ))}
          {documents.map(document => (
            <ListItem
              key={document.id}
              secondaryAction={
                <IconButton
                  onClick={(e) => {
                    setSelectedItem({ ...document, type: 'document' });
                    setMenuAnchor(e.currentTarget);
                  }}
                >
                  <MoreVert />
                </IconButton>
              }
            >
              <ListItemIcon>
                <Description />
              </ListItemIcon>
              <ListItemText 
                primary={document.name}
                secondary={`Size: ${(document.size / 1024 / 1024).toFixed(2)} MB • Updated: ${new Date(document.updatedAt).toLocaleDateString()}`}
              />
            </ListItem>
          ))}
        </List>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        {selectedItem?.type === 'document' && (
          <MenuItem onClick={() => handleDownload(selectedItem)}>
            <ListItemIcon>
              <Download fontSize="small" />
            </ListItemIcon>
            Download
          </MenuItem>
        )}
        <MenuItem onClick={() => setShareDialog(true)}>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          Share
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      {/* New Folder Dialog */}
      <Dialog open={newFolderDialog} onClose={() => setNewFolderDialog(false)}>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFolderDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateFolder} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialog} onClose={() => setShareDialog(false)}>
        <DialogTitle>Share Document</DialogTitle>
        <DialogContent>
          <List>
            {availableLawyers.map(lawyer => (
              <ListItem
                key={lawyer.id}
                button
                onClick={() => {
                  const selected = selectedLawyers.includes(lawyer.id);
                  setSelectedLawyers(
                    selected
                      ? selectedLawyers.filter(id => id !== lawyer.id)
                      : [...selectedLawyers, lawyer.id]
                  );
                }}
              >
                <ListItemText 
                  primary={lawyer.name}
                  secondary={lawyer.specialization}
                />
                <ListItemIcon>
                  {selectedLawyers.includes(lawyer.id) && <Check />}
                </ListItemIcon>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialog(false)}>Cancel</Button>
          <Button onClick={handleShare} variant="contained">Share</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default DocumentManager; 