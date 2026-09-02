import { useEffect, useState } from "react";
import "./App.css";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;

function App() {
  const savedToken = localStorage.getItem("adminToken");
  const savedUser = localStorage.getItem("adminUser");

  const [isLoggedIn, setIsLoggedIn] =
    useState(Boolean(savedToken));

  const [adminUser, setAdminUser] = useState(
    savedUser ? JSON.parse(savedUser) : null
  );

  const [activePage, setActivePage] =
    useState("dashboard");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [statsLoading, setStatsLoading] =
    useState(false);

  const [statsError, setStatsError] =
    useState("");

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSeekers: 0,
    totalOwners: 0,
    totalProperties: 0,
    activeProperties: 0,
    inactiveProperties: 0,
  });

  const [users, setUsers] = useState([]);

  const [usersLoading, setUsersLoading] =
    useState(false);

  const [usersError, setUsersError] =
    useState("");

  const [updatingUserId, setUpdatingUserId] =
    useState(null);

  const [properties, setProperties] = useState([]);

  const [propertiesLoading, setPropertiesLoading] =
    useState(false);

  const [propertiesError, setPropertiesError] =
    useState("");

  const [updatingPropertyId, setUpdatingPropertyId] =
    useState(null);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    setAdminUser(null);
    setIsLoggedIn(false);

    setActivePage("dashboard");

    setEmail("");
    setPassword("");

    setError("");
    setStatsError("");
    setUsersError("");
    setPropertiesError("");

    setUsers([]);
    setProperties([]);
    setUpdatingUserId(null);
    setUpdatingPropertyId(null);

    setStats({
      totalUsers: 0,
      totalSeekers: 0,
      totalOwners: 0,
      totalProperties: 0,
      activeProperties: 0,
      inactiveProperties: 0,
    });
  };

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      setStatsError("");

      const token =
        localStorage.getItem("adminToken");

      if (!token) {
        handleLogout();
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/dashboard-stats`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          handleLogout();
          return;
        }

        setStatsError(
          data?.message ||
            "Unable to load dashboard stats."
        );

        return;
      }

      setStats({
        totalUsers:
          data?.stats?.totalUsers || 0,

        totalSeekers:
          data?.stats?.totalSeekers || 0,

        totalOwners:
          data?.stats?.totalOwners || 0,

        totalProperties:
          data?.stats?.totalProperties || 0,

        activeProperties:
          data?.stats?.activeProperties || 0,

        inactiveProperties:
          data?.stats?.inactiveProperties || 0,
      });
    } catch (error) {
      console.error(
        "Dashboard stats error:",
        error
      );

      setStatsError(
        "Unable to connect to the server."
      );
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError("");

      const token =
        localStorage.getItem("adminToken");

      if (!token) {
        handleLogout();
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/users`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          handleLogout();
          return;
        }

        setUsersError(
          data?.message ||
            "Unable to load users."
        );

        return;
      }

      setUsers(
        Array.isArray(data?.users)
          ? data.users
          : []
      );
    } catch (error) {
      console.error(
        "Admin users error:",
        error
      );

      setUsersError(
        "Unable to connect to the server."
      );
    } finally {
      setUsersLoading(false);
    }
  };

  const updateUserStatus = async (
    userId,
    currentStatus
  ) => {
    const nextStatus = !currentStatus;

    const actionText = nextStatus
      ? "activate"
      : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} this user?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingUserId(userId);
      setUsersError("");

      const token =
        localStorage.getItem("adminToken");

      if (!token) {
        handleLogout();
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/users/${userId}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            isActive: nextStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          handleLogout();
          return;
        }

        setUsersError(
          data?.message ||
            "Unable to update user status."
        );

        return;
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === userId
            ? {
                ...user,
                isActive: nextStatus,
              }
            : user
        )
      );
    } catch (error) {
      console.error(
        "Admin update user status error:",
        error
      );

      setUsersError(
        "Unable to connect to the server."
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  const fetchProperties = async () => {
    try {
      setPropertiesLoading(true);
      setPropertiesError("");

      const token =
        localStorage.getItem("adminToken");

      if (!token) {
        handleLogout();
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/properties`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          handleLogout();
          return;
        }

        setPropertiesError(
          data?.message ||
            "Unable to load properties."
        );

        return;
      }

      setProperties(
        Array.isArray(data?.properties)
          ? data.properties
          : []
      );
    } catch (error) {
      console.error(
        "Admin properties error:",
        error
      );

      setPropertiesError(
        "Unable to connect to the server."
      );
    } finally {
      setPropertiesLoading(false);
    }
  };

  const updatePropertyStatus = async (
    propertyId,
    currentStatus
  ) => {
    const nextStatus = !currentStatus;

    const actionText = nextStatus
      ? "activate"
      : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} this property?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingPropertyId(propertyId);
      setPropertiesError("");

      const token =
        localStorage.getItem("adminToken");

      if (!token) {
        handleLogout();
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/properties/${propertyId}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            isActive: nextStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          handleLogout();
          return;
        }

        setPropertiesError(
          data?.message ||
            "Unable to update property status."
        );

        return;
      }

      setProperties((currentProperties) =>
        currentProperties.map((property) =>
          property._id === propertyId
            ? {
                ...property,
                isActive: nextStatus,
              }
            : property
        )
      );

      await fetchDashboardStats();
    } catch (error) {
      console.error(
        "Admin update property status error:",
        error
      );

      setPropertiesError(
        "Unable to connect to the server."
      );
    } finally {
      setUpdatingPropertyId(null);
    }
  };

  useEffect(() => {
    if (
      isLoggedIn &&
      activePage === "dashboard"
    ) {
      fetchDashboardStats();
    }

    if (
      isLoggedIn &&
      activePage === "users"
    ) {
      fetchUsers();
    }

    if (
      isLoggedIn &&
      activePage === "properties"
    ) {
      fetchProperties();
    }
  }, [isLoggedIn, activePage]);

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.message ||
            "Unable to login."
        );

        return;
      }

      if (data?.user?.role !== "admin") {
        setError(
          "Only admin accounts can access this dashboard."
        );

        return;
      }

      localStorage.setItem(
        "adminToken",
        data.token
      );

      localStorage.setItem(
        "adminUser",
        JSON.stringify(data.user)
      );

      setAdminUser(data.user);

      setActivePage("dashboard");

      setIsLoggedIn(true);

      setEmail("");
      setPassword("");
    } catch (error) {
      console.error(
        "Admin login error:",
        error
      );

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "A";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  };

  const renderAdminProfile = () => (
    <div className="admin-profile">
      <div className="admin-avatar">
        {getInitials(adminUser?.name || "Admin")}
      </div>

      <div className="admin-profile-copy">
        <p className="admin-name">
          {adminUser?.name || "StayRent Admin"}
        </p>

        <p className="admin-email">
          {adminUser?.email || ""}
        </p>
      </div>
    </div>
  );

  const renderPageHeader = (
    eyebrow,
    title,
    description
  ) => (
    <div className="dashboard-header">
      <div>
        <p className="welcome-text">
          {eyebrow}
        </p>

        <h1 className="dashboard-title">
          {title}
        </h1>

        {description && (
          <p className="dashboard-description">
            {description}
          </p>
        )}
      </div>

      {renderAdminProfile()}
    </div>
  );

  const renderDashboard = () => {
    const statCards = [
      {
        label: "Total Users",
        value: stats.totalUsers,
        icon: "U",
        tone: "indigo",
        hint: "All registered accounts",
      },
      {
        label: "Total Seekers",
        value: stats.totalSeekers,
        icon: "S",
        tone: "violet",
        hint: "People finding rentals",
      },
      {
        label: "Total Owners",
        value: stats.totalOwners,
        icon: "O",
        tone: "blue",
        hint: "Property owners",
      },
      {
        label: "Total Properties",
        value: stats.totalProperties,
        icon: "P",
        tone: "slate",
        hint: "All rental listings",
      },
      {
        label: "Active Properties",
        value: stats.activeProperties,
        icon: "✓",
        tone: "green",
        hint: "Visible to seekers",
      },
      {
        label: "Inactive Properties",
        value: stats.inactiveProperties,
        icon: "!",
        tone: "red",
        hint: "Hidden from discovery",
      },
    ];

    return (
      <>
        {renderPageHeader(
          "OVERVIEW",
          "Admin Dashboard",
          "Monitor StayRent users, owners and rental listings from one place."
        )}

        {statsError && (
          <div className="inline-alert error-alert">
            <span className="inline-alert-icon">
              !
            </span>

            <span>{statsError}</span>
          </div>
        )}

        <section className="hero-panel">
          <div className="hero-panel-copy">
            <span className="hero-kicker">
              STAYRENT MANAGEMENT
            </span>

            <h2>
              Your rental marketplace,
              <br />
              under control.
            </h2>

            <p>
              Review platform activity, manage
              accounts and moderate property
              listings with a clean admin workflow.
            </p>
          </div>

          <div className="hero-panel-meta">
            <div className="hero-meta-card">
              <span className="hero-meta-label">
                Platform status
              </span>

              <strong>Operational</strong>

              <span className="status-live">
                <i />
                Connected
              </span>
            </div>
          </div>
        </section>

        <div className="section-heading">
          <div>
            <p className="section-eyebrow">
              LIVE METRICS
            </p>

            <h2>Platform snapshot</h2>
          </div>
        </div>

        <div className="stats-grid">
          {statCards.map((card) => (
            <article
              className="stat-card"
              key={card.label}
            >
              <div
                className={`stat-icon ${card.tone}`}
              >
                {card.icon}
              </div>

              <div className="stat-card-top">
                <p className="stat-label">
                  {card.label}
                </p>

                <span className="stat-mini-dot" />
              </div>

              <h2 className="stat-value">
                {statsLoading
                  ? "..."
                  : card.value}
              </h2>

              <p className="stat-hint">
                {card.hint}
              </p>
            </article>
          ))}
        </div>

        <section className="overview-grid">
          <div className="overview-card">
            <div className="overview-card-icon">
              SR
            </div>

            <div>
              <p className="overview-card-label">
                Platform overview
              </p>

              <h3>
                StayRent backend is connected
              </h3>

              <p>
                Dashboard data is loading from
                your existing StayRent API and
                MongoDB setup.
              </p>
            </div>
          </div>

          <div className="overview-card compact-overview">
            <p className="overview-card-label">
              Quick moderation
            </p>

            <h3>
              Review accounts and listings
            </h3>

            <div className="quick-actions">
              <button
                type="button"
                onClick={() =>
                  setActivePage("users")
                }
              >
                Manage Users
              </button>

              <button
                type="button"
                onClick={() =>
                  setActivePage("properties")
                }
              >
                Manage Properties
              </button>
            </div>
          </div>
        </section>
      </>
    );
  };

  const renderUsers = () => {
    return (
      <>
        {renderPageHeader(
          "USER MANAGEMENT",
          "Users",
          "Review seekers and property owners registered on StayRent."
        )}

        <section className="data-card">
          <div className="data-card-header">
            <div>
              <p className="section-eyebrow">
                ACCOUNTS
              </p>

              <h2>Registered Users</h2>

              <p>
                Activate or deactivate user access
                without deleting account data.
              </p>
            </div>

            {!usersLoading && (
              <div className="count-pill">
                {users.length}
                <span>users</span>
              </div>
            )}
          </div>

          {usersLoading && (
            <div className="empty-state">
              <div className="spinner" />
              <h3>Loading users</h3>
              <p>
                Fetching registered accounts...
              </p>
            </div>
          )}

          {!usersLoading &&
            usersError && (
              <div className="inline-alert error-alert">
                <span className="inline-alert-icon">
                  !
                </span>
                <span>{usersError}</span>
              </div>
            )}

          {!usersLoading &&
            !usersError &&
            users.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  U
                </div>
                <h3>No users found</h3>
                <p>
                  Registered users will appear
                  here.
                </p>
              </div>
            )}

          {!usersLoading &&
            !usersError &&
            users.length > 0 && (
              <div className="table-wrapper">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Contact</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th className="action-column">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <div className="table-user">
                            <div className="table-avatar">
                              {getInitials(
                                user.name ||
                                  user.role ||
                                  "U"
                              )}
                            </div>

                            <div>
                              <strong>
                                {user.name || "-"}
                              </strong>
                              <span>
                                StayRent account
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="primary-cell">
                            {user.email || "-"}
                          </span>
                        </td>

                        <td>
                          <span className="muted-cell">
                            {user.phone || "-"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`role-badge ${
                              user.role || ""
                            }`}
                          >
                            {user.role || "-"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              user.isActive
                                ? "status-badge active-status"
                                : "status-badge inactive-status"
                            }
                          >
                            <i />
                            {user.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td className="action-column">
                          <button
                            type="button"
                            className={
                              user.isActive
                                ? "status-action danger-action"
                                : "status-action success-action"
                            }
                            disabled={
                              updatingUserId ===
                              user._id
                            }
                            onClick={() =>
                              updateUserStatus(
                                user._id,
                                user.isActive
                              )
                            }
                          >
                            {updatingUserId ===
                            user._id
                              ? "Updating..."
                              : user.isActive
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </section>
      </>
    );
  };

  const renderProperties = () => {
    return (
      <>
        {renderPageHeader(
          "PROPERTY MANAGEMENT",
          "Properties",
          "Review rental listings and control which properties are active on StayRent."
        )}

        <section className="data-card">
          <div className="data-card-header">
            <div>
              <p className="section-eyebrow">
                LISTINGS
              </p>

              <h2>All Properties</h2>

              <p>
                Properties listed by StayRent
                owners.
              </p>
            </div>

            {!propertiesLoading && (
              <div className="count-pill">
                {properties.length}
                <span>listings</span>
              </div>
            )}
          </div>

          {propertiesLoading && (
            <div className="empty-state">
              <div className="spinner" />
              <h3>Loading properties</h3>
              <p>
                Fetching rental listings...
              </p>
            </div>
          )}

          {!propertiesLoading &&
            propertiesError && (
              <div className="inline-alert error-alert">
                <span className="inline-alert-icon">
                  !
                </span>
                <span>{propertiesError}</span>
              </div>
            )}

          {!propertiesLoading &&
            !propertiesError &&
            properties.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  P
                </div>
                <h3>No properties found</h3>
                <p>
                  Owner listings will appear
                  here.
                </p>
              </div>
            )}

          {!propertiesLoading &&
            !propertiesError &&
            properties.length > 0 && (
              <div className="table-wrapper">
                <table className="premium-table properties-table">
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Owner</th>
                      <th>City</th>
                      <th>Rent</th>
                      <th>Type</th>
                      <th>Availability</th>
                      <th>Status</th>
                      <th className="action-column">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {properties.map(
                      (property) => (
                        <tr key={property._id}>
                          <td>
                            <div className="property-cell">
                              <div className="property-mark">
                                P
                              </div>

                              <div>
                                <strong>
                                  {property.title ||
                                    "-"}
                                </strong>
                                <span>
                                  Rental listing
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="primary-cell">
                              {property.owner?.name ||
                                "-"}
                            </span>
                          </td>

                          <td>
                            <span className="muted-cell">
                              {property.city || "-"}
                            </span>
                          </td>

                          <td>
                            <strong className="rent-cell">
                              ₹
                              {property.monthlyRent ??
                                0}
                            </strong>
                          </td>

                          <td>
                            <span className="role-badge neutral-role">
                              {property.propertyType ||
                                "-"}
                            </span>
                          </td>

                          <td>
                            <span
                              className={
                                property.isAvailable
                                  ? "status-badge available-status"
                                  : "status-badge occupied-status"
                              }
                            >
                              <i />
                              {property.isAvailable
                                ? "Available"
                                : "Occupied"}
                            </span>
                          </td>

                          <td>
                            <span
                              className={
                                property.isActive
                                  ? "status-badge active-status"
                                  : "status-badge inactive-status"
                              }
                            >
                              <i />
                              {property.isActive
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>

                          <td className="action-column">
                            <button
                              type="button"
                              className={
                                property.isActive
                                  ? "status-action danger-action"
                                  : "status-action success-action"
                              }
                              disabled={
                                updatingPropertyId ===
                                property._id
                              }
                              onClick={() =>
                                updatePropertyStatus(
                                  property._id,
                                  property.isActive
                                )
                              }
                            >
                              {updatingPropertyId ===
                              property._id
                                ? "Updating..."
                                : property.isActive
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
        </section>
      </>
    );
  };

  if (isLoggedIn) {
    return (
      <div className="dashboard-page">
        <aside className="sidebar">
          <div>
            <div className="sidebar-brand-row">
              <div className="sidebar-logo">
                SR
              </div>

              <div>
                <div className="sidebar-brand">
                  StayRent
                </div>

                <p className="sidebar-subtitle">
                  Admin Console
                </p>
              </div>
            </div>

            <div className="sidebar-divider" />

            <nav className="sidebar-nav">
              <button
                type="button"
                className={`nav-item ${
                  activePage === "dashboard"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActivePage("dashboard")
                }
              >
                <span className="nav-icon">
                  ▦
                </span>

                <span>Dashboard</span>
              </button>

              <button
                type="button"
                className={`nav-item ${
                  activePage === "users"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActivePage("users")
                }
              >
                <span className="nav-icon">
                  U
                </span>

                <span>Users</span>
              </button>

              <button
                type="button"
                className={`nav-item ${
                  activePage === "properties"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActivePage("properties")
                }
              >
                <span className="nav-icon">
                  P
                </span>

                <span>Properties</span>
              </button>
            </nav>
          </div>

          <div className="sidebar-bottom">
            <div className="sidebar-admin">
              <div className="sidebar-admin-avatar">
                {getInitials(
                  adminUser?.name || "Admin"
                )}
              </div>

              <div className="sidebar-admin-copy">
                <strong>
                  {adminUser?.name ||
                    "StayRent Admin"}
                </strong>

                <span>Administrator</span>
              </div>
            </div>

            <button
              className="logout-button"
              type="button"
              onClick={handleLogout}
            >
              <span>↪</span>
              Logout
            </button>
          </div>
        </aside>

        <main className="dashboard-main">
          <div className="dashboard-content">
            {activePage === "dashboard" &&
              renderDashboard()}

            {activePage === "users" &&
              renderUsers()}

            {activePage === "properties" &&
              renderProperties()}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="login-glow login-glow-one" />
      <div className="login-glow login-glow-two" />

      <div className="login-shell">
        <section className="login-visual">
          <div className="login-brand-row">
            <div className="login-logo">
              SR
            </div>

            <div>
              <div className="login-brand">
                StayRent
              </div>
              <div className="login-brand-subtitle">
                Admin Console
              </div>
            </div>
          </div>

          <div className="login-visual-content">
            <span className="login-kicker">
              PLATFORM MANAGEMENT
            </span>

            <h1>
              Manage StayRent
              <br />
              with confidence.
            </h1>

            <p>
              Monitor users, owners and property
              listings from one secure admin
              workspace.
            </p>

            <div className="login-feature-grid">
              <div>
                <strong>Users</strong>
                <span>
                  Manage account access
                </span>
              </div>

              <div>
                <strong>Properties</strong>
                <span>
                  Moderate rental listings
                </span>
              </div>

              <div>
                <strong>Analytics</strong>
                <span>
                  See live platform counts
                </span>
              </div>
            </div>
          </div>

          <div className="login-trust-note">
            <span className="trust-dot" />
            StayRent secure administration
          </div>
        </section>

        <section className="login-card">
          <div className="login-card-icon">
            SR
          </div>

          <p className="brand">
            SECURE ADMIN ACCESS
          </p>

          <h2>Welcome back</h2>

          <p className="subtitle">
            Sign in with your administrator
            account to continue.
          </p>

          <form onSubmit={handleLogin}>
            <label htmlFor="admin-email">
              Email address
            </label>

            <div className="login-input-wrap">
              <span>@</span>

              <input
                id="admin-email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                autoComplete="username"
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </div>

            <label htmlFor="admin-password">
              Password
            </label>

            <div className="login-input-wrap">
              <span>•</span>

              <input
                id="admin-password"
                type="password"
                placeholder="Enter password"
                value={password}
                autoComplete="current-password"
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                required
              />
            </div>

            {error && (
              <div className="login-error">
                <span>!</span>
                {error}
              </div>
            )}

            <button
              className="login-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="button-spinner" />
                  Logging in...
                </>
              ) : (
                <>
                  Login to Dashboard
                  <span className="login-arrow">
                    →
                  </span>
                </>
              )}
            </button>
          </form>

          <div className="login-security">
            <span>✓</span>
            Protected administrator access
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
