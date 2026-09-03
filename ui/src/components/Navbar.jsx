import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const lock = useLocation();
    const [data, setData] = useState();
    useEffect(() => {
        handleData();
    }, [lock])
    const handleData = async (bData) => {
        const token = localStorage.getItem('token');
        setData(token);
    }
    const handleLogout = async () => {
        localStorage.removeItem('token');
    }
    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container-fluid">
                    <Link className="navbar-brand">
                        Navbar
                    </Link>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                        aria-controls="navbarNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon" />
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav">
                            {
                                data ?
                                    <>
                                        <li className="nav-item">
                                            <Link to='/addProduct' className="nav-link active" aria-current="page">
                                                Add customer
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link onClick={handleLogout} to='/' className="nav-link active" aria-current="page">
                                                Logout
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link  to='/listProduct' className="nav-link active" aria-current="page">
                                                Customer List
                                            </Link>
                                        </li>
                                    </>
                                    :
                                    <>
                                        <li className="nav-item">
                                            <Link to='/register' className="nav-link active" aria-current="page">
                                                Register
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link to='/' className="nav-link active" aria-current="page">
                                                Login
                                            </Link>
                                        </li>
                                    </>
                            }
                        </ul>
                    </div>
                </div>
            </nav>

        </div>
    )
}

export default Navbar
