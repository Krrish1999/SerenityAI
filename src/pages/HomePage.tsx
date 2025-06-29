import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Heart, Brain, Calendar, BookOpen, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const HomePage: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-teal-500 text-white py-20 rounded-lg relative">
        <a href="https://bolt.new/" target="_blank" className="absolute top-4 right-4 w-16 h-16 md:w-20 md:h-20">
          <img src="/white_circle_360x360.png" alt="Powered by Bolt.new" className="w-full h-full" />
        </a>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Your Journey to Mental Wellness Starts Here</h1>
          <p className="text-lg md:text-xl mb-8">
            Connect with professional therapists, track your mental health, and access personalized resources to support your wellbeing.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg"
              variant="primary" 
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => {}}
            >
              Get Started
            </Button>
            <Button 
              size="lg"
              variant="outline" 
              className="border-white text-white hover:bg-white/10"
              onClick={() => {}}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How MindWell Helps You</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-transform hover:scale-105">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 w-12 h-12 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Journal Your Thoughts</h3>
              <p className="text-gray-600 mb-4">Track your emotions and thoughts with our digital journal to gain insight into your mental health patterns.</p>
              <Link to="/login" className="text-blue-600 font-medium flex items-center hover:underline">
                Start journaling <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-transform hover:scale-105">
              <div className="p-3 rounded-full bg-teal-100 text-teal-600 w-12 h-12 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Connect with Therapists</h3>
              <p className="text-gray-600 mb-4">Find and connect with licensed therapists who specialize in your specific needs and concerns.</p>
              <Link to="/login" className="text-teal-600 font-medium flex items-center hover:underline">
                Find a therapist <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-transform hover:scale-105">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 w-12 h-12 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Wellness Resources</h3>
              <p className="text-gray-600 mb-4">Access a library of evidence-based resources, articles, and exercises to support your mental health.</p>
              <Link to="/login" className="text-purple-600 font-medium flex items-center hover:underline">
                Explore resources <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50 rounded-lg">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What Our Users Say</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <img 
                  src="https://randomuser.me/api/portraits/women/32.jpg" 
                  alt="Sarah J."
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="text-lg font-medium">Sarah J.</h4>
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg key={star} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "MindWell has been instrumental in my mental health journey. The journal feature helps me track patterns in my mood, and my therapist can see my progress. It's made a world of difference."
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <img 
                  src="https://randomuser.me/api/portraits/men/57.jpg" 
                  alt="Michael T."
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="text-lg font-medium">Michael T.</h4>
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg key={star} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Finding the right therapist was always a challenge until I discovered MindWell. The platform made it easy to connect with someone who truly understands my needs. I've made incredible progress."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Your Wellness Journey?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of others who've taken control of their mental health with MindWell.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup">
              <Button size="lg">Create Free Account</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">Sign In</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};