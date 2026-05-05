import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, PenTool, Sparkles, Layers, Sun, Camera, Palette, User } from 'lucide-react';
import { cn } from '../lib/utils';

const OPTIONS = {
  style: ["Photorealistic", "Anime", "Oil Painting", "Watercolor", "Cyberpunk", "Steampunk", "Minimalist", "3D Render", "Sketch", "Pop Art"],
  lighting: ["Cinematic Lighting", "Natural Light", "Neon", "Volumetric Fog", "Golden Hour", "Studio Lighting", "Bioluminescence", "Harsh Shadows"],
  mood: ["Ethereal", "Dark & Gritty", "Joyful", "Melancholic", "Mysterious", "Epic", "Serene", "Chaotic"],
  camera: ["Wide Angle", "Macro", "Drone View", "Fisheye", "Telephoto", "Depth of Field", "Bokeh", "GoPro"],
  color: ["Vibrant", "Monochrome", "Pastel", "High Contrast", "Muted", "Neon Pink & Cyan", "Sepia", "Earth Tones"],
  artist: ["Greg Rutkowski", "Alphonse Mucha", "Studio Ghibli", "Syd Mead", "H.R. Giger", "Claude Monet", "Vincent van Gogh", "Zdzisław Beksiński"]
};

export function PromptBuilder() {
  const [subject, setSubject] = useState("");
  const [selections, setSelections] = useState<Record<string, string>>({
    style: "", lighting: "", mood: "", camera: "", color: "", artist: ""
  });
  const [copied, setCopied] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");

  useEffect(() => {
    const parts = [
      subject.trim(),
      selections.style ? `in the style of ${selections.style}` : "",
      selections.lighting,
      selections.mood ? `${selections.mood} mood` : "",
      selections.camera,
      selections.color ? `${selections.color} color palette` : "",
      selections.artist ? `by ${selections.artist}` : "",
      "--ar 16:9 --v 6.0" // Default Midjourney params
    ].filter(Boolean);

    setGeneratedPrompt(parts.join(", "));
  }, [subject, selections]);

  const handleSelect = (category: string, value: string) => {
    setSelections(prev => ({
      ...prev,
      [category]: prev[category] === value ? "" : value // Toggle
    }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-bg text-ink pt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl text-center mb-16"
      >
        <h1 className="text-5xl md:text-7xl font-serif mb-6 text-ink uppercase tracking-tighter">Prompt Builder</h1>
        <p className="text-ink/60 font-sans text-lg max-w-2xl mx-auto">Craft the perfect prompt step-by-step with our guided builder.</p>
      </motion.div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Builder Form (8 cols) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-8 flex flex-col gap-8"
        >
          {/* Subject Input */}
          <div className="bg-transparent border border-ink/10 p-8">
            <h3 className="text-xs font-bold text-ink uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-ink/10 pb-4">
              <PenTool className="w-4 h-4" /> 1. The Subject
            </h3>
            <textarea
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Describe your main subject in detail (e.g., 'A majestic cybernetic owl perched on a neon sign...')"
              className="w-full h-32 bg-ink/5 border border-ink/10 p-4 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-1 focus:ring-ink/30 resize-none transition-all font-mono text-sm"
            />
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <OptionSection title="Style" icon={<Layers />} category="style" options={OPTIONS.style} selections={selections} onSelect={handleSelect} />
            <OptionSection title="Lighting" icon={<Sun />} category="lighting" options={OPTIONS.lighting} selections={selections} onSelect={handleSelect} />
            <OptionSection title="Mood" icon={<Sparkles />} category="mood" options={OPTIONS.mood} selections={selections} onSelect={handleSelect} />
            <OptionSection title="Camera & Lens" icon={<Camera />} category="camera" options={OPTIONS.camera} selections={selections} onSelect={handleSelect} />
            <OptionSection title="Color Palette" icon={<Palette />} category="color" options={OPTIONS.color} selections={selections} onSelect={handleSelect} />
            <OptionSection title="Artist Reference" icon={<User />} category="artist" options={OPTIONS.artist} selections={selections} onSelect={handleSelect} />
          </div>
        </motion.div>

        {/* Right Column: Live Preview (4 cols) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-4"
        >
          <div className="sticky top-32 bg-transparent border border-ink/10 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-ink/10 bg-ink/5 flex items-center justify-between">
              <h3 className="text-xs font-bold text-ink uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Live Preview
              </h3>
            </div>
            
            <div className="p-8 flex-1 flex flex-col gap-8">
              <div className="relative group flex-1">
                <div className="relative h-full min-h-[200px] bg-ink/5 border border-ink/10 p-6 font-mono text-sm leading-relaxed text-ink/80 break-words">
                  {generatedPrompt || <span className="text-ink/40 italic">Start typing to build your prompt...</span>}
                </div>
              </div>

              <button
                onClick={handleCopy}
                disabled={!generatedPrompt}
                className={cn(
                  "w-full py-5 text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-3 transition-all border",
                  !generatedPrompt
                    ? "bg-transparent border-ink/10 text-ink/40 cursor-not-allowed"
                    : copied
                      ? "bg-ink text-bg border-ink"
                      : "bg-ink text-bg border-ink hover:bg-ink/80"
                )}
              >
                {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy Prompt</>}
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

function OptionSection({ 
  title, icon, category, options, selections, onSelect 
}: { 
  title: string, icon: React.ReactNode, category: string, options: string[], selections: Record<string, string>, onSelect: (c: string, v: string) => void 
}) {
  return (
    <div className="bg-transparent border border-ink/10 p-6 flex flex-col">
      <h4 className="text-xs font-bold text-ink uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-ink/10 pb-3">
        <span className="w-3.5 h-3.5 [&>svg]:w-full [&>svg]:h-full">{icon}</span> {title}
      </h4>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onSelect(category, opt)}
            className={cn(
              "px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all border",
              selections[category] === opt
                ? "bg-ink text-bg border-ink"
                : "bg-transparent text-ink/50 hover:text-ink border-ink/10 hover:border-ink/30"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
