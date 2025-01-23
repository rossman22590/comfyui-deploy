"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { motion } from "framer-motion";
import {
  SparklesIcon,
  PaintBrushIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  CameraIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/outline";

/* ----------------------------------------------------------------------------
  TYPE DEFINITIONS
---------------------------------------------------------------------------- */
interface SectionProps {
  children: ReactNode;
  className?: string;
}

interface GradientButtonProps {
  children: ReactNode;
  primary?: boolean;
  href?: string;
  className?: string;
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
}

interface WorkflowStepProps {
  number: number;
  title: string;
  description: string;
}

interface ArtShowcaseProps {
  src: string;
  alt: string;
  type?: "image" | "video";
}

/* ----------------------------------------------------------------------------
  ANIMATION VARIANTS
---------------------------------------------------------------------------- */
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
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

/* ----------------------------------------------------------------------------
  REUSABLE COMPONENTS
---------------------------------------------------------------------------- */
function Section({ children, className = "" }: SectionProps) {
  return <section className={`py-20 w-full relative ${className}`}>{children}</section>;
}

/** 
 * Button with a subtle gradient background (when primary)
 * or a white outline (when not).
 */
function GradientButton({
  children,
  primary = false,
  href = "#",
  className = "",
}: GradientButtonProps) {
  return (
    <motion.a
      href={href}
      className={[
        "relative inline-flex items-center justify-center px-8 py-4 rounded-xl",
        "text-lg font-semibold overflow-hidden no-underline",
        primary ? "text-white" : "text-gray-700",
        className,
      ].join(" ")}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="relative z-10">{children}</span>
      <motion.div
        className={
          primary
            ? "absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600"
            : "absolute inset-0 bg-white border-2 border-gray-200"
        }
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      />
    </motion.a>
  );
}

/** 
 * Single feature card with an icon, title, and description.
 */
function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <motion.div
      className="group relative bg-white rounded-xl p-6 shadow-md 
                 hover:shadow-xl transition-shadow duration-300"
      whileHover={{ y: -4 }}
    >
      <div className="flex items-center mb-4">
        <div className="p-3 bg-purple-50 rounded-lg mr-4 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
      <span
        className="absolute inset-0 rounded-xl border-2 
                   border-transparent group-hover:border-purple-100
                   transition-colors"
        aria-hidden="true"
      />
    </motion.div>
  );
}

/**
 * Single step in the workflow process.
 */
function WorkflowStep({ number, title, description }: WorkflowStepProps) {
  return (
    <motion.div className="flex items-start" variants={fadeInUp}>
      <div
        className="flex-shrink-0 w-12 h-12 flex items-center justify-center 
                   bg-gradient-to-r from-purple-600 to-blue-600 
                   text-white rounded-full font-bold text-xl mr-6 shadow-md"
      >
        {number}
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-1">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
}

/**
 * Displays either an image or a video in a 16:9 aspect ratio card.
 */
function ArtShowcase({ src, alt, type = "image" }: ArtShowcaseProps) {
  return (
    <motion.div
      className="
        relative 
        rounded-lg 
        overflow-hidden 
        shadow-md 
        hover:shadow-xl 
        transition-all 
        duration-300 
        aspect-video
      "
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {type === "image" ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </motion.div>
  );
}

/* ----------------------------------------------------------------------------
  BACKGROUND ANIMATION FOR HERO
  Subtle swirling circles behind the Hero to add flair.
---------------------------------------------------------------------------- */
function HeroBackgroundAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute w-[50rem] h-[50rem] bg-purple-200 rounded-full blur-3xl opacity-40"
        style={{ top: "-20rem", left: "-20rem" }}
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 60,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute w-[40rem] h-[40rem] bg-blue-200 rounded-full blur-3xl opacity-30"
        style={{ bottom: "-15rem", right: "-15rem" }}
        animate={{ rotate: -360 }}
        transition={{
          repeat: Infinity,
          duration: 80,
          ease: "linear",
        }}
      />
    </div>
  );
}

/* ----------------------------------------------------------------------------
  MAIN PAGE COMPONENT
---------------------------------------------------------------------------- */
export default function AICreativeWorkflow() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features: FeatureCardProps[] = [
    {
      icon: <PaintBrushIcon className="w-6 h-6 text-purple-600" />,
      title: "AI-Powered Art Generation",
      description: "Create stunning artworks with state-of-the-art AI models.",
    },
    {
      icon: <VideoCameraIcon className="w-6 h-6 text-blue-600" />,
      title: "Video Synthesis",
      description: "Generate and edit videos using advanced AI techniques.",
    },
    {
      icon: <MusicalNoteIcon className="w-6 h-6 text-green-600" />,
      title: "Music Composition",
      description: "Compose original music tracks with AI assistance.",
    },
    {
      icon: <CameraIcon className="w-6 h-6 text-red-600" />,
      title: "Image Enhancement",
      description: "Upscale and improve image quality using AI algorithms.",
    },
    {
      icon: <SparklesIcon className="w-6 h-6 text-yellow-600" />,
      title: "Style Transfer",
      description: "Apply artistic styles to your images and videos.",
    },
    {
      icon: <CodeBracketIcon className="w-6 h-6 text-indigo-600" />,
      title: "Custom Workflows",
      description: "Create and deploy your own AI creative pipelines.",
    },
  ];

  const workflowSteps: WorkflowStepProps[] = [
    {
      number: 1,
      title: "Choose Your Medium",
      description: "Select from images, videos, or music as your creative canvas.",
    },
    {
      number: 2,
      title: "Set Parameters",
      description: "Adjust AI settings to guide the creative process.",
    },
    {
      number: 3,
      title: "Generate Content",
      description: "Let our powerful AI models bring your vision to life.",
    },
    {
      number: 4,
      title: "Refine and Iterate",
      description: "Fine-tune the results with our intuitive editing tools.",
    },
    {
      number: 5,
      title: "Export and Share",
      description: "Download your creations or share them directly to social media.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col w-full bg-gray-50 text-gray-900">
      {/* 
        --------------------------------------------------
        Hero Section (Full Width) w/ Animated Background
        --------------------------------------------------
      */}
      <Section className="bg-gradient-to-br from-purple-50 via-blue-50 to-blue-100 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Add swirling background effect */}
        <HeroBackgroundAnimation />

        <motion.div
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={stagger}
          className="relative z-10 w-full px-6"
        >
          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 leading-tight drop-shadow-lg"
          >
            AI-Powered Creative Workflows
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto"
          >
            Transform your ideas into stunning visuals, captivating videos, 
            and mesmerizing music with our AI-driven creative platform.
          </motion.p>
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <GradientButton primary href="/get-started">
              Start Creating
            </GradientButton>
            <GradientButton href="/demo">
              Watch Demo
            </GradientButton>
          </motion.div>
        </motion.div>
      </Section>

      {/* 
        --------------------------------------------------
        Features (Full Width)
        --------------------------------------------------
      */}
      <Section className="bg-white">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-center mb-12 px-6"
        >
          Unleash Your Creativity
        </motion.h2>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </Section>

      {/* 
        --------------------------------------------------
        Workflow (Full Width)
        --------------------------------------------------
      */}
      <Section className="bg-gray-50">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="w-full px-6"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-4xl font-bold text-center mb-12"
          >
            How It Works
          </motion.h2>
          <div className="flex flex-col space-y-10 mx-auto max-w-4xl">
            {workflowSteps.map((step, index) => (
              <WorkflowStep key={index} {...step} />
            ))}
          </div>
        </motion.div>
      </Section>

      {/* 
        --------------------------------------------------
        Showcase (Full Width)
        --------------------------------------------------
      */}
      <Section className="bg-white">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-center mb-12 px-6"
        >
          AI-Generated Masterpieces
        </motion.h2>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-6">
          <ArtShowcase
            src="https://pixiomedia.nyc3.digitaloceanspaces.com/uploads/1737608138715-image.png"
            alt="AI-generated abstract art"
          />
          <ArtShowcase
            src="https://pixiomedia.nyc3.digitaloceanspaces.com/uploads/1737608142907-image.jpg"
            alt="AI-generated landscape"
          />
          <ArtShowcase
            src="https://pixiomedia.nyc3.digitaloceanspaces.com/uploads/1737608166338-pixverse-317182365469952.mp4"
            alt="AI-generated video clip"
            type="video"
          />
          <ArtShowcase
            src="https://pixiomedia.nyc3.digitaloceanspaces.com/uploads/1737608185328-video-user1091-runwaymlrossmytsi.org-asset2e490a12-51e5-4086-9381-e0e711449868.mp4"
            alt="AI-generated video animation"
            type="video"
          />
          <ArtShowcase
            src="https://pixiomedia.nyc3.digitaloceanspaces.com/uploads/1737608189616-image.webp"
            alt="AI-generated artwork"
          />
          <ArtShowcase
            src="https://pixiomedia.nyc3.digitaloceanspaces.com/uploads/1737608206569-image.png"
            alt="AI-generated digital art"
          />
        </div>
      </Section>

      {/* 
        --------------------------------------------------
        Call to Action (Full Width)
        --------------------------------------------------
      */}
      <Section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="w-full px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold mb-6 leading-tight"
          >
            Ready to Revolutionize Your Creative Process?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl mb-8 text-gray-100 max-w-2xl mx-auto"
          >
            Join thousands of artists and creators harnessing the power of AI
            to push the boundaries of creativity.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GradientButton
              href="/signup"
              className="bg-white text-purple-600 hover:bg-gray-200"
            >
              Get Started for Free
            </GradientButton>
          </motion.div>
        </div>
      </Section>

      {/* 
        --------------------------------------------------
        Footer (Full Width)
        --------------------------------------------------
      */}
      <footer className="bg-gray-900 text-white pt-12 pb-8 w-full">
        <div className="w-full px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-4">AI Creative Studio</h3>
              <p className="text-gray-400">Empowering creativity with AI</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#features">Features</a>
                </li>
                <li>
                  <a href="#pricing">Pricing</a>
                </li>
                <li>
                  <a href="#tutorials">Tutorials</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#about">About</a>
                </li>
                <li>
                  <a href="#blog">Blog</a>
                </li>
                <li>
                  <a href="#careers">Careers</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#privacy">Privacy</a>
                </li>
                <li>
                  <a href="#terms">Terms</a>
                </li>
                <li>
                  <a href="#copyright">Copyright</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            © {new Date().getFullYear()} AI Creative Studio. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
