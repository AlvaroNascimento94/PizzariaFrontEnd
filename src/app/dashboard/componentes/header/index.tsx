import Link from "next/link"
import styles from "./styles.module.scss"
import Image from "next/image"
import logoimg from "../../../../../public/logo.png"
import { LogOutIcon } from "lucide-react"

export function Header() {
    return (
        <header className={styles.headerContainer}>
            <div className={styles.headerContent}>
                <Link href="/dashboard">
                    <Image alt="Logo Pizzaria"
                        src={logoimg}
                        priority={true}
                        quality={100} />
                </Link>
                <nav>
                    <div>
                        <Link href="/dashboard/category">
                            Categoria
                        </Link>
                        <Link href="/dashboard/product">
                            Produto
                        </Link>
                    </div>
                    <form>
                        <button type="submit">
                            <LogOutIcon size={24} color="#000" />
                        </button>
                    </form>
                </nav>
            </div>
        </header>
    )
}