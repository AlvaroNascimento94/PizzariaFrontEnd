import { Header } from "./componentes/header"

export default function DasboratLayout({children}:{children:React.ReactNode}){
    return(
        <>
        <Header/>
        {children}
        </>
    )
}