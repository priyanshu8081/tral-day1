import React, { useEffect, useState } from "react";
import {
    FaUserGroup,
    FaStore,
    FaCalendarXmark,
    FaUserPlus,
    FaUser,
    FaBuilding,
    FaCalendarCheck
} from "react-icons/fa6";
import { getCompanyProfile } from "../../services/LandingServices";

const Dashboard = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchedData();
    }, []);

    const fetchedData = async () => {
        try {
            const res = await getCompanyProfile();
            setData(res?.data?.data);
        } catch (error) {
            console.log(error.response?.data);
        }
    };

    return (
        <div className="es-page es-page--dashboard">
            <div className="es-dash-header">
                <div className="es-dash-welcome">
                    Welcome back, {data?.contact_person_name || 'User'} — here's what's happening today.
                </div>
            </div>

            {/* Stat Cards */}
            <div className="es-dash-stats">
                <div className="es-dash-stat-card">
                    <div className="es-dash-stat-top">
                        <FaUserGroup /> Total employees
                    </div>
                    <div className="es-dash-stat-value">128</div>
                </div>
                <div className="es-dash-stat-card">
                    <div className="es-dash-stat-top">
                        <FaStore /> Active customers
                    </div>
                    <div className="es-dash-stat-value">42</div>
                </div>
                <div className="es-dash-stat-card">
                    <div className="es-dash-stat-top">
                        <FaCalendarXmark /> On leave today
                    </div>
                    <div className="es-dash-stat-value">6</div>
                </div>
                <div className="es-dash-stat-card">
                    <div className="es-dash-stat-top">
                        <FaUserPlus /> New this month
                    </div>
                    <div className="es-dash-stat-value">9</div>
                </div>
            </div>

            <div className="es-dash-main">
                {/* Department distribution */}
                <div className="es-dash-panel">
                    <div className="es-dash-panel-title">Department distribution</div>
                    
                    <div className="es-progress-row">
                        <div className="es-progress-header">
                            <span>Engineering</span>
                            <span>54</span>
                        </div>
                        <div className="es-progress-bar-bg">
                            <div className="es-progress-bar-fill" style={{ width: '60%' }}></div>
                        </div>
                    </div>

                    <div className="es-progress-row">
                        <div className="es-progress-header">
                            <span>Sales</span>
                            <span>31</span>
                        </div>
                        <div className="es-progress-bar-bg">
                            <div className="es-progress-bar-fill" style={{ width: '40%' }}></div>
                        </div>
                    </div>

                    <div className="es-progress-row">
                        <div className="es-progress-header">
                            <span>Support</span>
                            <span>25</span>
                        </div>
                        <div className="es-progress-bar-bg">
                            <div className="es-progress-bar-fill" style={{ width: '30%' }}></div>
                        </div>
                    </div>

                    <div className="es-progress-row">
                        <div className="es-progress-header">
                            <span>HR / admin</span>
                            <span>18</span>
                        </div>
                        <div className="es-progress-bar-bg">
                            <div className="es-progress-bar-fill" style={{ width: '20%' }}></div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="es-dash-panel">
                    <div className="es-dash-panel-title">Recent activity</div>
                    
                    <div className="es-activity-list">
                        <div className="es-activity-item">
                            <div className="es-activity-icon"><FaUser /></div>
                            <div>
                                <div className="es-activity-text">
                                    <strong>Riya Sharma</strong> joined Engineering
                                </div>
                                <div className="es-activity-time">2 hours ago</div>
                            </div>
                        </div>
                        
                        <div className="es-activity-item">
                            <div className="es-activity-icon"><FaBuilding /></div>
                            <div>
                                <div className="es-activity-text">
                                    New customer onboarded: <strong>Nova Retail</strong>
                                </div>
                                <div className="es-activity-time">Yesterday</div>
                            </div>
                        </div>

                        <div className="es-activity-item">
                            <div className="es-activity-icon"><FaCalendarCheck /></div>
                            <div>
                                <div className="es-activity-text">
                                    <strong>Arjun Mehta</strong> applied for leave
                                </div>
                                <div className="es-activity-time">2 days ago</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;