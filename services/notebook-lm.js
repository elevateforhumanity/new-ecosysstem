/**
 * NotebookLM Service - AI Research Assistant with RAG
 */
class NotebookLMService {
  constructor() {
    this.notebooks = new Map();
    this.sources = new Map();
    this.notes = new Map();
    this.embeddings = new Map();
  }

  async createNotebook({ title, description, ownerId }) {
    const notebookId = `notebook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const notebook = {
      id: notebookId,
      title,
      description,
      ownerId,
      sources: [],
      notes: [],
      knowledgeGraph: { nodes: [], edges: [] },
      createdAt: new Date()
    };
    this.notebooks.set(notebookId, notebook);
    return notebook;
  }

  async addSource(notebookId, source) {
    const notebook = this.notebooks.get(notebookId);
    if (!notebook) throw new Error('Notebook not found');

    const sourceId = `source_${Date.now()}`;
    const newSource = {
      id: sourceId,
      notebookId,
      type: source.type, // pdf, doc, url, text
      title: source.title,
      content: source.content || '',
      url: source.url,
      fileUrl: source.fileUrl,
      metadata: source.metadata || {},
      chunks: [],
      embeddings: [],
      addedAt: new Date()
    };

    if (source.type === 'pdf' || source.type === 'doc') {
      newSource.content = await this.extractText(source.fileUrl);
    } else if (source.type === 'url') {
      newSource.content = await this.fetchUrlContent(source.url);
    }

    newSource.chunks = this.chunkText(newSource.content);
    newSource.embeddings = await this.generateEmbeddings(newSource.chunks);

    this.sources.set(sourceId, newSource);
    notebook.sources.push(sourceId);

    await this.updateKnowledgeGraph(notebookId);

    return newSource;
  }

  async extractText(fileUrl) {
    return `Extracted text from ${fileUrl}. In production, use pdf-parse or mammoth for actual extraction.`;
  }

  async fetchUrlContent(url) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      return html.replace(/<[^>]*>/g, '').substring(0, 10000);
    } catch (error) {
      return `Error fetching URL: ${url}`;
    }
  }

  chunkText(text, chunkSize = 500) {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push({
        id: `chunk_${i}`,
        text: text.substring(i, i + chunkSize),
        startIndex: i,
        endIndex: Math.min(i + chunkSize, text.length)
      });
    }
    return chunks;
  }

  async generateEmbeddings(chunks) {
    return chunks.map((chunk, i) => ({
      chunkId: chunk.id,
      vector: Array(1536).fill(0).map(() => Math.random()),
      model: 'text-embedding-ada-002'
    }));
  }

  async askQuestion(notebookId, question) {
    const notebook = this.notebooks.get(notebookId);
    if (!notebook) throw new Error('Notebook not found');

    const relevantChunks = await this.findRelevantChunks(notebookId, question);
    const context = relevantChunks.map(c => c.text).join('\n\n');

    const prompt = `Based on the following sources, answer this question: ${question}\n\nSources:\n${context}\n\nProvide a detailed answer with citations.`;

    const answer = await this.callAI(prompt);

    return {
      question,
      answer,
      sources: relevantChunks.map(c => ({
        sourceId: c.sourceId,
        text: c.text,
        citation: c.citation
      })),
      timestamp: new Date()
    };
  }

  async findRelevantChunks(notebookId, query, topK = 5) {
    const notebook = this.notebooks.get(notebookId);
    const allChunks = [];

    for (const sourceId of notebook.sources) {
      const source = this.sources.get(sourceId);
      if (source) {
        source.chunks.forEach(chunk => {
          allChunks.push({
            ...chunk,
            sourceId,
            sourceTitle: source.title,
            citation: `${source.title}, p.${Math.floor(chunk.startIndex / 500) + 1}`
          });
        });
      }
    }

    const queryEmbedding = await this.generateEmbeddings([{ id: 'query', text: query }]);
    
    allChunks.forEach(chunk => {
      chunk.similarity = this.cosineSimilarity(queryEmbedding[0].vector, chunk.embedding || []);
    });

    return allChunks.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
  }

  cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) return Math.random();
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async generateNotes(notebookId, topic) {
    const notebook = this.notebooks.get(notebookId);
    if (!notebook) throw new Error('Notebook not found');

    const relevantChunks = await this.findRelevantChunks(notebookId, topic, 10);
    const context = relevantChunks.map(c => c.text).join('\n\n');

    const prompt = `Generate comprehensive notes about: ${topic}\n\nBased on these sources:\n${context}\n\nInclude:\n1. Key points\n2. Important quotes\n3. Connections between ideas\n4. Questions for further research`;

    const content = await this.callAI(prompt);

    const noteId = `note_${Date.now()}`;
    const note = {
      id: noteId,
      notebookId,
      topic,
      content,
      sources: relevantChunks.map(c => c.sourceId),
      createdAt: new Date()
    };

    this.notes.set(noteId, note);
    notebook.notes.push(noteId);

    return note;
  }

  async updateKnowledgeGraph(notebookId) {
    const notebook = this.notebooks.get(notebookId);
    if (!notebook) return;

    const nodes = [];
    const edges = [];

    for (const sourceId of notebook.sources) {
      const source = this.sources.get(sourceId);
      if (source) {
        nodes.push({
          id: sourceId,
          label: source.title,
          type: 'source',
          size: source.chunks.length
        });
      }
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const similarity = Math.random();
        if (similarity > 0.7) {
          edges.push({
            source: nodes[i].id,
            target: nodes[j].id,
            weight: similarity
          });
        }
      }
    }

    notebook.knowledgeGraph = { nodes, edges };
  }

  async callAI(prompt) {
    return `AI-generated response for: ${prompt.substring(0, 100)}...\n\nThis would use GPT-4 or Claude in production.`;
  }

  async getNotebook(notebookId) {
    const notebook = this.notebooks.get(notebookId);
    if (!notebook) throw new Error('Notebook not found');

    const sourcesData = notebook.sources.map(id => this.sources.get(id)).filter(Boolean);
    const notesData = notebook.notes.map(id => this.notes.get(id)).filter(Boolean);

    return { ...notebook, sourcesData, notesData };
  }

  async deleteSource(sourceId) {
    const source = this.sources.get(sourceId);
    if (!source) throw new Error('Source not found');

    const notebook = this.notebooks.get(source.notebookId);
    if (notebook) {
      notebook.sources = notebook.sources.filter(id => id !== sourceId);
      await this.updateKnowledgeGraph(source.notebookId);
    }

    return this.sources.delete(sourceId);
  }
}

module.exports = new NotebookLMService();
