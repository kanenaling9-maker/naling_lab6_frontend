export type Product = {
  id: number
  product_name: string
  description: string
  price: number
  quantity: number
  created_at?: string
}

export type ProductInput = {
  product_name: string
  description: string
  price: string
  quantity: string
}

export type AuthSession = {
  accessToken: string
  identity: string
  role: string
}

export type UserInput = {
  username: string
  email: string
  password: string
}
