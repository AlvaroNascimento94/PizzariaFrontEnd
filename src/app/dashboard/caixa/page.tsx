'use client'
import { useEffect, useState } from "react";
import { getCookieCliente } from "@/lib/cookieClient";
import { api } from "@/services/api";
import styles from "../dashboard.module.scss";
import { Orders } from "../orders";
import { OrderData } from "@/types/types";

export default function CaixaDashboard() {
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalDay, setTotalDay] = useState(0);

    useEffect(() => {
        async function loadOrders() {
            try {
                const token = getCookieCliente();
                const response = await api.get("/orders", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // Filtra pedidos "Pronto" ou "Finalizado"
                const filteredOrders = response.data
                    .filter((order: OrderData) => 
                        order.orderStatus.name === "Pronto" || 
                        order.orderStatus.name === "Finalizado"
                    )
                    .sort((a: OrderData, b: OrderData) => 
                        b.tables.name.localeCompare(a.tables.name)
                    );

                setOrders(filteredOrders);

                // Calcula total do dia (apenas pedidos finalizados de hoje)
                const today = new Date().toDateString();
                const todayTotal = response.data
                    .filter((order: OrderData) => 
                        order.orderStatus.name === "Finalizado" &&
                        new Date(order.createdAt).toDateString() === today
                    )
                    .reduce((sum: number, order: OrderData) => sum + Number(order.price), 0);

                setTotalDay(todayTotal);
            } catch (error) {
                console.error("Erro ao carregar pedidos:", error);
            } finally {
                setLoading(false);
            }
        }
        loadOrders();

        // Atualiza a cada 30 segundos
        const interval = setInterval(loadOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <main className={styles.container}>
            <section className={styles.body}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '2rem'
                }}>
                    <h1>Caixa - Pedidos para Pagamento</h1>
                    <div style={{ 
                        background: 'var(--oliva)', 
                        padding: '1rem 2rem', 
                        borderRadius: '10px',
                        color: 'white'
                    }}>
                        <h2 style={{ margin: 0 }}>Total do Dia</h2>
                        <h1 style={{ margin: 0, color: 'var(--dourado)' }}>
                            R$ {totalDay.toFixed(2)}
                        </h1>
                    </div>
                </div>
                <section className={styles.containerBody}>
                    {loading && <p>Carregando pedidos...</p>}
                    {!loading && orders.length > 0 ? (
                        orders.map((order) => (
                            <Orders key={order.id} order={order} />
                        ))
                    ) : (
                        !loading && <p>Nenhum pedido para pagamento</p>
                    )}
                </section>
            </section>
        </main>
    );
}
