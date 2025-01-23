"use client";

import React, { ReactNode } from "react";
import { motion } from "framer-motion";

/* -------------------------------------------------------------------------
   1. TYPES & INTERFACES
   ------------------------------------------------------------------------- */
interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string; // allow passing an 'id' prop
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
   4. MAIN ABOUT PAGE
   ------------------------------------------------------------------------- */
export default function AboutPage() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="min-h-screen w-full bg-gray-50 text-gray-900"
    >
      {/* HERO SECTION */}
      <Section className="bg-gradient-to-r from-purple-100 to-blue-100 text-center">
        <motion.div variants={fadeInUp} className="max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 mb-6">
            About Our Company
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            We’re on a mission to transform how people create, collaborate,
            and innovate.
          </p>
          <GradientButton href="#team">Meet Our Team</GradientButton>
        </motion.div>
      </Section>

      {/* OUR MISSION SECTION */}
      <Section>
        <SectionHeading
          title="Our Mission"
          subtitle="Shaping a creative future for everyone."
        />
        <motion.div
          variants={stagger}
          className="max-w-4xl mx-auto text-center text-xl text-gray-700 leading-relaxed"
        >
          <motion.p variants={fadeInUp} className="mb-6">
            We believe technology should empower creators and dreamers—never
            hold them back. Our platform merges state-of-the-art AI with
            intuitive design, aiming to unleash human potential at scale.
          </motion.p>
          <motion.p variants={fadeInUp}>
            From the hobbyist doodler to the world-class marketing team, we want
            everyone to create faster, collaborate smarter, and innovate like
            never before.
          </motion.p>
        </motion.div>
      </Section>

      {/* OUR STORY SECTION */}
      <Section className="bg-white">
        <SectionHeading
          title="Our Story"
          subtitle="From a small garage to a global creative hub"
        />
        <motion.div
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          <InfoCard
            icon={<span className="text-2xl">🚀</span>}
            title="Humble Beginnings"
            text="We started as a tiny group of tech enthusiasts building AI prototypes in a garage. We quickly learned that creators needed a simpler, more efficient way to produce stunning content."
          />
          <InfoCard
            icon={<span className="text-2xl">🌎</span>}
            title="Global Reach"
            text="With a growing user base spanning 100+ countries, we strive to make AI-driven art and design accessible to anyone, anywhere—no matter your skill level."
          />
          <InfoCard
            icon={<span className="text-2xl">🔥</span>}
            title="Continual Innovation"
            text="We never stop iterating. Whether it’s launching new features or refining existing ones, we’re committed to pushing the boundaries of what's possible."
          />
        </motion.div>
      </Section>

      {/* TEAM SECTION */}
      <Section id="team">
        <SectionHeading
          title="Meet the Team"
          subtitle="A dynamic group of creators, technologists, and innovators"
        />
        <motion.div
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          <InfoCard
            icon={<span className="text-2xl">👩‍💻</span>}
            title="Sarah - CEO"
            text="Sarah leads the strategic vision and ensures our team has everything they need to succeed. A lifelong entrepreneur, she’s driven by a passion for creative tech."
          />
          <InfoCard
            icon={<span className="text-2xl">🧑‍🎨</span>}
            title="Mike - Lead Designer"
            text="Mike orchestrates the look and feel of our products. He believes in clean, user-friendly designs that spark joy and creativity."
          />
          <InfoCard
            icon={<span className="text-2xl">🤖</span>}
            title="Alex - AI Architect"
            text="With a PhD in Machine Learning, Alex is the brain behind our AI models—bringing cutting-edge research into real-world applications."
          />
        </motion.div>
      </Section>

      {/* TESTIMONIALS SECTION */}
      <Section className="bg-gray-100">
        <SectionHeading
          title="What Others Say"
          subtitle="Trusted by creatives and teams worldwide"
        />
        <motion.div
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          <Testimonial
            name="Alice Smith"
            title="Art Director"
            message="The team’s dedication to seamless AI integration has saved me countless hours on every project."
            avatar="https://randomuser.me/api/portraits/women/68.jpg"
          />
          <Testimonial
            name="John Davis"
            title="Product Manager"
            message="What started as a small trial ended up being our secret weapon for rapid marketing iterations."
            avatar="https://randomuser.me/api/portraits/men/46.jpg"
          />
          <Testimonial
            name="Emily Yang"
            title="Freelance Illustrator"
            message="I feel like I have a second brain helping me generate fresh concepts. The speed is incredible!"
            avatar="https://randomuser.me/api/portraits/women/89.jpg"
          />
        </motion.div>
      </Section>

      {/* FINAL CTA SECTION */}
      <Section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center">
        <motion.div variants={fadeInUp} className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Learn More?
          </h2>
          <p className="text-xl text-gray-100 mb-6">
            Discover how we can help you power up your creative workflows.
          </p>
          <GradientButton href="/contact">Contact Us</GradientButton>
        </motion.div>
      </Section>
    </motion.div>
  );
}
