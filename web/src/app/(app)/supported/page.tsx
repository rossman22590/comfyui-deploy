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

const backgroundScale = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

/* -------------------------------------------------------------------------
   3. REUSABLE COMPONENTS
------------------------------------------------------------------------- */

// Copies text to clipboard
const handleCopy = (text: string) => {
  navigator.clipboard
    .writeText(text)
    .then(() => alert(`Copied:\n\n${text}`))
    .catch(() => alert("Failed to copy. Please try again!"));
};

/** Wraps each section in consistent style/animation */
function Section({ children, className = "", id }: SectionProps) {
  return (
    <motion.section
      id={id}
      variants={backgroundScale}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className={`py-20 px-4 md:px-6 lg:px-24 w-full ${className}`}
    >
      {children}
    </motion.section>
  );
}

/** Section heading with optional subtitle */
function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <motion.div variants={fadeInUp} className="mb-10 text-center max-w-3xl mx-auto">
      <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800 drop-shadow-sm">
        {title}
      </h2>
      {subtitle && (
        <p className="text-xl text-gray-500 leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

/** Shiny gradient button for CTAs or external links */
function GradientButton({ href = "#", children, className = "" }: GradientButtonProps) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.05, backgroundPosition: "100% 50%" }}
      whileTap={{ scale: 0.95 }}
      className={`relative inline-flex items-center justify-center px-6 py-3 
        text-lg font-bold text-white rounded-md overflow-hidden
        bg-gradient-to-r from-pink-600 to-purple-600 bg-[length:200%_200%]
        bg-left-bottom transition-all duration-500
        shadow-md hover:shadow-lg no-underline ${className}`}
    >
      {children}
    </motion.a>
  );
}

/** A pill-shaped gradient link for model references */
function PillLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center px-3 py-1 text-sm font-medium
                 text-white bg-gradient-to-r from-pink-600 to-purple-600
                 rounded-full shadow hover:opacity-80 transition-opacity"
    >
      Link
    </a>
  );
}

/* -------------------------------------------------------------------------
   4. MAIN PAGE
-------------------------------------------------------------------------*/

// Machine Creation API setup JSON
const machineCreationConfig = `{
  "comfyui": "b9d9bcba1418711f13d7e432605f85303d900723",
  "git_custom_nodes": {
    "https://github.com/rossman22590/comfyui-deploy.git": {
      "hash": "2dbb2d9de0514406b0fd181aa1b0fa53c78b30fb",
      "disabled": false
    }
  },
  "file_custom_nodes": []
}`;

// Custom Model API JSON
const customModelApiJSON = `[
  {
    "name": "v1-5-pruned-emaonly.ckpt",
    "type": "checkpoints",
    "base": "SD1.5",
    "save_path": "default",
    "description": "Stable Diffusion 1.5 base model",
    "reference": "https://huggingface.co/runwayml/stable-diffusion-v1-5",
    "filename": "v1-5-pruned-emaonly.ckpt",
    "url": "https://huggingface.co/runwayml/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly.ckpt"
  }
]`;

export default function SupportedModelsPage() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-white text-gray-900 overflow-x-hidden"
    >
      <style jsx global>{`
        .px-6 {
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
      `}</style>

      {/* HERO SECTION */}
      <Section className="bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 text-center">
        <motion.div variants={fadeInUp} className="max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 mb-6 drop-shadow-sm">
            Supported Models &amp; ComfyUI Versions
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Check out which AI models and ComfyUI releases work with our Pixio API pipelines.
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
          {/* COMFYUI VERSIONS */}
          <motion.div variants={fadeInUp} className="mb-12">
            <h3 className="text-2xl font-bold mb-4 text-gray-800 drop-shadow-sm">
              ComfyUI Versions
            </h3>
            <table className="w-full bg-white rounded-lg shadow border border-gray-200 overflow-visible">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="px-4 py-2 text-left">Version / Hash</th>
                  <th className="px-4 py-2 text-left">Supported</th>
                  <th className="px-4 py-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="relative group cursor-pointer inline-block">
                      <span
                        onClick={() =>
                          handleCopy("b9d9bcba1418711f13d7e432605f85303d900723")
                        }
                        className="text-blue-600"
                      >
                        Hash 0723
                      </span>
                      {/* Tooltip: displays full hash on hover */}
                      <div
                        className="absolute bottom-0 left-0 transform translate-y-full mt-1 px-2 py-1
                                   bg-gray-800 text-white text-xs rounded shadow-lg opacity-0
                                   group-hover:opacity-100 transition-opacity w-max z-50"
                      >
                        b9d9bcba1418711f13d7e432605f85303d900723
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 inline" />
                  </td>
                  <td className="px-4 py-3">Pixio tested this exact commit hash.</td>
                </tr>

                <tr className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="relative group cursor-pointer inline-block">
                      <span
                        onClick={() =>
                          handleCopy("851bc33d3adffffcbb1122e765a498z13999d3ad")
                        }
                        className="text-blue-600"
                      >
                        v1.2.5 d3ad
                      </span>
                      <div
                        className="absolute bottom-0 left-0 transform translate-y-full mt-1 px-2 py-1 
                                   bg-gray-800 text-white text-xs rounded shadow-lg opacity-0
                                   group-hover:opacity-100 transition-opacity w-max z-50"
                      >
                        851bc33d3adffffcbb1122e765a498z13999d3ad
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 inline" />
                  </td>
                  <td className="px-4 py-3">Stable hotfix version.</td>
                </tr>

                <tr className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="relative group cursor-pointer inline-block">
                      <span
                        onClick={() =>
                          handleCopy("12abcd34ef5678abcd90ab12ef3456abcd7890ab")
                        }
                        className="text-blue-600"
                      >
                        v1.2.9 ab12
                      </span>
                      <div
                        className="absolute bottom-0 left-0 transform translate-y-full mt-1 px-2 py-1
                                   bg-gray-800 text-white text-xs rounded shadow-lg opacity-0
                                   group-hover:opacity-100 transition-opacity w-max z-50"
                      >
                        12abcd34ef5678abcd90ab12ef3456abcd7890ab
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 inline" />
                  </td>
                  <td className="px-4 py-3">
                    Performance improvements for style transfer nodes.
                  </td>
                </tr>

                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="relative group cursor-pointer inline-block">
                      <span
                        onClick={() =>
                          handleCopy("99cafecafecafefeeddeadbeaf65676bebacafe")
                        }
                        className="text-blue-600"
                      >
                        v1.5.2 cafe
                      </span>
                      <div
                        className="absolute bottom-0 left-0 transform translate-y-full mt-1 px-2 py-1 
                                   bg-gray-800 text-white text-xs rounded shadow-lg opacity-0
                                   group-hover:opacity-100 transition-opacity w-max z-50"
                      >
                        99cafecafecafefeeddeadbeaf65676bebacafe
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 inline" />
                  </td>
                  <td className="px-4 py-3">Experimental branch validated internally.</td>
                </tr>
              </tbody>
            </table>
          </motion.div>

          {/* MODELS TABLE */}
          <motion.div variants={fadeInUp} className="mb-12">
            <h3 className="text-2xl font-bold mb-4 text-gray-800 drop-shadow-sm">
              Models
            </h3>
            <table className="w-full bg-white rounded-lg shadow border border-gray-200 overflow-visible">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="px-4 py-2 text-left">Model Name</th>
                  <th className="px-4 py-2 text-left">Supported</th>
                  <th className="px-4 py-2 text-left">Notes</th>
                  <th className="px-4 py-2 text-left">Links</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">Stable Diffusion v1.5</td>
                  <td className="px-4 py-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 inline" />
                  </td>
                  <td className="px-4 py-3">High-quality image generation.</td>
                  <td className="px-4 py-3">
                    <PillLink href="https://huggingface.co/runwayml/stable-diffusion-v1-5" />
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">Stable Diffusion XL</td>
                  <td className="px-4 py-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 inline" />
                  </td>
                  <td className="px-4 py-3">Enhanced upscaling, better details.</td>
                  <td className="px-4 py-3">
                    <PillLink href="https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0" />
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">Stable Diffusion v2</td>
                  <td className="px-4 py-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 inline" />
                  </td>
                  <td className="px-4 py-3">Enhanced detail in complex scenes.</td>
                  <td className="px-4 py-3">
                    <PillLink href="https://huggingface.co/stabilityai/stable-diffusion-2" />
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">Stable Diffusion v3</td>
                  <td className="px-4 py-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 inline" />
                  </td>
                  <td className="px-4 py-3">Further enhancements (beta).</td>
                  <td className="px-4 py-3">
                    <PillLink href="#" />
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">Flux</td>
                  <td className="px-4 py-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 inline" />
                  </td>
                  <td className="px-4 py-3">Great for stylized art.</td>
                  <td className="px-4 py-3">
                    <PillLink href="#" />
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">Flux Tools</td>
                  <td className="px-4 py-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 inline" />
                  </td>
                  <td className="px-4 py-3">LoRA-based extension.</td>
                  <td className="px-4 py-3">
                    <PillLink href="#" />
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">Hayuan</td>
                  <td className="px-4 py-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 inline" />
                  </td>
                  <td className="px-4 py-3">High complexity, surreal styles.</td>
                  <td className="px-4 py-3">
                    <PillLink href="#" />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">Dreambooth</td>
                  <td className="px-4 py-3">
                    <XCircleIcon className="w-6 h-6 text-red-600 inline" />
                  </td>
                  <td className="px-4 py-3 text-red-500">Not yet integrated.</td>
                  <td className="px-4 py-3">
                    <PillLink href="#" />
                  </td>
                </tr>
              </tbody>
            </table>
          </motion.div>

          {/* HUGGING FACE MODELS */}
          <motion.div variants={fadeInUp}>
            <h3 className="text-2xl font-bold mb-4 text-gray-800 drop-shadow-sm">
              Hugging Face Models
            </h3>
            <table className="w-full bg-white rounded-lg shadow border border-gray-200 overflow-visible">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="px-4 py-2 text-left">Model Name</th>
                  <th className="px-4 py-2 text-left">Supported</th>
                  <th className="px-4 py-2 text-left">Notes</th>
                  <th className="px-4 py-2 text-left">Links</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">GPT-2</td>
                  <td className="px-4 py-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 inline" />
                  </td>
                  <td className="px-4 py-3">Basic text generation model.</td>
                  <td className="px-4 py-3">
                    <PillLink href="https://huggingface.co/gpt2" />
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">BERT</td>
                  <td className="px-4 py-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 inline" />
                  </td>
                  <td className="px-4 py-3">Popular NLP model for many tasks.</td>
                  <td className="px-4 py-3">
                    <PillLink href="https://huggingface.co/bert-base-uncased" />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">BLOOM</td>
                  <td className="px-4 py-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 inline" />
                  </td>
                  <td className="px-4 py-3">Open large multilingual model.</td>
                  <td className="px-4 py-3">
                    <PillLink href="https://huggingface.co/bigscience/bloom" />
                  </td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        </motion.div>
      </Section>

      {/* MACHINE CREATION API SETUP */}
      <Section className="bg-white">
        <motion.div variants={fadeInUp} className="max-w-5xl mx-auto">
          <SectionHeading
            title="Machine Creation API Setup"
            subtitle="Here is the recommended JSON configuration for your ComfyUI environment."
          />
          <div className="relative bg-gray-900 rounded-lg p-4 text-white overflow-auto">
            <button
              onClick={() => handleCopy(machineCreationConfig)}
              className="absolute top-3 right-3 bg-gray-700 hover:bg-gray-600 transition-colors rounded-md px-3 py-1 text-sm"
            >
              Copy Code
            </button>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed">
              <code>{machineCreationConfig}</code>
            </pre>
          </div>
        </motion.div>
      </Section>

      {/* CUSTOM MODEL API JSON */}
      <Section className="bg-white">
        <motion.div variants={fadeInUp} className="max-w-5xl mx-auto">
          <SectionHeading
            title="Custom Model API JSON"
            subtitle="Define your custom model details for streamlined usage."
          />
          <div className="relative bg-gray-900 rounded-lg p-4 text-white overflow-auto">
            <button
              onClick={() => handleCopy(customModelApiJSON)}
              className="absolute top-3 right-3 bg-gray-700 hover:bg-gray-600 transition-colors rounded-md px-3 py-1 text-sm"
            >
              Copy Code
            </button>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed">
              <code>{customModelApiJSON}</code>
            </pre>
          </div>
        </motion.div>
      </Section>

{/* SDK SECTION */}
<Section className="bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 text-center">
  <SectionHeading
    title="Available SDKs"
    subtitle="Start integrating Pixio into your own apps in minutes."
  />
  <motion.div
    variants={fadeInUp}
    className="max-w-4xl mx-auto text-center flex flex-col items-center"
  >
    <p className="text-lg mb-6 sm:px-8 text-black">
      We currently provide first-class SDKs for popular frameworks.
      Getting started is as simple as installing our package and calling a few intuitive methods.
    </p>
    <div className="flex flex-col gap-4"> {/* Added this wrapper div with gap */}
      <GradientButton
        href="https://github.com/rossman22590/comfydeploy-fullstack-demo"
        className="w-64"
      >
        Full Stack Next.js App
      </GradientButton>
      <GradientButton
        href="https://github.com/rossman22590/pixio-api-nextjs"
        className="w-64"
      >
        Next.js SDK
      </GradientButton>
    </div>
    <p className="mt-4 text-black">
      <em>More SDKs coming soon...</em>
    </p>
  </motion.div>
</Section>

    </motion.div>
  );
}
