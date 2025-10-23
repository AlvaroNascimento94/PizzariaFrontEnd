"use client";
import { useEffect, useState } from "react";
import style from "./product.module.scss";
import { api } from "@/services/api";
import { getCookieCliente } from "@/lib/cookieClient";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { ProductData } from "@/types/types";
import { CardProduct } from "@/components/CardProduct";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("ativo");
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { can, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !can("Products", "READ")) {
      alert("Você não tem permissão para acessar esta página!");
      router.replace("/dashboard");
      return;
    }
    async function loadData() {
      try {
        const token = getCookieCliente();
        const [prodRes, catRes] = await Promise.all([
          api.get("/products", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/categories", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (error) {
        console.error("Erro ao carregar produtos/categorias:", error);
      } finally {
        setLoading(false);
      }
    }
    if (!authLoading) loadData();
  }, [authLoading, can, router]);

  function handleEdit(productId: string) {
    router.push(`/dashboard/product/${productId}`);
  }

  // Filtro
  const filtered = products.filter((p: any) => {
    const matchName = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !category || p.categoryId === category;
    const matchStatus = status === "todos"
      ? true
      : (status === "ativo" ? (p.status !== false) : p.status === false);
    return matchName && matchCategory && matchStatus;
  });

  function getProductImageUrl(image?: string) {
    if (!image) return undefined;
    return `http://localhost:3333/files/${image}`;
  }

  if (authLoading) {
    return <main className={style.container}><p>Verificando permissões...</p></main>;
  }
  if (!can("Products", "READ")) return null;

  return (
    <main className={style.container}>
      <div className={style.body}>
        <div className={style.header}>
          <h1>Produtos</h1>
          <button className={style.addButton} onClick={() => router.push("/dashboard/product/new")}>+ Novo Produto</button>
        </div>
        <div className={style.filterContainer}>
          <input
            className={style.searchBox}
            type="text"
            placeholder="Buscar por nome"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className={style.filterSelect}
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="">Todas as categorias</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            className={style.filterSelect}
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="todos">Todos</option>
          </select>
        </div>
        <div className={style.cardsWrapper}>
          <div className={style.productsGrid}>
            {loading ? (
              <p>Carregando...</p>
            ) : filtered.length > 0 ? (
              filtered.map((product: any) => (
                <CardProduct key={product.id} product={product} />
              ))
            ) : (
              <p>Nenhum produto encontrado</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
