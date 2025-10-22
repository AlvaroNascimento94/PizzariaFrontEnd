'use client'
import styles from "./styles.module.scss"
import { useEffect, useState } from "react";
import { Circle } from "lucide-react";
import { useRouter } from "next/navigation"

interface TableGroupData {
    tableId: string;
    tableName: string;
    totalOrders: number;
    totalPrice: number;
    createdAt: string;
    status: string;
    statusPriority: number;
    itemsByStatus: {
        aguardando: number;
        emPreparo: number;
        pronto: number;
        entregue: number;
        finalizado: number;
        cancelado: number;
    };
    orders: any[];
}

interface OrderProps {
    order: TableGroupData;
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
        router.replace(`/dashboard/order/${order.orders[0].id}`);
    }

    useEffect(() => {
        const updateTime = () => {
            setTimeActive(calculateTimeActive(order.createdAt));
        };

        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, [order.createdAt]);

    const statusName = order.status;
    const tableName = order.tableName;
    const itemsProntos = order.itemsByStatus.pronto;
    const hasItemsProntos = itemsProntos > 0;

    const statusColor: Record<string, string> = {
        "Aguardando": "var(--bege)",
        "Em Preparo": "var(--dourado2)",
        "Pronto": "var(--oliva)",
        "Entregue": "var(--bordo)",
        "Finalizado": "var(--black)",
    }

    const borderColor = statusColor[statusName] || "var(--bege)";
    
    const cardStyle = hasItemsProntos ? {
        border: `4px solid var(--oliva)`,
        boxShadow: '0 0 20px rgba(146, 147, 80, 0.4)',
        animation: 'pulse 2s infinite'
    } : {
        border: `3px solid ${borderColor}`
    };
    
    return (
        <button className={styles.container} style={cardStyle}
            onClick={handleOrder}>
            <section className={styles.card}>
                <div className={styles.cardHeader}>
                    <p>{tableName}</p>
                    <Circle size={15} style={{
                        borderRadius: "100%",
                        color: ` ${borderColor}`, 
                        backgroundColor: `${borderColor}`
                    }} />
                </div>
                
                {hasItemsProntos && (
                    <div className={styles.badge}>
                        🔔 {itemsProntos} {itemsProntos === 1 ? 'pronto' : 'prontos'}
                    </div>
                )}
                
                <div className={styles.cardBody}>
                    <div className={styles.status}>
                        {statusName}
                    </div>
                    

                    <div className={styles.itemsCounter}>
                        {order.itemsByStatus.aguardando > 0 && (
                            <span className={styles.counterBadge}>⏳ {order.itemsByStatus.aguardando}</span>
                        )}
                        {order.itemsByStatus.emPreparo > 0 && (
                            <span className={styles.counterBadge}>🔥 {order.itemsByStatus.emPreparo}</span>
                        )}
                        {order.itemsByStatus.pronto > 0 && (
                            <span className={styles.counterBadge}>✅ {order.itemsByStatus.pronto}</span>
                        )}
                        {order.itemsByStatus.entregue > 0 && (
                            <span className={styles.counterBadge}>🚀 {order.itemsByStatus.entregue}</span>
                        )}
                    </div>
                    
                    <div className={styles.time}>
                        <p>Duração: </p>
                        <p>{timeActive}</p>
                    </div>
                </div>
            </section>
        </button>
    )
}