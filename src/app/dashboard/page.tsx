import { Orders } from "./componentes/orders";
import style from "./dashboard.module.scss"

export default function Dashboard() {
    return (<>
        <main className={style.container}>

            <Orders />
        </main>
    </>);
}