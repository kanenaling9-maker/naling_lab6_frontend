import type { AuthSession, Product, ProductInput, UserInput } from './types'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')

type ApiErrorBody = {
  error?: unknown
  message?: unknown
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string,
): Promise<T> {
  if (!API_BASE_URL && !import.meta.env.DEV) {
    throw new Error('API is not configured. Set VITE_API_BASE_URL for the deployed LavaLust API.')
  }

  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  if (options.body) headers.set('Content-Type', 'application/json')
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)

  const apiPath =
    API_BASE_URL.endsWith('/api') && path.startsWith('/api/')
      ? path.slice('/api'.length)
      : path

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${apiPath}`, { ...options, headers })
  } catch {
    throw new Error('Could not reach the API. Check the API URL and your connection.')
  }

  const text = await response.text()
  let body: unknown
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    throw new Error(`The API returned an invalid response (HTTP ${response.status}).`)
  }

  if (!response.ok) {
    const details = body as ApiErrorBody | null
    const apiMessage =
      typeof details?.error === 'string'
        ? details.error
        : typeof details?.message === 'string'
          ? details.message
          : `Request failed (HTTP ${response.status}).`
    throw new Error(apiMessage)
  }

  return body as T
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export async function login(identifier: string, password: string): Promise<AuthSession> {
  const result: unknown = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  })

  if (!isRecord(result)) throw new Error('The API response is missing login details.')
  const tokens = isRecord(result.tokens) ? result.tokens : result
  const accessToken = tokens.access_token
  if (typeof accessToken !== 'string' || accessToken.length === 0) {
    throw new Error('The API response did not include an access token.')
  }

  const user = isRecord(result.user) ? result.user : null
  const identity =
    (typeof user?.username === 'string' && user.username) ||
    (typeof user?.email === 'string' && user.email) ||
    identifier
  const role = typeof user?.role === 'string' ? user.role : 'user'

  return { accessToken, identity, role }
}

export async function createUser(input: UserInput, accessToken: string): Promise<void> {
  await request('/api/users', {
    method: 'POST',
    body: JSON.stringify(input),
  }, accessToken)
}

export async function getProducts(accessToken: string): Promise<Product[]> {
  const result: unknown = await request('/api/products', {}, accessToken)
  const values = Array.isArray(result)
    ? result
    : isRecord(result) && Array.isArray(result.products)
      ? result.products
      : isRecord(result) && Array.isArray(result.data)
        ? result.data
        : null

  if (!values) throw new Error('The API returned an unexpected product list.')

  return values.map((value): Product => {
    if (
      !isRecord(value) ||
      (typeof value.id !== 'number' && typeof value.id !== 'string') ||
      typeof value.product_name !== 'string' ||
      !Number.isFinite(Number(value.price)) ||
      !Number.isFinite(Number(value.quantity))
    ) {
      throw new Error('The API returned a product with invalid fields.')
    }

    return {
      id: Number(value.id),
      product_name: value.product_name,
      description: typeof value.description === 'string' ? value.description : '',
      price: Number(value.price),
      quantity: Number(value.quantity),
      created_at: typeof value.created_at === 'string' ? value.created_at : undefined,
    }
  })
}

export async function createProduct(input: ProductInput, accessToken: string): Promise<void> {
  await request('/api/products', {
    method: 'POST',
    body: JSON.stringify({
      ...input,
      price: Number(input.price),
      quantity: Number(input.quantity),
    }),
  }, accessToken)
}

export async function updateProduct(
  id: number,
  input: ProductInput,
  accessToken: string,
): Promise<void> {
  await request(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...input,
      price: Number(input.price),
      quantity: Number(input.quantity),
    }),
  }, accessToken)
}

export async function deleteProduct(id: number, accessToken: string): Promise<void> {
  await request(`/api/products/${id}`, { method: 'DELETE' }, accessToken)
}
