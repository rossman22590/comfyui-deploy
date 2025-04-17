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
    <motion.div variants={fadeInUp} className="mb-10 text-center max-w-3xl mx-auto">
      <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">{title}</h2>
      {subtitle && (
        <p className="text-xl text-gray-500 leading-relaxed">{subtitle}</p>
      )}
    </motion.div>
  );
}

/** Animated card (e.g. for story, reasons, etc.) */
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

/** Gradient-styled call-to-action button */
function GradientButton({ href = "#", children, className = "" }: GradientButtonProps) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative inline-flex items-center justify-center px-6 py-3 
        text-lg font-bold text-white rounded-md overflow-hidden
        bg-gradient-to-r from-pink-600 to-purple-600 
        no-underline shadow-md hover:shadow-lg ${className}`}
    >
      {children}
    </motion.a>
  );
}

/* -------------------------------------------------------------------------
   4. MAIN ABOUT PAGE (Pixio API + ComfyUI + Screenshot Section)
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
          <GradientButton href="#story" className="w-48">Our Journey</GradientButton>
        </motion.div>
      </Section>

      {/* NEW COMFYUI SCREENSHOT SECTION */}
      <Section className="bg-white">
        <SectionHeading
          title="A Quick Look at ComfyUI"
          subtitle="Visual node-based workflows for powerful creative pipelines"
        />
        <motion.div variants={fadeInUp} className="max-w-4xl mx-auto text-center">
          <img
            src="https://pixiomedia.nyc3.digitaloceanspaces.com/uploads/1737669323424-1c7c4e0b-2037-4cbc-992c-e94f9debe647.png"
            alt="ComfyUI Screenshot"
            className="rounded-lg shadow-lg mx-auto"
          />
          <p className="mt-6 text-lg text-gray-700 leading-relaxed">
            ComfyUI provides a visual, node-based environment to chain AI operations together.
            It helps you see the flow of data through each step of your pipeline, making
            complex workflows easier to manage and debug.
          </p>
        </motion.div>
      </Section>

      {/* WHY PIXIO SECTION */}
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
            Whether you're designing a next-gen application or building out creative
            workflows, Pixio API makes it easy to integrate cutting-edge AI features like
            image generation, style transfer, video synthesis, and more—all from a single,
            intuitive interface.
          </motion.p>
          <motion.p variants={fadeInUp}>
            We believe in bringing powerful tools to everyone, simplifying the creation
            of stunning visuals and interactive experiences—without complex overhead.
          </motion.p>
        </motion.div>
      </Section>

      {/* OUR JOURNEY SECTION */}
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
            text="Pixio started as a small internal prototype for managing AI art pipelines.
                  We quickly realized the need for a developer-friendly API that
                  could power a wide range of creative projects."
          />
          <InfoCard
            icon={<span className="text-2xl">⚙️</span>}
            title="Building Pipelines"
            text="With user feedback at our core, we crafted a flexible system that
                  allows developers to chain AI operations—like image transformations,
                  style transfers, and video editing—into cohesive creative workflows."
          />
          <InfoCard
            icon={<span className="text-2xl">🌎</span>}
            title="Global Growth"
            text="Our community now spans designers, startups, and enterprise teams 
                  around the globe. Pixio API evolves constantly to meet the shifting 
                  demands of creative AI."
          />
        </motion.div>
      </Section>

      {/* COMFYUI SECTION */}
      <Section>
        <SectionHeading
          title="Why We Chose ComfyUI"
          subtitle="Advanced control meets seamless integration."
        />
        <motion.div
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          <InfoCard
            icon={<span className="text-2xl">🔗</span>}
            title="Modular Architecture"
            text="ComfyUI’s node-based approach fits perfectly with our pipeline philosophy,
                  letting you link different AI operations for custom creative flows."
          />
          <InfoCard
            icon={<span className="text-2xl">✨</span>}
            title="Flexible & Extensible"
            text="ComfyUI can be extended with your own modules, ensuring you’re never 
                  limited by built-in features. You have the freedom to innovate."
          />
          <InfoCard
            icon={<span className="text-2xl">🚀</span>}
            title="High Performance"
            text="With ComfyUI under the hood, Pixio can tap into optimized GPU 
                  acceleration and advanced AI methods for lightning-fast results."
          />
        </motion.div>
      </Section>

      {/* FINAL CTA SECTION */}
      <Section className="bg-gradient-to-r from-purple-100 to-blue-100 text-center">
        <motion.div variants={fadeInUp} className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Build Your Pipeline?
          </h2>
          <p className="text-xl text-black-100 mb-6">
            Discover how Pixio API and ComfyUI can power your creative workflows,
            unlocking new possibilities in record time.
          </p>
          <GradientButton href="https://calendly.com/techinschools/pixio-api-onboarding" className="w-48">
            Contact Us
          </GradientButton>
        </motion.div>
      </Section>
    </motion.div>
  );
}
