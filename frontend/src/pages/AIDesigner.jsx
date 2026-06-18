import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { generateDesign, saveDesign } from '../services/api';
import { FALLBACK_BOUQUET_IMAGE, handleImageError } from '../utils/imageFallback';
import { useLanguage } from '../context/LanguageContext';

// Fallback image pool with semantic tags (used when backend is unreachable)
const IMAGE_POOL = [
  {
    url: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?auto=format&fit=crop&w=600&q=80',
    tags: ['roses', 'red', 'romantic', 'anniversary', 'classic', 'wedding', 'ვარდები', 'წითელი', 'რომანტიკული', 'წლისთავი', 'კლასიკური', 'ქორწილი'],
  },
  {
    url: 'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?auto=format&fit=crop&w=600&q=80',
    tags: ['pink', 'peonies', 'pastel', 'wedding', 'romantic', 'luxury', 'birthday', 'ვარდისფერი', 'პეონები', 'ქორწილი', 'რომანტიკული', 'ლუქსი', 'დაბადების დღე'],
  },
  {
    url: 'https://images.unsplash.com/photo-1499063078284-f78f7d89616a?auto=format&fit=crop&w=600&q=80',
    tags: ['general gift', 'birthday', 'mixed', 'colorful', 'classic', 'everyday', 'sympathy', 'graduation', 'ზოგადი საჩუქარი', 'დაბადების დღე', 'კლასიკური', 'კურსდამთავრება', 'თანაგრძნობა'],
  },
  {
    url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=600&q=80',
    tags: ['white', 'elegant', 'wedding', 'sympathy', 'classic', 'lilies', 'minimal', 'ivory', 'თეთრი', 'ქორწილი', 'კლასიკური', 'შროშანები', 'მინიმალური', 'თანაგრძნობა'],
  },
  {
    url: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80',
    tags: ['sunflowers', 'yellow', 'birthday', 'wildflower', 'cheerful', 'orange', 'seasonal', 'მზესუმზირები', 'ყვითელი', 'დაბადების დღე', 'ველური'],
  },
  {
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
    tags: ['tropical', 'exotic', 'orange', 'corporate', 'modern', 'extra large', 'bold', 'ნარინჯისფერი', 'ტროპიკული', 'თანამედროვე'],
  },
  {
    url: 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=600&q=80',
    tags: ['lavender', 'purple', 'wildflower', 'minimal', 'small', 'housewarming', 'natural', 'ლავანდა', 'იასამნისფერი', 'ველური', 'მინიმალური', 'პატარა'],
  },
  {
    url: 'https://images.unsplash.com/photo-1444930694458-01babf71870c?auto=format&fit=crop&w=600&q=80',
    tags: ['wildflowers', 'blue', 'pink', 'yellow', 'everyday', 'natural', 'small', 'wildflower', 'ველური ყვავილები', 'ლურჯი', 'ყოველდღიური', 'ბუნებრივი'],
  },
];

const BASE_PRICES = { Small: 65, Medium: 95, Large: 130, 'Extra Large': 160 };
const STYLE_MULTIPLIERS = { Luxury: 1.2, Romantic: 1.1, Classic: 1.05 };

function estimatePrice(size, style) {
  const base = BASE_PRICES[size] || 95;
  const mult = STYLE_MULTIPLIERS[style] || 1;
  return Math.round(base * mult);
}

function scoreImages(form) {
  const input = [
    form.occasion, form.style, form.bouquetSize, form.wrappingStyle,
    ...(form.preferredFlowers || []), ...(form.preferredColors || []),
    form.description,
  ].filter(Boolean).join(' ').toLowerCase();

  const hash = [...input].reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0xffff, 0);
  const scored = IMAGE_POOL.map((img, idx) => ({
    url: img.url,
    score: img.tags.filter(tag => input.includes(tag.toLowerCase())).length,
    tiebreak: (hash + idx) % IMAGE_POOL.length,
  }));
  scored.sort((a, b) => b.score - a.score || a.tiebreak - b.tiebreak);
  return scored.slice(0, 4).map(x => x.url);
}

function buildPrompt(form) {
  const parts = [];
  if (form.style) parts.push(`${form.style} style`);
  if (form.bouquetSize) parts.push(`${form.bouquetSize} bouquet`);
  if (form.preferredColors?.length) parts.push(`in ${form.preferredColors.join(' and ')} tones`);
  if (form.preferredFlowers?.length) parts.push(`featuring ${form.preferredFlowers.join(', ')}`);
  if (form.occasion) parts.push(`for ${form.occasion}`);
  if (form.wrappingStyle) parts.push(`wrapped in ${form.wrappingStyle}`);
  if (form.description?.trim()) parts.push(form.description.trim());
  return parts.filter(Boolean).join(', ');
}

function generateLocally(form) {
  return {
    prompt: buildPrompt(form),
    generatedImages: scoreImages(form),
    estimatedPrice: estimatePrice(form.bouquetSize, form.style),
  };
}

function SingleChips({ options, selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => onSelect(selected === value ? '' : value)}
          className={`px-3 py-1.5 text-xs rounded-full border transition ${
            selected === value
              ? 'bg-flora-600 text-white border-flora-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-flora-300'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function MultiChips({ options, selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => onToggle(value)}
          className={`px-3 py-1.5 text-xs rounded-full border transition ${
            selected.includes(value)
              ? 'bg-flora-600 text-white border-flora-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-flora-300'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function AIDesigner() {
  const { addToCart } = useCart();
  const { t, formatCurrency } = useLanguage();

  const occasions = [
    { value: 'Birthday', label: t('ai.occ.Birthday') },
    { value: 'Anniversary', label: t('ai.occ.Anniversary') },
    { value: 'Wedding', label: t('ai.occ.Wedding') },
    { value: 'Romantic Gift', label: t('ai.occ.Romantic Gift') },
    { value: 'Sympathy', label: t('ai.occ.Sympathy') },
    { value: 'Graduation', label: t('ai.occ.Graduation') },
    { value: 'General Gift', label: t('ai.occ.General Gift') },
  ];
  const styles = [
    { value: 'Romantic', label: t('ai.sty.Romantic') },
    { value: 'Minimal', label: t('ai.sty.Minimal') },
    { value: 'Luxury', label: t('ai.sty.Luxury') },
    { value: 'Wildflower', label: t('ai.sty.Wildflower') },
    { value: 'Modern', label: t('ai.sty.Modern') },
    { value: 'Classic', label: t('ai.sty.Classic') },
  ];
  const sizes = [
    { value: 'Small', label: t('ai.sz.Small') },
    { value: 'Medium', label: t('ai.sz.Medium') },
    { value: 'Large', label: t('ai.sz.Large') },
    { value: 'Extra Large', label: t('ai.sz.Extra Large') },
  ];
  const wrappings = [
    { value: 'Kraft paper', label: t('ai.wrp.Kraft paper') },
    { value: 'Satin ribbon', label: t('ai.wrp.Satin ribbon') },
    { value: 'Luxury box', label: t('ai.wrp.Luxury box') },
    { value: 'Transparent wrap', label: t('ai.wrp.Transparent wrap') },
    { value: 'Minimal white wrap', label: t('ai.wrp.Minimal white wrap') },
  ];
  const flowerOptions = [
    { value: 'Roses', label: t('ai.flr.Roses') },
    { value: 'Peonies', label: t('ai.flr.Peonies') },
    { value: 'Tulips', label: t('ai.flr.Tulips') },
    { value: 'Sunflowers', label: t('ai.flr.Sunflowers') },
    { value: 'Lilies', label: t('ai.flr.Lilies') },
    { value: 'Lavender', label: t('ai.flr.Lavender') },
    { value: 'Orchids', label: t('ai.flr.Orchids') },
    { value: 'Dahlias', label: t('ai.flr.Dahlias') },
    { value: 'Wildflowers', label: t('ai.flr.Wildflowers') },
  ];
  const colorOptions = [
    { value: 'Red', label: t('ai.clr.Red') },
    { value: 'Pink', label: t('ai.clr.Pink') },
    { value: 'White', label: t('ai.clr.White') },
    { value: 'Yellow', label: t('ai.clr.Yellow') },
    { value: 'Orange', label: t('ai.clr.Orange') },
    { value: 'Purple', label: t('ai.clr.Purple') },
    { value: 'Blue', label: t('ai.clr.Blue') },
    { value: 'Peach', label: t('ai.clr.Peach') },
    { value: 'Coral', label: t('ai.clr.Coral') },
    { value: 'Lavender', label: t('ai.clr.Lavender') },
  ];

  const [form, setForm] = useState({
    occasion: '',
    preferredFlowers: [],
    preferredColors: [],
    bouquetSize: 'Medium',
    style: 'Romantic',
    wrappingStyle: 'Kraft paper',
    description: '',
  });

  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [added, setAdded] = useState(false);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleMulti(key, value) {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  }

  async function handleGenerate(e) {
    e.preventDefault();
    setGenerating(true);
    setResults(null);
    setSelectedDesign(null);
    setAdded(false);
    setUsingFallback(false);

    try {
      const data = await generateDesign(form);
      setResults(data);
    } catch {
      await new Promise((r) => setTimeout(r, 800));
      setResults(generateLocally(form));
      setUsingFallback(true);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSelectDesign(imageUrl) {
    const localId = `ai-${Date.now()}`;
    const design = {
      id: localId,
      generatedDesignId: localId,
      imageUrl,
      prompt: results.prompt,
      estimatedPrice: results.estimatedPrice,
      style: form.style,
      occasion: form.occasion,
      preferredFlowers: form.preferredFlowers,
      preferredColors: form.preferredColors,
      bouquetSize: form.bouquetSize,
      wrappingStyle: form.wrappingStyle,
    };
    setSelectedDesign(design);
    setAdded(false);

    try {
      const saved = await saveDesign({
        prompt: design.prompt,
        selectedImageUrl: imageUrl,
        generatedImages: results.generatedImages,
        style: form.style,
        occasion: form.occasion,
        preferredFlowers: form.preferredFlowers,
        preferredColors: form.preferredColors,
        bouquetSize: form.bouquetSize,
        wrappingStyle: form.wrappingStyle,
        estimatedPrice: results.estimatedPrice,
        orderType: 'AI-generated bouquet',
      });
      if (saved && saved._id) {
        setSelectedDesign((prev) => ({ ...prev, generatedDesignId: String(saved._id) }));
      }
    } catch {
      try {
        const existing = JSON.parse(
          localStorage.getItem('floradesigner_generated_designs') || '[]'
        );
        localStorage.setItem(
          'floradesigner_generated_designs',
          JSON.stringify([...existing, design])
        );
        localStorage.setItem('floradesigner_last_generated_design', JSON.stringify(design));
      } catch {}
    }
  }

  function handleAddToCart() {
    addToCart(
      {
        id: selectedDesign.id,
        name: t('ai.custom'),
        price: selectedDesign.estimatedPrice,
        imageUrl: selectedDesign.imageUrl,
        category: 'AI Design',
        itemType: 'ai-generated',
        prompt: selectedDesign.prompt,
        style: selectedDesign.style,
        occasion: selectedDesign.occasion,
        generatedDesignId: selectedDesign.generatedDesignId,
        bouquetSize: selectedDesign.bouquetSize,
        wrappingStyle: selectedDesign.wrappingStyle,
      },
      1
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  function handleDesignAgain() {
    setResults(null);
    setSelectedDesign(null);
    setAdded(false);
    setUsingFallback(false);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="page-title">{t('ai.title')}</h1>
        <p className="text-gray-500">{t('ai.desc')}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-96 shrink-0">
          <form onSubmit={handleGenerate} className="card p-6 space-y-5">
            <h2 className="font-semibold text-gray-800">{t('ai.form.title')}</h2>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">{t('ai.occasion')}</p>
              <SingleChips
                options={occasions}
                selected={form.occasion}
                onSelect={(v) => setField('occasion', v)}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">{t('ai.style')}</p>
              <SingleChips
                options={styles}
                selected={form.style}
                onSelect={(v) => setField('style', v)}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">{t('ai.size')}</p>
              <SingleChips
                options={sizes}
                selected={form.bouquetSize}
                onSelect={(v) => setField('bouquetSize', v)}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">{t('ai.wrap')}</p>
              <SingleChips
                options={wrappings}
                selected={form.wrappingStyle}
                onSelect={(v) => setField('wrappingStyle', v)}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                {t('ai.flowers')}{' '}
                <span className="text-gray-400 font-normal">{t('ai.flowers.any')}</span>
              </p>
              <MultiChips
                options={flowerOptions}
                selected={form.preferredFlowers}
                onToggle={(v) => toggleMulti('preferredFlowers', v)}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                {t('ai.colors')}{' '}
                <span className="text-gray-400 font-normal">{t('ai.colors.any')}</span>
              </p>
              <MultiChips
                options={colorOptions}
                selected={form.preferredColors}
                onToggle={(v) => toggleMulti('preferredColors', v)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('ai.details')}{' '}
                <span className="text-gray-400 font-normal">{t('ai.details.optional')}</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                rows={3}
                placeholder={t('ai.details.placeholder')}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-flora-300 resize-none bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={generating}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? t('ai.generating') : t('ai.generate')}
            </button>
          </form>
        </div>

        <div className="flex-1 min-w-0">
          {!results && !generating && (
            <div className="flex items-center justify-center text-center py-24 text-gray-300">
              <div>
                <p className="text-5xl mb-3">*</p>
                <p className="text-sm">{t('ai.empty')}</p>
              </div>
            </div>
          )}

          {generating && (
            <div className="flex items-center justify-center text-center py-24">
              <div>
                <div className="w-10 h-10 border-4 border-flora-100 border-t-flora-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500 text-sm">{t('ai.loading')}</p>
              </div>
            </div>
          )}

          {results && !generating && (
            <div className="space-y-6">
              {usingFallback && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl px-4 py-3">
                  {t('ai.fallback')}
                </div>
              )}

              <div className="bg-flora-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1 font-medium">
                  {t('ai.prompt.label')}
                </p>
                <p className="text-sm text-gray-700 italic">"{results.prompt}"</p>
              </div>

              {!selectedDesign && (
                <>
                  <h2 className="font-semibold text-gray-800">{t('ai.choose')}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {results.generatedImages.map((img, i) => (
                      <div key={i} className="card overflow-hidden">
                        <div className="h-52 bg-flora-50 overflow-hidden">
                          <img
                            src={img || FALLBACK_BOUQUET_IMAGE}
                            alt={`${t('ai.option')} ${i + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            onError={handleImageError}
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="font-medium text-gray-800 text-sm">{t('ai.option')} {i + 1}</p>
                            <p className="font-bold text-flora-600">
                              {formatCurrency(results.estimatedPrice)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleSelectDesign(img)}
                            className="w-full text-sm bg-flora-600 text-white px-3 py-2 rounded-lg hover:bg-flora-700 transition"
                          >
                            {t('ai.select')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleDesignAgain}
                    className="text-sm text-flora-600 hover:underline"
                  >
                    {t('ai.generate.diff')}
                  </button>
                </>
              )}

              {selectedDesign && (
                <div>
                  <h2 className="font-semibold text-gray-800 mb-4">{t('ai.selected.title')}</h2>
                  <div className="card overflow-hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-2">
                      <div className="h-64 sm:h-auto bg-flora-50">
                        <img
                          src={selectedDesign.imageUrl || FALLBACK_BOUQUET_IMAGE}
                          alt={t('ai.selected.title')}
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                        />
                      </div>
                      <div className="p-6 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg mb-1">
                            {t('ai.custom')}
                          </h3>
                          <p className="text-xs text-flora-600 mb-4">
                            {t('ai.design.label')} &middot; {selectedDesign.style || 'Custom'}
                          </p>
                          <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">
                              {t('ai.prompt.title')}
                            </p>
                            <p className="text-xs text-gray-600 italic leading-relaxed">
                              "{selectedDesign.prompt}"
                            </p>
                          </div>
                          {selectedDesign.occasion && (
                            <p className="text-xs text-gray-500 mb-1">
                              {t('ai.occasion.label')}: {selectedDesign.occasion}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mb-4">
                            {t('ai.size.label')}: {selectedDesign.bouquetSize}
                          </p>
                          <p className="text-2xl font-bold text-flora-600 mb-4">
                            {formatCurrency(selectedDesign.estimatedPrice)}
                          </p>
                        </div>
                        <div className="space-y-3">
                          {added ? (
                            <p className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-center">
                              {t('ai.added')}{' '}
                              <Link to="/cart" className="underline">
                                {t('ai.viewcart')}
                              </Link>
                            </p>
                          ) : (
                            <button onClick={handleAddToCart} className="btn-primary w-full">
                              {t('ai.addtocart')}
                            </button>
                          )}
                          <button
                            onClick={handleDesignAgain}
                            className="w-full text-sm border border-gray-200 text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                          >
                            {t('ai.again')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
