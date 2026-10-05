import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  createProduct,
  createUser,
  deleteProduct,
  getProducts,
  login,
  updateProduct,
} from './api'
import type { AuthSession, Product, ProductInput, UserInput } from './types'
import './App.css'

const emptyProduct: ProductInput = {
  product_name: '',
  description: '',
  price: '',
  quantity: '',
}

const emptyUser: UserInput = {
  username: '',
  email: '',
  password: '',
}

function readSavedSession(): AuthSession | null {
  const saved = sessionStorage.getItem('lab6-session')
  if (!saved) return null

  try {
    const value: unknown = JSON.parse(saved)
    if (
      typeof value === 'object' &&
      value !== null &&
      'accessToken' in value &&
      typeof value.accessToken === 'string' &&
      'identity' in value &&
      typeof value.identity === 'string' &&
      'role' in value &&
      typeof value.role === 'string'
    ) {
      return {
        accessToken: value.accessToken,
        identity: value.identity,
        role: value.role,
      }
    }
    sessionStorage.removeItem('lab6-session')
  } catch {
    sessionStorage.removeItem('lab6-session')
  }

  return null
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(price)
}

function App() {
  const [session, setSession] = useState<AuthSession | null>(readSavedSession)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(() => Boolean(session))
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductInput>(emptyProduct)
  const [userForm, setUserForm] = useState<UserInput>(emptyUser)
  const [loginForm, setLoginForm] = useState({
    identifier: 'admin@example.com',
    password: 'password',
  })

  useEffect(() => {
    if (!session) return

    let active = true

    getProducts(session.accessToken)
      .then((items) => {
        if (active) setProducts(items)
      })
      .catch((cause: unknown) => {
        if (!active) return
        setError(cause instanceof Error ? cause.message : 'Unable to load products.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [session])

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return products
    return products.filter((product) =>
      `${product.product_name} ${product.description}`.toLowerCase().includes(term),
    )
  }, [products, search])

  const totalUnits = products.reduce((total, product) => total + product.quantity, 0)
  const inventoryValue = products.reduce(
    (total, product) => total + product.price * product.quantity,
    0,
  )

  function signOut() {
    sessionStorage.removeItem('lab6-session')
    setSession(null)
    setProducts([])
    setLoading(false)
    setMessage('')
    setError('')
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setLoading(true)
    setError('')

    try {
      const nextSession = await login(loginForm.identifier, loginForm.password)
      sessionStorage.setItem('lab6-session', JSON.stringify(nextSession))
      setSession(nextSession)
      setLoginForm({ identifier: 'admin@example.com', password: 'password' })
      setMessage('')
    } catch (cause) {
      setLoading(false)
      setError(cause instanceof Error ? cause.message : 'Login failed.')
    } finally {
      setBusy(false)
    }
  }

  function openNewProduct() {
    setEditing(null)
    setForm(emptyProduct)
    setError('')
    setDialogOpen(true)
  }

  function openEditProduct(product: Product) {
    setEditing(product)
    setForm({
      product_name: product.product_name,
      description: product.description ?? '',
      price: String(product.price),
      quantity: String(product.quantity),
    })
    setError('')
    setDialogOpen(true)
  }

  async function handleSaveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!session) return

    const payload: ProductInput = {
      product_name: form.product_name.trim(),
      description: form.description.trim(),
      price: form.price,
      quantity: form.quantity,
    }

    setBusy(true)
    setError('')
    try {
      if (editing) {
        await updateProduct(editing.id, payload, session.accessToken)
        setMessage('Product updated successfully.')
      } else {
        await createProduct(payload, session.accessToken)
        setMessage('Product added successfully.')
      }
      const refreshed = await getProducts(session.accessToken)
      setProducts(refreshed)
      setDialogOpen(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save product.')
    } finally {
      setBusy(false)
    }
  }

  async function handleDeleteProduct(product: Product) {
    if (!session || !window.confirm(`Delete "${product.product_name}"? This cannot be undone.`)) {
      return
    }

    setBusy(true)
    setError('')
    setMessage('')
    try {
      await deleteProduct(product.id, session.accessToken)
      setProducts((current) => current.filter((item) => item.id !== product.id))
      setMessage('Product deleted successfully.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to delete product.')
    } finally {
      setBusy(false)
    }
  }

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setBusy(true)
    setError('')
    setMessage('')
    try {
      const adminSession = await login(loginForm.identifier, loginForm.password)
      if (adminSession.role !== 'admin') {
        throw new Error('Only an admin account can create users.')
      }
      await createUser(userForm, adminSession.accessToken)
      setUserForm(emptyUser)
      setUserDialogOpen(false)
      setMessage(`User "${userForm.username.trim()}" created successfully.`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to create user.')
    } finally {
      setBusy(false)
    }
  }

  if (!session) {
    return (
      <main className="login-page">
        <section className="login-card">
          <div className="login-art">
            <div className="art-copy">
              <span className="eyebrow">INVENTORY, SIMPLIFIED</span>
              <h1>Everything in its right place.</h1>
              <p>A clear view of your products, stock, and day-to-day operations.</p>
            </div>
            <div className="art-stat">
              <span className="stat-dot" />
              <span>One workspace. Full control.</span>
            </div>
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
          </div>
          <div className="login-panel">
            <div className="login-heading">
              <span className="eyebrow">WELCOME BACK</span>
              <h2>Sign in to your account</h2>
              <p>Enter your credentials to continue to your workspace.</p>
            </div>
            <form className="form-stack" onSubmit={handleLogin}>
              <label className="field">
                <span>Username or email</span>
                <input
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username or email"
                  value={loginForm.identifier}
                  onChange={(event) =>
                    setLoginForm((current) => ({ ...current, identifier: event.target.value }))
                  }
                  required
                />
              </label>
              <label className="field">
                <span>Password</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((current) => ({ ...current, password: event.target.value }))
                  }
                  required
                />
              </label>
              {error && <p className="feedback feedback-error">{error}</p>}
              <button className="button button-primary button-wide" type="submit" disabled={busy}>
                {busy ? 'Signing in…' : 'Sign in'}
                <span aria-hidden="true">→</span>
              </button>
            </form>
            <div className="login-secondary">
              <span>Need an account?</span>
              <button
                className="text-button"
                type="button"
                onClick={() => {
                  setUserForm(emptyUser)
                  setError('')
                  setUserDialogOpen(true)
                }}
              >
                Create user
              </button>
            </div>
            <aside className="credentials-note" aria-label="Admin account setup">
              <span className="note-pin" aria-hidden="true">●</span>
              <span className="eyebrow">ADMIN ACCOUNT</span>
              <strong>Sign in with the demo admin account.</strong>
              <dl>
                <div><dt>Email</dt><dd>admin@example.com</dd></div>
                <div><dt>Password</dt><dd>password</dd></div>
              </dl>
              <p>Demo credentials only. Change the password before using this app outside your local environment.</p>
            </aside>
            <p className="login-footnote">Product Management System · Laboratory Exercise No. 6</p>
          </div>
        </section>
        {userDialogOpen && (
          <div className="modal-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busy) setUserDialogOpen(false)
          }}>
            <section className="product-dialog" role="dialog" aria-modal="true" aria-labelledby="user-dialog-title">
              <div className="dialog-heading">
                <div>
                  <span className="eyebrow">TEAM ACCESS</span>
                  <h2 id="user-dialog-title">Create user</h2>
                  <p>Enter the new account details. Admin access is verified using the sign-in credentials.</p>
                </div>
                <button className="icon-button dialog-close" type="button" onClick={() => setUserDialogOpen(false)} disabled={busy} aria-label="Close dialog">×</button>
              </div>
              <form className="form-stack" onSubmit={handleCreateUser}>
                <label className="field">
                  <span>Username</span>
                  <input
                    maxLength={100}
                    autoComplete="username"
                    value={userForm.username}
                    onChange={(event) => setUserForm((current) => ({ ...current, username: event.target.value }))}
                    placeholder="e.g. alex.santos"
                    required
                  />
                </label>
                <label className="field">
                  <span>Email address</span>
                  <input
                    type="email"
                    maxLength={255}
                    autoComplete="email"
                    value={userForm.email}
                    onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="user@example.com"
                    required
                  />
                </label>
                <label className="field">
                  <span>Password <small>At least 8 characters</small></span>
                  <input
                    type="password"
                    minLength={8}
                    maxLength={72}
                    autoComplete="new-password"
                    value={userForm.password}
                    onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))}
                    placeholder="Create a secure password"
                    required
                  />
                </label>
                {error && <p className="feedback feedback-error">{error}</p>}
                <div className="dialog-actions">
                  <button className="button button-quiet" type="button" onClick={() => setUserDialogOpen(false)} disabled={busy}>Cancel</button>
                  <button className="button button-primary" type="submit" disabled={busy}>
                    {busy ? 'Creating…' : 'Create user'}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </main>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="nav-caption">WORKSPACE</div>
        <nav aria-label="Main navigation">
          <a className="nav-link nav-link-active" href="#products">
            <span className="nav-icon" aria-hidden="true">▦</span>
            Products
            <span className="nav-count">{products.length}</span>
          </a>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="note-icon" aria-hidden="true">✦</span>
            <strong>Stay on top of stock</strong>
            <span>Keep your catalog accurate and up to date.</span>
          </div>
          <div className="user-profile">
            <span className="avatar">{session.identity.charAt(0).toUpperCase()}</span>
            <span className="profile-copy">
              <strong>{session.identity}</strong>
              <small>Signed in</small>
            </span>
            <button className="icon-button signout-button" type="button" onClick={signOut} aria-label="Log out" title="Log out">
              ↗
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content" id="products">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-divider">/</span><strong>Products</strong></div>
          <button className="button button-quiet" type="button" onClick={signOut}>
            Log out <span aria-hidden="true">↗</span>
          </button>
        </header>

        <section className="page-content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">CATALOG MANAGEMENT</span>
              <h1>Products</h1>
              <p>
                {session.role === 'admin'
                  ? 'Manage your products and keep your inventory in sync.'
                  : 'You have read-only access to the product inventory.'}
              </p>
            </div>
            <div className="page-actions">
              {session.role === 'admin' && (
                <button className="button button-primary" type="button" onClick={openNewProduct}>
                  <span className="plus-icon" aria-hidden="true">+</span>
                  Add product
                </button>
              )}
            </div>
          </div>

          {message && <div className="feedback feedback-success" role="status">{message}</div>}
          {error && <div className="feedback feedback-error" role="alert">{error}</div>}

          <section className="stats-grid" aria-label="Inventory summary">
            <article className="stat-card">
              <span className="stat-label">Total products</span>
              <strong>{products.length}</strong>
              <span className="stat-detail"><span className="stat-icon lavender">▦</span> Items in your catalog</span>
            </article>
            <article className="stat-card">
              <span className="stat-label">Units in stock</span>
              <strong>{totalUnits.toLocaleString()}</strong>
              <span className="stat-detail"><span className="stat-icon mint">↗</span> Across all products</span>
            </article>
            <article className="stat-card">
              <span className="stat-label">Inventory value</span>
              <strong>{formatPrice(inventoryValue)}</strong>
              <span className="stat-detail"><span className="stat-icon peach">₱</span> Based on current stock</span>
            </article>
          </section>

          <section className="catalog-card">
            <div className="catalog-toolbar">
              <div>
                <h2>All products <span className="count-pill">{products.length}</span></h2>
                <p>A complete list of products in your inventory.</p>
              </div>
              <label className="search-field">
                <span aria-hidden="true">⌕</span>
                <input
                  type="search"
                  placeholder="Search products..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Search products"
                />
                <kbd>/</kbd>
              </label>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>PRODUCT</th>
                    <th>PRICE</th>
                    <th>QUANTITY</th>
                    <th>STATUS</th>
                    {session.role === 'admin' && <th><span className="sr-only">Actions</span></th>}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="table-message" colSpan={session.role === 'admin' ? 5 : 4}>
                        Loading products…
                      </td>
                    </tr>
                  ) : visibleProducts.length === 0 ? (
                    <tr>
                      <td className="table-message" colSpan={session.role === 'admin' ? 5 : 4}>
                        {products.length === 0
                          ? 'No products yet. Add your first product to get started.'
                          : 'No products match your search.'}
                      </td>
                    </tr>
                  ) : (
                    visibleProducts.map((product, index) => (
                      <tr key={product.id}>
                        <td>
                          <div className="product-cell">
                            <span className={`product-avatar product-color-${index % 5}`}>
                              {product.product_name.charAt(0).toUpperCase()}
                            </span>
                            <span className="product-copy">
                              <strong>{product.product_name}</strong>
                              <small>{product.description || 'No description'}</small>
                            </span>
                          </div>
                        </td>
                        <td className="price-cell">{formatPrice(product.price)}</td>
                        <td>{product.quantity.toLocaleString()} <span className="unit-label">units</span></td>
                        <td>
                          <span className={`status-badge ${product.quantity > 0 ? 'status-in-stock' : 'status-out-of-stock'}`}>
                            <span />
                            {product.quantity > 0 ? 'In stock' : 'Out of stock'}
                          </span>
                        </td>
                        {session.role === 'admin' && (
                          <td>
                            <div className="row-actions">
                              <button className="text-button" type="button" onClick={() => openEditProduct(product)}>Edit</button>
                              <button className="text-button text-danger" type="button" onClick={() => void handleDeleteProduct(product)} disabled={busy}>Delete</button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="catalog-footer">
              Showing <strong>{visibleProducts.length}</strong> of <strong>{products.length}</strong> products
              <span>Changes are saved to your inventory.</span>
            </div>
          </section>
          <footer className="page-footer">Inventory management <span>·</span> Product catalog</footer>
        </section>
      </main>

      {dialogOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !busy) setDialogOpen(false)
        }}>
          <section className="product-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
            <div className="dialog-heading">
              <div>
                <span className="eyebrow">{editing ? 'UPDATE CATALOG' : 'GROW YOUR CATALOG'}</span>
                <h2 id="dialog-title">{editing ? 'Edit product' : 'Add a product'}</h2>
                <p>{editing ? 'Update the details for this product.' : 'Enter the details for your new product.'}</p>
              </div>
              <button className="icon-button dialog-close" type="button" onClick={() => setDialogOpen(false)} disabled={busy} aria-label="Close dialog">×</button>
            </div>
            <form className="form-stack" onSubmit={handleSaveProduct}>
              <label className="field">
                <span>Product name</span>
                <input
                  autoFocus
                  maxLength={100}
                  value={form.product_name}
                  onChange={(event) => setForm((current) => ({ ...current, product_name: event.target.value }))}
                  placeholder="e.g. Everyday Tote Bag"
                  required
                />
              </label>
              <label className="field">
                <span>Description <small>Optional</small></span>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Add a short description..."
                />
              </label>
              <div className="field-row">
                <label className="field">
                  <span>Price <small>PHP</small></span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </label>
                <label className="field">
                  <span>Quantity</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.quantity}
                    onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
                    placeholder="0"
                    required
                  />
                </label>
              </div>
              {error && <p className="feedback feedback-error">{error}</p>}
              <div className="dialog-actions">
                <button className="button button-quiet" type="button" onClick={() => setDialogOpen(false)} disabled={busy}>Cancel</button>
                <button className="button button-primary" type="submit" disabled={busy}>
                  {busy ? 'Saving…' : editing ? 'Save changes' : 'Add product'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

export default App
