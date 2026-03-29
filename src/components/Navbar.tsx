import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Search, BookOpen, LayoutDashboard, ShieldCheck, LogOut } from 'lucide-react';
import { supabase, Database } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'motion/react';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setRole(profileData?.role ?? 'user');
        setProfile(profileData);
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setRole(profileData?.role ?? 'user');
        setProfile(profileData);
      } else {
        setRole(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const navLinks = [
    { name: 'Browse', path: '/browse', icon: BookOpen },
  ];

  if (user) {
    navLinks.push({ name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard });
  }

  if (role === 'admin') {
    navLinks.push({ name: 'Admin', path: '/admin', icon: ShieldCheck });
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="sticky top-0 z-50 bg-brand-cream/80 backdrop-blur-md border-b border-brand-ink/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-serif font-bold text-brand-orange">Yorùbá Lexicon</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-brand-orange ${
                  location.pathname === link.path ? 'text-brand-orange' : 'text-brand-ink/70'
                }`}
              >
                <link.icon size={18} />
                <span>{link.name}</span>
              </Link>
            ))}
            {user ? (
              <button onClick={handleSignOut} className="btn-secondary py-2 px-5 text-sm flex items-center space-x-2">
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            ) : (
              <Link to="/auth" className="btn-primary py-2 px-5 text-sm flex items-center space-x-2">
                <User size={16} />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-brand-ink p-2 rounded-md hover:bg-brand-ink/5"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-brand-cream border-b border-brand-ink/5 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-3 py-4 rounded-xl text-base font-medium text-brand-ink/70 hover:bg-brand-ink/5 hover:text-brand-orange"
                >
                  <link.icon size={20} />
                  <span>{link.name}</span>
                </Link>
              ))}
              <div className="pt-4">
                {user ? (
                  <button
                    onClick={() => { setIsOpen(false); handleSignOut(); }}
                    className="btn-secondary w-full text-center flex items-center justify-center space-x-2 py-3 rounded-xl"
                  >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="btn-primary w-full text-center flex items-center justify-center space-x-2"
                  >
                    <User size={18} />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
