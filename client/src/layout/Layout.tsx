import Navbar from "@/components/navbar/Navbar"
import type { ReactNode } from "react"

const Layout = ({children}: { children: ReactNode }) => {
  return (
    <div className="relative overflow-x-hidden bg-background">
        <Navbar/>
        <main className="overflow-x-hidden">
           {children}
        </main>
        {/* <Footer/> */}
    </div>
  )
}

export default Layout