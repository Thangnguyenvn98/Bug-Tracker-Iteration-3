
import { Link, useLocation } from 'react-router-dom'
import SignOutButton from './SignOutButton'
const Navbar = () => {
    
    const { pathname } = useLocation();

  return (
    <nav className="p-2 border-2 border-black">
        <ul className="flex justify-center gap-x-10 text-2xl font-bold">
        {pathname === '/' && (
                    <Link to="/add-bug" className="text-blue-500">Submit a bug</Link>
                )}  
        {pathname !== '/' && (
                    <Link to="/" className="text-blue-500">Bug Library</Link>
                )}
        {pathname !== '/' && pathname !== '/add-bug' && (
                    <Link to="/add-bug" className="text-slate-400">Submit a new bug</Link>
                )}             
        <Link to='/password-reset-request'>Change password</Link>
          <li><SignOutButton/></li>
        </ul>
    </nav>
  )
}

export default Navbar