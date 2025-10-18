'use client'
import styles from "./styles.module.scss"
import { useEffect, useState } from "react";
import { OrderData } from "@/types/types";
import { Circle } from "lucide-react";
import { useRouter } from "next/navigation"

interface OrderProps {
    order: OrderData;
}

export function Orders({ order }: OrderProps) {
    const [timeActive, setTimeActive] = useState("");
    const router = useRouter()

    function calculateTimeActive(createdAt: string): string {
        const created = new Date(createdAt);
        const now = new Date();
        const diffMs = now.getTime() - created.getTime();

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}h ${minutes}min`;
        }
        return `${minutes}min`;
    }

    function handleOrder() {
        router.replace(`/dashboard/order/${order.id}`);
    }

    useEffect(() => {
        const updateTime = () => {
            setTimeActive(calculateTimeActive(order.createdAt));
        };

        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, [order.createdAt]);

    const statusName = order.orderStatus.name;
    const tableName = order.tables.name;
    const price = order.price.toFixed(2);

    const statusColor: Record<string, string> = {
        "Em Preparo": "var(--dourado)",
        "Pronto": "var(--oliva)",
        "Entregue": "var(--bordo)",
        "Finalizado": "var(--black)",
    }

    const borderColor = statusColor[statusName] || "var(--bege)";

    return (
        <button className={styles.container} style={{
            border: `3px solid ${borderColor}`
        }}
            onClick={handleOrder}>
            <section className={styles.card}>
                <div className={styles.cardHeader}>
                    <p>{tableName}</p> <Circle size={15} style={{
                        borderRadius: "100%",
                        color: ` ${borderColor}`, backgroundColor: `${borderColor}`
                    }} />
                </div>
                <div className={styles.cardBody}>
                    <div className={styles.status}>
                        {statusName}
                    </div>
                    <div className={styles.price}>
                        R$ {price}
                    </div>
                    <div className={styles.time}>
                        <p>ClienteChegou:</p>
                        <p>
                            {timeActive}
                        </p>
                    </div>
                </div>
            </section>
        </button>
    )
}