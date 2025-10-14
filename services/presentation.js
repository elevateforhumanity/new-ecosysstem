/**
 * Presentation Service (Google Slides Alternative)
 * Provides presentation creation, editing, and collaboration
 */

class PresentationService {
  constructor() {
    this.presentations = new Map();
    this.slides = new Map();
    this.templates = this.initializeTemplates();
  }

  /**
   * Initialize presentation templates
   */
  initializeTemplates() {
    return [
      {
        id: 'blank',
        name: 'Blank',
        thumbnail: '📄',
        slides: [{ layout: 'title', elements: [] }]
      },
      {
        id: 'pitch',
        name: 'Pitch Deck',
        thumbnail: '💼',
        slides: [
          { layout: 'title', elements: [] },
          { layout: 'content', elements: [] },
          { layout: 'two-column', elements: [] }
        ]
      },
      {
        id: 'education',
        name: 'Education',
        thumbnail: '🎓',
        slides: [
          { layout: 'title', elements: [] },
          { layout: 'content', elements: [] }
        ]
      }
    ];
  }

  /**
   * Create new presentation
   */
  async createPresentation({ title, ownerId, template = 'blank' }) {
    const presentationId = `pres_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const presentation = {
      id: presentationId,
      title,
      ownerId,
      slides: [],
      theme: {
        primaryColor: '#4285f4',
        secondaryColor: '#34a853',
        fontFamily: 'Arial',
        backgroundColor: '#ffffff'
      },
      collaborators: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add slides from template
    const templateData = this.templates.find(t => t.id === template);
    if (templateData) {
      for (const slideTemplate of templateData.slides) {
        const slide = await this.createSlide(presentationId, slideTemplate.layout);
        presentation.slides.push(slide.id);
      }
    }
    
    this.presentations.set(presentationId, presentation);
    
    return presentation;
  }

  /**
   * Create new slide
   */
  async createSlide(presentationId, layout = 'blank') {
    const slideId = `slide_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const slide = {
      id: slideId,
      presentationId,
      layout,
      elements: this.getLayoutElements(layout),
      notes: '',
      transition: 'none',
      duration: 0,
      createdAt: new Date()
    };
    
    this.slides.set(slideId, slide);
    
    return slide;
  }

  /**
   * Get default elements for layout
   */
  getLayoutElements(layout) {
    const layouts = {
      blank: [],
      title: [
        {
          id: 'title',
          type: 'text',
          content: 'Click to add title',
          x: 50,
          y: 200,
          width: 700,
          height: 100,
          fontSize: 48,
          fontWeight: 'bold',
          textAlign: 'center'
        },
        {
          id: 'subtitle',
          type: 'text',
          content: 'Click to add subtitle',
          x: 50,
          y: 320,
          width: 700,
          height: 60,
          fontSize: 24,
          textAlign: 'center'
        }
      ],
      content: [
        {
          id: 'title',
          type: 'text',
          content: 'Click to add title',
          x: 50,
          y: 50,
          width: 700,
          height: 60,
          fontSize: 36,
          fontWeight: 'bold'
        },
        {
          id: 'content',
          type: 'text',
          content: 'Click to add content',
          x: 50,
          y: 130,
          width: 700,
          height: 400,
          fontSize: 18
        }
      ],
      'two-column': [
        {
          id: 'title',
          type: 'text',
          content: 'Click to add title',
          x: 50,
          y: 50,
          width: 700,
          height: 60,
          fontSize: 36,
          fontWeight: 'bold'
        },
        {
          id: 'left',
          type: 'text',
          content: 'Left column',
          x: 50,
          y: 130,
          width: 340,
          height: 400,
          fontSize: 18
        },
        {
          id: 'right',
          type: 'text',
          content: 'Right column',
          x: 410,
          y: 130,
          width: 340,
          height: 400,
          fontSize: 18
        }
      ]
    };
    
    return layouts[layout] || [];
  }

  /**
   * Add element to slide
   */
  async addElement(slideId, element) {
    const slide = this.slides.get(slideId);
    if (!slide) throw new Error('Slide not found');
    
    const newElement = {
      id: `elem_${Date.now()}`,
      type: element.type, // text, image, shape, video
      ...element,
      createdAt: new Date()
    };
    
    slide.elements.push(newElement);
    
    return newElement;
  }

  /**
   * Update element
   */
  async updateElement(slideId, elementId, updates) {
    const slide = this.slides.get(slideId);
    if (!slide) throw new Error('Slide not found');
    
    const element = slide.elements.find(e => e.id === elementId);
    if (!element) throw new Error('Element not found');
    
    Object.assign(element, updates);
    element.updatedAt = new Date();
    
    return element;
  }

  /**
   * Delete element
   */
  async deleteElement(slideId, elementId) {
    const slide = this.slides.get(slideId);
    if (!slide) throw new Error('Slide not found');
    
    slide.elements = slide.elements.filter(e => e.id !== elementId);
    
    return { success: true };
  }

  /**
   * Reorder slides
   */
  async reorderSlides(presentationId, slideIds) {
    const presentation = this.presentations.get(presentationId);
    if (!presentation) throw new Error('Presentation not found');
    
    presentation.slides = slideIds;
    presentation.updatedAt = new Date();
    
    return presentation;
  }

  /**
   * Duplicate slide
   */
  async duplicateSlide(slideId) {
    const originalSlide = this.slides.get(slideId);
    if (!originalSlide) throw new Error('Slide not found');
    
    const newSlideId = `slide_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newSlide = {
      ...JSON.parse(JSON.stringify(originalSlide)),
      id: newSlideId,
      createdAt: new Date()
    };
    
    // Generate new IDs for elements
    newSlide.elements = newSlide.elements.map(elem => ({
      ...elem,
      id: `elem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }));
    
    this.slides.set(newSlideId, newSlide);
    
    return newSlide;
  }

  /**
   * Set slide transition
   */
  async setTransition(slideId, transition, duration = 1000) {
    const slide = this.slides.get(slideId);
    if (!slide) throw new Error('Slide not found');
    
    slide.transition = transition; // none, fade, slide, zoom
    slide.duration = duration;
    
    return slide;
  }

  /**
   * Add speaker notes
   */
  async addNotes(slideId, notes) {
    const slide = this.slides.get(slideId);
    if (!slide) throw new Error('Slide not found');
    
    slide.notes = notes;
    
    return slide;
  }

  /**
   * Apply theme
   */
  async applyTheme(presentationId, theme) {
    const presentation = this.presentations.get(presentationId);
    if (!presentation) throw new Error('Presentation not found');
    
    presentation.theme = { ...presentation.theme, ...theme };
    presentation.updatedAt = new Date();
    
    return presentation;
  }

  /**
   * Export to PDF
   */
  async exportToPDF(presentationId) {
    const presentation = this.presentations.get(presentationId);
    if (!presentation) throw new Error('Presentation not found');
    
    // In production, use puppeteer or similar
    return {
      url: `/api/presentations/${presentationId}/export/pdf`,
      generatedAt: new Date()
    };
  }

  /**
   * Export to PPTX
   */
  async exportToPPTX(presentationId) {
    const presentation = this.presentations.get(presentationId);
    if (!presentation) throw new Error('Presentation not found');
    
    // In production, use pptxgenjs or similar
    return {
      url: `/api/presentations/${presentationId}/export/pptx`,
      generatedAt: new Date()
    };
  }

  /**
   * Get presentation data
   */
  async getPresentation(presentationId) {
    const presentation = this.presentations.get(presentationId);
    if (!presentation) throw new Error('Presentation not found');
    
    const slidesData = [];
    for (const slideId of presentation.slides) {
      const slide = this.slides.get(slideId);
      if (slide) {
        slidesData.push(slide);
      }
    }
    
    return {
      ...presentation,
      slidesData
    };
  }

  /**
   * Start presentation mode
   */
  async startPresentation(presentationId) {
    const presentation = await this.getPresentation(presentationId);
    
    return {
      presentationId,
      currentSlide: 0,
      totalSlides: presentation.slidesData.length,
      startedAt: new Date()
    };
  }
}

module.exports = new PresentationService();
