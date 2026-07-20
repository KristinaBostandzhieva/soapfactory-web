export interface Product {
  id: string;
  name: string;
  price: number;
  priceMax?: number;
  slug: string;
  image?: string;
  category: string;        // top-level category slug
  subcategory?: string;
  description?: string;
  promo?: boolean;         // featured in Промоции
}

export interface Category {
  slug: string;
  title: string;
  parent?: string;
  image?: string;
}

export const categories: Category[] = [
  { slug: 'grizha-za-tialoto', title: 'Грижа за тялото', image: '/images/cat-ytalo.png' },
  { slug: 'bio-sapuni', title: 'Био сапуни', parent: 'grizha-za-tialoto' },
  { slug: 'bio-dush-gelove', title: 'Био душ гелове', parent: 'grizha-za-tialoto' },
  { slug: 'deo-stikove', title: 'Део стикове', parent: 'grizha-za-tialoto' },
  { slug: 'zaharni-eksfolianti', title: 'Ексфолианти', parent: 'grizha-za-tialoto' },
  { slug: 'losioni-i-masla', title: 'Лосиони и масла', parent: 'grizha-za-tialoto' },
  { slug: 'grizha-za-litseto', title: 'Грижа за лицето', image: '/images/cat-litse.png' },
  { slug: 'bio-balsami-za-ustni', title: 'Био балсами за устни', parent: 'grizha-za-litseto' },
  { slug: 'kremove', title: 'Кремове', parent: 'grizha-za-litseto' },
  { slug: 'pochistvashti', title: 'Почистващи', parent: 'grizha-za-litseto' },
  { slug: 'velvet', title: 'Серия Velvet', parent: 'grizha-za-litseto' },
  { slug: 'grizha-za-kosata', title: 'Грижа за косата', image: '/images/cat-hair.png' },
  { slug: 'shampoane', title: 'Шампоани', parent: 'grizha-za-kosata' },
  { slug: 'shampoanovi-blokcheta', title: 'Шампоанови блокчета', parent: 'grizha-za-kosata' },
  { slug: 'promotsii', title: 'Промоции' },
];

export const products: Product[] = [
  // shampoos
  { id: 'n1', name: 'Happyhair шампоан при пърхот', price: 12.99, slug: 'happyhair-parhot', image: '/images/new1.webp', category: 'grizha-za-kosata', subcategory: 'shampoane', promo: true },
  { id: 'n2', name: 'Хидратиращ шампоан за коса', price: 12.99, slug: 'hidratirasht-shampoan', image: '/images/new2.jpg', category: 'grizha-za-kosata', subcategory: 'shampoane' },
  { id: 'n3', name: 'Регенериращ шампоан за коса', price: 12.99, slug: 'regenerirasht-shampoan', image: '/images/new3.jpg', category: 'grizha-za-kosata', subcategory: 'shampoane' },
  { id: 'n4', name: 'БИО Билков шампоан – за здрав скалп', price: 12.99, slug: 'bio-bilkov-shampoan', image: '/images/new4.webp', category: 'grizha-za-kosata', subcategory: 'shampoane' },
  // shampoo blocks
  { id: 'sb1', name: 'БИО Шампоаново блокче Витаминт', price: 8.99, slug: 'blokche-vitamint', image: '/images/new1.webp', category: 'grizha-za-kosata', subcategory: 'shampoanovi-blokcheta' },
  { id: 'sb2', name: 'Шампоаново блокче Детокс', price: 8.99, slug: 'blokche-detoks', image: '/images/new4.webp', category: 'grizha-za-kosata', subcategory: 'shampoanovi-blokcheta' },
  { id: 'sb3', name: 'Шампоаново блокче Алое', price: 8.99, slug: 'blokche-aloe', image: '/images/new2.jpg', category: 'grizha-za-kosata', subcategory: 'shampoanovi-blokcheta' },
  { id: 'sb4', name: 'Шампоаново блокче Лавандула', price: 8.99, slug: 'blokche-lavandula', image: '/images/new3.jpg', category: 'grizha-za-kosata', subcategory: 'shampoanovi-blokcheta' },
  // soaps
  { id: 'b1', name: 'Билков сапун', price: 3.49, slug: 'bilkov-sapun', image: '/images/soap1.jpg', category: 'grizha-za-tialoto', subcategory: 'bio-sapuni', promo: true },
  { id: 'b2', name: 'Сапун Иланг-Иланг', price: 3.49, slug: 'sapun-ilang', image: '/images/soap2.jpg', category: 'grizha-za-tialoto', subcategory: 'bio-sapuni' },
  { id: 'b3', name: 'Сапун Сандалово дърво', price: 3.49, slug: 'sapun-sandalovo', image: '/images/soap3.jpg', category: 'grizha-za-tialoto', subcategory: 'bio-sapuni' },
  { id: 'b4', name: 'Сапун Лавандула', price: 3.49, slug: 'sapun-lavandula', image: '/images/soap4.jpg', category: 'grizha-za-tialoto', subcategory: 'bio-sapuni' },
  { id: 's5', name: 'Сапун Цветен', price: 3.49, slug: 'sapun-cveten', image: '/images/soap5.jpg', category: 'grizha-za-tialoto', subcategory: 'bio-sapuni' },
  { id: 's6', name: 'Сапун Морков', price: 3.49, slug: 'sapun-morkov', image: '/images/soap6.jpg', category: 'grizha-za-tialoto', subcategory: 'bio-sapuni' },
  { id: 's7', name: 'Слънчев сапун', price: 3.49, slug: 'slanchev-sapun', category: 'grizha-za-tialoto', subcategory: 'bio-sapuni' },
  { id: 's8', name: 'Сапун Бебчо', price: 3.49, slug: 'sapun-bebcho', category: 'grizha-za-tialoto', subcategory: 'bio-sapuni' },
  { id: 's9', name: 'Сапун Портокал и Канела', price: 3.49, slug: 'sapun-portokal-kanela', category: 'grizha-za-tialoto', subcategory: 'bio-sapuni' },
  { id: 's10', name: 'Сапун Детокс', price: 3.49, slug: 'sapun-detoks', category: 'grizha-za-tialoto', subcategory: 'bio-sapuni' },
  // deo
  { id: 'd1', name: 'Дeo стик – Слънчев', price: 7.99, slug: 'deo-slanchev', image: '/images/soap2.jpg', category: 'grizha-za-tialoto', subcategory: 'deo-stikove', promo: true },
  { id: 'd2', name: 'Дeo стик – Сандалово дърво', price: 7.99, slug: 'deo-sandalovo', image: '/images/soap3.jpg', category: 'grizha-za-tialoto', subcategory: 'deo-stikove' },
  { id: 'd3', name: 'Дeo стик – лайм и бергамот', price: 7.99, slug: 'deo-laim-bergamot', image: '/images/soap5.jpg', category: 'grizha-za-tialoto', subcategory: 'deo-stikove' },
  { id: 'd4', name: 'Дeo стик – Ванилия и лайм', price: 7.99, slug: 'deo-vanilia-laim', category: 'grizha-za-tialoto', subcategory: 'deo-stikove' },
  // face
  { id: 'f1', name: 'Балсам за устни – Портокал и канела', price: 4.99, slug: 'balsam-portokal', image: '/images/cat-litse.png', category: 'grizha-za-litseto', subcategory: 'bio-balsami-za-ustni' },
  { id: 'f2', name: 'Bakuchiol Anti-Ageing крем', price: 24.99, slug: 'bakuchiol-krem', image: '/images/velvet.jpeg', category: 'grizha-za-litseto', subcategory: 'velvet', promo: true },
  { id: 'f3', name: 'Хидратиращ крем за лице', price: 19.99, slug: 'hidratirasht-krem', category: 'grizha-za-litseto', subcategory: 'kremove' },
  { id: 'f4', name: 'Почистващ гел за лице', price: 14.99, slug: 'pochistvasht-gel', category: 'grizha-za-litseto', subcategory: 'pochistvashti' },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function productsInCategory(slug: string) {
  if (slug === 'promotsii') return products.filter((p) => p.promo);
  return products.filter((p) => p.category === slug || p.subcategory === slug);
}

export function relatedProducts(p: Product, n = 4) {
  return products.filter((x) => x.id !== p.id && (x.subcategory === p.subcategory || x.category === p.category)).slice(0, n);
}
