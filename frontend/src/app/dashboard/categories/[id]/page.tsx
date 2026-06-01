'use client';

import { useParams } from 'next/navigation';
import { CategoryDetail } from '@/features/categories/category-detail';

export default function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  return <CategoryDetail id={id}/>;
}
