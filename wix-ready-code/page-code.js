// PASTE THIS INTO WIX PAGE CODE
import { fetch } from 'wix-fetch';
import wixLocation from 'wix-location';

$w.onReady(function () {
  // Load programs when page loads
  loadPrograms();
  
  // Setup contact form
  setupContactForm();
  
  // Track page view
  trackPageView();
});

// Load and display programs
async function loadPrograms() {
  try {
    const response = await fetch('/programs');
    const data = await response.json();
    
    if (data.programs && data.programs.length > 0) {
      displayPrograms(data.programs);
    }
  } catch (error) {
    console.error('Failed to load programs:', error);
  }
}

// Display programs in repeater
function displayPrograms(programs) {
  if ($w('#programsRepeater')) {
    $w('#programsRepeater').data = programs;
    
    $w('#programsRepeater').onItemReady(($item, itemData) => {
      $item('#programTitle').text = itemData.title;
      $item('#programSummary').text = itemData.summary;
      
      $item('#learnMoreButton').onClick(() => {
        wixLocation.to(`/programs/${itemData.slug}`);
      });
    });
  }
}

// Setup contact form
function setupContactForm() {
  if ($w('#submitButton')) {
    $w('#submitButton').onClick(async () => {
      const formData = {
        name: $w('#nameInput').value,
        email: $w('#emailInput').value,
        phone: $w('#phoneInput').value,
        message: $w('#messageInput').value,
        program: $w('#programSelect').value
      };
      
      // Validate
      if (!formData.name || !formData.email) {
        $w('#errorMessage').text = 'Name and email are required';
        $w('#errorMessage').show();
        return;
      }
      
      try {
        $w('#submitButton').disable();
        $w('#submitButton').label = 'Submitting...';
        
        const response = await fetch('/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
          $w('#successMessage').text = result.message;
          $w('#successMessage').show();
          $w('#contactForm').hide();
        } else {
          $w('#errorMessage').text = result.error;
          $w('#errorMessage').show();
        }
      } catch (error) {
        $w('#errorMessage').text = 'Network error. Please try again.';
        $w('#errorMessage').show();
      } finally {
        $w('#submitButton').enable();
        $w('#submitButton').label = 'Submit';
      }
    });
  }
}

// Track page views
async function trackPageView() {
  try {
    await fetch('/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'page_view',
        page: wixLocation.path,
        data: { url: wixLocation.url }
      })
    });
  } catch (error) {
    console.error('Analytics failed:', error);
  }
}