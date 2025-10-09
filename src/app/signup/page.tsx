import Image from "next/image";
import Link from "next/link";
import pizzaria from "../../../public/pizzaria2.png"
import styles from "./signup.module.scss"

export default function Signup() {
    return (
        <>
            <div className={styles.containerCenter}>
                <div className={styles.card}>
                    <div className={styles.imageContainer}>
                        <Image src={pizzaria} alt="Pizzaria Logo" className={styles.image} />
                    </div>
                    <section className={styles.login}>
                        <Image src={pizzaria} alt="Pizzaria Logo" className={styles.imageSection} />
                        <h1>Criando conta</h1>
                        <form>
                            <input className={styles.input} type="text" required name='text' placeholder='Digite seu nome'/>
                            <input className={styles.input} type="email" required name='email' placeholder='Digite seu email' />
                            <input type="password" required name="password" placeholder='*********' className={styles.input} />
                            <button type='submit'> Acessar</button>
                        </form>
                        <Link href="/">
                        Ja possui uma conta? Faça login
                        </Link>
                    </section>
                </div>
            </div>
        </>
    )
}