import styles from './page.module.scss'
import pizzaria from "../../public/pizzaria2.png"
import Image from "next/image";
import Link from 'next/link';
import { api } from '@/services/api';

export default function Home() {
  async function handleLogin(formData: FormData) {
    'use server'

    const email = formData.get("email");
    const password = formData.get("password");

    if (email === "" || password === "") {
      return
    }
    try {
      const response = await api.post("/session", {
        email, password
      })
      console.log(response.data);
      
    } catch (error) {
      console.log({ message: error })
    }
    

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
            <h1>Bem Vindo</h1>
            <form action={handleLogin}>
              <div>
                <label>Email</label>
                <input className={styles.input} type="email" required name='email' placeholder='Digite seu email' />
              </div>
              <div>
                <label>Password</label>
                <input type="password" required name="password" placeholder='*********' className={styles.input} />
              </div>
              <button type='submit'> Acessar</button>
            </form>
            <Link href='/signup'>
              Nao possuo uma conta
            </Link>
          </section>
        </div>

      </div>
    </>
  )
}
