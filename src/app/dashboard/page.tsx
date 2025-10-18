'use client'

import { Orders } from "./orders";
import style from "./dashboard.module.scss"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { getCookieCliente } from "@/lib/cookieClient";

export default function Dashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter()

    async function handleCreate() {
        router.replace("/dashboard/order")
    }

    useEffect(() => {
        async function loadOrders() {
            try {
                const token = getCookieCliente();

                const response = await api.get("/orders", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const sortedOrders = response.data.sort((a: any, b: any) => {
                    return a.tables.name.localeCompare(b.tables.name);
                });

                setOrders(sortedOrders);
                console.log("Pedidos carregados e ordenados:", sortedOrders);
            } catch (error) {
                console.error("Erro ao carregar pedidos:", error);
            } finally {
                setLoading(false);
            }

        }
        loadOrders();
    }, []);

    return (
        <main className={style.container}>
            <section className={style.body}>

                <section className={style.containerHeader}>
                    <h1>Últimos Pedidos</h1>
                    <button onClick={handleCreate}>
                        <Plus />
                        Novo Pedido
                    </button>
                </section>
                <section className={style.containerBody}>

                    {loading && <p>Carregando pedidos...</p>}

                    {!loading && orders.length > 0 ? (
                        orders.map((order) =>
                            <Orders order={order} key={order} />)
                    ) : (
                        !loading && <p>Nenhum pedido encontrado</p>
                    )}
                </section>
            </section>
        </main>
    );
}