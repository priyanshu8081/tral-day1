import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const lock = useLocation();
    const [data, setData] = useState();

    useEffect(() => {
        handleData();
    }, [lock])

    const handleData = async () => {
        const token = localStorage.getItem('token');
        setData(token);
    }

    const handleLogout = async () => {
        localStorage.removeItem('token');
    }

    const isActive = (path) => lock.pathname === path ? 'es-navbar__link active' : 'es-navbar__link';

    return (
        <nav className="es-navbar">
            <Link to="/dashboard" className="es-navbar__brand">
                <div className="es-navbar__avatar">ES</div>
                Elation Softnet
            </Link>

            <ul className="es-navbar__links">
                {data ? (
                    <>
                        <li>
                            <Link to="/dashboard" className={isActive('/dashboard')}>
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link to="/employees" className={isActive('/employees')}>
                                Employees
                            </Link>
                        </li>
                        <li>
                            <Link to="/listProduct" className={isActive('/listProduct')}>
                                Customers
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/company-profile"
                                className={isActive("/company-profile")}
                            >
                                Company Profile
                            </Link>
                        </li>



                        <li>
                            <Link
                                onClick={handleLogout}
                                to="/"
                                className="es-navbar__link es-navbar__link--logout"
                            >
                                Logout
                            </Link>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <Link to="/register" className={isActive('/register')}>
                                Register
                            </Link>
                        </li>
                        <li>
                            <Link to="/" className={isActive('/')}>
                                Login
                            </Link>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    )
}

export default Navbar
