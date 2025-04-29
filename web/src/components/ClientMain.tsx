"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { motion } from "framer-motion";
import {
  PaintBrushIcon,
  VideoCameraIcon,
  CameraIcon,
  SparklesIcon,
  CodeBracketIcon,
  CogIcon,
  UserIcon,
  UserGroupIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import meta from "next-gen/config";
import { PaymentActivationPopup, shouldShowPaymentActivationPopup } from "./PaymentActivationPopup";
import Script from "next/script";

/* ---------------------------------- Types ---------------------------------- */
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
interface UseCaseCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}
interface PricingPlanProps {
  title: string;
  price: string;
  features: string[];
  ctaLink: string;
  highlighted?: boolean;
}
interface TestimonialProps {
  author: string;
  role: string;
  text: string;
  avatarUrl: string;
}

/* ------------------------- Animation Variants ------------------------- */
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
  visible: { transition: { staggerChildren: 0.15 } },
};

/* --------------------------- UI Components --------------------------- */
function Section({ children, className = "" }: SectionProps) {
  return <section className={`py-20 w-full ${className}`}>{children}</section>;
}

function GradientButton({ children, primary = false, href = "#", className = "" }: GradientButtonProps) {
  return (
    <motion.a
      href={href}
      className={[
        "relative inline-flex items-center justify-center px-8 py-4 rounded-xl",
        "text-lg font-semibold overflow-hidden no-underline shadow-md",
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
            ? "absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600"
            : "absolute inset-0 bg-white border-2 border-gray-200"
        }
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      />
    </motion.a>
  );
}

function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <motion.div className="group relative bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300" whileHover={{ y: -4 }} variants={fadeInUp}>
      <div className="flex items-center mb-4">
        <div className="p-3 bg-purple-50 rounded-lg mr-4 flex items-center justify-center">{icon}</div>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
      <span className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-purple-100 transition-colors" aria-hidden="true" />
    </motion.div>
  );
}

function WorkflowStep({ number, title, description }: WorkflowStepProps) {
  return (
    <motion.div className="flex items-start" variants={fadeInUp}>
      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-bold text-xl mr-6 shadow-md">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
}

function ArtShowcase({ src, alt, type = "image" }: ArtShowcaseProps) {
  return (
    <motion.div className="relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 aspect-video" whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
      {type === "image" ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </motion.div>
  );
}

function UseCaseCard({ icon, title, description }: UseCaseCardProps) {
  return (
    <motion.div className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow flex items-center space-x-4" whileHover={{ y: -5 }} variants={fadeInUp}>
      <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-purple-100 to-blue-100 rounded-full overflow-hidden flex-shrink-0">
        <div className="flex items-center justify-center w-full h-full">
          {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
        </div>
      </div>
      <div>
        <h4 className="text-xl font-semibold mb-2">{title}</h4>
        <p className="text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
}

function PricingPlan({ title, price, features, ctaLink, highlighted = false }: PricingPlanProps) {
  return (
    <motion.div
      className={`relative flex flex-col p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow ${highlighted ? "bg-gradient-to-br from-purple-50 to-blue-50" : "bg-white"}`}
      whileHover={{ scale: 1.02 }}
      variants={fadeInUp}
    >
      {highlighted && (
        <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
          Most Popular
        </div>
      )}
      <h3 className="text-2xl font-bold mb-4 text-gray-800">{title}</h3>
      <p className="text-4xl font-extrabold text-gray-800 mb-4">{price}</p>
      <ul className="mb-8 space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center space-x-2 text-gray-700">
            <CheckCircleIcon className="w-5 h-5 text-purple-600" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <GradientButton href={ctaLink} primary={highlighted} className={highlighted ? "" : "bg-white text-gray-700"}>
        Get Started
      </GradientButton>
    </motion.div>
  );
}

function Testimonial({ author, role, text, avatarUrl }: TestimonialProps) {
  return (
    <motion.div className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow flex flex-col items-center text-center" whileHover={{ y: -5 }} variants={fadeInUp}>
      <img src={avatarUrl} alt={author} className="w-16 h-16 rounded-full mb-4 object-cover" />
      <blockquote className="text-gray-600 italic mb-4">“{text}”</blockquote>
      <div className="font-semibold text-gray-800">{author}</div>
      <div className="text-sm text-gray-500">{role}</div>
    </motion.div>
  );
}

function HeroBackgroundAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute w-[50rem] h-[50rem] bg-purple-200 rounded-full blur-3xl opacity-40"
        style={{ top: "-20rem", left: "-20rem" }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
      />
      <motion.div
        className="absolute w-[40rem] h-[40rem] bg-blue-200 rounded-full blur-3xl opacity-30"
        style={{ bottom: "-15rem", right: "-15rem" }}
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 80, ease: "linear" }}
      />
    </div>
  );
}

/* ---------------------------- Data Arrays ---------------------------- */
const featuresData: FeatureCardProps[] = [
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
  {
    icon: <CogIcon className="w-6 h-6 text-green-600" />,
    title: "ComfyUI Integration",
    description: "Seamlessly integrate with ComfyUI for advanced control.",
  },
];

const workflowStepsData: WorkflowStepProps[] = [
  { number: 1, title: "Design Your Workflow", description: "Use ComfyUI's intuitive interface to design your AI workflow." },
  { number: 2, title: "Configure Nodes", description: "Set up and connect nodes to define your AI processing pipeline." },
  { number: 3, title: "Input Parameters", description: "Adjust settings and provide prompts to guide the AI generation." },
  { number: 4, title: "Generate Content", description: "Let our powerful AI models bring your vision to life." },
  { number: 5, title: "Refine and Iterate", description: "Fine-tune the results by adjusting your workflow or parameters." },
  { number: 6, title: "Launch API", description: "Launch your workflow as an API!." },
];

const useCasesData: UseCaseCardProps[] = [
  { icon: <UserIcon className="w-6 h-6 text-purple-600" />, title: "Freelance Creators", description: "Expand your service offerings with AI-driven designs, branding assets, and immersive visuals." },
  { icon: <UserGroupIcon className="w-6 h-6 text-blue-600" />, title: "Marketing Teams", description: "Quickly generate creative assets for campaigns, social media, and product launches." },
  { icon: <CloudArrowUpIcon className="w-6 h-6 text-indigo-600" />, title: "Developers", description: "Easily integrate AI art pipelines into your apps or websites with our robust API and ComfyUI nodes." },
];

const pricingPlansData: PricingPlanProps[] = [
  { title: "Basic", price: "$100/mo", features: ["AI Art Generation (Basic)", "5 Machine Credits", "Standard Image Enhancement", "Serverless Deployment"], ctaLink: "https://buy.stripe.com/4gw7uv7lL3Ybf1CcN5" },
  { title: "Professional", price: "$200/mo", features: ["AI Art Generation (Advanced)", "25 Machine Credits", "High-Resolution Image Enhancement", "Priority Email Support"], ctaLink: "https://buy.stripe.com/4gwbKL8pP3Ybf1CaEY", highlighted: true },
  { title: "Enterprise", price: "$500/mo", features: ["Unlimited AI Art Generation", "100 Machine Credits", "High-Fidelity Image Enhancement", "Dedicated Support & SLA"], ctaLink: "https://buy.stripe.com/7sIbKLbC12U7dXy6oJ" },
];

const testimonialsData: TestimonialProps[] = [
  { author: "Sharon Jerman", role: "Art Director", text: "Pixio's AI helped me create mesmerizing brand visuals in a fraction of the time—it’s a total game-changer.", avatarUrl: "https://pixiomedia.nyc3.digitaloceanspaces.com/uploads/1737621302287-HgwvWLO7_400x400.jpg" },
  { author: "Nick Kukaj", role: "Freelance Creative", text: "I love how easy it is to integrate AI into my workflow. My clients are stunned by the results!", avatarUrl: "https://randomuser.me/api/portraits/men/51.jpg" },
  { author: "Jeremy White", role: "Marketing Manager", text: "Our campaigns have never looked better. The combination of speed and quality is unmatched.", avatarUrl: "https://randomuser.me/api/portraits/men/69.jpg" },
];

/* --------------------------- Main Page Component --------------------------- */
export default function ClientMain() {
  const [isVisible, setIsVisible] = useState(false);
  const [showActivationPopup, setShowActivationPopup] = useState(false);

  // Check if we should show the payment activation popup when component mounts
  useEffect(() => {
    const shouldShow = shouldShowPaymentActivationPopup();
    setShowActivationPopup(shouldShow);
  }, []);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen w-full">
      <style jsx global>{`
        .px-6 {
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
      `}</style>

      {/* Payment Activation Popup */}
      {showActivationPopup && (
        <PaymentActivationPopup onClose={() => setShowActivationPopup(false)} />
      )}

      {/* HEADER SECTION - Full width gradient background */}
      <Section className="w-full bg-gradient-to-br from-purple-50 via-blue-50 to-blue-100 flex flex-col items-center justify-center text-center overflow-hidden relative">
        <HeroBackgroundAnimation />
        <div className="w-full">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div initial="hidden" animate={isVisible ? "visible" : "hidden"} variants={stagger}>
              <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600 leading-tight drop-shadow-lg">
                Pixio AI Powered Creative Workflows
              </motion.h1>
              <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-gray-700 mb-10">
                Transform your ideas into stunning visuals and captivating videos with our AI-driven creative platform, powered by ComfyUI.
              </motion.p>
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                <GradientButton primary href="/machines">Start Creating</GradientButton>
                <GradientButton href="https://calendly.com/techinschools/pixio-api-onboarding?month=2025-01">Book Demo</GradientButton>
                <GradientButton href="https://pixio.myapps.ai">Pixio</GradientButton>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* FEATURES SECTION */}
      <Section className="w-full bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-4xl font-bold text-center mb-12">
            Unleash Your Creativity
          </motion.h2>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((feature, index) => (
              <FeatureCard key={index} icon={feature.icon} title={feature.title} description={feature.description} />
            ))}
          </motion.div>
        </div>
      </Section>

      {/* HOW IT WORKS SECTION */}
      <Section className="w-full bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 variants={fadeInUp} className="text-4xl font-bold text-center mb-12">
            How It Works with ComfyUI
          </motion.h2>
          <div className="flex flex-col lg:flex-row gap-12">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="w-full lg:w-1/2">
              <div className="flex flex-col space-y-10">
                {workflowStepsData.map((step, index) => (
                  <WorkflowStep key={index} {...step} />
                ))}
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="w-full lg:w-1/2">
              <p className="text-gray-600 mb-6">
                Harness the power of ComfyUI in your applications with just a few lines of code:
              </p>
              <div className="relative p-[4px] rounded-lg overflow-hidden">
                <div className="absolute inset-0 rounded-lg animate-gradient-rotation"></div>
                <div className="relative bg-black rounded-lg p-6 overflow-x-auto">
                  <pre className="text-gray-100">
                    <code className="language-javascript">{`
const client = new ComfyDeployClient({
  apiBase: "https://api.myapps.ai",
  apiToken: process.env.PIXIO_API_KEY!,
});
const { run_id } = await client.run(
  "d0d81c90-ecd6-4912-8eaa-a6ca667cec58", 
  { inputs: { "input_text": "" } }
);
const run = await client.getRun(run_id);
                    `}</code>
                  </pre>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* AI SHOWCASE SECTION */}
      <Section className="w-full bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-4xl font-bold text-center mb-12">
            AI-Generated Masterpieces
          </motion.h2>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ArtShowcase src="https://pixiomedia.nyc3.digitaloceanspaces.com/uploads/1737608138715-image.png" alt="AI-generated abstract art" />
            <ArtShowcase src="https://pixiomedia.nyc3.digitaloceanspaces.com/uploads/1737608142907-image.jpg" alt="AI-generated landscape" />
            <ArtShowcase src="https://pixiomedia.nyc3.digitaloceanspaces.com/uploads/1737608166338-pixverse-317182365469952.mp4" alt="AI-generated video clip" type="video" />
            <ArtShowcase src="https://pixiomedia.nyc3.digitaloceanspaces.com/uploads/1737608185328-video-user1091-runwaymlrossmytsi.org-asset2e490a12-51e5-4086-9381-e0e711449868.mp4" alt="AI-generated video animation" type="video" />
            <ArtShowcase src="https://pixiomedia.nyc3.digitaloceanspaces.com/uploads/1737608189616-image.webp" alt="AI-generated artwork" />
            <ArtShowcase src="https://pixiomedia.nyc3.digitaloceanspaces.com/uploads/1737608206569-image.png" alt="AI-generated digital art" />
          </motion.div>
        </div>
      </Section>

      {/* USE CASES SECTION */}
      <Section className="w-full bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-4xl font-bold text-center mb-12">
            Real-World Use Cases
          </motion.h2>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="w-full grid grid-cols-1 md:grid-cols-3 gap-8">
            {useCasesData.map((useCase, index) => (
              <UseCaseCard key={index} icon={useCase.icon} title={useCase.title} description={useCase.description} />
            ))}
          </motion.div>
        </div>
      </Section>

      {/* PRICING SECTION */}
      <Section className="w-full bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-4xl font-bold text-center mb-12">
            Plans &amp; Pricing
          </motion.h2>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="w-full grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlansData.map((plan, index) => (
              <PricingPlan key={index} {...plan} />
            ))}
          </motion.div>

          {/* Senja Widget - Placed right after pricing plans */}
          <div className="mt-16">
            <Script 
              src="https://widget.senja.io/widget/698903f7-82e1-43c9-a1e4-507b33742e0a/platform.js" 
              strategy="afterInteractive"
            />
            <div 
              className="senja-embed" 
              data-id="698903f7-82e1-43c9-a1e4-507b33742e0a" 
              data-mode="shadow" 
              data-lazyload="false" 
              style={{display: "block"}}
            />
          </div>
        </div>
      </Section>

      {/* FINAL CTA SECTION */}
      <Section className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-4xl font-bold mb-6 leading-tight text-center">
            Ready to Revolutionize Your Creative Process?
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="text-xl mb-8 text-gray-100 text-center">
            Join thousands of artists and creators harnessing the power of AI to push the boundaries of creativity.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
            <GradientButton href="/machines" className="bg-white text-purple-600 hover:bg-gray-200">
              Get Started Now
            </GradientButton>
          </motion.div>
        </div>
      </Section>

      {/* Global Styles for Gradient Animation */}
      <style jsx global>{`
        @keyframes gradient-rotation {
          0% {
            --gradient-angle: 0deg;
          }
          100% {
            --gradient-angle: 360deg;
          }
        }
        .animate-gradient-rotation {
          --gradient-angle: 0deg;
          background: conic-gradient(
            from var(--gradient-angle),
            #ff00ff,
            #ff00ff,
            #00ffff,
            #00ff00,
            #ffff00,
            #ff0000,
            #ff00ff
          );
          animation: gradient-rotation 4s linear infinite;
        }
        .animate-gradient-rotation::before {
          content: "";
          position: absolute;
          inset: 6px;
          background: black;
          border-radius: 16px;
          z-index: 0;
        }
        @property --gradient-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }
      `}</style>
    </div>
  );
}
