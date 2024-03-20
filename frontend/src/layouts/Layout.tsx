import React from 'react'
import Header from '../components/Header'
import { Toaster } from "react-hot-toast"

interface LayoutProps {
    children: React.ReactNode
}

const Layout = ({children} : LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
        <Toaster/>
        <Header/>
        {children}
    </div>
  )
}

export default Layout