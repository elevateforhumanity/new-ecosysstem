import React from 'react'

import { Mail, Phone, MapPin, Clock } from 'lucide-react'


export { Page }

function Page() {
  return (
    <>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-3">Contact Us</h1>
        <p className="text-xl text-gray-600 mb-8">
          Have questions? We're here to help you start your journey.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white border-2 border-gray-100 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">Get In Touch</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <a href="tel:+13175551234" className="text-blue-600 hover:text-blue-700">
                      (317) 555-1234
                    </a>
                    <p className="text-sm text-gray-600">Mon-Fri, 9am-5pm EST</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <a href="mailto:info@elevateforhumanity.org" className="text-blue-600 hover:text-blue-700">
                      info@elevateforhumanity.org
                    </a>
                    <p className="text-sm text-gray-600">We respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Location</h3>
                    <p className="text-gray-700">
                      Indianapolis, IN<br />
                      Marion County
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Office Hours</h3>
                    <p className="text-gray-700">
                      Monday - Friday: 9:00 AM - 5:00 PM<br />
                      Saturday - Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold mb-2">Quick Apply</h3>
              <p className="text-sm text-gray-700 mb-4">
                Ready to get started? Skip the contact form and apply directly.
              </p>
              <a href="/get-started">
                <button className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors">
                  Apply Now - FREE
                </button>
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white border-2 border-gray-100 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="(317) 555-1234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program Interest
                </label>
                <select className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none">
                  <option value="">Select a program...</option>
                  <option value="construction">Construction Pre-Apprenticeship</option>
                  <option value="phlebotomy">Phlebotomy Technician</option>
                  <option value="cdl">CDL Truck Driving</option>
                  <option value="cpr">CPR Instructor</option>
                  <option value="drug-testing">Drug Testing Collector</option>
                  <option value="financial">Financial Literacy Coach</option>
                  <option value="other">Other / General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Tell us how we can help..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Quick Links */}
        <div className="bg-gray-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { q: 'Are programs really free?', a: 'Yes, 100% free for eligible Marion County residents.' },
              { q: 'How long are programs?', a: 'Programs range from 2-16 weeks depending on the field.' },
              { q: 'Do I need experience?', a: 'No prior experience required. We train from the ground up.' },
              { q: 'Will I get a job?', a: '92% of our graduates secure employment in their field.' },
            ].map((faq) => (
              <div key={faq.q} className="bg-white p-4 rounded-lg border-2 border-gray-100">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <a href="/programs" className="text-blue-600 font-semibold hover:text-blue-700">
              View All Programs →
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

