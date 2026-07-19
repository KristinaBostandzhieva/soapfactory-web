import { notFound } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import { updateProduct } from '@/app/admin/actions';
import { prisma } from '@/lib/prisma';
import { getCategoryOptions, productImages } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, include: { categories: { select: { id: true } } } });
  if (!product) notFound();

  const categories = await getCategoryOptions();

  const imgs = productImages(product.images);
  const initial = {
    name: product.name, slug: product.slug, price: product.price, sku: product.sku,
    shortDescription: product.shortDescription, description: product.description, weight: product.weight,
    nameEn: product.nameEn, shortDescriptionEn: product.shortDescriptionEn, descriptionEn: product.descriptionEn,
    inStock: product.inStock, featured: product.featured,
    imageUrl: imgs[0] || '', imageUrl2: imgs[1] || '',
    hoverImage: product.hoverImage || '',
    categoryId: product.categories[0]?.id || '',
    stockQty: product.stockQty,
  };

  return <ProductForm action={updateProduct.bind(null, id)} categories={categories} initial={initial} heading="Редактиране на продукт" />;
}
