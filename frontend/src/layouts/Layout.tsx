import React from 'react'
import Header from '../components/Header'

interface LayoutProps {
    children: React.ReactNode
}

const Layout = ({children} : LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
        <Header/>
        {children}
    </div>
  )
}

export default Layout