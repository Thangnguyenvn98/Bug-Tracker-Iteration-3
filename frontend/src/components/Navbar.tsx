
import { Link } from 'react-router-dom'
import SignOutButton from './SignOutButton'
const Navbar = () => {
  return (
    <nav>
        <ul className="flex flex-col gap-y-4">
            <Link to='/'>Bug Library</Link>
            <Link to='/add-bug'>Submit a bug</Link>
            <Link to='/password-reset-request'>Change Password</Link>
            <li><SignOutButton/></li>
        </ul>
    </nav>
  )
}

export default Navbar