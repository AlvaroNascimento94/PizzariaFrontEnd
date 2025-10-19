'use client'
import { IconPicker } from "@/components/IconPicker"
import style from "./newcategory.module.scss"
import { useState } from "react"
import { api } from "@/services/api"
import { getCookieCliente } from "@/lib/cookieClient"
import { useRouter } from "next/navigation"

export default function NewCategory() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState("#ff6b35");
    const [selectedIcon, setSelectedIcon] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    console.log("Estado atual:", { name, description, color, selectedIcon });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!name || !selectedIcon) {
            alert("Por favor, preencha o nome e selecione um ícone!");
            return;
        }

        setLoading(true);

        try {
            const token = getCookieCliente();

            await api.post("/category", {
                name,
                description,
                color,
                icon: selectedIcon
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            alert("Categoria criada com sucesso!");
            router.push("/dashboard/category");
        } catch (error) {
            console.error("Erro ao criar categoria:", error);
            alert("Erro ao criar categoria!");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className={style.container}>
            <section className={style.body}>
                <section className={style.containerHeader}>
                    <h1>Nova Categoria</h1>
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
                            <input 
                                type="text" 
                                placeholder="Ex: Deliciosas pizzas artesanais"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className={style.description}>
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

                        <button 
                            type="submit" 
                            disabled={loading}
                        >
                            {loading ? 'Criando...' : 'Save Categoria'}
                        </button>
                    </form>
                </section>
            </section>
        </main>
    )
}