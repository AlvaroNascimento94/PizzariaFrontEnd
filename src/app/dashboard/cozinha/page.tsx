'use client'
import { useEffect, useState } from "react";
import { getCookieCliente } from "@/lib/cookieClient";
import { api } from "@/services/api";
import style from "./cozinha.module.scss";
import { OrderData } from "@/types/types";
import { CardCozinha } from "@/components/CardCozinha";

export default function CozinhaDashboard() {
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadOrders() {
        try {
            const token = getCookieCliente();
            const response = await api.get("/orders", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const filteredOrders = response.data
                    .sort((a: OrderData, b: OrderData) => {
                    if (a.orderStatus.name === "Em Preparo" && b.orderStatus.name !== "Em Preparo") return -1;
                    if (a.orderStatus.name !== "Em Preparo" && b.orderStatus.name === "Em Preparo") return 1;

                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                });

            setOrders(filteredOrders);
        } catch (error) {
            console.error("Erro ao carregar pedidos:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrders();
        const interval = setInterval(loadOrders, 3000);
        return () => clearInterval(interval);
    }, []);

    const novosPedidos = orders.filter(o =>o.orderStatus.name === "Iniciado");
    const emPreparo = orders.filter(o => o.orderStatus.name === "Em Preparo");
    const prontos = orders.filter(o => o.orderStatus.name === "Pronto");

    const atrasados = orders.filter(order => {
        if (order.orderStatus.name === "Em Entrega") return false; 
        const diffInMinutes = Math.floor((new Date().getTime()- new Date(order.createdAt).getTime()) / (1000 * 60));
        return diffInMinutes > 210; //210 corrigir o utf
    }).length;

    if (loading) {
        return (
            <main className={style.container}>
                <section className={style.body}>
                    <p>Carregando pedidos...</p>
                </section>
            </main>
        );
    }

    return (
        <main className={style.container}>
            <section className={style.body}>
                <div className={style.header}>
                    <div className={style.tabs}>
                        <div className={style.counter}>Todos ({orders.length})</div>
                        <div className={style.counter}>Novos ({novosPedidos.length})</div>
                        <div className={style.counter}>Em Preparo ({emPreparo.length})</div>
                        <div className={style.counter}>Prontos ({prontos.length})</div>
                        
                    </div>
                    {atrasados > 0 && (
                        <div className={style.alert}>
                            ⚠️ {atrasados} pedidos atrasados
                        </div>
                    )}
                </div>

                <div className={style.columnsHeader}>
                    <div className={style.columnTitle}>
                        <span className={style.badge}>NOVOS PEDIDOS</span>
                    </div>
                    <div className={style.columnTitle}>
                        <span className={style.badge}>EM PREPARO</span>
                    </div>
                    <div className={style.columnTitle}>
                        <span className={style.badge}>PRONTO</span>
                    </div>
                </div>

                <div className={style.columnsGrid}>
                    <div className={style.column}>
                        {novosPedidos.length > 0 ? (
                            novosPedidos.map((order) => (
                                <CardCozinha
                                    key={order.id}
                                    order={order}
                                    onUpdate={loadOrders}
                                />
                            ))
                        ) : (
                            <p className={style.emptyColumn}>Nenhum pedido novo</p>
                        )}
                    </div>

                    <div className={style.column}>
                        {emPreparo.length > 0 ? (
                            emPreparo.map((order) => (
                                <CardCozinha
                                    key={order.id}
                                    order={order}
                                    onUpdate={loadOrders}
                                />
                            ))
                        ) : (
                            <p className={style.emptyColumn}>Nenhum pedido em preparo</p>
                        )}
                    </div>

                    <div className={style.column}>
                        {prontos.length > 0 ? (
                            prontos.map((order) => (
                                <CardCozinha
                                    key={order.id}
                                    order={order}
                                    onUpdate={loadOrders}
                                />
                            ))
                        ) : (
                            <p className={style.emptyColumn}>Nenhum pedido pronto</p>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
