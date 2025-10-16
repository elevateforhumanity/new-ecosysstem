/**
 * Add Course Schema to page for Google Rich Results
 * Call this in useEffect on program/course pages
 */

interface CourseSchemaProps {
  name: string;
  description: string;
  duration: string; // e.g., "12 weeks" or "P12W"
  price: string | number; // "0" for free, or dollar amount
  provider?: string;
  url?: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
  skills?: string[];
}

export function addCourseSchema(course: CourseSchemaProps) {
  // Remove existing course schema if present
  const existingSchema = document.querySelector('script[data-schema="course"]');
  if (existingSchema) {
    existingSchema.remove();
  }

  // Convert duration to ISO 8601 format (e.g., "12 weeks" -> "P12W")
  const durationISO = course.duration.includes('week') 
    ? `P${course.duration.match(/\d+/)?.[0]}W`
    : course.duration.includes('month')
    ? `P${course.duration.match(/\d+/)?.[0]}M`
    : 'P12W'; // default

  const schema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.name,
    "description": course.description,
    "provider": {
      "@type": "Organization",
      "name": course.provider || "Elevate for Humanity",
      "sameAs": "https://elevateforhumanity.pages.dev"
    },
    "offers": {
      "@type": "Offer",
      "price": typeof course.price === 'string' ? course.price.replace(/[^0-9.]/g, '') : course.price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": course.url || window.location.href
    },
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "onsite",
      "duration": durationISO,
      "instructor": {
        "@type": "Organization",
        "name": course.provider || "Elevate for Humanity"
      }
    }
  };

  // Add rating if provided
  if (course.rating && course.reviewCount) {
    schema["aggregateRating"] = {
      "@type": "AggregateRating",
      "ratingValue": course.rating.toString(),
      "reviewCount": course.reviewCount.toString(),
      "bestRating": "5",
      "worstRating": "1"
    };
  }

  // Add category/about if provided
  if (course.category) {
    schema["about"] = course.category;
  }

  // Add skills/teaches if provided
  if (course.skills && course.skills.length > 0) {
    schema["teaches"] = course.skills;
  }

  // Create and append script tag
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-schema', 'course');
  script.textContent = JSON.stringify(schema, null, 2);
  document.head.appendChild(script);
}

/**
 * Add Breadcrumb Schema
 */
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function addBreadcrumbSchema(items: BreadcrumbItem[]) {
  // Remove existing breadcrumb schema if present
  const existingSchema = document.querySelector('script[data-schema="breadcrumb"]');
  if (existingSchema) {
    existingSchema.remove();
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-schema', 'breadcrumb');
  script.textContent = JSON.stringify(schema, null, 2);
  document.head.appendChild(script);
}

/**
 * Sample programs with schema data
 */
export const samplePrograms = [
  {
    name: "Phlebotomy Technician Certification",
    description: "8-10 week clinical training program with certification exam prep and 92% job placement rate. Learn blood collection, patient care, and laboratory procedures.",
    duration: "10 weeks",
    price: "0",
    rating: 4.9,
    reviewCount: 45,
    category: "Healthcare",
    skills: ["Blood Collection", "Patient Care", "Laboratory Procedures", "Medical Terminology", "Safety Protocols"]
  },
  {
    name: "Construction Pre-Apprenticeship",
    description: "12-16 week OSHA-certified construction training with hands-on experience and 95% job placement rate. Includes safety certification and tool training.",
    duration: "16 weeks",
    price: "0",
    rating: 4.8,
    reviewCount: 67,
    category: "Construction",
    skills: ["OSHA Safety", "Hand Tools", "Power Tools", "Blueprint Reading", "Construction Math"]
  },
  {
    name: "CDL Truck Driving",
    description: "4-8 week Class A CDL training program with 98% job placement rate. Includes behind-the-wheel training and DOT certification.",
    duration: "8 weeks",
    price: "0",
    rating: 4.9,
    reviewCount: 123,
    category: "Transportation",
    skills: ["Class A CDL", "Vehicle Inspection", "Safe Driving", "DOT Regulations", "Cargo Handling"]
  },
  {
    name: "CompTIA A+ IT Technician",
    description: "12 week IT fundamentals and hardware/software troubleshooting certification program. 88% job placement rate with average starting salary of $45,000.",
    duration: "12 weeks",
    price: "0",
    rating: 4.7,
    reviewCount: 89,
    category: "Information Technology",
    skills: ["Hardware Troubleshooting", "Software Installation", "Networking Basics", "Security Fundamentals", "Customer Service"]
  },
  {
    name: "Medical Billing & Coding",
    description: "10 week healthcare administration program covering ICD-10, CPT coding, and medical billing software. 90% job placement rate.",
    duration: "10 weeks",
    price: "0",
    rating: 4.8,
    reviewCount: 56,
    category: "Healthcare Administration",
    skills: ["ICD-10 Coding", "CPT Coding", "Medical Billing", "HIPAA Compliance", "Electronic Health Records"]
  }
];
