"use client";

import React, { ReactNode } from "react";
import { motion } from "framer-motion";

/* -------------------------------------------------------------------------
   1. TYPES & INTERFACES
   ------------------------------------------------------------------------- */
interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
}

interface InfoCardProps {
  title: string;
  text: string;
  icon: ReactNode;
}

interface TestimonialProps {
  name: string;
  title: string;
  message: string;
  avatar: string;
}

interface GradientButtonProps {
  href?: string;
  className?: string;
  children: ReactNode;
}

/* -------------------------------------------------------------------------
   2. ANIMATION VARIANTS
   ------------------------------------------------------------------------- */
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

/* -------------------------------------------------------------------------
   3. REUSABLE COMPONENTS
   ------------------------------------------------------------------------- */

/** Simple container for consistent spacing/style */
function Section({ children, className = "", id }: SectionProps) {
  return (
    <section
      id={id}
      className={`py-20 px-4 md:px-6 lg:px-24 w-full ${className}`}
    >
      {children}
    </section>
  );
}

/** Cleanly styled heading that animates in */
function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <motion.div
      variants={fadeInUp}
      className="mb-10 text-center max-w-3xl mx-auto"
    >
      <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
        {title}
      </h2>
      {subtitle && (
        <p className="text-xl text-gray-500 leading-relaxed">{subtitle}</p>
      )}
    </motion.div>
  );
}

/** Animated card (Team, History, etc.) */
function InfoCard({ title, text, icon }: InfoCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center mb-4">
        <div className="mr-4 text-blue-600">{icon}</div>
        <h4 className="text-xl font-semibold text-gray-800">{title}</h4>
      </div>
      <p className="text-gray-600">{text}</p>
    </motion.div>
  );
}

/** Simple testimonial block */
function Testimonial({ name, title, message, avatar }: TestimonialProps) {
  return (
    <motion.div
      variants={fadeInUp}
      className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center"
    >
      <img
        src={avatar}
        alt={name}
        className="w-16 h-16 rounded-full mb-4 object-cover"
      />
      <blockquote className="text-gray-600 italic mb-4">“{message}”</blockquote>
      <div className="font-semibold text-gray-800">{name}</div>
      <div className="text-sm text-gray-400">{title}</div>
    </motion.div>
  );
}

/** Gradient-styled call-to-action button */
function GradientButton({ href = "#", children, className = "" }: GradientButtonProps) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative inline-flex items-center justify-center px-6 py-3 
        text-lg font-bold text-white rounded-md overflow-hidden
        bg-gradient-to-r from-purple-600 to-blue-600 
        no-underline shadow-md hover:shadow-lg ${className}`}
    >
      {children}
    </motion.a>
  );
}

/* -------------------------------------------------------------------------
   4. MAIN ABOUT PAGE (Pixio API Focus)
   ------------------------------------------------------------------------- */
export default function AboutPage() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="min-h-screen w-full bg-gray-50 text-gray-900"
    >
      {/* Global style override */}
      <style jsx global>{`
        .px-6 {
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
      `}</style>

      {/* HERO SECTION */}
      <Section className="bg-gradient-to-r from-purple-100 to-blue-100 text-center">
        <motion.div variants={fadeInUp} className="max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 mb-6">
            About the Pixio API
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            The simplest way to build and orchestrate your creative AI pipelines.
          </p>
          <GradientButton href="#story">Learn Our Story</GradientButton>
        </motion.div>
      </Section>

      {/* OUR MISSION SECTION */}
      <Section>
        <SectionHeading
          title="Why Pixio API?"
          subtitle="Empowering developers, creators, and teams to integrate AI seamlessly."
        />
        <motion.div
          variants={stagger}
          className="max-w-4xl mx-auto text-center text-xl text-gray-700 leading-relaxed"
        >
          <motion.p variants={fadeInUp} className="mb-6">
            Whether you're designing a next-gen application or building out
            creative workflows, Pixio API makes it easy to integrate cutting-edge
            AI features like image generation, style transfer, video synthesis,
            and more—all from a single, intuitive interface.
          </motion.p>
          <motion.p variants={fadeInUp}>
            We believe in bringing powerful tools to everyone, simplifying the
            creation of stunning visuals and interactive experiences, without
            complex overhead.
          </motion.p>
        </motion.div>
      </Section>

      {/* OUR STORY SECTION */}
      <Section className="bg-white" id="story">
        <SectionHeading
          title="Our Journey"
          subtitle="From a tiny prototype to a global AI platform"
        />
        <motion.div
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          <InfoCard
            icon={<span className="text-2xl">🚀</span>}
            title="Tiny Beginnings"
            text="Pixio started as a small internal prototype for managing art pipelines.
                  We quickly realized the need for a developer-friendly API that
                  could power a wide range of creative projects."
          />
          <InfoCard
            icon={<span className="text-2xl">⚙️</span>}
            title="Building Pipelines"
            text="With user feedback at our core, we crafted a flexible system that
                  allows developers to chain AI operations—like transforming images,
                  video editing, and more—seamlessly into their own apps."
          />
          <InfoCard
            icon={<span className="text-2xl">🌎</span>}
            title="Global Growth"
            text="Our community now spans designers, startups, and enterprise teams
                  around the globe. Pixio API is constantly evolving to meet
                  the ever-changing landscape of creative AI."
          />
        </motion.div>
      </Section>

      {/* TEAM SECTION */}
      <Section id="team">
        <SectionHeading
          title="Meet the Core Team"
          subtitle="Dedicated to pushing the boundaries of creative AI"
        />
        <motion.div
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          <InfoCard
            icon={<span className="text-2xl">👩‍💻</span>}
            title="Sarah - CEO"
            text="Sarah leads the overall strategy and ensures that Pixio remains user-centric,
                  leveraging her background in product development and machine learning."
          />
          <InfoCard
            icon={<span className="text-2xl">🧑‍🎨</span>}
            title="Mike - Design Chief"
            text="Mike spearheads all design efforts. From the developer console to marketing
                  assets, he makes sure every interaction reflects our AI-forward vision."
          />
          <InfoCard
            icon={<span className="text-2xl">🤖</span>}
            title="Alex - Lead Engineer"
            text="The mind behind our pipeline architecture. Alex’s expertise in distributed
                  computing and AI ensures Pixio scales for any creative challenge."
          />
        </motion.div>
      </Section>

      {/* TESTIMONIALS SECTION */}
      <Section className="bg-gray-100">
        <SectionHeading
          title="What Our Users Say"
          subtitle="Hear from those building AI pipelines with Pixio"
        />
        <motion.div
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          <Testimonial
            name="Alice Smith"
            title="App Developer"
            message="Integrating Pixio into my workflow was a breeze. It saved me months of
                     development time and now I can focus on creating user experiences,
                     not wrangling AI models."
            avatar="https://randomuser.me/api/portraits/women/68.jpg"
          />
          <Testimonial
            name="John Davis"
            title="Product Manager"
            message="Our marketing team’s creative pipeline is now fully automated with Pixio.
                     We produce stunning visuals for campaigns in record time."
            avatar="https://randomuser.me/api/portraits/men/46.jpg"
          />
          <Testimonial
            name="Emily Yang"
            title="Freelance Illustrator"
            message="Pixio gave me superpowers. I can add AI-driven effects to my artworks
                     and quickly experiment with styles for my clients."
            avatar="https://randomuser.me/api/portraits/women/89.jpg"
          />
        </motion.div>
      </Section>

      {/* FINAL CTA SECTION */}
      <Section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center">
        <motion.div variants={fadeInUp} className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Build Your Pipeline?
          </h2>
          <p className="text-xl text-gray-100 mb-6">
            Discover how Pixio API can power your creative workflows,
            unlocking possibilities in record time.
          </p>
          <GradientButton href="/contact">Contact Us</GradientButton>
        </motion.div>
      </Section>
    </motion.div>
  );
}
