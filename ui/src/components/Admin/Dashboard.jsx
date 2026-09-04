import React, { useEffect, useState } from "react";
import {
    FaUserGroup,
    FaStore,
    FaCalendarXmark,
    FaUserPlus,
    FaUser,
    FaBuilding,
    FaArrowRight,
    FaIdCard,
    FaArrowsRotate,
    FaChartPie,
    FaClockRotateLeft,
    FaShieldHalved,
} from "react-icons/fa6";
import { Link } from "react-router-dom";
import { getCompanyProfile } from "../../services/LandingServices";
import { getEmployees, getCustomerList } from "../../services/UserServices";
import "../../styles/Dashboard.css";

const Dashboard = () => {
    const [company, setCompany] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [profileRes, empRes, custRes] = await Promise.allSettled([
                getCompanyProfile(),
                getEmployees(),
                getCustomerList(),
            ]);

            if (profileRes.status === "fulfilled") {
                setCompany(profileRes.value?.data?.data || null);
            }

            if (empRes.status === "fulfilled") {
                const empData =
                    empRes.value?.data?.data || empRes.value?.data || [];
                setEmployees(Array.isArray(empData) ? empData : []);
            }

            if (custRes.status === "fulfilled") {
                const custData =
                    custRes.value?.data?.data || custRes.value?.data || [];
                setCustomers(Array.isArray(custData) ? custData : []);
            }
        } catch (error) {
            console.log("Dashboard fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate dynamic stats
    const totalEmployees = employees.length;
    const activeCustomers = customers.length;
    const onLeaveEmployees = employees.filter((e) =>
        String(e?.status || "").toLowerCase().includes("leave")
    ).length;

    // New this month
    const now = new Date();
    const newThisMonth = employees.filter((e) => {
        if (!e?.created_at) return false;
        const d = new Date(e.created_at);
        return (
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
        );
    }).length;

    // Dynamic department distribution
    const deptColors = [
        "#6366f1",
        "#10b981",
        "#f59e0b",
        "#8b5cf6",
        "#0ea5e9",
        "#ec4899",
        "#14b8a6",
    ];

    const deptMap = {};
    employees.forEach((emp) => {
        const dept = emp?.department || "Engineering";
        deptMap[dept] = (deptMap[dept] || 0) + 1;
    });

    const deptList = Object.entries(deptMap).map(([name, count], index) => ({
        name,
        count,
        percent:
            totalEmployees > 0
                ? Math.round((count / totalEmployees) * 100)
                : 0,
        color: deptColors[index % deptColors.length],
    }));

    // Recent employees
    const recentEmployees = [...employees].slice(0, 3);
    // Recent customers
    const recentCustomers = [...customers].slice(0, 2);

    // Current hour greeting
    const currentHour = new Date().getHours();
    const greeting =
        currentHour < 12
            ? "Good morning"
            : currentHour < 18
            ? "Good afternoon"
            : "Good evening";

    return (
        <div className="es-dashboard-page">
            {/* ── HERO BANNER ─────────────────────────────────── */}
            <div className="dash-hero">
                <div className="dash-hero-content">
                    <div className="dash-hero-badge">
                        <span className="dash-live-dot"></span>
                        <span>Enterprise Live Operations</span>
                        <span>•</span>
                        <span>{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    <h1 className="dash-hero-title">
                        {greeting},{" "}
                        <span>
                            {company?.contact_person_name || company?.company_name || "Partner"}
                        </span>
                    </h1>
                    <p className="dash-hero-subtitle">
                        Here is your real-time enterprise overview. Manage dynamic employees, track customer accounts, and monitor organizational operations seamlessly.
                    </p>
                </div>

                <div className="dash-hero-actions">
                    <button
                        className="dash-btn-glass"
                        onClick={fetchAllData}
                        title="Refresh data"
                    >
                        <FaArrowsRotate className={loading ? "fa-spin" : ""} /> Refresh
                    </button>
                    <Link to="/employees" className="dash-btn-solid">
                        <FaUserPlus /> Add Employee
                    </Link>
                </div>
            </div>

            {/* ── STATS METRICS ROW ───────────────────────────── */}
            <div className="dash-stats-grid">
                {/* Total Employees */}
                <div className="dash-stat-card dash-stat-card--indigo">
                    <div className="dash-stat-top">
                        <div className="dash-stat-icon-wrap dash-stat-icon-wrap--indigo">
                            <FaUserGroup />
                        </div>
                        <span className="dash-stat-tag">Live Staff</span>
                    </div>
                    <div>
                        <div className="dash-stat-label">Total Employees</div>
                        <div className="dash-stat-val">
                            {loading ? "..." : totalEmployees}
                        </div>
                    </div>
                    <div className="dash-stat-footer">
                        <span>Dynamic backend directory</span>
                    </div>
                </div>

                {/* Active Customers */}
                <div className="dash-stat-card dash-stat-card--emerald">
                    <div className="dash-stat-top">
                        <div className="dash-stat-icon-wrap dash-stat-icon-wrap--emerald">
                            <FaStore />
                        </div>
                        <span className="dash-stat-tag">Active</span>
                    </div>
                    <div>
                        <div className="dash-stat-label">Total Customers</div>
                        <div className="dash-stat-val">
                            {loading ? "..." : activeCustomers}
                        </div>
                    </div>
                    <div className="dash-stat-footer">
                        <span>Managed accounts in system</span>
                    </div>
                </div>

                {/* On Leave */}
                <div className="dash-stat-card dash-stat-card--amber">
                    <div className="dash-stat-top">
                        <div className="dash-stat-icon-wrap dash-stat-icon-wrap--amber">
                            <FaCalendarXmark />
                        </div>
                        <span className="dash-stat-tag">Today</span>
                    </div>
                    <div>
                        <div className="dash-stat-label">On Leave Today</div>
                        <div className="dash-stat-val">
                            {loading ? "..." : onLeaveEmployees}
                        </div>
                    </div>
                    <div className="dash-stat-footer">
                        <span>Absence & leave tracking</span>
                    </div>
                </div>

                {/* New This Month */}
                <div className="dash-stat-card dash-stat-card--sky">
                    <div className="dash-stat-top">
                        <div className="dash-stat-icon-wrap dash-stat-icon-wrap--sky">
                            <FaUserPlus />
                        </div>
                        <span className="dash-stat-tag">This Month</span>
                    </div>
                    <div>
                        <div className="dash-stat-label">New Hires</div>
                        <div className="dash-stat-val">
                            {loading ? "..." : newThisMonth}
                        </div>
                    </div>
                    <div className="dash-stat-footer">
                        <span>Recent employee onboarding</span>
                    </div>
                </div>
            </div>

            {/* ── MAIN 2-COLUMN GRID ──────────────────────────── */}
            <div className="dash-grid-2">
                {/* Department Distribution */}
                <div className="dash-panel">
                    <div className="dash-panel-header">
                        <h3 className="dash-panel-title">
                            <FaChartPie style={{ color: "#4f46e5" }} />
                            Department Distribution
                        </h3>
                        <Link to="/employees" className="dash-panel-link">
                            View Directory <FaArrowRight />
                        </Link>
                    </div>

                    {loading ? (
                        <div style={{ color: "#64748b", padding: "28px 0", textAlign: "center" }}>
                            Calculating live department ratios...
                        </div>
                    ) : deptList.length === 0 ? (
                        <div style={{ padding: "36px 12px", textAlign: "center", color: "#64748b" }}>
                            <p style={{ margin: "0 0 14px", fontSize: "15px" }}>
                                No employee records registered in the system.
                            </p>
                            <Link to="/employees" className="dash-btn-solid" style={{ fontSize: "13px" }}>
                                <FaUserPlus /> Register First Employee
                            </Link>
                        </div>
                    ) : (
                        deptList.map((item, idx) => (
                            <div className="dash-dept-row" key={idx}>
                                <div className="dash-dept-info">
                                    <span className="dash-dept-name">
                                        <span
                                            className="dash-dept-dot"
                                            style={{ background: item.color }}
                                        ></span>
                                        {item.name}
                                    </span>
                                    <span className="dash-dept-count">
                                        {item.count} staff ({item.percent}%)
                                    </span>
                                </div>
                                <div className="dash-dept-bar-bg">
                                    <div
                                        className="dash-dept-bar-fill"
                                        style={{
                                            width: `${item.percent}%`,
                                            background: item.color,
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Recent Activity */}
                <div className="dash-panel">
                    <div className="dash-panel-header">
                        <h3 className="dash-panel-title">
                            <FaClockRotateLeft style={{ color: "#059669" }} />
                            Recent Organizational Activity
                        </h3>
                    </div>

                    <div className="dash-activity-list">
                        {loading ? (
                            <div style={{ color: "#64748b", padding: "28px 0", textAlign: "center" }}>
                                Loading live activity updates...
                            </div>
                        ) : recentEmployees.length === 0 && recentCustomers.length === 0 ? (
                            <div style={{ padding: "36px 12px", textAlign: "center", color: "#64748b" }}>
                                No activity recorded yet. Start by onboarding employees or customers.
                            </div>
                        ) : (
                            <>
                                {recentEmployees.map((emp, i) => (
                                    <div className="dash-activity-item" key={`emp-${i}`}>
                                        <div className="dash-activity-icon dash-activity-icon--user">
                                            <FaUser />
                                        </div>
                                        <div className="dash-activity-body">
                                            <div className="dash-activity-title">
                                                <strong>{emp?.full_name || emp?.name}</strong>{" "}
                                                registered as {emp?.role || emp?.department || "Staff Member"}
                                            </div>
                                            <div className="dash-activity-time">
                                                {emp?.created_at
                                                    ? new Date(emp.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                                                    : "Active employee in directory"}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {recentCustomers.map((cust, i) => (
                                    <div className="dash-activity-item" key={`cust-${i}`}>
                                        <div className="dash-activity-icon dash-activity-icon--building">
                                            <FaBuilding />
                                        </div>
                                        <div className="dash-activity-body">
                                            <div className="dash-activity-title">
                                                New customer account onboarded:{" "}
                                                <strong>{cust?.customer_name || cust?.name}</strong>
                                            </div>
                                            <div className="dash-activity-time">
                                                {cust?.city
                                                    ? `${cust.city}, ${cust.state || ""}`
                                                    : "Active client account"}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── QUICK MANAGEMENT HUB ────────────────────────── */}
            <div className="dash-shortcuts-grid">
                <Link to="/employees" className="dash-shortcut-card">
                    <div className="dash-shortcut-icon">
                        <FaUserGroup />
                    </div>
                    <div>
                        <div className="dash-shortcut-title">Manage Employees</div>
                        <div className="dash-shortcut-desc">View, verify, and search staff</div>
                    </div>
                </Link>

                <Link to="/listProduct" className="dash-shortcut-card">
                    <div className="dash-shortcut-icon">
                        <FaStore />
                    </div>
                    <div>
                        <div className="dash-shortcut-title">Customer Accounts</div>
                        <div className="dash-shortcut-desc">View customer list & details</div>
                    </div>
                </Link>

                <Link to="/company-profile" className="dash-shortcut-card">
                    <div className="dash-shortcut-icon">
                        <FaIdCard />
                    </div>
                    <div>
                        <div className="dash-shortcut-title">Company Profile</div>
                        <div className="dash-shortcut-desc">Corporate credentials & status</div>
                    </div>
                </Link>

                <div className="dash-shortcut-card" style={{ cursor: "default" }}>
                    <div className="dash-shortcut-icon">
                        <FaShieldHalved />
                    </div>
                    <div>
                        <div className="dash-shortcut-title">Security & Role</div>
                        <div className="dash-shortcut-desc">Verified Enterprise Account</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;