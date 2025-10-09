import Image from "next/image";
import Link from "next/link";
import pizzaria from "../../../public/pizzaria2.png"
import styles from "./signup.module.scss"
import { api } from "@/services/api";
import { redirect } from "next/navigation";


export default function Signup() {
    async function handleRegiste(formData: FormData) {
        'use server'
        const name = formData.get("name");
        const email = formData.get("email");
        const password = formData.get("password");

        if (name === "" || email === "" || password === "") {
            return;
        }

        try {
            await api.post("/users", {
                name, 
                email, 
                password
            })
        } catch (error) {
            console.log({messge:error})
        }
        redirect("/")
    }

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
                        <form action={handleRegiste}>
                            <div >
                                <label>Name</label>
                                <input className={styles.input} type="text" required name='name' placeholder='Digite seu nome' />
                            </div>
                            <div>
                                <label>Email</label>
                                <input className={styles.input} type="email" required name='email' placeholder='Digite seu email' />
                            </div>
                            <div>
                                <label>Passwornd</label>
                                <input type="password" required name="password" placeholder='*********' className={styles.input} />
                            </div>
                            <button type='submit'> Cadastrar </button>
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