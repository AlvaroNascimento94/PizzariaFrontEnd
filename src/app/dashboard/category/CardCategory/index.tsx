'use client'
import styles from "./cardCategory.module.scss"
import { CategoryData } from "@/types/types";
import { useRouter } from "next/navigation"

interface CategoryProps {
    category: CategoryData;
}

export function CardCategory({ category }: CategoryProps) {
    const router = useRouter()

    function handleUpdate() {
        router.replace(`/dashboard/category/${category.id}`)
    }

    // Verifica se é emoji (1-2 caracteres) ou se contém emoji Unicode
    const isEmoji = category.icon && category.icon.length <= 2;

    return (
        <main className={styles.container}>
            <section className={styles.card}>
                <div className={styles.cardHeader}>
                    <div className={styles.headerIcon} style={{ background: category.color }}>
                        {isEmoji ? (
                            <span style={{ fontSize: '30px' }}>{category.icon}</span>
                        ) : (
                            <span style={{ fontSize: '30px' }}>❓</span>
                        )}
                    </div>
                    <p>{category.name}</p>
                </div>
                <div className={styles.cardBody}>
                    <button onClick={handleUpdate}> Editar </button>
                </div>
            </section>
        </main>
    )
}