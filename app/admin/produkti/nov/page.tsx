import ProductForm from '@/components/admin/ProductForm';
import { createProduct } from '@/app/admin/actions';
import { getCategoryOptions } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const categories = await getCategoryOptions();
  return <ProductForm action={createProduct} categories={categories} heading="Нов продукт" />;
}
