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

  const renderDashboard = () => {
    return (
      <>
        <div className="dashboard-header">
          <div>
            <p className="welcome-text">
              Welcome back
            </p>

            <h1 className="dashboard-title">
              Admin Dashboard
            </h1>
          </div>

          <div className="admin-profile">
            <div className="admin-avatar">
              A
            </div>

            <div>
              <p className="admin-name">
                {adminUser?.name ||
                  "StayRent Admin"}
              </p>

              <p className="admin-email">
                {adminUser?.email || ""}
              </p>
            </div>
          </div>
        </div>

        {statsError && (
          <p className="error-message">
            {statsError}
          </p>
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">
              Total Users
            </p>

            <h2 className="stat-value">
              {statsLoading
                ? "..."
                : stats.totalUsers}
            </h2>
          </div>

          <div className="stat-card">
            <p className="stat-label">
              Total Seekers
            </p>

            <h2 className="stat-value">
              {statsLoading
                ? "..."
                : stats.totalSeekers}
            </h2>
          </div>

          <div className="stat-card">
            <p className="stat-label">
              Total Owners
            </p>

            <h2 className="stat-value">
              {statsLoading
                ? "..."
                : stats.totalOwners}
            </h2>
          </div>

          <div className="stat-card">
            <p className="stat-label">
              Total Properties
            </p>

            <h2 className="stat-value">
              {statsLoading
                ? "..."
                : stats.totalProperties}
            </h2>
          </div>

          <div className="stat-card">
            <p className="stat-label">
              Active Properties
            </p>

            <h2 className="stat-value">
              {statsLoading
                ? "..."
                : stats.activeProperties}
            </h2>
          </div>

          <div className="stat-card">
            <p className="stat-label">
              Inactive Properties
            </p>

            <h2 className="stat-value">
              {statsLoading
                ? "..."
                : stats.inactiveProperties}
            </h2>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Platform Overview</h2>

          <p>
            Dashboard is connected to the
            StayRent backend and MongoDB.
          </p>
        </div>
      </>
    );
  };

  const renderUsers = () => {
    return (
      <>
        <div className="dashboard-header">
          <div>
            <p className="welcome-text">
              StayRent Management
            </p>

            <h1 className="dashboard-title">
              Users
            </h1>
          </div>

          <div className="admin-profile">
            <div className="admin-avatar">
              A
            </div>

            <div>
              <p className="admin-name">
                {adminUser?.name ||
                  "StayRent Admin"}
              </p>

              <p className="admin-email">
                {adminUser?.email || ""}
              </p>
            </div>
          </div>
        </div>

        <div className="users-section">
          <div className="users-header">
            <div>
              <h2>Registered Users</h2>

              <p>
                Seekers and owners registered
                on StayRent.
              </p>
            </div>

            {!usersLoading && (
              <div className="users-count">
                {users.length}
              </div>
            )}
          </div>

          {usersLoading && (
            <div className="users-message">
              Loading users...
            </div>
          )}

          {!usersLoading &&
            usersError && (
              <div className="users-error">
                {usersError}
              </div>
            )}

          {!usersLoading &&
            !usersError &&
            users.length === 0 && (
              <div className="users-message">
                No users found.
              </div>
            )}

          {!usersLoading &&
            !usersError &&
            users.length > 0 && (
              <div className="table-wrapper">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>
                          {user.name ||
                            "-"}
                        </td>

                        <td>
                          {user.email ||
                            "-"}
                        </td>

                        <td>
                          {user.phone ||
                            "-"}
                        </td>

                        <td>
                          <span
                            className={`role-badge ${user.role}`}
                          >
                            {user.role}
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
                            {user.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className={
                              user.isActive
                                ? "user-status-button deactivate-user-button"
                                : "user-status-button activate-user-button"
                            }
                            disabled={
                              updatingUserId === user._id
                            }
                            onClick={() =>
                              updateUserStatus(
                                user._id,
                                user.isActive
                              )
                            }
                          >
                            {updatingUserId === user._id
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
        </div>
      </>
    );
  };

  const renderProperties = () => {
    return (
      <>
        <div className="dashboard-header">
          <div>
            <p className="welcome-text">
              StayRent Management
            </p>

            <h1 className="dashboard-title">
              Properties
            </h1>
          </div>

          <div className="admin-profile">
            <div className="admin-avatar">
              A
            </div>

            <div>
              <p className="admin-name">
                {adminUser?.name ||
                  "StayRent Admin"}
              </p>

              <p className="admin-email">
                {adminUser?.email || ""}
              </p>
            </div>
          </div>
        </div>

        <div className="users-section">
          <div className="users-header">
            <div>
              <h2>All Properties</h2>

              <p>
                Properties listed by StayRent
                owners.
              </p>
            </div>

            {!propertiesLoading && (
              <div className="users-count">
                {properties.length}
              </div>
            )}
          </div>

          {propertiesLoading && (
            <div className="users-message">
              Loading properties...
            </div>
          )}

          {!propertiesLoading &&
            propertiesError && (
              <div className="users-error">
                {propertiesError}
              </div>
            )}

          {!propertiesLoading &&
            !propertiesError &&
            properties.length === 0 && (
              <div className="users-message">
                No properties found.
              </div>
            )}

          {!propertiesLoading &&
            !propertiesError &&
            properties.length > 0 && (
              <div className="table-wrapper">
                <table className="users-table properties-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Owner</th>
                      <th>City</th>
                      <th>Rent</th>
                      <th>Type</th>
                      <th>Availability</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {properties.map(
                      (property) => (
                        <tr key={property._id}>
                          <td>
                            {property.title || "-"}
                          </td>

                          <td>
                            {property.owner?.name ||
                              "-"}
                          </td>

                          <td>
                            {property.city || "-"}
                          </td>

                          <td>
                            ₹
                            {property.monthlyRent ??
                              0}
                          </td>

                          <td>
                            <span className="role-badge">
                              {property.propertyType ||
                                "-"}
                            </span>
                          </td>

                          <td>
                            <span
                              className={
                                property.isAvailable
                                  ? "status-badge active-status"
                                  : "status-badge inactive-status"
                              }
                            >
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
                              {property.isActive
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>

                          <td>
                            <button
                              type="button"
                              className={
                                property.isActive
                                  ? "property-status-button deactivate-property-button"
                                  : "property-status-button activate-property-button"
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
        </div>
      </>
    );
  };

  if (isLoggedIn) {
    return (
      <div className="dashboard-page">
        <aside className="sidebar">
          <div>
            <div className="sidebar-brand">
              StayRent
            </div>

            <p className="sidebar-subtitle">
              Admin Panel
            </p>
          </div>

          <nav className="sidebar-nav">
            <button
              className={`nav-item ${
                activePage === "dashboard"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActivePage("dashboard")
              }
            >
              Dashboard
            </button>

            <button
              className={`nav-item ${
                activePage === "users"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActivePage("users")
              }
            >
              Users
            </button>

            <button
              className={`nav-item ${
                activePage === "properties"
                  ? "active"
                  : ""
              }`}
              type="button"
              onClick={() =>
                setActivePage("properties")
              }
            >
              Properties
            </button>
          </nav>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </aside>

        <main className="dashboard-main">
          {activePage === "dashboard" &&
            renderDashboard()}

          {activePage === "users" &&
            renderUsers()}

          {activePage === "properties" &&
            renderProperties()}
        </main>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="login-card">
        <p className="brand">
          StayRent Admin
        </p>

        <h1>Admin Login</h1>

        <p className="subtitle">
          Sign in to manage users, owners and
          properties.
        </p>

        <form onSubmit={handleLogin}>
          <label>Email</label>

          <input
            type="email"
            placeholder="admin@example.com"
            value={email}
            autoComplete="username"
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            autoComplete="current-password"
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
          />

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;