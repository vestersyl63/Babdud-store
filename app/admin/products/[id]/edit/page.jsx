'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AdminProductForm from '../../../../../components/AdminProductForm.jsx';

export default function EditProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then((r) => r.json())
      .then((d) => {
        const p = d.product;
        setProduct({
          name: p.name,
          description: p.description || '',
          price: String(p.price),
          previous_price: p.previous_price ? String(p.previous_price) : '',
          stock: String(p.stock),
          category_id: p.category_id ? String(p.category_id) : '',
          specs: p.specs || '',
          variations: p.variations || '',
          active: Boolean(p.active),
          images: (p.images || []).map((i) => i.url),
        });
      });
  }, [id]);

  return (
    <div>
      <h1 className="mb-4 font-display text-lg font-bold">Edit product</h1>
      {product ? <AdminProductForm initial={product} editing={id} /> : <div className="skeleton h-96 rounded-2xl" />}
    </div>
  );
}
