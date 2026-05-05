import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, Image as ImageIcon, Sparkles, Loader2, Copy, Check, Wand2, PenTool } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { cn } from '../lib/utils';

const STYLES = [
  "Ghibli", "Anime", "Oil Painting", "Cyberpunk", "Watercolor", "Pixel Art", "3D Render", "Photorealistic", "Synthwave", "Impressionist"
];

export function StyleConverter() {
  const [image, setImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>("Ghibli");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null); // Reset result on new image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image) return;
    setIsGenerating(true);
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      // Extract base64 data
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];

      const prompt = `Analyze this image in detail. Describe the subject, composition, lighting, color palette, mood, and artistic style. Then generate a detailed text-to-image prompt (optimized for Midjourney/Stable Diffusion) that would recreate this image in ${selectedStyle} style. Format: 
      - Scene description
      - Style keywords  
      - Lighting & mood
      - Technical parameters
      - Full assembled prompt`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            { text: prompt },
          ],
        },
      });

      setResult(response.text || "Failed to generate prompt.");
    } catch (error) {
      console.error("Error generating prompt:", error);
      setResult("An error occurred while generating the prompt. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink pt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl text-center mb-16"
      >
        <h1 className="text-5xl md:text-7xl font-serif mb-6 text-ink uppercase tracking-tighter">Style Transfer</h1>
        <p className="text-ink/60 font-sans text-lg max-w-2xl mx-auto">Upload an image, select a style, and let Gemini craft the perfect prompt to recreate it.</p>
      </motion.div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 pb-20">
        {/* Left Column: Upload & Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-8"
        >
          {/* Upload Area */}
          <div
            className={cn(
              "relative aspect-square md:aspect-video lg:aspect-square w-full border border-dashed flex flex-col items-center justify-center overflow-hidden transition-all group cursor-pointer",
              image ? "border-ink/20 bg-surface" : "border-ink/20 hover:border-ink/50 hover:bg-ink/5 bg-transparent"
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            {image ? (
              <>
                <img src={image} alt="Uploaded" className="w-full h-full object-cover opacity-60 lg:opacity-80 lg:group-hover:opacity-60 transition-opacity filter grayscale-[20%]" />
                <div className="absolute inset-0 flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity bg-transparent lg:bg-bg/60 backdrop-blur-none lg:backdrop-blur-sm pointer-events-none">
                  <span className="bg-ink text-bg px-6 py-3 text-xs font-bold tracking-widest uppercase flex items-center gap-2 pointer-events-auto shadow-xl">
                    <Upload className="w-4 h-4" /> Change Image
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 text-ink/50 group-hover:text-ink transition-colors p-8 text-center">
                <div className="w-16 h-16 border border-ink/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-xs tracking-widest uppercase mb-2">Upload Image</p>
                  <p className="text-[10px] uppercase tracking-widest text-ink/40">SVG, PNG, JPG (max. 800x400px)</p>
                </div>
              </div>
            )}
          </div>

          {/* Style Selection */}
          <div className="bg-transparent border border-ink/10 p-8">
            <h3 className="text-xs font-bold text-ink uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-ink/10 pb-4">
              <Wand2 className="w-4 h-4" /> Target Style
            </h3>
            <div className="flex flex-wrap gap-2">
              {STYLES.map(style => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={cn(
                    "px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-all border",
                    selectedStyle === style
                      ? "bg-ink text-bg border-ink"
                      : "bg-transparent text-ink/50 hover:text-ink border-ink/10 hover:border-ink/30"
                  )}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!image || isGenerating}
            className={cn(
              "w-full py-5 text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-3 transition-all border",
              !image || isGenerating
                ? "bg-transparent border-ink/10 text-ink/40 cursor-not-allowed"
                : "bg-ink text-bg border-ink hover:bg-ink/80"
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Generate Prompt
              </>
            )}
          </button>
        </motion.div>

        {/* Right Column: Result */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col h-full"
        >
          <div className="bg-transparent border border-ink/10 flex flex-col h-full min-h-[500px] overflow-hidden relative">
            {/* Header */}
            <div className="p-6 border-b border-ink/10 flex items-center justify-between bg-ink/5">
              <h3 className="text-xs font-bold text-ink uppercase tracking-widest flex items-center gap-2">
                <PenTool className="w-4 h-4" /> Output
              </h3>
              {result && (
                <button
                  onClick={handleCopy}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-all border",
                    copied
                      ? "bg-ink text-bg border-ink"
                      : "bg-transparent text-ink/60 hover:text-ink border-transparent hover:border-ink/20"
                  )}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy All'}
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative">
              {isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-ink">
                  <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 border-2 border-ink/10"></div>
                    <div className="absolute inset-0 border-2 border-ink border-t-transparent animate-spin"></div>
                  </div>
                  <p className="font-mono text-xs uppercase tracking-widest animate-pulse text-ink/60">Gemini is analyzing...</p>
                </div>
              ) : result ? (
                <div className="prose prose-invert max-w-none font-mono text-sm leading-relaxed text-ink/80">
                  <div className="whitespace-pre-wrap">
                    {result}
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-ink/40 gap-6">
                  <Sparkles className="w-8 h-8 opacity-20" />
                  <p className="text-xs font-bold tracking-widest uppercase">Awaiting Image</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
