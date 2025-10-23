
"use client";
import { useRouter } from "next/navigation";
import { ProductData } from '@/types/types';
import styles from './CardProduct.module.scss';

interface CardProductProps {
  product: ProductData;
}

export function CardProduct({ product }: CardProductProps) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/dashboard/product/${product.id}`);
  };

  return (
    <div className={styles.card + (!product.status ? ' ' + styles.inactive : '')}>
      <div className={styles.imageWrapper}>
        {product.banner ? (
          <img src={`http://localhost:3333/files/${product.banner}`} alt={product.name} className={styles.image} />
        ) : (
          <div className={styles.noImage}>Sem imagem</div>
        )}
      </div>
      <div className={styles.info}>
        <h2>{product.name}</h2>
        <p className={styles.desc}>{product.description}</p>
        <div className={styles.bottom}>
          <span className={styles.price}>R$ {Number(product.price).toFixed(2)}</span>
          <button className={styles.editButton} onClick={handleEdit}>
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}
