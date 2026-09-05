import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    FaChartPie,
    FaUserGroup,
    FaStore,
    FaBuilding,
    FaRightFromBracket,
} from 'react-icons/fa6';

// Import company profile service
import { getCompanyProfile } from '../../services/AdminServices';

const Navbar = () => {
    const lock = useLocation();
    const [token, setToken] = useState();
    const [company, setCompany] = useState(null);

    useEffect(() => {
        const t = localStorage.getItem('token');
        setToken(t);
        if (t) {
            // Fetch company profile for logo
            getCompanyProfile()
                .then(res => {
                    // API returns data under res.data (depending on axios config)
                    const payload = res?.data?.data || res?.data;
                    setCompany(payload);
                })
                .catch(() => setCompany(null));
        }
    }, [lock]);

    const handleLogout = async () => {
        localStorage.removeItem('token');
    };

    const isActive = (path) => lock.pathname === path ? 'es-navbar__link active' : 'es-navbar__link';

    return (
        <nav className="es-navbar">
            <Link to="/dashboard" className="es-navbar__brand">
                <div className="es-navbar__avatar">
                    ES
                </div>
                <span>Elation Softnet</span>
            </Link>

            <ul className="es-navbar__links">
                {token ? (
                    <>
                        <li>
                            <Link to="/dashboard" className={isActive('/dashboard')}>
                                <FaChartPie style={{ fontSize: '14px' }} />
                                <span>Dashboard</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/employees" className={isActive('/employees')}>
                                <FaUserGroup style={{ fontSize: '14px' }} />
                                <span>Employees</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/listProduct" className={isActive('/listProduct')}>
                                <FaStore style={{ fontSize: '14px' }} />
                                <span>Customers</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/company-profile"
                                className={isActive("/company-profile")}
                            >
                                <FaBuilding style={{ fontSize: '14px' }} />
                                <span>Company Profile</span>
                            </Link>
                        </li>

                        <li>
                            <Link
                                onClick={handleLogout}
                                to="/"
                                className="es-navbar__link es-navbar__link--logout"
                            >
                                <FaRightFromBracket style={{ fontSize: '14px' }} />
                                <span>Logout</span>
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
    );
};

export default Navbar;
