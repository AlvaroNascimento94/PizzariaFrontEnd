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
            <section className={style.body}>
                <section className={style.containerHeader}>
                    <h1>{isEditing ? 'Editar Categoria' : 'Nova Categoria'}</h1>
                </section>
                <section className={style.containerBody}>
                    <form onSubmit={handleSubmit}>
                        <div className={style.name}>
                            <label>Nome da Categoria *</label>
                            <input
                                type="text"
                                placeholder="Ex: pizzas, drinks"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className={style.description}>
                            <label>Descrição (Opcional)</label>
                            <textarea
                                placeholder="Ex: Deliciosas pizzas artesanais feitas no forno a lenha"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                            />
                        </div>
                        <div className={style.color}>
                            <label>Cor da Categoria *</label>
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                            />
                            <span style={{ marginLeft: '10px', color: 'gray' }}>
                                {color}
                            </span>
                        </div>
                        <div className={style.icon}>
                            <IconPicker
                                selectedIcon={selectedIcon}
                                onSelect={setSelectedIcon}
                            />
                        </div>
                        <div className={style.buttons}>
                            <button
                                type="submit"
                                disabled={loading}
                                id={style.confirm}
                            >
                                {loading ? 'Salvando...' : isEditing ? 'Atualizar Categoria' : 'Salvar Categoria'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                id={style.cancel}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </section>
            </section>
        </main>
    )
}
