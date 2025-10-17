import Navbar from "@/components/navbar/Navbar"
import type { ReactNode } from "react"

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <div className="ambaint-layer bg-ambaint" />
      <div className="content-layer flex min-h-0 flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        {/* <Footer/> */}
      </div>
    </div>
  )
}

export default Layout