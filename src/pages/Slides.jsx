import React, { useState, useEffect } from 'react';

/**
 * Slides Page - Google Slides Alternative
 */
export function Slides() {
  const [presentation, setPresentation] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isPresentMode, setIsPresentMode] = useState(false);

  useEffect(() => {
    loadPresentation();
  }, []);

  const loadPresentation = async () => {
    // Mock data for demo
    const mockPresentation = {
      id: 'pres_1',
      title: 'Untitled Presentation',
      theme: {
        primaryColor: '#4285f4',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial'
      },
      slidesData: [
        {
          id: 'slide1',
          layout: 'title',
          elements: [
            {
              id: 'title',
              type: 'text',
              content: 'Welcome to Elevate Slides',
              x: 50,
              y: 200,
              width: 700,
              height: 100,
              fontSize: 48,
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#000000'
            },
            {
              id: 'subtitle',
              type: 'text',
              content: 'Create beautiful presentations',
              x: 50,
              y: 320,
              width: 700,
              height: 60,
              fontSize: 24,
              textAlign: 'center',
              color: '#666666'
            }
          ]
        }
      ]
    };
    
    setPresentation(mockPresentation);
  };

  const addSlide = () => {
    const newSlide = {
      id: `slide${Date.now()}`,
      layout: 'content',
      elements: [
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
        }
      ]
    };
    
    setPresentation({
      ...presentation,
      slidesData: [...presentation.slidesData, newSlide]
    });
    setCurrentSlide(presentation.slidesData.length);
  };

  const deleteSlide = (index) => {
    const newSlides = presentation.slidesData.filter((_, i) => i !== index);
    setPresentation({
      ...presentation,
      slidesData: newSlides
    });
    if (currentSlide >= newSlides.length) {
      setCurrentSlide(Math.max(0, newSlides.length - 1));
    }
  };

  const updateElement = (elementId, updates) => {
    const newSlides = [...presentation.slidesData];
    const slide = newSlides[currentSlide];
    const element = slide.elements.find(e => e.id === elementId);
    if (element) {
      Object.assign(element, updates);
      setPresentation({ ...presentation, slidesData: newSlides });
    }
  };

  const renderElement = (element) => {
    const isSelected = selectedElement === element.id;
    
    const style = {
      position: 'absolute',
      left: `${element.x}px`,
      top: `${element.y}px`,
      width: `${element.width}px`,
      height: `${element.height}px`,
      fontSize: `${element.fontSize}px`,
      fontWeight: element.fontWeight || 'normal',
      textAlign: element.textAlign || 'left',
      color: element.color || '#000000',
      border: isSelected ? '2px solid var(--brand-info)' : 'none',
      cursor: 'pointer',
      padding: '0.5rem',
      outline: 'none'
    };

    if (element.type === 'text') {
      return (
        <div
          key={element.id}
          style={style}
          onClick={() => setSelectedElement(element.id)}
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => updateElement(element.id, { content: e.target.textContent })}
        >
          {element.content}
        </div>
      );
    }

    if (element.type === 'image') {
      return (
        <img
          key={element.id}
          src={element.src}
          alt={element.alt}
          style={style}
          onClick={() => setSelectedElement(element.id)}
        />
      );
    }

    return null;
  };

  const currentSlideData = presentation?.slidesData[currentSlide];

  if (isPresentMode) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <div style={{
          width: '800px',
          height: '600px',
          backgroundColor: presentation?.theme.backgroundColor || '#fff',
          position: 'relative',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
        }}>
          {currentSlideData?.elements.map(renderElement)}
        </div>

        {/* Navigation */}
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '1rem',
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '1rem',
          borderRadius: '0.5rem'
        }}>
          <button
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#fff',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            ← Previous
          </button>
          <span style={{ color: '#fff', padding: '0.5rem 1rem' }}>
            {currentSlide + 1} / {presentation?.slidesData.length}
          </span>
          <button
            onClick={() => setCurrentSlide(Math.min(presentation.slidesData.length - 1, currentSlide + 1))}
            disabled={currentSlide === presentation.slidesData.length - 1}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#fff',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Next →
          </button>
          <button
            onClick={() => setIsPresentMode(false)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--brand-danger)',
              color: '#fff',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Exit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--brand-surface)' }}>
      {/* Sidebar - Slide thumbnails */}
      <div style={{
        width: '200px',
        backgroundColor: '#fff',
        borderRight: '1px solid var(--brand-border)',
        overflowY: 'auto',
        padding: '1rem'
      }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '0.875rem', fontWeight: '600' }}>
          Slides
        </h3>
        
        {presentation?.slidesData.map((slide, index) => (
          <div
            key={slide.id}
            onClick={() => setCurrentSlide(index)}
            style={{
              marginBottom: '0.75rem',
              border: currentSlide === index ? '2px solid var(--brand-info)' : '1px solid var(--brand-border)',
              borderRadius: '0.375rem',
              padding: '0.5rem',
              cursor: 'pointer',
              backgroundColor: currentSlide === index ? 'var(--brand-surface)' : '#fff',
              position: 'relative'
            }}
          >
            <div style={{
              width: '100%',
              height: '80px',
              backgroundColor: '#f3f4f6',
              borderRadius: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              color: 'var(--brand-text-muted)'
            }}>
              Slide {index + 1}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteSlide(index);
              }}
              style={{
                position: 'absolute',
                top: '0.25rem',
                right: '0.25rem',
                padding: '0.25rem',
                backgroundColor: 'var(--brand-danger)',
                color: '#fff',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              ×
            </button>
          </div>
        ))}
        
        <button
          onClick={addSlide}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: 'var(--brand-info)',
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}
        >
          + New Slide
        </button>
      </div>

      {/* Main editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <div style={{
          backgroundColor: '#fff',
          borderBottom: '1px solid var(--brand-border)',
          padding: '0.75rem 1rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <input
            type="text"
            value={presentation?.title || 'Untitled Presentation'}
            style={{
              border: 'none',
              fontSize: '1.125rem',
              fontWeight: '500',
              outline: 'none',
              width: '300px'
            }}
          />

          <div style={{ flex: 1 }} />

          <button style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#fff',
            border: '1px solid var(--brand-border-dark)',
            borderRadius: '0.375rem',
            cursor: 'pointer'
          }}>
            💾 Save
          </button>

          <button
            onClick={() => setIsPresentMode(true)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--brand-info)',
              color: '#fff',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            ▶ Present
          </button>
        </div>

        {/* Canvas */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          overflow: 'auto'
        }}>
          <div style={{
            width: '800px',
            height: '600px',
            backgroundColor: presentation?.theme.backgroundColor || '#fff',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            position: 'relative'
          }}>
            {currentSlideData?.elements.map(renderElement)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Slides;
