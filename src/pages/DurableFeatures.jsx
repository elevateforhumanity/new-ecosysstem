import React from 'react';

export default function DurableFeatures() {
  const features = [
    {
      title: 'Interactive Learning',
      description: 'Engage with hands-on exercises and real-world projects',
      icon: '🎮'
    },
    {
      title: 'Expert Instructors',
      description: 'Learn from industry professionals with years of experience',
      icon: '👨‍🏫'
    },
    {
      title: 'Flexible Schedule',
      description: 'Study at your own pace, anytime and anywhere',
      icon: '⏰'
    },
    {
      title: 'Certificates',
      description: 'Earn recognized certificates upon course completion',
      icon: '🎓'
    },
    {
      title: 'Community Support',
      description: 'Connect with peers and mentors in our learning community',
      icon: '👥'
    },
    {
      title: 'Career Services',
      description: 'Get job placement assistance and career guidance',
      icon: '💼'
    }
  ];

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-brand-text mb-4">
            Platform Features
          </h1>
          <p className="text-xl text-brand-text-muted max-w-2xl mx-auto">
            Everything you need to succeed in your learning journey
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-8 border-2 border-brand-border rounded-xl hover:border-indigo-500 transition">
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-brand-text-muted">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
