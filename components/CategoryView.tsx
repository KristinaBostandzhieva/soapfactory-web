'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { sortProducts, type UiProduct } from '@/lib/catalog';
import { useT } from '@/hooks/useT';

const fb = 'var(--font-body)';
const fd = 'var(--font-display), Georgia, serif';

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="boj-filter-section">
      <button onClick={() => setOpen((value) => !value)} className="boj-filter-trigger">
        <span>{title}</span>
        {open ? <ChevronUp size={13} strokeWidth={1.5} /> : <Plus size={14} strokeWidth={1.5} />}
      </button>
      {open && <div className="boj-filter-body">{children}</div>}
    </div>
  );
}

export default function CategoryView({
  products, title, titleEn, categorySlug, parentTitle, parentSlug,
}: {
  products: UiProduct[];
  title: string;
  titleEn?: string | null;
  categorySlug?: string | null;
  parentTitle?: string | null;
  parentSlug?: string | null;
}) {
  const tr = useT();
  const [sort, setSort] = useState('default');
  const [perPage, setPerPage] = useState(24);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedSuitable, setSelectedSuitable] = useState<string[]>([]);
  const [selectedScents, setSelectedScents] = useState<string[]>([]);
  const filtersEnabled = categorySlug !== 'za-doma'
    && categorySlug !== 'zaharni-eksfolianti'
    && categorySlug !== 'bio-balsami-za-ustni';
  const isHairCare = categorySlug === 'grizha-za-kosata' || parentSlug === 'grizha-za-kosata';
  const isBodyCare = categorySlug === 'grizha-za-tialoto' || parentSlug === 'grizha-za-tialoto';
  const isFaceCare = categorySlug === 'grizha-za-litseto' || parentSlug === 'grizha-za-litseto';
  const showFilters = filtersEnabled && filtersVisible;
  const isEnglish = tr.filters.filters === 'Filters';
  const faceSkinOptions = {
    sensitive: tr.filters.suitableOptions[2],
    oily: tr.filters.suitableOptions[1],
    normal: tr.filters.suitableOptions[3],
    problem: tr.filters.suitableOptions[4],
  };
  const filterGroups = isHairCare
    ? {
        firstTitle: isEnglish ? 'Hair type' : 'Тип коса',
        firstOptions: isEnglish
          ? ['Normal hair', 'Dry and damaged hair', 'Oily hair', 'Colored hair', 'Every hair type']
          : ['Нормална коса', 'Суха и увредена коса', 'Мазна коса', 'Боядисана коса', 'Всеки тип коса'],
        secondTitle: isEnglish ? 'Hair concern' : 'Грижа',
        secondOptions: isEnglish
          ? ['Hair loss', 'Dandruff', 'Split ends', 'Scalp balance', 'Volume and density']
          : ['Косопад', 'Пърхот', 'Цъфтящи краища', 'Баланс на скалпа', 'Обем и плътност'],
      }
    : isBodyCare
      ? {
          firstTitle: isEnglish ? 'Suitable for' : 'Подходящо за',
          firstOptions: isEnglish
            ? ['Sensitive skin']
            : ['Чувствителна кожа'],
          secondTitle: isEnglish ? 'Scent' : 'Аромат',
          secondOptions: tr.filters.scentOptions,
        }
    : {
        firstTitle: 'Подходящо за',
        firstOptions: tr.filters.suitableOptions,
        secondTitle: 'Аромат',
        secondOptions: tr.filters.scentOptions,
      };

  const firstFilterTitle = isFaceCare ? tr.filters.suitable : filterGroups.firstTitle;
  const firstFilterOptions = isFaceCare
    ? [
        faceSkinOptions.sensitive,
        faceSkinOptions.oily,
        faceSkinOptions.normal,
        faceSkinOptions.problem,
      ]
    : filterGroups.firstOptions;
  const showSecondFilter = !isFaceCare && filterGroups.secondOptions.length > 0;

  const selectedSkinKeys = selectedSuitable.map((option) => {
    if (option === faceSkinOptions.sensitive) return 'sensitive';
    if (option === faceSkinOptions.oily) return 'oily';
    if (option === faceSkinOptions.normal) return 'normal';
    if (option === faceSkinOptions.problem) return 'problem';
    return '';
  }).filter(Boolean);
  const skinFilterKey = selectedSkinKeys.join('|');
  const bodyFilterKey = `${selectedSuitable.join('|')}::${selectedScents.join('|')}`;

  function toggleSuitable(option: string) {
    setSelectedSuitable((current) => (
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option]
    ));
  }

  function toggleScent(option: string) {
    setSelectedScents((current) => (
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option]
    ));
  }

  function isBodySensitiveOrNoAromaProduct(product: UiProduct): boolean {
    const sku = product.sku || product.id;
    const text = `${product.name} ${product.slug} ${product.shortDescription || ''}`.toLowerCase();
    const exactBodyFilterSkus = new Set(['106', '182', '196', '198']);

    return exactBodyFilterSkus.has(String(sku))
      || text.includes('deo-stik-naturalen')
      || text.includes('natural-deo')
      || text.includes('sapun-bebcho')
      || text.includes('сапун бебчо')
      || text.includes('bebcho')
      || text.includes('бебчо')
      || text.includes('sos-balsam')
      || text.includes('sos балсам')
      || text.includes('sos cream')
      || text.includes('алое вера гел')
      || text.includes('bio-aloe-vera-gel')
      || text.includes('алое вера');
  }

  function matchesBodyFilters(product: UiProduct): boolean {
    if (!isBodyCare) return true;
    if (selectedSuitable.length === 0 && selectedScents.length === 0) return true;
    return isBodySensitiveOrNoAromaProduct(product);
  }

  function matchesFaceSkinFilter(product: UiProduct): boolean {
    if (!isFaceCare || selectedSkinKeys.length === 0) return true;

    const sku = product.sku || product.id;
    const text = `${product.name} ${product.slug} ${product.shortDescription || ''}`.toLowerCase();
    const isRoseWater = sku === '195' || text.includes('rose water') || text.includes('розова вода');
    const isFaceWash = sku === '161' || text.includes('face wash');
    const isEyeCream = sku === '180' || sku === '181' || text.includes('околооч') || text.includes('eye cream');
    const isCocoaLipBalm = sku === '171' || (text.includes('lip') && text.includes('cocoa')) || (text.includes('устни') && text.includes('какао'));
    const isSerum = text.includes('serum') || text.includes('серум');
    const isCream = !isSerum && (text.includes('cream') || text.includes('крем'));
    const isBakuchiolCream = isCream && text.includes('bakuchiol');
    const isHyaluronCream = isCream && text.includes('hyaluron');
    const isBakuchiolSerum = isSerum && text.includes('bakuchiol');
    const isHyaluronSerum = isSerum && text.includes('hyaluron');

    return selectedSkinKeys.some((key) => {
      if (key === 'normal') return true;
      if (key === 'sensitive') {
        return isRoseWater
          || isEyeCream
          || isCocoaLipBalm
          || isBakuchiolCream
          || isHyaluronCream
          || isBakuchiolSerum
          || isHyaluronSerum;
      }
      if (key === 'oily') return isRoseWater || isFaceWash || isCream || isHyaluronSerum;
      if (key === 'problem') return isRoseWater || isFaceWash || isSerum || isCream;
      return true;
    });
  }

  const filtered = useMemo(
    () => products.filter((product) => matchesFaceSkinFilter(product) && matchesBodyFilters(product)),
    [products, isFaceCare, skinFilterKey, isBodyCare, bodyFilterKey]
  );
  const shown = useMemo(
    () => sortProducts(filtered, sort).slice(0, perPage),
    [filtered, sort, perPage]
  );

  const CATEGORY_LABELS: Record<string, { bg: string; en: string }> = {
    'grizha-za-tialoto': { bg: 'Грижа за тялото', en: 'Body Care' },
    'grizha-za-litseto': { bg: 'Грижа за лицето', en: 'Face Care' },
    'grizha-za-kosata': { bg: 'Грижа за косата', en: 'Hair Care' },
    'bio-sapuni': { bg: 'Био сапуни', en: 'Bio Soaps' },
    'bio-dush-gelove': { bg: 'Душ гелове', en: 'Shower Gels' },
    'deo-stikove': { bg: 'Део стикове', en: 'Deodorant Sticks' },
    'zaharni-eksfolianti': { bg: 'Ексфолианти', en: 'Exfoliants' },
    'losioni-i-masla': { bg: 'Лосиони и масла', en: 'Lotions & Oils' },
    'bio-balsami-za-ustni': { bg: 'Балсами за устни', en: 'Lip Balms' },
    'pochistvashti-grizha-za-litseto': { bg: 'Почистващи', en: 'Cleansers' },
    'kremove': { bg: 'Кремове', en: 'Creams' },
    'serumi': { bg: 'Серуми', en: 'Serums' },
    'shampoani': { bg: 'Шампоани', en: 'Shampoos' },
    'shampoanovi-blokcheta': { bg: 'Шампоанови блокчета', en: 'Shampoo Bars' },
    'promotsii': { bg: 'Промоции', en: 'Promotions' },
    'za-doma': { bg: 'За дома', en: 'Cleaning' },
  };

  // EN title priority: admin-entered nameEn from the DB, then the hardcoded
  // label map (legacy categories), then the Bulgarian title.
  const displayTitle = isEnglish && titleEn
    ? titleEn
    : categorySlug && CATEGORY_LABELS[categorySlug]
      ? CATEGORY_LABELS[categorySlug][isEnglish ? 'en' : 'bg']
      : title;
  const displayParentTitle = parentSlug && CATEGORY_LABELS[parentSlug]
    ? CATEGORY_LABELS[parentSlug][isEnglish ? 'en' : 'bg']
    : parentTitle;
  const subtitle = parentTitle
    ? (isEnglish
        ? `Natural products for ${displayParentTitle?.toLowerCase()}`
        : `Натурални продукти за ${displayParentTitle?.toLowerCase()}`)
    : (isEnglish
        ? 'Natural daily care with clean ingredients'
        : 'Натурална ежедневна грижа с чисти съставки');

  const HERO_IMAGES: Record<string, string> = {
    'losioni-i-masla':                  '/images/pc-top-image/body-butter-pc.png',
    'pochistvashti-grizha-za-litseto':  '/images/pc-top-image/clkeanser-top-pc.webp',
    'deo-stikove':                      '/images/pc-top-image/deo-cream-pc.png',
    'kremove':                          '/images/pc-top-image/kremove-top-pc.webp',
    'bio-balsami-za-ustni':             '/images/pc-top-image/lip-balm-pc.png',
    'zaharni-eksfolianti':              '/images/pc-top-image/scrub-pc.png',
    'serumi':                           '/images/pc-top-image/serum-top-pc.webp',
    'bio-dush-gelove':                  '/images/pc-top-image/shower-gel-pc.png',
    'shampoani':                        '/images/pc-top-image/089d4c89-c66c-4871-987b-cdedf5fc6a52.png',
    'shampoanovi-blokcheta':            '/images/pc-top-image/089d4c89-c66c-4871-987b-cdedf5fc6a52.png',
    'grizha-za-kosata':                 '/images/pc-top-image/089d4c89-c66c-4871-987b-cdedf5fc6a52.png',
    'bio-sapuni':                       '/images/pc-top-image/soap-pc-top-image.png',
    'promotsii':                        '/images/pc-top-image/promo-top-pc.png',
    'za-doma':                          '/images/pc-top-image/forthehome-pc-top.png',
  };
  const heroImage = categorySlug ? HERO_IMAGES[categorySlug] : undefined;
  const isPromotionsHero = categorySlug === 'promotsii';

  const SUBCATEGORIES: Record<string, { slug: string; nameBg: string; nameEn: string; image: string }[]> = {
    'grizha-za-tialoto': [
      { slug: 'bio-sapuni',          nameBg: 'Био сапуни',      nameEn: 'Bio Soaps',          image: '/images/pc-top-image/soap-pc-top-image.png' },
      { slug: 'bio-dush-gelove',     nameBg: 'Душ гелове',      nameEn: 'Shower Gels',        image: '/images/pc-top-image/shower-gel-pc.png' },
      { slug: 'deo-stikove',         nameBg: 'Део стикове',     nameEn: 'Deodorant Sticks',   image: '/images/pc-top-image/deo-cream-pc.png' },
      { slug: 'zaharni-eksfolianti', nameBg: 'Ексфолианти',     nameEn: 'Exfoliants',         image: '/images/pc-top-image/scrub-pc.png' },
      { slug: 'losioni-i-masla',     nameBg: 'Лосиони и масла', nameEn: 'Lotions & Oils',     image: '/images/pc-top-image/body-butter-pc.png' },
    ],
    'grizha-za-litseto': [
      { slug: 'bio-balsami-za-ustni',            nameBg: 'Балсами за устни', nameEn: 'Lip Balms',  image: '/images/pc-top-image/lip-balm-pc.png' },
      { slug: 'pochistvashti-grizha-za-litseto', nameBg: 'Почистващи',       nameEn: 'Cleansers',  image: '/images/pc-top-image/clkeanser-top-pc.webp' },
      { slug: 'kremove',                         nameBg: 'Кремове',         nameEn: 'Creams',     image: '/images/pc-top-image/kremove-top-pc.webp' },
      { slug: 'serumi',                          nameBg: 'Серуми',          nameEn: 'Serums',     image: '/images/pc-top-image/serum-top-pc.webp' },
    ],
  };
  const subcategories = categorySlug ? SUBCATEGORIES[categorySlug] : undefined;

  return (
    <div className="boj-category-page">
      <section className="boj-category-hero" style={{ position: 'relative' }}>
        {/* Per-category hero image (non-parent pages) */}
        {heroImage && !subcategories && (
          <div aria-hidden="true" style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: isPromotionsHero ? '67%' : '45%',
            backgroundImage: isPromotionsHero ? undefined : `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            maskImage: isPromotionsHero ? undefined : 'linear-gradient(to right, transparent 0%, black 35%)',
            WebkitMaskImage: isPromotionsHero ? undefined : 'linear-gradient(to right, transparent 0%, black 35%)',
            pointerEvents: 'none',
          }}>
            {isPromotionsHero && (
              <>
                <img
                  src={heroImage}
                  alt=""
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    height: '100%',
                    width: 'auto',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    objectPosition: 'right center',
                    maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.18) 18%, rgba(0,0,0,0.75) 36%, black 54%)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.18) 18%, rgba(0,0,0,0.75) 36%, black 54%)',
                  }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to right, rgba(247,243,233,0.92) 0%, rgba(247,243,233,0.34) 34%, rgba(247,243,233,0.02) 68%, transparent 100%)',
                }} />
              </>
            )}
          </div>
        )}
        <div className="boj-category-hero-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <div>
            <h1>{displayTitle}</h1>
            <p>{subtitle}</p>
          </div>
          {subcategories && (
            <div className="boj-subcategory-strip">
              {subcategories.map((sub) => (
                <a key={sub.slug} href={`/kategoria/${sub.slug}`} className="boj-subcategory-card">
                  <img src={sub.image} alt={isEnglish ? sub.nameEn : sub.nameBg} />
                  <span>{isEnglish ? sub.nameEn : sub.nameBg}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="boj-category-bar">
        <div className={`boj-category-bar-inner${filtersEnabled ? '' : ' boj-category-bar-inner--no-filters'}`}>
          {filtersEnabled ? (
            <button onClick={() => setFiltersVisible((value) => !value)} className="boj-filter-toggle">
              {filtersVisible ? 'Скрий филтрите' : 'Покажи филтрите'}
              {filtersVisible ? <ChevronUp size={13} strokeWidth={1.5} /> : <ChevronDown size={13} strokeWidth={1.5} />}
            </button>
          ) : (
            <div aria-hidden="true" />
          )}

          <div className="boj-sort-wrap">
            <div className="boj-select-shell">
              <select id="category-sort" value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Сортирай по">
                <option value="default">СОРТИРАЙ ПО</option>
                <option value="popularity">{tr.filters.sortPopular}</option>
                <option value="rating">{tr.filters.sortRating}</option>
                <option value="newest">{tr.filters.sortNewest}</option>
                <option value="price-asc">{tr.filters.sortPriceAsc}</option>
                <option value="price-desc">{tr.filters.sortPriceDesc}</option>
              </select>
              <ChevronDown size={12} strokeWidth={1.6} />
            </div>
          </div>
        </div>
      </div>

      <main className={`boj-category-main${filtersEnabled ? (showFilters ? '' : ' boj-category-main--wide') : ' boj-category-main--no-filters'}`}>
        {filtersEnabled && (
        <aside className={`boj-filter-rail${showFilters ? '' : ' boj-filter-rail--hidden'}`} aria-label="Филтри" aria-hidden={!showFilters}>
            <FilterSection title={firstFilterTitle}>
              {firstFilterOptions.map((option) => (
                <label key={option} className="boj-check">
                  <input
                    type="checkbox"
                    tabIndex={showFilters ? 0 : -1}
                    checked={(isFaceCare || isBodyCare) ? selectedSuitable.includes(option) : undefined}
                    onChange={(isFaceCare || isBodyCare) ? () => toggleSuitable(option) : undefined}
                  /> {option}
                </label>
              ))}
            </FilterSection>

            {showSecondFilter && (
              <FilterSection title={filterGroups.secondTitle}>
                {filterGroups.secondOptions.map((option) => (
                  <label key={option} className="boj-check">
                    <input
                      type="checkbox"
                      tabIndex={showFilters ? 0 : -1}
                      checked={isBodyCare ? selectedScents.includes(option) : undefined}
                      onChange={isBodyCare ? () => toggleScent(option) : undefined}
                    /> {option}
                  </label>
                ))}
              </FilterSection>
            )}
        </aside>
        )}

        <section className="boj-products-area">
          {shown.length > 0 ? (
            <div className="boj-product-grid">
              {shown.map((product) => (
                <ProductCard key={product.id} product={product} variant="bojCategory" />
              ))}
            </div>
          ) : (
            <p className="boj-empty">{tr.filters.noProducts}</p>
          )}

          {shown.length < filtered.length && (
            <div className="boj-load-more">
              <button onClick={() => setPerPage((value) => value + 12)}>Зареди още</button>
            </div>
          )}
        </section>
      </main>

      <style>{`
        .boj-category-page {
          background: #fff;
          color: #111;
        }

        .boj-category-hero {
          min-height: 228px;
          display: flex;
          align-items: center;
          background:
            radial-gradient(ellipse at 18% 26%, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.58) 20%, transparent 42%),
            radial-gradient(ellipse at 72% 36%, rgba(235,231,213,0.82) 0%, rgba(235,231,213,0.42) 34%, transparent 63%),
            linear-gradient(106deg, #eef4ec 0%, #f7f3e9 48%, #ebe8d9 100%);
          overflow: hidden;
        }

        .boj-category-hero-inner {
          width: min(100%, 1234px);
          margin: 0 auto;
          padding: 18px 24px;
        }

        .boj-category-hero h1 {
          margin: 0 0 14px;
          font-family: ${fd};
          font-size: clamp(31px, 2.4vw, 42px);
          line-height: 1.05;
          font-weight: 500;
          letter-spacing: 0;
          color: #090909;
        }

        .boj-category-hero p {
          margin: 0;
          max-width: 520px;
          font-family: ${fb};
          font-size: 15px;
          line-height: 1.55;
          color: #111;
        }

        .boj-subcategory-strip {
          display: flex;
          gap: 10px;
          align-items: stretch;
          height: 174px;
          flex: 0 0 auto;
        }

        .boj-subcategory-card {
          position: relative;
          display: block;
          width: 128px;
          height: 100%;
          overflow: hidden;
          text-decoration: none;
          color: #fff;
          background: #fff;
        }

        .boj-subcategory-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.35s ease;
        }

        .boj-subcategory-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0.28) 42%, rgba(255,255,255,0.02) 100%);
          pointer-events: none;
        }

        .boj-subcategory-card span {
          position: absolute;
          left: 10px;
          right: 10px;
          bottom: 12px;
          z-index: 1;
          margin: 0;
          font-family: ${fb};
          font-size: 11px;
          line-height: 1.18;
          font-weight: 700;
          color: #3F332D;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          text-align: center;
          text-shadow: 0 1px 10px rgba(255,255,255,0.72);
        }

        .boj-subcategory-card:hover img {
          transform: scale(1.04);
        }

        .boj-category-bar {
          border-top: 1px solid #eee;
          border-bottom: 1px solid #eeeeec;
          background: #fff;
        }

        .boj-category-bar-inner {
          width: min(100%, 1234px);
          height: 58px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 258px 1fr;
          align-items: center;
          padding: 0 24px;
        }

        .boj-category-bar-inner--no-filters {
          grid-template-columns: 1fr;
        }

        .boj-category-bar-inner--no-filters .boj-sort-wrap {
          border-left: 0;
        }

        .boj-filter-toggle {
          height: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: flex-start;
          gap: 12px;
          border: 0;
          background: transparent;
          cursor: pointer;
          font-family: ${fb};
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          color: #111;
        }

        .boj-sort-wrap {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 14px;
          border-left: 1px solid #eeeeec;
        }

        .boj-count {
          font-family: ${fb};
          font-size: 11px;
          color: #9b9b9b;
        }

        .boj-sort-label {
          font-family: ${fb};
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #111;
        }

        .boj-select-shell {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        .boj-select-shell select {
          appearance: none;
          border: 0;
          outline: 0;
          background: transparent;
          cursor: pointer;
          font-family: ${fb};
          font-size: 11px;
          color: #111;
          padding: 0;
        }

        .boj-category-main {
          width: min(100%, 1234px);
          margin: 0 auto;
          display: grid;
          grid-template-columns: 258px minmax(0, 1fr);
          gap: 30px;
          padding: 30px 24px 72px;
          transition: grid-template-columns 0.42s cubic-bezier(0.22, 1, 0.36, 1), gap 0.42s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .boj-category-main--wide {
          grid-template-columns: 0px minmax(0, 1fr);
          gap: 0;
        }

        .boj-category-main--no-filters {
          grid-template-columns: 1fr;
          gap: 0;
        }

        .boj-filter-rail {
          border-right: 1px solid #eeeeec;
          min-height: 140px;
          padding-right: 28px;
          overflow: hidden;
          opacity: 1;
          transform: translateX(0);
          transition: opacity 0.26s ease, transform 0.42s cubic-bezier(0.22, 1, 0.36, 1), padding-right 0.42s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.26s ease;
          will-change: opacity, transform;
        }

        .boj-filter-rail--hidden {
          opacity: 0;
          pointer-events: none;
          padding-right: 0;
          border-right-color: transparent;
          transform: translateX(-18px);
        }

        .boj-products-area {
          min-width: 0;
          transition: transform 0.42s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .boj-filter-section {
          border-bottom: 1px solid #eeeeec;
        }

        .boj-filter-trigger {
          width: 100%;
          min-height: 51px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          border: 0;
          background: transparent;
          cursor: pointer;
          padding: 0;
          font-family: ${fb};
          font-size: 13px;
          font-weight: 400;
          color: #1d1d1d;
        }

        .boj-filter-body {
          padding: 0 0 17px;
        }

        .boj-range {
          width: 100%;
          accent-color: #111;
        }

        .boj-filter-note {
          margin: 6px 0 0;
          font-family: ${fb};
          font-size: 11px;
          color: #777;
        }

        .boj-check {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 9px;
          cursor: pointer;
          font-family: ${fb};
          font-size: 12px;
          color: #333;
        }

        .boj-check input {
          accent-color: #111;
        }

        .boj-product-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 28px 28px;
          transition: gap 0.42s cubic-bezier(0.22, 1, 0.36, 1);
        }

        @media (prefers-reduced-motion: reduce) {
          .boj-category-main,
          .boj-filter-rail,
          .boj-products-area,
          .boj-product-grid {
            transition: none !important;
          }
        }

        .boj-empty {
          margin: 48px 0;
          text-align: center;
          font-family: ${fb};
          font-size: 14px;
          color: #999;
        }

        .boj-load-more {
          margin-top: 54px;
          text-align: center;
        }

        .boj-load-more button {
          border: 1px solid #111;
          background: transparent;
          color: #111;
          cursor: pointer;
          padding: 12px 34px;
          font-family: ${fb};
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .boj-product-grid .product-card--boj-category {
          padding: 0 !important;
          border-radius: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
          transform: none !important;
        }

        .boj-product-grid .product-card--boj-category:hover {
          transform: none !important;
          box-shadow: none !important;
        }

        .boj-product-grid .product-card--boj-category > a:first-of-type {
          margin-bottom: 10px !important;
        }

        .boj-product-grid .product-card--boj-category .product-card-img-wrap {
          aspect-ratio: 1 / 1 !important;
          border-radius: 0 !important;
          overflow: hidden !important;
          margin-bottom: 0 !important;
        }

        .boj-product-grid .product-card--boj-category .product-img {
          object-fit: contain !important;
          width: 100% !important;
          height: 100% !important;
          padding: 2% !important;
          mix-blend-mode: multiply;
        }

        .boj-product-grid .product-card--boj-category.product-card--photo-image .product-card-img-wrap {
          background: #fff !important;
        }

        .boj-product-grid .product-card--boj-category.product-card--lipbalm-image .product-card-img-wrap {
          background: #fff !important;
        }

        .boj-product-grid .product-card--boj-category.product-card--photo-image .product-img {
          object-fit: cover !important;
          padding: 0 !important;
          mix-blend-mode: normal;
        }

        .boj-product-grid .product-card--boj-category .product-card-rating {
          margin: 0 0 2px !important;
          gap: 2px !important;
          min-height: 17px;
          color: #f3a8b5 !important;
        }

        .boj-product-grid .product-card--boj-category .product-card-rating svg {
          color: #f3a8b5 !important;
          width: 14px !important;
          height: 14px !important;
        }

        .boj-product-grid .product-card--boj-category .product-card-rating span {
          margin-left: 6px;
          font-size: 11px !important;
          color: #333 !important;
        }

        .boj-product-grid .product-card--boj-category .card-title {
          margin: 0 0 2px !important;
          font-family: ${fb} !important;
          font-size: 15px !important;
          line-height: 1.25 !important;
          min-height: 1.25em;
          font-weight: 600 !important;
          color: #1a1a1a !important;
          letter-spacing: 0 !important;
          text-align: left !important;
          display: -webkit-box !important;
          -webkit-line-clamp: 1 !important;
          -webkit-box-orient: vertical !important;
          overflow: hidden !important;
        }

        .boj-product-grid .product-card--boj-category .card-desc-all {
          display: -webkit-box !important;
          -webkit-line-clamp: 1 !important;
          -webkit-box-orient: vertical !important;
          overflow: hidden !important;
          margin: 0 0 10px !important;
          font-family: ${fb} !important;
          font-size: 13px !important;
          line-height: 1.4 !important;
          min-height: 1.4em;
          color: #756B65 !important;
          text-align: left !important;
        }

        .boj-product-grid .product-card--boj-category .boj-price-strip {
          position: relative;
          overflow: hidden;
          height: 37px;
          display: flex !important;
          align-items: center;
          justify-content: center;
          border: 0 !important;
          border-radius: 0 !important;
          background: #F9E8EC !important;
          color: #3F332D !important;
          padding: 0 14px !important;
          opacity: 1 !important;
          font-family: ${fb} !important;
          font-size: 13px !important;
          font-weight: 400 !important;
          letter-spacing: 0 !important;
          text-transform: none !important;
          line-height: 1 !important;
          transition: background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease !important;
        }

        .boj-product-grid .product-card--boj-category .boj-price-strip::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.0) 34%, rgba(255,255,255,0.72) 48%, rgba(255,255,255,0.0) 62%, transparent 100%);
          transform: translateX(-120%);
          transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
        }

        .boj-product-grid .product-card--boj-category .boj-price-strip.boj-strip-sale {
          justify-content: space-between;
        }

        .boj-product-grid .product-card--boj-category .boj-save {
          font-size: 12.5px;
          font-weight: 600;
          color: #3F332D;
          transition: color 0.25s ease;
        }

        .boj-product-grid .product-card--boj-category .boj-old {
          font-size: 12.5px;
          color: #A89A90;
          text-decoration: line-through;
          transition: color 0.25s ease;
        }

        .boj-product-grid .product-card--boj-category .boj-price-strip:hover {
          background: linear-gradient(135deg, #EAF4E3 0%, #D6EBCB 48%, #F4FAEF 100%) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.85), 0 10px 24px -20px rgba(92, 115, 80, 0.75);
        }

        .boj-product-grid .product-card--boj-category .boj-price-strip:hover::after {
          transform: translateX(120%);
        }

        .boj-product-grid .product-card--boj-category .boj-current {
          color: #3F332D;
          font-size: 14px;
          font-weight: 600;
          transition: color 0.25s ease;
        }

        .boj-product-grid .product-card--boj-category .boj-strip-sale .boj-current {
          color: #C2453F;
        }

        .boj-product-grid .product-card--boj-category .boj-price-strip:hover .boj-current,
        .boj-product-grid .product-card--boj-category .boj-price-strip:hover .boj-save {
          color: #2f4128;
        }

        .boj-product-grid .product-card--boj-category .boj-price-strip:hover .boj-old {
          color: rgba(47, 65, 40, 0.48);
        }

        @media (min-width: 1400px) {
          .boj-category-hero-inner,
          .boj-category-bar-inner,
          .boj-category-main {
            width: 1400px;
          }
        }

        @media (max-width: 1023px) {
          .boj-category-hero-inner {
            gap: 26px;
          }

          .boj-subcategory-strip {
            height: 150px;
            overflow-x: auto;
            max-width: 56vw;
            scrollbar-width: none;
          }

          .boj-subcategory-strip::-webkit-scrollbar {
            display: none;
          }

          .boj-subcategory-card {
            width: 118px;
            flex: 0 0 118px;
          }

          .boj-category-bar-inner,
          .boj-category-main {
            grid-template-columns: 220px minmax(0, 1fr);
          }

          .boj-category-main--wide {
            grid-template-columns: 0px minmax(0, 1fr);
            gap: 0;
          }

          .boj-category-main--no-filters {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .boj-product-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .boj-category-hero {
            min-height: 190px;
          }

          .boj-category-hero-inner {
            padding: 30px 18px 24px;
            flex-direction: column;
            align-items: flex-start !important;
          }

          .boj-subcategory-strip {
            width: 100%;
            max-width: 100%;
            height: 132px;
          }

          .boj-subcategory-card {
            width: 112px;
            flex-basis: 112px;
          }

          .boj-category-bar-inner {
            height: auto;
            min-height: 56px;
            display: flex;
            justify-content: space-between;
            gap: 16px;
            padding: 0 18px;
          }

          .boj-sort-wrap {
            border-left: 0;
            gap: 8px;
          }

          .boj-count,
          .boj-sort-label {
            display: none;
          }

          .boj-category-main {
            display: block;
            padding: 18px 18px 52px;
          }

          .boj-filter-rail {
            border-right: 0;
            border-bottom: 1px solid #eeeeec;
            padding: 0 0 12px;
            margin-bottom: 22px;
            max-height: 460px;
            transition: opacity 0.26s ease, transform 0.36s cubic-bezier(0.22, 1, 0.36, 1), max-height 0.42s cubic-bezier(0.22, 1, 0.36, 1), margin-bottom 0.42s cubic-bezier(0.22, 1, 0.36, 1), padding-bottom 0.42s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.26s ease;
          }

          .boj-filter-rail--hidden {
            max-height: 0;
            padding-bottom: 0;
            margin-bottom: 0;
            border-bottom-color: transparent;
            transform: translateY(-10px);
          }

          .boj-product-grid {
            grid-template-columns: 1fr;
            gap: 34px;
          }
        }
      `}</style>
    </div>
  );
}
