'use client'

import { Order } from "./order";
import style from "./dashboard.module.scss"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react";
import { api } from "@/services/api";
import { getCookieCliente } from "@/lib/cookieClient";
import { OrderProps } from "@/types/types";

export default function Dashboard() {
    const [orders, setOrders] = useState<OrderProps["order"][]>([]);
    const [loading, setLoading] = useState(true);
    const isFetchingRef = useRef(false);

    const router = useRouter()

    async function handleCreate() {
        router.replace("/dashboard/order/new")
    }

    useEffect(() => {
        async function loadOrders() {
            if (isFetchingRef.current) return;

            try {
                isFetchingRef.current = true;
                const token = getCookieCliente();

                const response = await api.get("/orders-by-table", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setOrders(response.data);
            } catch (error) {
                console.error("Erro ao carregar pedidos:", error);
            } finally {
                isFetchingRef.current = false;
                setLoading(false);
            }

        }

        loadOrders();

        const interval = setInterval(loadOrders, 1500);

        function refreshOnFocus() {
            loadOrders();
        }

        function refreshOnVisible() {
            if (document.visibilityState === "visible") {
                loadOrders();
            }
        }

        window.addEventListener("focus", refreshOnFocus);
        document.addEventListener("visibilitychange", refreshOnVisible);

        return () => {
            clearInterval(interval);
            window.removeEventListener("focus", refreshOnFocus);
            document.removeEventListener("visibilitychange", refreshOnVisible);
        };
    }, []);

    return (
        <main className={style.container}>
            <section className={style.body}>

                <section className={style.containerHeader}>
                    <h1>Últimos Pedidos</h1>
                    <button onClick={handleCreate}>
                        + Novo Pedido
                    </button>
                </section>
                <section className={style.containerBody}>

                    {loading && <p>Carregando pedidos...</p>}

                    {!loading && orders.length > 0 ? (
                        orders.map((order) =>
                            <Order order={order} key={order.tableId} />)
                    ) : (
                        !loading && <p>Nenhum pedido encontrado</p>
                    )}
                </section>
            </section>
        </main>
    );
}