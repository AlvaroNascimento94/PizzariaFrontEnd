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
    const [banner, setBanner] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | undefined>(undefined);
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
        else {
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

    function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setBanner(file);
            setBannerPreview(URL.createObjectURL(file));
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
            if (response.data.banner) {
                setBannerPreview(`http://localhost:3333/files/${response.data.banner}`);
            }
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

        // Validações antes de enviar
        if (!name.trim()) {
            alert("Nome é obrigatório!");
            return;
        }

        if (!email.trim()) {
            alert("E-mail é obrigatório!");
            return;
        }

        if (!isEditing && !password) {
            alert("Senha é obrigatória para criar um novo funcionário!");
            return;
        }

        if (!isEditing && isAdmin && !accessProfileId) {
            alert("Cargo é obrigatório!");
            return;
        }

        setLoading(true);

        try {
            const token = getCookieCliente();
            const formData = new FormData();

            formData.append('name', name.trim());
            formData.append('email', email.trim());
            formData.append('phone', phone.trim());

            if (!isEditing && isAdmin) {
                formData.append('password', password);
                formData.append('accessProfileId', accessProfileId);
                formData.append('active', String(active));
            }

            if (isEditing && isAdmin && !isEditingSelf) {
                formData.append('accessProfileId', accessProfileId);
                formData.append('active', String(active));
            }

            if (isEditingSelf && password) {
                formData.append('password', password);
            }

            if (banner) {
                formData.append('file', banner);
            } else if (isEditing && !bannerPreview) {
                formData.append('removeBanner', 'true');
            }

            console.log("Enviando dados:", {
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                accessProfileId,
                active,
                hasFile: !!banner,
                isEditing
            });

            if (isEditing) {
                const endpoint = isEditingSelf ? '/me' : `/user/${employeeId}`;
                await api.put(endpoint, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            } else {
                await api.post("/user", formData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }

            router.push(getBackRoute());
        } catch (error: any) {
            console.error("Erro ao salvar funcionário:", error);
            const errorMessage = error?.response?.data?.error || `Erro ao ${isEditing ? 'atualizar' : 'criar'} funcionário!`;
            alert(errorMessage);
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

                                    {bannerPreview ? (
                                        <div className={styles.imagePreview}>
                                            <img src={bannerPreview} alt="Foto do funcionário" width={250} height={250} style={{ objectFit: 'cover', borderRadius: 8 }} />
                                            <button type="button" onClick={() => {
                                                setBanner(null);
                                                setBannerPreview(undefined);
                                            }} className={styles.removeButton}>
                                                Remover Foto
                                            </button>
                                        </div>
                                    ) : (
                                        <div className={styles.uploadArea}>
                                            <div className={styles.uploadIcon}>📁</div>
                                            <p>{banner ? banner.name : 'Clique para fazer upload ou arraste a imagem'}</p>
                                            <span>PNG, JPG até 5MB</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleBannerChange}
                                            />
                                        </div>
                                    )}
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
                                type="button"
                                className={styles.cancelButton}
                                onClick={() => router.push(getBackRoute())}
                            >
                                ✖ Cancelar
                            </button>
                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={loading}
                            >
                                <span className={styles.icon}>👤</span>
                                {loading ? 'Salvando...' : (isEditing ? 'Atualizar Funcionário' : 'Cadastrar Funcionário')}
                            </button>

                        </div>
                    </form>
                </section>
            </div>
        </main>
    )
}