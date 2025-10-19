import styles from './page.module.scss'
import pizzaria from "../../public/pizzaria2.png"
import Image from "next/image";
import { api } from '@/services/api';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default function Home() {
  async function handleLogin(formData: FormData) {
    'use server'

    const email = formData.get("email");
    const password = formData.get("password");

    if (email === "" || password === "") {
      return
    }

    let redirectPath = "/dashboard";

    try {
      const response = await api.post("/session", {
        email, password
      })
      if (!response.data.token) {
        return;
      }
      const time = 60 * 60 * 24 * 1000;
      (await cookies()).set("session", response.data.token, {
        maxAge: time,
        path:"/",
        httpOnly:false,
        secure: process.env.NODE_ENV === "production"
      })

      const userResponse = await api.get("/me/permissions", {
        headers: {
          Authorization: `Bearer ${response.data.token}`
        }
      });

      const userProfile = userResponse.data.profile?.name;
      
    if (userProfile === "Chef") {
        redirectPath = "/dashboard/cozinha"; 
      }

    } catch (error) {
      console.log("Erro ao fazer login:", error)
      return;
    }

    redirect(redirectPath);

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
          </section>
        </div>

      </div>
    </>
  )
}
