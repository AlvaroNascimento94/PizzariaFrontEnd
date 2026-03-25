'use client'

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import styles from "./styles.module.scss"
import Image from "next/image"
import logoimg from "../../../../../public/logo.png"
import { User, LogOutIcon, LayoutGrid, Users, Tags, Package, ChefHat, Menu } from "lucide-react"
import { deleteCookie } from "cookies-next"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export function Header() {
    const router = useRouter()
    const { isAdmin, loading, user, profile } = useAuth()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement | null>(null)

    async function handleProfile() {
        router.replace(`/dashboard/employee/${user?.id}`)
    }

    async function handleLogout() {
        deleteCookie("session", { path: "/" })
        router.replace("/")
    }

    const menuItems = [
        {
            key: "mesas",
            href: "/dashboard",
            label: "Mesas",
            icon: <LayoutGrid size={18} />,
            visible: profile?.name !== "Chef",
        },
        {
            key: "funcionarios",
            href: "/dashboard/employee",
            label: "Funcionarios",
            icon: <Users size={18} />,
            visible: isAdmin,
        },
        {
            key: "categoria",
            href: "/dashboard/category",
            label: "Categoria",
            icon: <Tags size={18} />,
            visible: isAdmin,
        },
        {
            key: "produto",
            href: "/dashboard/product",
            label: "Produto",
            icon: <Package size={18} />,
            visible: isAdmin,
        },
        {
            key: "cozinha",
            href: "/dashboard/cozinha",
            label: "Cozinha",
            icon: <ChefHat size={18} />,
            visible: isAdmin,
        },
    ]

    const visibleMenuItems = useMemo(
        () => menuItems.filter((item) => item.visible),
        [menuItems]
    )

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (!menuRef.current) return
            if (!menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    return (
        <header className={styles.headerContainer}>
            <div className={styles.headerContent}>
                <Image alt="Logo Pizzaria" src={logoimg} priority={true} quality={100} />
                <nav>
                    <div className={styles.navLeft}>
                        {!loading && (
                            <>
                                <div className={styles.desktopMenu}>
                                    {visibleMenuItems.map((item) => (
                                        <Link key={item.key} href={item.href} className={styles.navLink}>
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>

                                <div className={styles.menuWrapper} ref={menuRef}>
                                    <button
                                        type="button"
                                        className={styles.menuTrigger}
                                        onClick={() => setIsMenuOpen((prev) => !prev)}
                                        aria-label="Abrir menu"
                                    >
                                        <Menu size={20} />
                                    </button>

                                    {isMenuOpen && (
                                        <div className={styles.dropdownMenu}>
                                            {visibleMenuItems.map((item) => (
                                                <Link
                                                    key={item.key}
                                                    href={item.href}
                                                    className={styles.dropdownItem}
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    <span className={styles.itemIcon}>{item.icon}</span>
                                                    <span>{item.label}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <div className={styles.navRight}>
                        <form action={handleProfile}>
                            <p className={styles.userName} title={user?.name || ""}>
                                {user?.name}
                            </p>
                            <button type="submit" className={styles.profileButton}>
                                {user?.banner ? (
                                    <img
                                        src={`http://localhost:3333/files/${user.banner}`}
                                        alt={user.name}
                                        className={styles.avatar}
                                    />
                                ) : (
                                    <div className={styles.avatarPlaceholder}>
                                        <User size={24} />
                                    </div>
                                )}
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