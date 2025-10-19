'use client'
import styles from "./cardCategory.module.scss"
import { CategoryData } from "@/types/types";
import { useRouter } from "next/navigation"
import * as Icons from 'lucide-react'

interface CategoryProps {
    category: CategoryData;
}

export function CardCategory({ category }: CategoryProps) {

    function getIcon(iconName: string,): React.ComponentType<any> {
        const IconComponent = (Icons as any)[iconName];
        return IconComponent;
    }

    const IconComponent = getIcon(category.icon);

    const router = useRouter()

    function handleUpdate() {
        router.replace(`/dashboard/category/${category.id}`)
    }

    return (
        <main className={styles.container}>
            <section className={styles.card}>
                <div className={styles.cardHeader}>
                    <div className={styles.headerIcon} style={{ background: category.color }}>
                        <IconComponent
                            size={30}
                            color='white'
                            strokeWidth={2}
                        />
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