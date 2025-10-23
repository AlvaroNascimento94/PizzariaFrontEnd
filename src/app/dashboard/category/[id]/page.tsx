'use client'
import { IconPicker } from "@/components/IconPicker"
import style from "./categoryForm.module.scss"
import { useState, useEffect } from "react"
import { api } from "@/services/api"
import { getCookieCliente } from "@/lib/cookieClient"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export default function CategoryForm() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState("#ff6b35");
    const [selectedIcon, setSelectedIcon] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    const router = useRouter();
    const params = useParams();
    const categoryId = params.id as string;
    const { profile } = useAuth();

    const isEditing = categoryId !== 'new';

    function getBackRoute() {
        if (profile?.name === 'Chef') {
            return '/dashboard/cozinha';
        }
        return '/dashboard/category';
    }

    useEffect(() => {
        if (isEditing) {
            loadCategory();
        }
    }, [categoryId]);

    async function loadCategory() {
        setLoadingData(true);
        try {
            const token = getCookieCliente();

            console.log("Carregando categoria ID:", categoryId);

            const response = await api.get(`/category/detail/${categoryId}`, {

                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log("Dados recebidos:", response.data);

            setName(response.data.name);
            setDescription(response.data.description || "");
            setColor(response.data.color);
            setSelectedIcon(response.data.icon);
        } catch (error) {
            console.error("Erro ao carregar categoria:", error);
            alert("Erro ao carregar dados da categoria!");
            router.push(getBackRoute());
        } finally {
            setLoadingData(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!name || !selectedIcon) {
            alert("Por favor, preencha o nome e selecione um ícone!");
            return;
        }

        setLoading(true);

        try {
            const token = getCookieCliente();
            const data = {
                name,
                description,
                color,
                icon: selectedIcon
            };

            if (isEditing) {
                const updateData = {
                    ...data,
                };

                await api.put(`/category/${categoryId}`, updateData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            } else {
                await api.post("/category", data, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }

            router.push(getBackRoute());
        } catch (error) {
            console.error("Erro ao salvar categoria:", error);
            alert(`Erro ao ${isEditing ? 'atualizar' : 'criar'} categoria!`);
        } finally {
            setLoading(false);
        }
    }

    function handleCancel() {
        router.push(getBackRoute());
    }

    if (loadingData) {
        return (
            <main className={style.container}>
                <section className={style.body}>
                    <section className={style.containerHeader}>
                        <h1>Carregando...</h1>
                    </section>
                </section>
            </main>
        );
    }

    return (
        <main className={style.container}>
            <div className={style.body}>
                <section className={style.formCard}>
                    <div className={style.formHeader}>
                        <h1>{isEditing ? 'Editar Categoria' : 'Nova Categoria'}</h1>
                    </div>

                    <form onSubmit={handleSubmit} className={style.form}>
                        <div className={style.formGrid}>
                            <div className={style.leftColumn}>
                                <div className={style.inputGroup}>
                                    <label>
                                        <span className={style.icon}>🏷️</span> Nome da Categoria *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ex: pizzas, drinks"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className={style.inputGroup}>
                                    <label>
                                        <span className={style.icon}>📝</span> Descrição (Opcional)
                                    </label>
                                    <textarea
                                        placeholder="Ex: Deliciosas pizzas artesanais feitas no forno a lenha"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={4}
                                    />
                                </div>
                            </div>

                            <div className={style.rightColumn}>
                                <div className={style.inputGroup}>
                                    <label>
                                        <span className={style.icon}>🎨</span> Cor da Categoria *
                                    </label>
                                    <div className={style.colorPicker}>
                                        <input
                                            type="color"
                                            value={color}
                                            onChange={(e) => setColor(e.target.value)}
                                        />
                                        <span className={style.colorCode}>{color}</span>
                                    </div>
                                </div>

                                <div className={style.iconGroup}>
                                    <IconPicker
                                        selectedIcon={selectedIcon}
                                        onSelect={setSelectedIcon}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={style.formActions}>
                            
                            <button
                                type="button"
                                className={style.cancelButton}
                                onClick={handleCancel}
                            >
                                ✖ Cancelar
                            </button>
                            <button
                                type="submit"
                                className={style.submitButton}
                                disabled={loading}
                            >
                                <span className={style.icon}>💾</span>
                                {loading ? 'Salvando...' : isEditing ? 'Atualizar Categoria' : 'Salvar Categoria'}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </main>
    )
}
