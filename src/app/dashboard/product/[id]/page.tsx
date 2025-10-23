"use client";
import { useEffect, useState } from "react";
import style from "./productForm.module.scss";
import { api } from "@/services/api";
import { getCookieCliente } from "@/lib/cookieClient";
import { useRouter, useParams } from "next/navigation";

export default function ProductForm() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [price, setPrice] = useState("");
    const [status, setStatus] = useState(true);
    const [banner, setBanner] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | undefined>(undefined);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;
    const isEditing = productId !== "new";

    useEffect(() => {
        loadCategories();
        if (isEditing) {
            loadProduct();
        }
    }, [productId]);

    async function loadCategories() {
        try {
            const token = getCookieCliente();
            const res = await api.get("/categories", { headers: { Authorization: `Bearer ${token}` } });
            setCategories(res.data);
        } catch (err) {
            setCategories([]);
        }
    }

    async function loadProduct() {
        setLoadingData(true);
        try {
            const token = getCookieCliente();
            const res = await api.get(`/product/${productId}`, { headers: { Authorization: `Bearer ${token}` } });
            setName(res.data.name);
            setDescription(res.data.description);
            setCategoryId(res.data.categoryId);
            setPrice(res.data.price);
            setStatus(res.data.status !== false);
            if (res.data.banner) {
                setBannerPreview(`http://localhost:3333/files/${res.data.banner}`);
            }
        } catch (err) {
            router.push("/dashboard/product");
        } finally {
            setLoadingData(false);
        }
    }

    function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setBanner(file);
            setBannerPreview(URL.createObjectURL(file));
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const token = getCookieCliente();
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            formData.append("categoryId", categoryId);
            formData.append("price", price);
            formData.append("status", String(status));
            if (banner) formData.append("file", banner);
            if (isEditing) {
                await api.put(`/product/${productId}`, formData, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                await api.post("/product", formData, { headers: { Authorization: `Bearer ${token}` } });
            }
            router.push("/dashboard/product");
        } catch (err) {
            alert(`Erro ao ${isEditing ? 'atualizar' : 'criar'} produto!`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className={style.container}>
            <div className={style.formCard}>
                <div className={style.formHeader}>
                    {isEditing ? '' : <span className={style.icon}>+</span>}
                    <div>
                        <h1>{isEditing ? 'Editar Produto' : 'Novo Produto'}</h1>
                    </div>
                </div>
                <form className={style.form} onSubmit={handleSubmit}>
                    <div className={style.formGrid}>
                        <div className={style.leftColumn}>
                            <div className={style.inputGroup}>
                                <label>Nome do Produto *</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Pizza Margherita Artesanal"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />

                            </div>
                            <div className={style.inputGroup}>
                                <label>Descrição *</label>
                                <textarea
                                    placeholder="Descreva os ingredientes e características especiais do produto..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    maxLength={200}
                                    required
                                    rows={4}
                                />

                            </div>
                            <div className={style.inputGroup}>
                                <label>Categoria *</label>
                                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                                    <option value="">Selecione uma categoria</option>
                                    {categories.map((cat: any) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={style.inputGroup}>
                                <label>Preço *</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="R$ 0,00"
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className={style.rightColumn}>
                            <label className={style.imageLabel}>Imagem do Produto
                                <div className={style.imageUploadArea}>
                                    {bannerPreview ? (
                                        <img src={bannerPreview} alt="Preview" className={style.imagePreview} />
                                    ) : (
                                        <div className={style.uploadPlaceholder}>
                                            <span className={style.uploadIcon}>☁️</span>
                                            <span>Clique para fazer upload ou arraste a imagem</span>
                                            <span className={style.inputHint}>PNG, JPG até 5MB</span>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleBannerChange} />
                                </div>
                            </label>
                            <div className={style.switchGroup}>
                                <label>Produto Ativo</label>
                                <label className={style.switch}>
                                    <input type="checkbox" checked={status} onChange={e => setStatus(e.target.checked)} />
                                    <span className={style.slider}></span>
                                </label>
                                <span className={style.inputHint}>{status ? "Disponível no cardápio" : "Indisponível no cardápio"}</span>
                            </div>
                        </div>
                    </div>
                    <div className={style.formActions}>
                        <button type="button" className={style.cancelButton} onClick={() => router.push("/dashboard/product")}>X Cancelar</button>
                        <button type="submit" className={style.saveButton} disabled={loading}>
                            {isEditing ? '✓ Atualizar Produto' : '✓ Salvar Produto'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
