/**
 * Collaboration Service - Real-time document editing
 * Provides Google Docs alternative with collaborative editing
 */

class CollaborationService {
  constructor() {
    this.documents = new Map();
    this.sessions = new Map();
    this.cursors = new Map();
  }

  /**
   * Create a new document
   */
  async createDocument({ title, type = 'doc', ownerId, content = '' }) {
    const docId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const document = {
      id: docId,
      title,
      type, // 'doc', 'sheet', 'slide'
      ownerId,
      content,
      collaborators: [],
      permissions: {
        owner: 'write',
        collaborators: 'write',
        viewers: 'read'
      },
      version: 1,
      versions: [],
      comments: [],
      suggestions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastEditedBy: ownerId
    };
    
    this.documents.set(docId, document);
    
    return document;
  }

  /**
   * Get document by ID
   */
  async getDocument(docId, userId) {
    const doc = this.documents.get(docId);
    if (!doc) throw new Error('Document not found');
    
    if (!this.canAccessDocument(doc, userId)) {
      throw new Error('Access denied');
    }
    
    return doc;
  }

  /**
   * Update document content
   */
  async updateDocument(docId, userId, updates) {
    const doc = this.documents.get(docId);
    if (!doc) throw new Error('Document not found');
    
    if (!this.canEditDocument(doc, userId)) {
      throw new Error('No edit permission');
    }
    
    // Save current version before updating
    if (updates.content && updates.content !== doc.content) {
      doc.versions.push({
        version: doc.version,
        content: doc.content,
        savedAt: doc.updatedAt,
        savedBy: doc.lastEditedBy
      });
      doc.version++;
    }
    
    Object.assign(doc, updates);
    doc.updatedAt = new Date();
    doc.lastEditedBy = userId;
    
    // Broadcast update to all active sessions
    this.broadcastUpdate(docId, {
      type: 'document-update',
      updates,
      userId,
      timestamp: new Date()
    });
    
    return doc;
  }

  /**
   * Add collaborator to document
   */
  async addCollaborator(docId, ownerId, collaboratorId, permission = 'write') {
    const doc = this.documents.get(docId);
    if (!doc) throw new Error('Document not found');
    if (doc.ownerId !== ownerId) throw new Error('Only owner can add collaborators');
    
    if (!doc.collaborators.find(c => c.userId === collaboratorId)) {
      doc.collaborators.push({
        userId: collaboratorId,
        permission, // 'read' or 'write'
        addedAt: new Date()
      });
    }
    
    return doc;
  }

  /**
   * Remove collaborator from document
   */
  async removeCollaborator(docId, ownerId, collaboratorId) {
    const doc = this.documents.get(docId);
    if (!doc) throw new Error('Document not found');
    if (doc.ownerId !== ownerId) throw new Error('Only owner can remove collaborators');
    
    doc.collaborators = doc.collaborators.filter(c => c.userId !== collaboratorId);
    
    // Disconnect any active sessions for this user
    this.disconnectUser(docId, collaboratorId);
    
    return doc;
  }

  /**
   * Create editing session
   */
  async createSession(docId, userId, userName) {
    const doc = this.documents.get(docId);
    if (!doc) throw new Error('Document not found');
    
    if (!this.canAccessDocument(doc, userId)) {
      throw new Error('Access denied');
    }
    
    const sessionId = `session_${Date.now()}_${userId}`;
    
    const session = {
      id: sessionId,
      docId,
      userId,
      userName,
      canEdit: this.canEditDocument(doc, userId),
      connectedAt: new Date(),
      lastActivity: new Date(),
      cursor: null
    };
    
    this.sessions.set(sessionId, session);
    
    // Notify other users
    this.broadcastUpdate(docId, {
      type: 'user-joined',
      session: {
        userId,
        userName,
        canEdit: session.canEdit
      }
    });
    
    return {
      session,
      document: doc,
      activeSessions: this.getActiveSessions(docId)
    };
  }

  /**
   * End editing session
   */
  async endSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    const { docId, userId, userName } = session;
    
    this.sessions.delete(sessionId);
    
    // Notify other users
    this.broadcastUpdate(docId, {
      type: 'user-left',
      userId,
      userName
    });
  }

  /**
   * Update cursor position
   */
  async updateCursor(sessionId, cursorPosition) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    session.cursor = cursorPosition;
    session.lastActivity = new Date();
    
    // Broadcast cursor position to other users
    this.broadcastUpdate(session.docId, {
      type: 'cursor-update',
      userId: session.userId,
      userName: session.userName,
      cursor: cursorPosition
    }, sessionId); // Exclude sender
  }

  /**
   * Add comment to document
   */
  async addComment(docId, userId, userName, { text, selection }) {
    const doc = this.documents.get(docId);
    if (!doc) throw new Error('Document not found');
    
    if (!this.canAccessDocument(doc, userId)) {
      throw new Error('Access denied');
    }
    
    const comment = {
      id: `comment_${Date.now()}`,
      userId,
      userName,
      text,
      selection, // { start, end }
      replies: [],
      resolved: false,
      createdAt: new Date()
    };
    
    doc.comments.push(comment);
    
    this.broadcastUpdate(docId, {
      type: 'comment-added',
      comment
    });
    
    return comment;
  }

  /**
   * Reply to comment
   */
  async replyToComment(docId, commentId, userId, userName, text) {
    const doc = this.documents.get(docId);
    if (!doc) throw new Error('Document not found');
    
    const comment = doc.comments.find(c => c.id === commentId);
    if (!comment) throw new Error('Comment not found');
    
    const reply = {
      id: `reply_${Date.now()}`,
      userId,
      userName,
      text,
      createdAt: new Date()
    };
    
    comment.replies.push(reply);
    
    this.broadcastUpdate(docId, {
      type: 'comment-reply',
      commentId,
      reply
    });
    
    return reply;
  }

  /**
   * Resolve comment
   */
  async resolveComment(docId, commentId, userId) {
    const doc = this.documents.get(docId);
    if (!doc) throw new Error('Document not found');
    
    const comment = doc.comments.find(c => c.id === commentId);
    if (!comment) throw new Error('Comment not found');
    
    comment.resolved = true;
    comment.resolvedBy = userId;
    comment.resolvedAt = new Date();
    
    this.broadcastUpdate(docId, {
      type: 'comment-resolved',
      commentId
    });
    
    return comment;
  }

  /**
   * Add suggestion (track changes)
   */
  async addSuggestion(docId, userId, userName, { type, content, selection }) {
    const doc = this.documents.get(docId);
    if (!doc) throw new Error('Document not found');
    
    if (!this.canEditDocument(doc, userId)) {
      throw new Error('No edit permission');
    }
    
    const suggestion = {
      id: `suggestion_${Date.now()}`,
      userId,
      userName,
      type, // 'insert', 'delete', 'replace'
      content,
      selection,
      status: 'pending', // 'pending', 'accepted', 'rejected'
      createdAt: new Date()
    };
    
    doc.suggestions.push(suggestion);
    
    this.broadcastUpdate(docId, {
      type: 'suggestion-added',
      suggestion
    });
    
    return suggestion;
  }

  /**
   * Accept suggestion
   */
  async acceptSuggestion(docId, suggestionId, userId) {
    const doc = this.documents.get(docId);
    if (!doc) throw new Error('Document not found');
    if (doc.ownerId !== userId) throw new Error('Only owner can accept suggestions');
    
    const suggestion = doc.suggestions.find(s => s.id === suggestionId);
    if (!suggestion) throw new Error('Suggestion not found');
    
    suggestion.status = 'accepted';
    suggestion.acceptedBy = userId;
    suggestion.acceptedAt = new Date();
    
    // Apply suggestion to document
    // (In production, implement actual content modification)
    
    this.broadcastUpdate(docId, {
      type: 'suggestion-accepted',
      suggestionId
    });
    
    return suggestion;
  }

  /**
   * Get document version history
   */
  async getVersionHistory(docId, userId) {
    const doc = this.documents.get(docId);
    if (!doc) throw new Error('Document not found');
    
    if (!this.canAccessDocument(doc, userId)) {
      throw new Error('Access denied');
    }
    
    return doc.versions;
  }

  /**
   * Restore document version
   */
  async restoreVersion(docId, versionNumber, userId) {
    const doc = this.documents.get(docId);
    if (!doc) throw new Error('Document not found');
    
    if (!this.canEditDocument(doc, userId)) {
      throw new Error('No edit permission');
    }
    
    const version = doc.versions.find(v => v.version === versionNumber);
    if (!version) throw new Error('Version not found');
    
    // Save current version before restoring
    doc.versions.push({
      version: doc.version,
      content: doc.content,
      savedAt: doc.updatedAt,
      savedBy: doc.lastEditedBy
    });
    
    doc.content = version.content;
    doc.version++;
    doc.updatedAt = new Date();
    doc.lastEditedBy = userId;
    
    this.broadcastUpdate(docId, {
      type: 'version-restored',
      versionNumber,
      content: version.content
    });
    
    return doc;
  }

  /**
   * Get active sessions for document
   */
  getActiveSessions(docId) {
    const sessions = [];
    
    this.sessions.forEach(session => {
      if (session.docId === docId) {
        sessions.push({
          userId: session.userId,
          userName: session.userName,
          canEdit: session.canEdit,
          cursor: session.cursor,
          connectedAt: session.connectedAt
        });
      }
    });
    
    return sessions;
  }

  /**
   * Broadcast update to all sessions
   */
  broadcastUpdate(docId, update, excludeSessionId = null) {
    this.sessions.forEach((session, sessionId) => {
      if (session.docId === docId && sessionId !== excludeSessionId) {
        // In production, use WebSocket to send update
        console.log(`Broadcasting to session ${sessionId}:`, update);
      }
    });
  }

  /**
   * Disconnect user from document
   */
  disconnectUser(docId, userId) {
    this.sessions.forEach((session, sessionId) => {
      if (session.docId === docId && session.userId === userId) {
        this.endSession(sessionId);
      }
    });
  }

  /**
   * Check if user can access document
   */
  canAccessDocument(doc, userId) {
    return doc.ownerId === userId ||
           doc.collaborators.some(c => c.userId === userId);
  }

  /**
   * Check if user can edit document
   */
  canEditDocument(doc, userId) {
    if (doc.ownerId === userId) return true;
    
    const collaborator = doc.collaborators.find(c => c.userId === userId);
    return collaborator && collaborator.permission === 'write';
  }

  /**
   * Export document to different formats
   */
  async exportDocument(docId, userId, format = 'pdf') {
    const doc = this.documents.get(docId);
    if (!doc) throw new Error('Document not found');
    
    if (!this.canAccessDocument(doc, userId)) {
      throw new Error('Access denied');
    }
    
    // In production, use libraries like:
    // - PDF: puppeteer, pdfkit
    // - DOCX: docx
    // - HTML: built-in
    
    return {
      format,
      url: `/api/documents/${docId}/export/${format}`,
      generatedAt: new Date()
    };
  }
}

module.exports = new CollaborationService();
