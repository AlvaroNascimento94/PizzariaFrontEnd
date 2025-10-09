import styles from './page.module.scss'
import pizzaria from "../../public/pizzaria2.png"
import Image from "next/image";
import Link from 'next/link';

export default function Home() {
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
            <form>
              <input className={styles.input} type="email" required name='emal' placeholder='Digite seu email' />
              <input type="password" required name="password" placeholder='*********' className={styles.input} />
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
