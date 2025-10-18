'use client'
import { useRouter } from "next/navigation";
import style from "./category.module.scss"
import { useEffect, useState } from "react";
import { getCookieCliente } from "@/lib/cookieClient";
import { api } from "@/services/api";
import { Plus } from "lucide-react";
import { CardCategory } from "../componentes/CardCategory";

export default function Category() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter()

    async function handleCreate() {
        router.replace("/dashboard/category/create")
    }

    useEffect(() => {
        async function loadCategory() {
            try {
                const token = getCookieCliente();

                const response = await api.get("/categories", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setCategories(response.data);
                console.log("Categorias carregados:", response.data);
            } catch (error) {
                console.error("Erro ao carregar categorias:", error);
            } finally {
                setLoading(false);
            }
        }
        loadCategory();
    }, []);

    return (
        <main className={style.container}>
            <section className={style.body}>

                <section className={style.containerHeader}>
                    <h1>Categorias</h1>
                    <button onClick={handleCreate}>
                        <Plus />
                        Nova Categoria
                    </button>
                </section>
                <section className={style.containerBody}>
                    {loading && <p>Carregando pedidos...</p>}
                    {!loading && categories.length > 0 ? (
                        categories.map((category) =>
                            <CardCategory category={category}/>
                    )) : (
                        !loading && <p>Nenhum pedido encontrado</p>
                    )}
                </section>
            </section>
        </main>
    )
}
