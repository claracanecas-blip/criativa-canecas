export type IconName =
  | 'BriefcaseBusiness'
  | 'Cake'
  | 'Camera'
  | 'Church'
  | 'Clapperboard'
  | 'Coffee'
  | 'CreditCard'
  | 'Dog'
  | 'Dumbbell'
  | 'Gamepad2'
  | 'Gift'
  | 'Handshake'
  | 'Heart'
  | 'Image'
  | 'MessageCircle'
  | 'Palette'
  | 'Search'
  | 'Shirt'
  | 'ShoppingBag'
  | 'Smile'
  | 'Sparkles'
  | 'Truck'
  | 'Tv'
  | 'WandSparkles'

export interface Collection {
  slug: string
  nome: string
  icone: IconName
  to?: string
}

export interface MenuItem {
  nome: string
  to: string
  seta?: boolean
  destaque?: boolean
}

export interface ProductInput {
  id: string
  nome: string
  imagem: string
  tema?: string
  preco?: number
}

export interface Product extends ProductInput {
  colecao: string
  preco: number
}
