import { Header } from "./componentes/header"
import { AuthProvider } from "@/hooks/useAuth"

export default function DasboratLayout({children}:{children:React.ReactNode}){
    return(
        <AuthProvider>
            <Header/>
            {children}
        </AuthProvider>
    )
}