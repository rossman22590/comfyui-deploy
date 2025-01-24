"use client";

import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

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
   4. MAIN PAGE: SUPPORTED MODELS & COMFYUI VERSIONS
   ------------------------------------------------------------------------- */
export default function SupportedModelsPage() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="min-h-screen w-full bg-gray-50 text-gray-900"
    >
      {/* Optional global style override */}
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
            Supported Models &amp; ComfyUI Versions
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Check out which AI models and ComfyUI releases work seamlessly
            with our Pixio API pipelines.
          </p>
          <GradientButton href="#details" className="w-48">
            See Details
          </GradientButton>
        </motion.div>
      </Section>

      {/* DETAILS SECTION */}
      <Section id="details" className="bg-white">
        <SectionHeading
          title="Compatibility Overview"
          subtitle="Stay up to date with the latest versions we support."
        />
        <motion.div variants={stagger} className="max-w-5xl mx-auto">
          {/* ComfyUI Versions Table */}
          <motion.div variants={fadeInUp} className="mb-12">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              ComfyUI Versions
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg shadow border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="px-4 py-2 text-left">Version</th>
                    <th className="px-4 py-2 text-left">Supported</th>
                    <th className="px-4 py-2 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Example Rows */}
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-3">v1.2.0</td>
                    <td className="px-4 py-3">
                      <CheckCircleIcon className="w-6 h-6 text-green-600 inline" />
                    </td>
                    <td className="px-4 py-3">
                      Stable release. Fully tested with Pixio API.
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-3">v1.3.1</td>
                    <td className="px-4 py-3">
                      <CheckCircleIcon className="w-6 h-6 text-green-600 inline" />
                    </td>
                    <td className="px-4 py-3">
                      Minor bug fixes—recommended upgrade for new pipelines.
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-3">v1.4.0</td>
                    <td className="px-4 py-3">
                      <XCircleIcon className="w-6 h-6 text-red-600 inline" />
                    </td>
                    <td className="px-4 py-3 text-red-500">
                      Known compatibility issues. Not recommended.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Models Table */}
          <motion.div variants={fadeInUp}>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Models</h3>
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg shadow border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="px-4 py-2 text-left">Model Name</th>
                    <th className="px-4 py-2 text-left">Supported</th>
                    <th className="px-4 py-2 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Example Rows */}
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-3">Stable Diffusion v1.5</td>
                    <td className="px-4 py-3">
                      <CheckCircleIcon className="w-6 h-6 text-green-600 inline" />
                    </td>
                    <td className="px-4 py-3">
                      Most popular for high-quality image generation.
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-3">Stable Diffusion v2.1</td>
                    <td className="px-4 py-3">
                      <CheckCircleIcon className="w-6 h-6 text-green-600 inline" />
                    </td>
                    <td className="px-4 py-3">
                      Enhanced upscaling and better detail in complex scenes.
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-3">Stable DIffusion XL</td>
                    <td className="px-4 py-3">
                      <XCircleIcon className="w-6 h-6 text-red-600 inline" />
                    </td>
                    <td className="px-4 py-3 text-red-500">
                      Not yet integrated with Pixio pipelines.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </Section>

      {/* FINAL CTA SECTION */}
      <Section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center">
        <motion.div variants={fadeInUp} className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Need More Info?</h2>
          <p className="text-xl text-gray-100 mb-6">
            Reach out to our team for detailed integration guides, 
            or to request support for additional models.
          </p>
          <GradientButton href="/contact" className="w-48">
            Contact Us
          </GradientButton>
        </motion.div>
      </Section>
    </motion.div>
  );
}
