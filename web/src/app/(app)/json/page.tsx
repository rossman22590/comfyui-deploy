"use client";

import React, { useState, ChangeEvent } from "react";
import { motion } from "framer-motion";

/* -------------------------------------------------------------------------
   1. ANIMATION VARIANTS & HELPER FUNCTIONS
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

/** Helper to copy text to clipboard */
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    alert(`Copied:\n\n${text}`);
  } catch {
    alert("Failed to copy. Please try again!");
  }
}

/* -------------------------------------------------------------------------
   2. REUSABLE COMPONENTS
------------------------------------------------------------------------- */
interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

function Section({ children, className = "", id }: SectionProps) {
  return (
    <motion.section
      id={id}
      variants={backgroundScale}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className={`py-16 px-4 md:px-6 lg:px-24 w-full ${className}`}
    >
      {children}
    </motion.section>
  );
}

interface GradientButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

function GradientButton({ onClick, children, className = "" }: GradientButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, backgroundPosition: "100% 50%" }}
      whileTap={{ scale: 0.95 }}
      className={`relative inline-flex items-center justify-center px-6 py-3 
        text-lg font-bold text-white rounded-md overflow-hidden
        bg-gradient-to-r from-pink-600 to-purple-600 bg-[length:200%_200%]
        bg-left-bottom transition-all duration-500
        shadow-md hover:shadow-lg no-underline border-0 cursor-pointer
        ${className}`}
    >
      {children}
    </motion.button>
  );
}

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
}

function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <motion.div variants={fadeInUp} className="mb-10 text-center max-w-3xl mx-auto">
      <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800 drop-shadow-sm">
        {title}
      </h2>
      {subtitle && (
        <p className="text-xl text-gray-500 leading-relaxed">{subtitle}</p>
      )}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------
   3. DEFINITIONS FOR OUR MODELS
-------------------------------------------------------------------------*/
type ModelEntry = {
  url: string;
  base: string;
  name: string;
  type: string;
  filename: string;
  reference: string;
  save_path: string;
  description: string;
};

const EMPTY_MODEL: ModelEntry = {
  url: "",
  base: "",
  name: "",
  type: "",
  filename: "",
  reference: "",
  save_path: "",
  description: "",
};

/* -------------------------------------------------------------------------
   4. MAIN: CUSTOM MODEL BUILDER PAGE
-------------------------------------------------------------------------*/
export default function MultiCustomModelBuilderPage() {
  const [models, setModels] = useState<ModelEntry[]>([ { ...EMPTY_MODEL } ]);

  // Handle changes for each model in the array
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => {
    const { name, value } = e.target;
    setModels((prev) => {
      const updated = [...prev];
      (updated[index] as any)[name] = value;
      return updated;
    });
  };

  // Add a new, empty model entry
  const handleAddModel = () => {
    setModels((prev) => [...prev, { ...EMPTY_MODEL }]);
  };

  // Final JSON (formatted) of all models
  const modelsJSON = JSON.stringify(models, null, 2);

  return (
    <motion.div
      className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-white text-gray-900 overflow-x-hidden"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      {/* Page Heading */}
      <Section className="bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100">
        <SectionHeading
          title="Multi-Model JSON Builder"
          subtitle="Fill out the fields below for each model you want to include."
        />
      </Section>

      {/* Form Section */}
      <Section>
        <div className="max-w-4xl mx-auto bg-white rounded-md shadow p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Enter Model Details
          </h3>

          {models.map((model, idx) => (
            <div
              key={idx}
              className="mb-8 border-b border-gray-200 pb-6 last:border-none last:pb-0"
            >
              <h4 className="font-semibold text-gray-600 text-lg mb-4">
                Model #{idx + 1}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={model.name}
                    onChange={(e) => handleChange(e, idx)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="ex: v1-5-pruned-emaonly.ckpt"
                  />
                </div>
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <input
                    type="text"
                    name="type"
                    value={model.type}
                    onChange={(e) => handleChange(e, idx)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="ex: checkpoints"
                  />
                </div>

                {/* Base */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base
                  </label>
                  <input
                    type="text"
                    name="base"
                    value={model.base}
                    onChange={(e) => handleChange(e, idx)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="ex: SD1.5"
                  />
                </div>
                {/* Save Path */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Save Path
                  </label>
                  <input
                    type="text"
                    name="save_path"
                    value={model.save_path}
                    onChange={(e) => handleChange(e, idx)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="ex: default"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={model.description}
                    onChange={(e) => handleChange(e, idx)}
                    rows={2}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="ex: Stable Diffusion 1.5 base model"
                  />
                </div>

                {/* Reference */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference URL
                  </label>
                  <input
                    type="text"
                    name="reference"
                    value={model.reference}
                    onChange={(e) => handleChange(e, idx)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="ex: https://huggingface.co/runwayml/stable-diffusion-v1-5"
                  />
                </div>

                {/* Filename */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filename
                  </label>
                  <input
                    type="text"
                    name="filename"
                    value={model.filename}
                    onChange={(e) => handleChange(e, idx)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="ex: v1-5-pruned-emaonly.ckpt"
                  />
                </div>

                {/* URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Download URL
                  </label>
                  <input
                    type="text"
                    name="url"
                    value={model.url}
                    onChange={(e) => handleChange(e, idx)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="ex: https://huggingface.co/.../file.ckpt"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Button to add a new model */}
          <GradientButton
            onClick={handleAddModel}
            className="mt-4 px-4 py-2 text-sm"
          >
            + Add Another Model
          </GradientButton>
        </div>
      </Section>

      {/* JSON Output Section */}
      <Section>
        <div className="max-w-5xl mx-auto">
          <div className="bg-gray-900 text-white p-4 rounded-md relative overflow-auto">
            <GradientButton
              onClick={() => copyToClipboard(modelsJSON)}
              className="absolute top-3 right-3 text-sm px-3 py-1"
            >
              Copy JSON
            </GradientButton>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed mt-8">
              <code>{modelsJSON}</code>
            </pre>
          </div>
        </div>
      </Section>
    </motion.div>
  );
}
