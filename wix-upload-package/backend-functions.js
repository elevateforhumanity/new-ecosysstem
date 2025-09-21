// PASTE THIS INTO WIX BACKEND → http-functions.js
import { ok, serverError, badRequest } from 'wix-http-functions';
import wixData from 'wix-data';

// Get all programs
export function get_programs(request) {
  return wixData.query("Programs")
    .find()
    .then((results) => {
      return ok({
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "programs": results.items,
          "total": results.totalCount
        }
      });
    })
    .catch((error) => {
      return serverError({
        "body": { "error": "Failed to load programs" }
      });
    });
}

// Submit contact form
export function post_contact(request) {
  const { name, email, phone, message, program } = request.body;
  
  if (!name || !email) {
    return badRequest({
      "body": { "error": "Name and email required" }
    });
  }
  
  return wixData.save("Contacts", {
    "name": name,
    "email": email,
    "phone": phone || "",
    "message": message || "",
    "program": program || "",
    "submittedAt": new Date(),
    "status": "new"
  })
  .then(() => {
    return ok({
      "body": { 
        "success": true, 
        "message": "Thank you! We'll contact you soon." 
      }
    });
  })
  .catch((error) => {
    return serverError({
      "body": { "error": "Submission failed. Please try again." }
    });
  });
}

// Track analytics
export function post_analytics(request) {
  const { event, page, data } = request.body;
  
  return wixData.save("Analytics", {
    "event": event,
    "page": page,
    "data": data,
    "timestamp": new Date()
  })
  .then(() => {
    return ok({ "body": { "tracked": true } });
  })
  .catch(() => {
    return ok({ "body": { "tracked": false } });
  });
}