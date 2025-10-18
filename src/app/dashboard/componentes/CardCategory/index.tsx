'use client'
import styles from "./cardCategory.module.scss"
import {  useState } from "react";
import { CategoryData } from "@/types/types";

import { useRouter } from "next/navigation"

interface CategoryProps {
    category: CategoryData;
}

export function CardCategory({ category }: CategoryProps) {
    const [timeActive, setTimeActive] = useState("");
    const router = useRouter()

      async function handleUpdate() {
        router.replace(`/dashboard/category/${category.id}`)
    }
    const statusColor: Record<string, string> = {
        "Em Preparo": "var(--dourado)",
        "Pronto": "var(--oliva)",
        "Entregue": "var(--bordo)",
        "Finalizado": "var(--black)",
    }

    return (
        <button className={styles.container}
            onClick={handleUpdate}>
            <section className={styles.card}>
                <div className={styles.cardHeader}>
                    icon e name
                </div>
                <div className={styles.cardBody}>
                    <button> Editar </button>
                </div>
            </section>
        </button>
    )
}