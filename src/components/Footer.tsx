import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-ink text-brand-cream py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-serif font-bold text-brand-orange mb-6">Yorùbá Lexicon</h2>
            <p className="text-brand-cream/60 max-w-md leading-relaxed">
              Preserving the richness of the Yorùbá language through community-driven documentation and digital archiving. Join us in building the most comprehensive Yorùbá lexicon.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-orange mb-6">Platform</h3>
            <ul className="space-y-4">
              <li><Link to="/browse" className="text-brand-cream/60 hover:text-brand-cream transition-colors">Browse Archive</Link></li>
              <li><Link to="/dashboard" className="text-brand-cream/60 hover:text-brand-cream transition-colors">Contribute</Link></li>
              <li><Link to="/auth" className="text-brand-cream/60 hover:text-brand-cream transition-colors">Sign In</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-orange mb-6">Connect</h3>
            <div className="flex space-x-6">
              <a href="#" className="text-brand-cream/60 hover:text-brand-cream transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-brand-cream/60 hover:text-brand-cream transition-colors"><Github size={20} /></a>
              <a href="#" className="text-brand-cream/60 hover:text-brand-cream transition-colors"><Mail size={20} /></a>
            </div>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-brand-cream/10 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-brand-cream/40">
            © {new Date().getFullYear()} Yorùbá Lexicon Project. All rights reserved.
          </p>
          <div className="flex space-x-8 text-sm text-brand-cream/40">
            <a href="#" className="hover:text-brand-cream transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand-cream transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
