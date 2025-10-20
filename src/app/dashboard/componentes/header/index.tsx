'use client'

import Link from "next/link"
import styles from "./styles.module.scss"
import Image from "next/image"
import logoimg from "../../../../../public/logo.png"
import { User, LogOutIcon } from "lucide-react"
import { deleteCookie } from "cookies-next"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export function Header() {
    const router = useRouter()
    const { isAdmin, loading, user, profile, can } = useAuth()
    async function handleProfile() {
        router.replace(`/dashboard/employee/${user?.id}`)
    }

    async function handleLogout() {
        deleteCookie("session", { path: "/" })
        router.replace("/")
    }

    return (
        <header className={styles.headerContainer}>
            <div className={styles.headerContent}>
                <Image alt="Logo Pizzaria"
                    src={logoimg}
                    priority={true}
                    quality={100} />
                <nav>
                    <div>
                        {!loading && (
                            <>
                                {(profile?.name !== "Chef") && 
                                (<Link href="/dashboard"> Mesas </Link>)}
                                {(isAdmin) && (
                                    <Link href="/dashboard/employee">
                                        Funcionarios
                                    </Link>
                                )}

                                {(isAdmin) && (
                                    <Link href="/dashboard/category">
                                        Categoria
                                    </Link>
                                )}

                                {(isAdmin) && (
                                    <Link href="/dashboard/product">
                                        Produto
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                    <div>
                        <form action={handleProfile}>
                            <p>
                                {user?.name}
                            </p>
                            <button type="submit">
                                <User size={35} />
                            </button>

                        </form>
                        <form action={handleLogout}>
                            <button type="submit" className={styles.logout}>
                                <LogOutIcon size={24} />
                            </button>
                        </form>
                    </div>
                </nav>
            </div>
        </header>
    )
}