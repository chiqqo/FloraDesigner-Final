const GeneratedDesign = require('../models/GeneratedDesign');
const { GoogleGenAI } = require('@google/genai');

const SIMULATED_IMAGES = [
  'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1499063078284-f78f7d89616a?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1444930694458-01babf71870c?auto=format&fit=crop&w=600&q=80',
];

const BASE_PRICES = { Small: 65, Medium: 95, Large: 130, 'Extra Large': 160 };
const STYLE_MULTIPLIERS = { Luxury: 1.2, Romantic: 1.1, Classic: 1.05 };

function estimatePrice(size, style) {
  const base = BASE_PRICES[size] || 95;
  const mult = STYLE_MULTIPLIERS[style] || 1;
  return Math.round(base * mult);
}

function buildPrompt({ occasion, style, preferredFlowers, preferredColors, bouquetSize, wrappingStyle, description }) {
  const parts = [];
  if (style) parts.push(`${style} style`);
  if (bouquetSize) parts.push(`${bouquetSize} bouquet`);
  if (preferredColors?.length) parts.push(`in ${preferredColors.join(' and ')} tones`);
  if (preferredFlowers?.length) parts.push(`featuring ${preferredFlowers.join(', ')}`);
  if (occasion) parts.push(`for ${occasion}`);
  if (wrappingStyle) parts.push(`wrapped in ${wrappingStyle}`);
  if (description?.trim()) parts.push(description.trim());
  return parts.filter(Boolean).join(', ');
}

function buildImagePrompt(promptText) {
  return (
    `Professional studio photograph of a beautiful flower bouquet: ${promptText}. ` +
    'Elegant floral arrangement, soft natural lighting, clean white background, ' +
    'high resolution, photorealistic.'
  );
}

// Returns a base64 data URL on success, null on any failure.
// Tries gemini-2.5-flash-image first, then imagen-4.0-generate-001.
async function generateWithGemini(promptText) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });
  const imagePrompt = buildImagePrompt(promptText);

  // Attempt 1: Gemini 2.5 Flash Image
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: imagePrompt,
      config: { responseModalities: ['IMAGE'] },
    });
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        const mimeType = part.inlineData.mimeType || 'image/png';
        console.log('Gemini 2.5 Flash Image: image generated successfully');
        return `data:${mimeType};base64,${part.inlineData.data}`;
      }
    }
    console.warn('Gemini 2.5 Flash Image: response contained no image part');
  } catch (err) {
    console.warn(`Gemini 2.5 Flash Image failed (${err.status || err.code || 'error'}): ${String(err.message).slice(0, 120)}`);
  }

  // Attempt 2: Imagen 4
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: imagePrompt,
      config: { numberOfImages: 1, aspectRatio: '1:1' },
    });
    const raw = response.generatedImages[0].image.imageBytes;
    const base64 = typeof raw === 'string' ? raw : Buffer.from(raw).toString('base64');
    console.log('Imagen 4: image generated successfully');
    return `data:image/png;base64,${base64}`;
  } catch (err) {
    console.warn(`Imagen 4 failed (${err.status || err.code || 'error'}): ${String(err.message).slice(0, 120)}`);
  }

  return null;
}

// Route: POST /api/designer/generate
// Works without MongoDB (no DB call here).
const generateDesigns = async (req, res) => {
  try {
    const { occasion = '', style = '', bouquetSize = 'Medium', ...rest } = req.body;
    const prompt = buildPrompt({ occasion, style, bouquetSize, ...rest });
    const estimatedPrice = estimatePrice(bouquetSize, style);

    const geminiImage = await generateWithGemini(prompt);

    if (geminiImage) {
      return res.json({
        prompt,
        generatedImages: [geminiImage],
        estimatedPrice,
        provider: 'gemini',
        gemini: true,
      });
    }

    // Simulated fallback
    const seedStr = occasion + style + bouquetSize;
    const hash = [...seedStr].reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0xffff, 0);
    const start = hash % Math.max(1, SIMULATED_IMAGES.length - 3);
    const generatedImages = SIMULATED_IMAGES.slice(start, start + 4);
    res.json({
      prompt,
      generatedImages,
      estimatedPrice,
      provider: 'simulated',
      gemini: false,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const saveSelectedDesign = async (req, res) => {
  try {
    const design = new GeneratedDesign(req.body);
    const saved = await design.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getGeneratedDesigns = async (req, res) => {
  try {
    const designs = await GeneratedDesign.find().sort({ createdAt: -1 });
    res.json(designs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getGeneratedDesignById = async (req, res) => {
  try {
    const design = await GeneratedDesign.findById(req.params.id);
    if (!design) return res.status(404).json({ message: 'Design not found' });
    res.json(design);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { generateDesigns, saveSelectedDesign, getGeneratedDesigns, getGeneratedDesignById };
