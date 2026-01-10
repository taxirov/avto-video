const normalizeSpaces = (text) => String(text || '').replace(/\s+/g, ' ').trim();

const normalizeValue = (value, fallback = "ma'lumot ko'rsatilmagan") => {
  if (value === null || value === undefined) return fallback;
  const str = String(value).trim();
  return str ? str : fallback;
};

const formatRounded = (value, fallback = "ma'lumot ko'rsatilmagan") => {
  if (value === null || value === undefined || value === '') return fallback;
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return String(Math.round(num));
};

const formatCommunications = (values) => {
  if (!Array.isArray(values) || !values.length) return '';
  const titles = {
    water_supply: 'Suv',
    electric_lighting: 'Elektr',
    gas_supply: 'Gaz',
    sewage: 'Kanalizatsiya',
  };
  return values
    .map((code) => titles[code] || code)
    .filter(Boolean)
    .join(', ');
};

const getVariations = (item) => {
  if (Array.isArray(item?.variations)) return item.variations;
  if (Array.isArray(item?.productOrder?.product?.variations)) return item.productOrder.product.variations;
  return [];
};

const getVariationByCode = (variations, code) => variations.find((entry) => entry?.code === code);

const getVariationValue = (variations, code) => {
  const entry = getVariationByCode(variations, code);
  if (!entry) return undefined;
  if (Array.isArray(entry.values) && entry.values.length) return entry.values;
  if (entry.value !== undefined) return entry.value;
  return undefined;
};

const getVariationLabel = (variations, code) => {
  const entry = getVariationByCode(variations, code);
  if (!entry) return '';
  return entry.valueLabel || entry.value || '';
};

const buildAudioTemplate = (item) => {
  const rawRegion = item?.region || item?.productOrder?.region || item?.productRegion || null;
  const isMicroRegion = rawRegion?.regionType === 'MICRO_REGION';
  const parentName = isMicroRegion
    ? rawRegion?.parent?.parent?.name || rawRegion?.parent?.name || ''
    : rawRegion?.parent?.name || '';
  const regionName = isMicroRegion
    ? rawRegion?.parent?.name || ''
    : rawRegion?.name || item?.district || '';
  const mfyName = item?.mfy?.name || item?.productMfy?.name || (isMicroRegion ? rawRegion?.name : '');
  const mfyWord = mfyName.trim().split(/\s+/)[0] || '';
  const variations = getVariations(item);
  const categoryText = (() => {
    const map = { 19: 'noturar binoni', 8: 'kvartirani', 12: 'xususiy uyni' };
    const categoryId = item?.category?.id || item?.categoryId;
    const categoryName = item?.category?.name || item?.category;
    if (map[categoryId]) return map[categoryId];
    if (categoryName) return `${String(categoryName).toLowerCase()}ni`;
    return 'obyektni';
  })();
  const areaAll = formatRounded(getVariationValue(variations, 'area_all') ?? item?.areaAll ?? item?.area);
  const buildingArea = formatRounded(
    getVariationValue(variations, 'building_width_area') ?? item?.buildingArea ?? item?.areaAll ?? item?.area
  );
  const effectiveArea = formatRounded(getVariationValue(variations, 'area_effective') ?? item?.effectiveArea ?? item?.area_living);
  const typeOfBuilding = (() => {
    const base =
      getVariationLabel(variations, 'type_of_building') || item?.typeOfBuildingLabel || item?.typeOfBuilding || item?.buildingType?.name;
    if (!base || !String(base).trim()) return '';
    return String(base).trim().toLowerCase();
  })();
  const floorsBuilding = normalizeValue(getVariationValue(variations, 'floors_building') ?? item?.floorsBuilding);
  const floors = normalizeValue(getVariationValue(variations, 'floors') ?? item?.floors);
  const floorsSentence = item?.separateBuilding
    ? `Uy qavatliligi ${floorsBuilding}.`
    : `Uy qavatliligi ${floorsBuilding}, qavati ${floors}.`;
  const communications = (() => {
    const rawValue = getVariationValue(variations, 'engineer_communications') ?? item?.engineerCommunications;
    if (Array.isArray(rawValue)) return formatCommunications(rawValue);
    if (typeof rawValue === 'string') {
      const values = rawValue
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);
      return formatCommunications(values);
    }
    return '';
  })();

  const sentences = [
    normalizeSpaces(
      `${parentName || ''} ${regionName || ''} ${mfyWord ? `${mfyWord} mahallasida` : ''} joylashgan ${categoryText} taklif qilamiz.`
    ),
    `Umumiy yer maydoni ${areaAll} metr kvadrat.`,
    `Qurilish osti maydoni ${buildingArea} metr kvadrat.`,
    `Foydali maydoni ${effectiveArea} metr kvadrat.`,
    typeOfBuilding ? normalizeSpaces(`Qurilish turi ${typeOfBuilding}.`) : '',
    normalizeSpaces(floorsSentence),
    communications ? `${communications} ta'minoti mavjud.` : '',
    'Joylashuvi qulay.',
    "Batafsil malumot uchun 55 517 22 20 raqamiga bog'laning!",
  ];

  const categoryId = item?.category?.id || item?.categoryId;
  const categoryName = item?.category?.name || item?.category || '';
  const isApartment = Number(categoryId) === 8 || String(categoryName).toLowerCase().includes('kvartir');
  if (isApartment) {
    const filtered = sentences.filter((line) => {
      const v = String(line || '');
      return !/^Umumiy yer maydoni\s+/i.test(v) && !/^Qurilish osti maydoni\s+/i.test(v);
    });
    return filtered.join(' ');
  }
  return sentences.join(' ');
};

module.exports = { buildAudioTemplate };
