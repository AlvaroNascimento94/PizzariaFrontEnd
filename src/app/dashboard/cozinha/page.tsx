'use client'
import { useEffect, useState } from "react";
import { getCookieCliente } from "@/lib/cookieClient";
import { api } from "@/services/api";
import style from "./cozinha.module.scss";
import { OrderProductData } from "@/types/types";
import { CardCozinha } from "@/components/CardCozinha";

export default function CozinhaDashboard() {
    const [items, setItems] = useState<OrderProductData[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadItems() {
        try {
            const token = getCookieCliente();
            const response = await api.get("/order-products", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const sortedItems = response.data.sort((a: OrderProductData, b: OrderProductData) => {
                if (a.status.name === "Em Preparo" && b.status.name !== "Em Preparo") return -1;
                if (a.status.name !== "Em Preparo" && b.status.name === "Em Preparo") return 1;

                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            });

            setItems(sortedItems);
        } catch (error) {
            console.error("Erro ao carregar itens:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadItems();
        const interval = setInterval(loadItems, 3000);
        return () => clearInterval(interval);
    }, []);

    const novosItens = items.filter(item => 
        item.status.name === "Aguardando"
    );
    const emPreparo = items.filter(item => item.status.name === "Em Preparo");
    const prontos = items.filter(item => item.status.name === "Pronto");


    const atrasados = items.filter(item => {
        if (item.status.name === "Entregue") return false;
        const diffInMinutes = Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / (1000 * 60));
        return diffInMinutes > 30;
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
                        <div className={style.counter}>Todos ({items.length})</div>
                        <div className={style.counter}>Novos ({novosItens.length})</div>
                        <div className={style.counter}>Em Preparo ({emPreparo.length})</div>
                        <div className={style.counter}>Prontos ({prontos.length})</div>
                        
                    </div>
                    {atrasados > 0 && (
                        <div className={style.alert}>
                            ⚠️ {atrasados} itens atrasados
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
                        {novosItens.length > 0 ? (
                            novosItens.map((item) => (
                                <CardCozinha
                                    key={item.id}
                                    item={item}
                                    onUpdate={loadItems}
                                />
                            ))
                        ) : (
                            <p className={style.emptyColumn}>Nenhum item novo</p>
                        )}
                    </div>

                    <div className={style.column}>
                        {emPreparo.length > 0 ? (
                            emPreparo.map((item) => (
                                <CardCozinha
                                    key={item.id}
                                    item={item}
                                    onUpdate={loadItems}
                                />
                            ))
                        ) : (
                            <p className={style.emptyColumn}>Nenhum item em preparo</p>
                        )}
                    </div>

                    <div className={style.column}>
                        {prontos.length > 0 ? (
                            prontos.map((item) => (
                                <CardCozinha
                                    key={item.id}
                                    item={item}
                                    onUpdate={loadItems}
                                />
                            ))
                        ) : (
                            <p className={style.emptyColumn}>Nenhum item pronto</p>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
