import assert from 'node:assert/strict'
import { test } from 'node:test'
import { productImageSrcset, productImageUrl } from '../src/utils/assets.ts'

test('monta URLs das variantes sem perder caracteres especiais', () => {
  const source = './img/caneca café 01.jpg'

  assert.equal(
    productImageUrl(source),
    'https://bqhqqgbdhglnecpfrbig.supabase.co/storage/v1/object/public/product-images/caneca%20caf%C3%A9%2001.webp',
  )
  assert.equal(
    productImageUrl(source, 'card-320'),
    'https://bqhqqgbdhglnecpfrbig.supabase.co/storage/v1/object/public/product-images/card/320/caneca%20caf%C3%A9%2001.webp',
  )
  assert.equal(
    productImageUrl(source, 'social'),
    'https://bqhqqgbdhglnecpfrbig.supabase.co/storage/v1/object/public/product-images/social/caneca%20caf%C3%A9%2001.webp',
  )
})

test('srcset oferece 320, 640 e original de 1000 pixels', () => {
  const srcset = productImageSrcset('./img/produto.png')

  assert.match(srcset, /\/card\/320\/produto\.webp 320w/)
  assert.match(srcset, /\/card\/640\/produto\.webp 640w/)
  assert.match(srcset, /\/produto\.webp 1000w$/)
})
