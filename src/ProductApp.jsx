import { useEffect, useState } from 'react';
import {
  ArrowDownWideNarrow, ArrowRight, Boxes, Check, ChevronDown, CircleHelp,
  DollarSign, Edit3, Eye, LogOut, Menu, PackagePlus, Plus, Search,
  ShieldCheck, SlidersHorizontal, Trash2, TrendingUp, UserRoundPlus,
  UsersRound, X,
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');
const EMPTY_PRODUCT = { product_name: '', description: '', price: '', quantity: '' };

async function apiRequest(path, { token, ...options } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || payload.message || `Request failed (${response.status})`);
  return payload;
}

function currency(value) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value) || 0);
}

function AuthScreen({ onAuthenticated }) {
  const [values, setValues] = useState({ identifier: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      onAuthenticated(result);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-aside">
        <a className="product-brand" href="#home"><span className="brand-symbol"><Boxes size={19} /></span><span>stockroom<span className="brand-dot">.</span></span></a>
        <div className="auth-story">
          <span className="overline"><i /> PRODUCT OPERATIONS, MADE CLEAR</span>
          <h1>Keep your<br />stock in<br /><em>good shape.</em></h1>
          <p>A calm, clear home for the products your business depends on.</p>
          <div className="auth-aside-bottom"><span>01 — INVENTORY</span><span>BUILT WITH LAVALUST</span></div>
        </div>
        <div className="auth-graphic" aria-hidden="true"><div className="graphic-ring ring-a" /><div className="graphic-ring ring-b" /><div className="graphic-center"><Boxes size={28} /></div><span className="graphic-cross cross-a">+</span><span className="graphic-cross cross-b">+</span><span className="graphic-pill">STOCK / 001</span></div>
      </div>
      <section className="auth-form-area">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand"><span className="brand-symbol"><Boxes size={19} /></span> stockroom<span className="brand-dot">.</span></div>
          <div className="auth-label">ADMIN-MANAGED WORKSPACE</div>
          <h2>Welcome back.</h2>
          <p className="auth-description">Sign in with the account created by your administrator.</p>
          <form onSubmit={submit} className="auth-form">
            <label>Username or email<input autoComplete="username" value={values.identifier} onChange={(event) => setValues({ ...values, identifier: event.target.value })} placeholder="admin" required /></label>
            <label>Password<input autoComplete="current-password" type="password" value={values.password} onChange={(event) => setValues({ ...values, password: event.target.value })} placeholder="Your password" required /></label>
            {error && <div className="form-error" role="alert">{error}</div>}
            <button className="primary-button auth-submit" disabled={busy}>{busy ? 'Please wait…' : 'Sign in'}<ArrowRight size={16} /></button>
          </form>
          <div className="admin-credentials-note"><b>Admin sign-in</b><span>Username: <strong>admin</strong></span><span>Password: <strong>{import.meta.env.DEV ? 'Admin@12345' : 'provided by your administrator'}</strong></span>{import.meta.env.DEV && <span className="demo-password-warning">Demo only. Change this before deployment.</span>}</div>
          <div className="auth-secure"><ShieldCheck size={15} /> Only an administrator can create user accounts</div>
        </div>
        <div className="auth-copyright">STOCKROOM INVENTORY <span>·</span> 2026</div>
      </section>
    </main>
  );
}

function ProductDialog({ product, busy, error, onClose, onSubmit }) {
  const [values, setValues] = useState(product || EMPTY_PRODUCT);
  const editing = Boolean(product?.id);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="product-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <header className="dialog-header"><div><span className="dialog-icon"><PackagePlus size={18} /></span><div><div className="dialog-overline">INVENTORY RECORD</div><h2 id="dialog-title">{editing ? 'Edit product' : 'Add a product'}</h2></div></div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={18} /></button></header>
        <form onSubmit={(event) => { event.preventDefault(); onSubmit(values); }}>
          <div className="dialog-fields">
            <label className="field-wide">Product name<input value={values.product_name} onChange={(event) => update('product_name', event.target.value)} placeholder="e.g. Ceramic pour-over set" maxLength={100} required autoFocus /></label>
            <label className="field-wide">Description<textarea rows="3" value={values.description} onChange={(event) => update('description', event.target.value)} placeholder="A short description of this item" required /></label>
            <label>Unit price<div className="input-prefix"><span>₱</span><input type="number" min="0" step="0.01" value={values.price} onChange={(event) => update('price', event.target.value)} placeholder="0.00" required /></div></label>
            <label>Quantity<input type="number" min="0" step="1" value={values.quantity} onChange={(event) => update('quantity', event.target.value)} placeholder="0" required /></label>
          </div>
          {error && <div className="form-error dialog-error" role="alert">{error}</div>}
          <footer className="dialog-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Add product'}<ArrowRight size={15} /></button></footer>
        </form>
      </section>
    </div>
  );
}

function UserDialog({ busy, error, onClose, onSubmit }) {
  const [values, setValues] = useState({ username: '', email: '', password: '' });

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="product-dialog user-dialog" role="dialog" aria-modal="true" aria-labelledby="user-dialog-title">
        <header className="dialog-header"><div><span className="dialog-icon"><UserRoundPlus size={18} /></span><div><div className="dialog-overline">ADMINISTRATOR ACTION</div><h2 id="user-dialog-title">Create view-only user</h2></div></div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={18} /></button></header>
        <form onSubmit={(event) => { event.preventDefault(); onSubmit(values); }}>
          <div className="dialog-fields user-fields">
            <label className="field-wide">Username<input value={values.username} onChange={(event) => setValues({ ...values, username: event.target.value })} placeholder="e.g. inventory.viewer" maxLength={100} required autoFocus /></label>
            <label className="field-wide">Email address<input type="email" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} placeholder="viewer@company.com" required /></label>
            <label className="field-wide">Temporary password<input type="password" value={values.password} onChange={(event) => setValues({ ...values, password: event.target.value })} placeholder="At least 8 characters" minLength={8} required /></label>
          </div>
          <div className="user-permission-note"><Eye size={15} /><span>This account can view products only. It cannot add, edit, or delete records.</span></div>
          {error && <div className="form-error dialog-error" role="alert">{error}</div>}
          <footer className="dialog-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={busy}>{busy ? 'Creating…' : 'Create user'}<ArrowRight size={15} /></button></footer>
        </form>
      </section>
    </div>
  );
}

function Dashboard({ auth, onLogout }) {
  const isAdmin = auth.user.role === 'admin';
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeView, setActiveView] = useState('inventory');
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [dialogProduct, setDialogProduct] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [userBusy, setUserBusy] = useState(false);
  const [dialogError, setDialogError] = useState('');
  const [userError, setUserError] = useState('');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  async function loadProducts() {
    setLoadError('');
    try {
      const result = await apiRequest('/products', { token: auth.tokens.access_token });
      setProducts(result.data || []);
    } catch (error) {
      setLoadError(error.message);
      if (/unauthorized/i.test(error.message)) onLogout(false);
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers() {
    try {
      const result = await apiRequest('/admin/users', { token: auth.tokens.access_token });
      setUsers(result.data || []);
    } catch (error) {
      showToast(error.message);
      if (/unauthorized|administrator/i.test(error.message)) onLogout(false);
    }
  }

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => { if (isAdmin && activeView === 'users') loadUsers(); }, [activeView, isAdmin]);

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  }

  function openCreate() {
    setDialogProduct(null);
    setDialogError('');
    setDialogOpen(true);
  }

  function openEdit(product) {
    setDialogProduct({ ...product, price: String(product.price), quantity: String(product.quantity) });
    setDialogError('');
    setDialogOpen(true);
  }

  async function saveProduct(values) {
    setBusy(true);
    setDialogError('');
    const editing = Boolean(dialogProduct?.id);
    try {
      await apiRequest(editing ? `/products/${dialogProduct.id}` : '/products', {
        method: editing ? 'PUT' : 'POST',
        token: auth.tokens.access_token,
        body: JSON.stringify({ ...values, price: Number(values.price), quantity: Number(values.quantity) }),
      });
      setDialogOpen(false);
      await loadProducts();
      showToast(editing ? 'Product changes saved.' : 'Product added to inventory.');
    } catch (error) {
      setDialogError(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function createUser(values) {
    setUserBusy(true);
    setUserError('');
    try {
      await apiRequest('/admin/users', {
        method: 'POST',
        token: auth.tokens.access_token,
        body: JSON.stringify(values),
      });
      setUserDialogOpen(false);
      await loadUsers();
      showToast('View-only user created.');
    } catch (error) {
      setUserError(error.message);
    } finally {
      setUserBusy(false);
    }
  }

  async function removeProduct(product) {
    if (!window.confirm(`Delete “${product.product_name}” from your inventory? This cannot be undone.`)) return;
    try {
      await apiRequest(`/products/${product.id}`, { method: 'DELETE', token: auth.tokens.access_token });
      setProducts((current) => current.filter((item) => Number(item.id) !== Number(product.id)));
      showToast('Product deleted.');
    } catch (error) {
      showToast(error.message);
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesText = `${product.product_name} ${product.description}`.toLowerCase().includes(search.toLowerCase());
    const matchesStock = stockFilter === 'all' || (stockFilter === 'low' ? Number(product.quantity) > 0 && Number(product.quantity) <= 5 : Number(product.quantity) === 0);
    return matchesText && matchesStock;
  });
  const totalValue = products.reduce((sum, product) => sum + Number(product.price) * Number(product.quantity), 0);
  const lowStock = products.filter((product) => Number(product.quantity) > 0 && Number(product.quantity) <= 5).length;
  const initials = (auth.user.username || auth.user.email || 'U').split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  const currentDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: '2-digit', year: 'numeric' }).format(new Date()).toUpperCase();

  return (
    <div className="dashboard-shell">
      <aside className={`dashboard-sidebar ${menuOpen ? 'dashboard-sidebar-open' : ''}`}>
        <a className="product-brand" href="#inventory"><span className="brand-symbol"><Boxes size={19} /></span><span>stockroom<span className="brand-dot">.</span></span></a>
        <div className="workspace-tag"><span className="workspace-avatar">S</span><span><b>Stockroom Co.</b><small>INVENTORY WORKSPACE</small></span><ChevronDown size={14} /></div>
        <div className="nav-caption">WORKSPACE</div>
        <button className={`dashboard-nav-item ${activeView === 'inventory' ? 'active' : ''}`} onClick={() => { setActiveView('inventory'); setMenuOpen(false); }}><Boxes size={17} />Inventory<span className="nav-count">{products.length}</span></button>
        {isAdmin && <button className={`dashboard-nav-item ${activeView === 'users' ? 'active' : ''}`} onClick={() => { setActiveView('users'); setMenuOpen(false); }}><UsersRound size={17} />Users<span className="nav-count">{users.length}</span></button>}
        <div className="sidebar-note"><div className="sidebar-note-icon">{isAdmin ? <TrendingUp size={16} /> : <Eye size={16} />}</div><b>{isAdmin ? 'Stock at a glance' : 'View-only access'}</b><p>{isAdmin ? (lowStock === 0 ? 'Everything is looking healthy.' : `${lowStock} ${lowStock === 1 ? 'item needs' : 'items need'} a restock soon.`) : 'You can view inventory, but only an admin can change product data.'}</p></div>
        <div className="sidebar-bottom"><div className="api-status"><span className="status-pulse" /> API CONNECTED<small>LAVALUST · AUTHENTICATED</small></div><button className="profile-button" onClick={onLogout}><span className="profile-avatar">{initials}</span><span className="profile-info"><b>{auth.user.username || auth.user.email}</b><small>{auth.user.email}</small></span><LogOut size={16} /></button></div>
      </aside>
      {menuOpen && <button className="dashboard-backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}

      <main className="dashboard-main" id="inventory">
        <header className="dashboard-topbar"><button className="dashboard-menu-button" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu size={19} /></button><div className="dashboard-breadcrumb">Workspace <span>/</span> <b>{activeView === 'users' ? 'Users' : 'Inventory'}</b></div><div className="topbar-actions"><span className="last-sync"><span /> {isAdmin ? 'ADMIN ACCESS' : 'VIEW ONLY'}</span><button className="help-button" aria-label="Help"><CircleHelp size={17} /></button><button className="top-avatar" title={auth.user.email}>{initials}</button></div></header>
        <div className="dashboard-content">
          <section className="dashboard-title-row"><div><div className="dashboard-overline">{currentDate} <span>·</span> {activeView === 'users' ? 'ACCOUNT MANAGEMENT' : 'YOUR INVENTORY'}</div><h1>{activeView === 'users' ? 'User access' : `Good work, ${auth.user.username?.split(' ')[0] || 'there'}`}<span>.</span></h1><p>{activeView === 'users' ? 'Create accounts with view-only access to product inventory.' : isAdmin ? 'Here’s what’s happening across your product inventory.' : 'View your product inventory. Changes are managed by an administrator.'}</p></div>{isAdmin && <button className="primary-button add-button" onClick={activeView === 'users' ? () => { setUserError(''); setUserDialogOpen(true); } : openCreate}>{activeView === 'users' ? <UserRoundPlus size={16} /> : <Plus size={17} />}{activeView === 'users' ? 'Create user' : 'Add product'}</button>}</section>

          {activeView === 'inventory' ? <>
          <section className="metric-grid" aria-label="Inventory summary">
            <article className="metric-card"><div className="metric-head"><span>PRODUCTS</span><span className="metric-icon icon-coral"><Boxes size={17} /></span></div><div className="metric-value">{products.length.toString().padStart(2, '0')}</div><div className="metric-foot">Unique items in your catalog</div></article>
            <article className="metric-card"><div className="metric-head"><span>UNITS IN STOCK</span><span className="metric-icon icon-green"><ArrowDownWideNarrow size={17} /></span></div><div className="metric-value">{products.reduce((sum, product) => sum + Number(product.quantity), 0).toLocaleString()}</div><div className="metric-foot">Across all listed products</div></article>
            <article className="metric-card"><div className="metric-head"><span>INVENTORY VALUE</span><span className="metric-icon icon-blue"><DollarSign size={17} /></span></div><div className="metric-value metric-currency">{currency(totalValue)}</div><div className="metric-foot">Based on current unit prices</div></article>
            <article className="metric-card"><div className="metric-head"><span>LOW STOCK</span><span className="metric-icon icon-amber"><SlidersHorizontal size={17} /></span></div><div className="metric-value">{lowStock.toString().padStart(2, '0')}</div><div className="metric-foot">Products with 5 units or fewer</div></article>
          </section>

          <section className="inventory-panel">
            <div className="inventory-heading"><div><div className="panel-overline">CATALOG / 01</div><h2>All products <span>{products.length}</span></h2></div><div className="inventory-tools"><label className="table-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" aria-label="Search products" />{search && <button onClick={() => setSearch('')} aria-label="Clear search"><X size={14} /></button>}</label><label className="filter-select"><SlidersHorizontal size={15} /><select value={stockFilter} onChange={(event) => setStockFilter(event.target.value)} aria-label="Filter stock"><option value="all">All stock</option><option value="low">Low stock</option><option value="out">Out of stock</option></select><ChevronDown size={13} /></label></div></div>
            {loadError && <div className="load-error" role="alert">{loadError}<button onClick={loadProducts}>Try again</button></div>}
            <div className="table-wrap"><table><thead><tr><th>PRODUCT</th><th>UNIT PRICE</th><th>QUANTITY</th><th>STOCK STATUS</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>
              {loading ? <tr><td colSpan="5" className="table-message"><span className="loading-spinner" /> Loading your inventory…</td></tr> : filteredProducts.length === 0 ? <tr><td colSpan="5" className="table-message"><div className="empty-icon"><Boxes size={20} /></div><b>{products.length === 0 ? 'Your inventory starts here.' : 'No products found.'}</b><span>{products.length === 0 ? isAdmin ? 'Add your first product to see it in your catalog.' : 'Your administrator has not added products yet.' : 'Try another search or stock filter.'}</span>{products.length === 0 && isAdmin && <button className="text-action" onClick={openCreate}><Plus size={14} /> Add your first product</button>}</td></tr> : filteredProducts.map((product) => {
                const quantity = Number(product.quantity);
                const status = quantity === 0 ? 'out' : quantity <= 5 ? 'low' : 'healthy';
                return <tr key={product.id}><td><div className="product-cell"><span className={`product-thumb thumb-${Number(product.id) % 4}`}><Boxes size={18} /></span><span className="product-details"><b>{product.product_name}</b><small>{product.description}</small></span></div></td><td className="price-cell">{currency(product.price)}</td><td><span className="quantity-cell">{quantity.toLocaleString()} <small>units</small></span></td><td><span className={`stock-badge stock-${status}`}><i />{status === 'healthy' ? 'In stock' : status === 'low' ? 'Low stock' : 'Out of stock'}</span></td><td>{isAdmin && <div className="row-actions"><button className="icon-button" onClick={() => openEdit(product)} aria-label={`Edit ${product.product_name}`} title="Edit product"><Edit3 size={15} /></button><button className="icon-button danger-icon" onClick={() => removeProduct(product)} aria-label={`Delete ${product.product_name}`} title="Delete product"><Trash2 size={15} /></button></div>}</td></tr>;
              })}
            </tbody></table></div>
            <div className="table-footer"><span>Showing <b>{filteredProducts.length}</b> of <b>{products.length}</b> products</span><button onClick={loadProducts}><ArrowDownWideNarrow size={14} /> Refresh inventory</button></div>
          </section>
          </> : <section className="inventory-panel users-panel"><div className="inventory-heading"><div><div className="panel-overline">ACCESS / 02</div><h2>View-only users <span>{users.length}</span></h2></div><div className="users-panel-note"><Eye size={15} /> These accounts cannot change product records.</div></div><div className="table-wrap"><table><thead><tr><th>USER</th><th>EMAIL</th><th>ACCESS</th><th>CREATED</th></tr></thead><tbody>{users.length === 0 ? <tr><td colSpan="4" className="table-message"><div className="empty-icon"><UsersRound size={20} /></div><b>No user accounts yet.</b><span>Create a view-only account to give someone inventory access.</span></td></tr> : users.map((user) => <tr key={user.id}><td><div className="product-cell"><span className="user-row-avatar">{user.username.slice(0, 1).toUpperCase()}</span><span className="product-details"><b>{user.username}</b><small>Inventory viewer</small></span></div></td><td>{user.email}</td><td><span className="stock-badge stock-healthy"><Eye size={12} /> View only</span></td><td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</td></tr>)}</tbody></table></div><div className="table-footer"><span>Accounts created by an administrator</span><button onClick={loadUsers}><ArrowDownWideNarrow size={14} /> Refresh users</button></div></section>}
          <footer className="dashboard-footer"><span><span className="footer-mark">s.</span> STOCKROOM <i>·</i> INVENTORY MANAGEMENT</span><span>DATA SERVED SECURELY BY LAVALUST API</span></footer>
        </div>
      </main>
      {dialogOpen && <ProductDialog product={dialogProduct} busy={busy} error={dialogError} onClose={() => setDialogOpen(false)} onSubmit={saveProduct} />}
      {userDialogOpen && <UserDialog busy={userBusy} error={userError} onClose={() => setUserDialogOpen(false)} onSubmit={createUser} />}
      {toast && <div className="toast-message" role="status"><Check size={16} />{toast}</div>}
    </div>
  );
}

export default function ProductApp() {
  const [auth, setAuth] = useState(() => {
    try { return JSON.parse(localStorage.getItem('stockroom_auth') || 'null'); } catch { return null; }
  });

  useEffect(() => {
    if (!auth?.tokens?.access_token) return;
    apiRequest('/auth/me', { token: auth.tokens.access_token }).then(({ user }) => {
      setAuth((current) => {
        const next = { ...current, user };
        localStorage.setItem('stockroom_auth', JSON.stringify(next));
        return next;
      });
    }).catch(() => {
      localStorage.removeItem('stockroom_auth');
      setAuth(null);
    });
  }, []);

  function acceptAuthentication(result) {
    const next = { user: result.user, tokens: result.tokens };
    localStorage.setItem('stockroom_auth', JSON.stringify(next));
    setAuth(next);
  }

  async function logout(revoke = true) {
    if (revoke && auth?.tokens?.access_token) {
      try {
        await apiRequest('/auth/logout', {
          method: 'POST',
          token: auth.tokens.access_token,
          body: JSON.stringify({ refresh_token: auth.tokens.refresh_token }),
        });
      } catch { /* Clear local credentials even when the API is unavailable. */ }
    }
    localStorage.removeItem('stockroom_auth');
    setAuth(null);
  }

  return auth?.tokens?.access_token ? <Dashboard auth={auth} onLogout={logout} /> : <AuthScreen onAuthenticated={acceptAuthentication} />;
}
