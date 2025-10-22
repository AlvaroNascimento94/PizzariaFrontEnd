'use client'
import { useRouter } from "next/navigation";
import style from "./category.module.scss"
import { useEffect, useState } from "react";
import { getCookieCliente } from "@/lib/cookieClient";
import { api } from "@/services/api";
import { Plus } from "lucide-react";
import { CardCategory } from "../../../components/CardCategory";
import { useAuth } from "@/hooks/useAuth";

export default function Category() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const { can, loading: authLoading } = useAuth();

    useEffect(() => {
        // Verifica se o usuário tem permissão para ler categorias
        if (!authLoading && !can('Categories', 'READ')) {
            alert('Você não tem permissão para acessar esta página!');
            router.replace('/dashboard');
            return;
        }

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
        
        if (!authLoading) {
            loadCategory();
        }
    }, [authLoading, can, router]);

    async function handleCreate() {
        router.push("/dashboard/category/new");
    }

    if (authLoading) {
        return (
            <main className={style.container}>
                <p>Verificando permissões...</p>
            </main>
        );
    }
    
    if (!can('Categories', 'READ')) {
        return null;
    }

    return (
        <main className={style.container}>
            <section className={style.body}>

                <section className={style.containerHeader}>
                    <h1>Categorias</h1>
                    <button onClick={handleCreate}>
                        + Nova Categoria
                    </button>
                </section>
                <div className={style.cardsWrapper}>
                  <section className={style.containerBody}>
                      {loading && <p>Carregando pedidos...</p>}
                      {!loading && categories.length > 0 ? (
                          categories.map((category) =>
                              <CardCategory category={category} />
                          )) : (
                          !loading && <p>Nenhum pedido encontrado</p>
                      )}
                  </section>
                </div>
            </section>
        </main>
    )
}
