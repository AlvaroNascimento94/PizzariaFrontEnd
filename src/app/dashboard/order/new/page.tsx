"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { getCookieCliente } from "@/lib/cookieClient";
import { useAuth } from "@/hooks/useAuth";
import styles from "./orderForm.module.scss";
import { CategoryData, Table, ProductData, OrderItem } from "@/types/types";

export default function NewOrderPage() {
  const router = useRouter();
  const { can, loading: authLoading } = useAuth();

  const [tables, setTables] = useState<Table[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [observation, setObservation] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("useEffect executado - authLoading:", authLoading, "can Orders CREATE:", can("Orders", "CREATE"));
    
    if (!authLoading && !can("Orders", "CREATE")) {
      alert("Você não tem permissão para criar pedidos!");
      router.replace("/dashboard");
      return;
    }
    
    if (!authLoading) {
      console.log("Chamando loadData...");
      loadData();
    }
  }, [authLoading, can, router]);

  async function loadData() {
    try {
      const token = getCookieCliente();
      console.log("Token:", token);
      
      const [tablesRes, categoriesRes, productsRes] = await Promise.all([
        api.get("/tables", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/categories", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/products", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      console.log("Tabelas:", tablesRes.data);
      console.log("Categorias:", categoriesRes.data);
      console.log("Produtos:", productsRes.data);
      
      setTables(tablesRes.data);
      setCategories(categoriesRes.data);
      setProducts(productsRes.data.filter((p: ProductData) => p.status));
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
      if (error.response?.status === 403) {
        alert("Você não tem permissão para acessar os dados necessários (Tables, Categories ou Products READ)!");
      } else {
        alert(`Erro ao carregar dados: ${error.response?.data?.error || error.message}`);
      }
    }
  }

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !selectedCategory || p.categoryId === selectedCategory;
    return matchSearch && matchCategory;
  });

  function addItem(product: ProductData) {
    const existing = orderItems.find(item => item.productId === product.id);
    if (existing) {
      setOrderItems(orderItems.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems([
        ...orderItems,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          price: product.price
        }
      ]);
    }
  }

  function updateQuantity(productId: string, delta: number) {
    setOrderItems(orderItems.map(item =>
      item.productId === productId
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    ).filter(item => item.quantity > 0));
  }

  function removeItem(productId: string) {
    setOrderItems(orderItems.filter(item => item.productId !== productId));
  }

  async function handleSubmit() {
    if (!selectedTable) {
      alert("Selecione uma mesa!");
      return;
    }
    if (orderItems.length === 0) {
      alert("Adicione pelo menos um item ao pedido!");
      return;
    }

    setLoading(true);
    try {
      const token = getCookieCliente();
      
      // Criar pedido
      const orderRes = await api.post("/order", { tableId: selectedTable }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const orderId = orderRes.data.id;

      // Adicionar itens
      for (const item of orderItems) {
        await api.post("/order/item", {
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          description: observation
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      alert("Pedido criado com sucesso!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      alert("Erro ao criar pedido!");
    } finally {
      setLoading(false);
    }
  }

  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (authLoading) {
    return <div className={styles.container}><p>Verificando permissões...</p></div>;
  }

  if (!can("Orders", "CREATE")) return null;

  return (
    <main className={styles.container}>
      <div className={styles.layout}>
        <div className={styles.leftPanel}>
          <div className={styles.header}>
            <h1>Produtos</h1>
          </div>

          <div className={styles.tableSelector}>
            <label>📋 Selecionar Mesa</label>
            <select value={selectedTable} onChange={e => setSelectedTable(e.target.value)}>
              <option value="">Mesas</option>
              {tables.filter(t => t.available).map(table => (
                <option key={table.id} value={table.id}>{table.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.filters}>
            <input
              type="text"
              placeholder="🔍 Buscar produto"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className={styles.categorySelect}
            >
              <option value="">Categoria</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.productsGrid}>
            {filteredProducts.map(product => (
              <div key={product.id} className={styles.productCard}>
                <img
                  src={product.banner ? `http://localhost:3333/files/${product.banner}` : "/logo.png"}
                  alt={product.name}
                  className={styles.productImage}
                />
                <div className={styles.productInfo}>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className={styles.productFooter}>
                    <span className={styles.price}>R$ {product.price.toFixed(2)}</span>
                    <button
                      className={styles.addButton}
                      onClick={() => addItem(product)}
                    >
                      + Adicionar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.summaryHeader}>
            <h2>📝 Resumo do Pedido</h2>
            <p>Mesa: {tables.find(t => t.id === selectedTable)?.name || "Selecione uma mesa"}</p>
          </div>

          {orderItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <p>Nenhum item adicionado</p>
            </div>
          ) : (
            <>
              <div className={styles.itemsList}>
                {orderItems.map(item => (
                  <div key={item.productId} className={styles.orderItem}>
                    <div className={styles.itemHeader}>
                      <h4>{item.productName}</h4>
                      <span className={styles.itemPrice}>R$ {item.price.toFixed(2)}</span>
                    </div>
                    <div className={styles.itemControls}>
                      <button
                        className={styles.qtyButton}
                        onClick={() => updateQuantity(item.productId, -1)}
                      >
                        -
                      </button>
                      <span className={styles.quantity}>{item.quantity}</span>
                      <button
                        className={styles.qtyButton}
                        onClick={() => updateQuantity(item.productId, 1)}
                      >
                        +
                      </button>
                      <button
                        className={styles.removeButton}
                        onClick={() => removeItem(item.productId)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.observationBox}>
                <label>Observações:</label>
                <textarea
                  placeholder="Adicione observações ou customizações..."
                  value={observation}
                  onChange={e => setObservation(e.target.value)}
                  rows={3}
                />
              </div>

              <div className={styles.totalSection}>
                <div className={styles.totalLine}>
                  <span>Total:</span>
                  <span className={styles.totalValue}>R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.submitButton}
                  onClick={handleSubmit}
                  disabled={loading || !selectedTable}
                >
                  ✓ Enviar Pedido
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={() => router.push("/dashboard")}
                >
                  ✖ Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
