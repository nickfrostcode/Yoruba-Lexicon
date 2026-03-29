import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Book, Users, ShieldCheck, ArrowRight } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 md:pt-32 md:pb-48">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block px-4 py-1.5 mb-6 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-bold uppercase tracking-widest"
            >
              The Living Archive
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-8xl font-serif font-bold tracking-tight text-brand-ink mb-8 leading-[0.9]"
            >
              Preserving the <br />
              <span className="italic text-brand-orange">Yorùbá</span> Legacy
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-2xl mx-auto text-xl text-brand-ink/60 mb-12 leading-relaxed"
            >
              A collaborative digital space dedicated to documenting, preserving, and celebrating the linguistic depth of the Yorùbá language for generations to come.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6"
            >
              <Link to="/browse" className="btn-primary w-full sm:w-auto flex items-center justify-center space-x-2">
                <span>Explore Lexicon</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/dashboard" className="btn-secondary w-full sm:w-auto">
                Start Contributing
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl animate-pulse delay-700" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard
              icon={<Search size={32} className="text-brand-orange" />}
              title="Smart Search"
              description="Find words, meanings, and phonetic pronunciations with our intuitive search engine designed for Yorùbá diacritics."
            />
            <FeatureCard
              icon={<Users size={32} className="text-brand-orange" />}
              title="Community Driven"
              description="Every entry is contributed by native speakers and linguists, ensuring cultural accuracy and dialectal diversity."
            />
            <FeatureCard
              icon={<ShieldCheck size={32} className="text-brand-orange" />}
              title="Verified Accuracy"
              description="Our peer-review system ensures that every contribution meets high linguistic standards before being archived."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-brand-ink text-brand-cream overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-serif font-bold mb-8 leading-tight">
                Building the <br />
                <span className="text-brand-orange italic">Greatest Archive</span> <br />
                Together
              </h2>
              <p className="text-brand-cream/60 text-lg mb-12 leading-relaxed">
                Language is more than just words; it's the vessel of culture. By documenting the Yorùbá lexicon, we are preserving a worldview, a history, and a future.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-4xl font-bold text-brand-orange mb-2">12k+</div>
                  <div className="text-sm uppercase tracking-widest text-brand-cream/40 font-bold">Entries</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-brand-orange mb-2">3.5k+</div>
                  <div className="text-sm uppercase tracking-widest text-brand-cream/40 font-bold">Contributors</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-brand-cream/5 border border-brand-cream/10 p-8 flex items-center justify-center">
                <div className="text-center">
                  <Book size={120} className="text-brand-orange/20 mb-8 mx-auto" />
                  <p className="text-2xl font-serif italic text-brand-cream/80">
                    "Èdè Yorùbá kò ní parun."
                  </p>
                  <p className="mt-4 text-brand-cream/40 text-sm uppercase tracking-widest">
                    The Yorùbá language shall not perish.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-serif font-bold mb-8">Ready to contribute?</h2>
          <p className="text-xl text-brand-ink/60 mb-12">
            Join our community of linguists and speakers to help document the Yorùbá language.
          </p>
          <Link to="/auth" className="btn-primary text-lg px-12 py-4">
            Create an Account
          </Link>
        </div>
      </section>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="p-8 rounded-2xl border border-brand-ink/5 hover:border-brand-orange/20 transition-all hover:shadow-xl hover:shadow-brand-orange/5 group">
    <div className="mb-6 transform transition-transform group-hover:scale-110 duration-300">
      {icon}
    </div>
    <h3 className="text-2xl font-serif font-bold mb-4">{title}</h3>
    <p className="text-brand-ink/60 leading-relaxed">{description}</p>
  </div>
);
