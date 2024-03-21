
import { Link, useLocation } from 'react-router-dom'
import SignOutButton from './SignOutButton'
const Navbar = () => {
    
    const { pathname } = useLocation();

  return (
    <nav className="p-2 border-2 border-black">
        <ul className="flex justify-center gap-x-10 text-2xl font-bold">
        {pathname === '/' && (
                  <>
                     <Link to="/buglibrary" className="text-blue-500">Bug Library</Link>

                    <Link to="/add-bug" className="text-slate-400">Submit a  bug</Link>
                    </>
                )}  
     
        {pathname !== '/' && pathname !== '/add-bug' && pathname !== '/buglibrary' && (
          <>
                              <Link to="/" className="text-green-500">Home</Link>
                              <Link to="/buglibrary" className="text-blue-500">Bug Library</Link>

                    <Link to="/add-bug" className="text-slate-400">Submit a bug</Link>
                    </>)}
                    {pathname === '/add-bug' && (
          <>
                              <Link to="/" className="text-green-500">Home</Link>
                              <Link to="/buglibrary" className="text-blue-500">Bug Library</Link>

                    </>)}
                    {pathname === '/buglibrary' && (
          <>
                              <Link to="/" className="text-green-500">Home</Link>

                    <Link to="/add-bug" className="text-slate-400">Submit a bug</Link>
                    </>)}
                                                
        <Link to='/change-password'>Change password</Link>
          <li><SignOutButton/></li>
        </ul>
    </nav>
  )
}

export default Navbar