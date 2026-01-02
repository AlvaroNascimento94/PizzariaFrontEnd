"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/services/api";
import { getCookieCliente } from "@/lib/cookieClient";
import { useAuth } from "@/hooks/useAuth";
import styles from "./orderTable.module.scss";
import { CategoryData, ProductData, Table, OrderItem, OrderData } from "@/types/types";


export default function OrderTablePage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const { can, loading: authLoading } = useAuth();

  const [table, setTable] = useState<Table | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [existingOrders, setExistingOrders] = useState<OrderData[]>([]);
  const [observation, setObservation] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [tableId, setTableId] = useState<string>("");

  useEffect(() => {
    if (!authLoading && !can("Orders", "CREATE")) {
      alert("Você não tem permissão para criar pedidos!");
      router.replace("/dashboard");
      return;
    }
    if (!authLoading) {
      loadData();

      const interval = setInterval(() => {
        loadData();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [authLoading, can, router, orderId]);

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  }, []);

  async function loadData() {
    try {
      const token = getCookieCliente();
      const orderRes = await api.get(`/order/detail/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const orderData = orderRes.data;
      console.log(orderData);

      const mesaId = orderData.tableId;
      setTableId(mesaId);

      const [tableRes, categoriesRes, productsRes, ordersRes] = await Promise.all([
        api.get(`/tables`, { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/categories", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/products", { headers: { Authorization: `Bearer ${token}` } }),
        api.get(`/orders-by-table?tableId=${mesaId}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const currentTable = tableRes.data.find((t: Table) => t.id === mesaId);
      setTable(currentTable);
      setCategories(categoriesRes.data);
      setProducts(productsRes.data.filter((p: ProductData) => p.status));

      const tableGroup = ordersRes.data.find((group: any) => group.tableId === mesaId);
      console.log("Table group:", tableGroup);

      if (tableGroup && tableGroup.orders) {
        setExistingOrders(tableGroup.orders);
      } else {
        setExistingOrders([]);
      }
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
      if (error.response?.status === 403) {
        alert("Você não tem permissão para acessar os dados necessários!");
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

  async function handleAddItems() {
    if (orderItems.length === 0) {
      alert("Adicione pelo menos um item!");
      return;
    }

    setLoading(true);
    try {
      const token = getCookieCliente();

      let orderId = existingOrders.find(o => o.orderStatus.name !== 'Finalizado' && o.orderStatus.name !== 'Cancelado')?.id;

      if (!orderId) {
        const orderRes = await api.post("/order", { tableId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        orderId = orderRes.data.id;
      }

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

      alert("Itens adicionados com sucesso!");
      setOrderItems([]);
      setObservation("");
      loadData();
    } catch (error) {
      console.error("Erro ao adicionar itens:", error);
      alert("Erro ao adicionar itens!");
    } finally {
      setLoading(false);
    }
  }

  async function handleCloseAccount() {
    if (existingOrders.length === 0) {
      alert("Não há pedidos para fechar!");
      return;
    }

    const openOrder = existingOrders.find(o => o.orderStatus.name !== 'Finalizado' && o.orderStatus.name !== 'Cancelado');
    if (!openOrder) {
      alert("Não há pedidos abertos para fechar!");
      return;
    }

    setLoading(true);
    try {
      const token = getCookieCliente();
      await api.put("/order/finish", { orderId: openOrder.id }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Erro ao fechar conta:", error);
      alert("Erro ao fechar conta!");
    } finally {
      setLoading(false);
    }
  }

  const newItemsTotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const existingTotal = existingOrders.reduce((sum, order) => {
    if (!order.orderProducts || !Array.isArray(order.orderProducts)) return sum;
    const orderTotal = order.orderProducts.reduce((orderSum, item) => {
      return orderSum + (item.product.price * item.quantity);
    }, 0);
    return sum + orderTotal;
  }, 0);

  const subtotal = newItemsTotal + existingTotal;
  const serviceCharge = subtotal * 0.10;
  const grandTotal = subtotal + serviceCharge;

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
            <h2>{table?.name || "Mesa"}</h2>
            <p>Aberta às {currentTime || '...'}</p>
          </div>

          {existingOrders && existingOrders.length > 0 && (
            <div className={styles.previousOrders}>
              <h3>📋 Pedidos Anteriores</h3>
              {existingOrders.map(order => (
                <div key={order.id} className={styles.orderGroup}>
                  {order.orderProducts && Array.isArray(order.orderProducts) && order.orderProducts.map((item: any) => (
                    <div key={item.id} className={styles.orderItem}>
                      <div className={styles.itemHeader}>
                        <h4>{item.product?.name || 'Produto não encontrado'}</h4>
                        <span className={styles.itemPrice}>
                          R$ {(item.product?.price || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className={styles.itemDetails}>
                        <span>Qtd: {item.quantity || 0}</span>
                        <span className={styles.status}>
                          {item.status?.name || 'Status desconhecido'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {orderItems.length > 0 && (
            <>
              <div className={styles.newItems}>
                <h3>🟠 Novos Itens</h3>
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
            </>
          )}

          {(existingOrders.length > 0 || orderItems.length > 0) && (
            <>
              <div className={styles.totalSection}>
                <div className={styles.subtotalLine}>
                  <span>Subtotal:</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className={styles.subtotalLine}>
                  <span>Taxa de serviço (10%):</span>
                  <span>R$ {serviceCharge.toFixed(2)}</span>
                </div>
                <div className={styles.totalLine}>
                  <span>Total:</span>
                  <span className={styles.totalValue}>R$ {grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className={styles.actions}>
                {orderItems.length > 0 && (
                  <button
                    className={styles.addItemButton}
                    onClick={handleAddItems}
                    disabled={loading}
                  >
                    + Adicionar Item
                  </button>
                )}
                <button
                  className={styles.closeButton}
                  onClick={handleCloseAccount}
                  disabled={loading}
                >
                  💳 Fechar Conta
                </button>
              </div>
            </>
          )}

          {existingOrders.length === 0 && orderItems.length === 0 && (
            <div className={styles.emptyCart}>
              <p>Nenhum item no pedido</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
