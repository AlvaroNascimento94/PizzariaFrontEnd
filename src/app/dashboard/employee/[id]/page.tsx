'use client'
import { useState, useEffect } from 'react';
import styles from './employeeForm.module.scss'
import { useParams, useRouter } from 'next/navigation';
import { getCookieCliente } from '@/lib/cookieClient';
import { api } from '@/services/api';
import { AccessProfile } from '@/types/types';
import { useAuth } from '@/hooks/useAuth';


export default function EmployeeForm() {
    const [id, setId] = useState()
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [banner, setBanner] = useState("");
    const [active, setActive] = useState(true);
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [accessProfileId, setAccessProfileId] = useState("");
    const [accessProfiles, setAccessProfiles] = useState<AccessProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [currentUserId, setCurrentUserId] = useState("");

    const { isAdmin, user, profile } = useAuth();
    const router = useRouter();
    const params = useParams();
    const employeeId = params.id as string;

    const isEditing = employeeId !== 'new';
    const isEditingSelf = employeeId === currentUserId;


    function getBackRoute() {
        if (profile?.name === 'Chef') {
            return '/dashboard/cozinha';
        }
        else if (isAdmin) {
            return '/dashboard/employee';
        }
        else{
            return '/dashboard';
        }
    }

    useEffect(() => {
        loadCurrentUser();
        if (isAdmin) {
            loadAccessProfiles();
        }
        if (isEditing) {
            loadEmployee();
        }
    }, [employeeId, isAdmin]);

    async function loadCurrentUser() {
        try {
            const token = getCookieCliente();
            const response = await api.get("/me/permissions", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setCurrentUserId(response.data.user.id);
        } catch (error) {
            console.error("Erro ao carregar usuário atual:", error);
        }
    }

    async function loadAccessProfiles() {
        try {
            const token = getCookieCliente();
            const response = await api.get("/access-profiles", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setAccessProfiles(response.data);
        } catch (error) {
            console.error("Erro ao carregar cargos:", error);
        }
    }

    async function loadEmployee() {
        setLoadingData(true);
        try {
            const token = getCookieCliente();
            const response = await api.get(`/user/${employeeId}`, {

                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log("Dados recebidos:", response.data);
            setId(response.data.id)
            setName(response.data.name);
            setBanner(response.data.banner)
            setEmail(response.data.email);
            setPhone(response.data.phone || "")
            setAccessProfileId(response.data.accessProfile.id);
            setActive(response.data.active);
        } catch (error) {
            console.error("Erro ao carregar categoria:", error);
            alert("Erro ao carregar dados da categoria!");
            router.push("/dashboard/category");
        } finally {
            setLoadingData(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const token = getCookieCliente();
            let data: any = {
                name,
                email,
                phone
            };

            if (!isEditing && isAdmin) {
                data = {
                    ...data,
                    password,
                    accessProfileId,
                    active
                };
            }

            if (isEditing && isAdmin && !isEditingSelf) {
                data = {
                    ...data,
                    accessProfileId,
                    active
                };
            }

            if (isEditingSelf) {
                data = {
                    ...data,
                    password: password || undefined
                };
            }

            if (isEditing) {
                const endpoint = isEditingSelf ? '/me' : `/user/${employeeId}`;
                await api.put(endpoint, data, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            } else {
                await api.post("/users", data, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }


            router.push(getBackRoute());
        } catch (error) {
            console.error("Erro ao salvar funcionário:", error);
            alert(`Erro ao ${isEditing ? 'atualizar' : 'criar'} funcionário!`);
        } finally {
            setLoading(false);
        }
    }
    return (
        <main className={styles.container}>
            <div className={styles.body}>
                <section className={styles.formCard}>
                    <div className={styles.formHeader}>
                        <h1>Informações do Funcionário</h1>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGrid}>
                            <div className={styles.leftColumn}>
                                <div className={styles.inputGroup}>
                                    <label>
                                        <span className={styles.icon}>👤</span> Nome Completo *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder='Digite o nome completo'
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>
                                        <span className={styles.icon}>✉️</span> E-mail *
                                    </label>
                                    <input
                                        type='email'
                                        required
                                        placeholder='exemplo@email.com'
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>
                                        <span className={styles.icon}>📞</span> Telefone *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder='(11) 99999-9999'
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>

                                {(!isEditing || isEditingSelf) && (
                                    <div className={styles.inputGroup}>
                                        <label>
                                            <span className={styles.icon}>🔒</span> {isEditing ? 'Nova Senha (opcional)' : 'Senha *'}
                                        </label>
                                        <input
                                            type="password"
                                            placeholder={isEditing ? 'Deixe em branco para não alterar' : 'Digite a senha'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required={!isEditing}
                                        />
                                    </div>
                                )}

                                {isAdmin && isEditing && !isEditingSelf && (
                                    <div className={styles.statusContainer}>
                                        <div className={styles.statusInfo}>
                                            <span className={styles.statusIcon}>⚡</span>
                                            <span className={styles.statusTitle}>Status</span>
                                        </div>
                                        <label className={styles.switch}>
                                            <input
                                                type="checkbox"
                                                checked={active}
                                                onChange={(e) => setActive(e.target.checked)}
                                            />
                                            <span className={styles.slider}></span>
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className={styles.rightColumn}>
                                <div className={styles.uploadGroup}>
                                    <label>
                                        <span className={styles.icon}>📷</span> Foto do Funcionário (opcional)
                                    </label>
                                    <div className={styles.uploadArea}>
                                        <div className={styles.uploadIcon}>📁</div>
                                        <p>Clique para fazer upload ou arraste a imagem</p>
                                        <span>PNG, JPG até 5MB</span>
                                        <input type="file" accept="image/*" />
                                    </div>
                                </div>

                                {isAdmin && (
                                    <div className={styles.inputGroup}>
                                        <label>
                                            <span className={styles.icon}>💼</span> Cargo *
                                        </label>
                                        <select
                                            value={accessProfileId}
                                            onChange={(e) => setAccessProfileId(e.target.value)}
                                            required
                                        >
                                            <option value="">Selecione o cargo</option>
                                            {accessProfiles.map(profile => (
                                                <option key={profile.id} value={profile.id}>
                                                    {profile.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                        </div>

                        <div className={styles.formActions}>
                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={loading}
                            >
                                <span className={styles.icon}>👤</span>
                                {loading ? 'Salvando...' : (isEditing ? 'Atualizar Funcionário' : 'Cadastrar Funcionário')}
                            </button>
                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={() => router.push(getBackRoute())}
                            >
                                ✖ Cancelar
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </main>
    )
}