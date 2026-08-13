import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const publicPages = [
  { name: 'home', path: '/' },
  { name: 'coleção', path: '/colecao/series' },
  { name: 'busca', path: '/busca?q=Arrow' },
  { name: 'produto', path: '/produto/arrow-1' },
]

for (const target of publicPages) {
  test(`${target.name} atende WCAG 2.2 A/AA sem violações automáticas`, async ({ page }) => {
    await page.goto(target.path)
    await expect(page.locator('main')).toBeVisible()
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })
}

test('fluxo busca → produto → WhatsApp preserva contexto comercial', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('searchbox', { name: 'Buscar' }).fill('Arrow')
  await page.getByRole('button', { name: 'Buscar' }).click()

  await expect(page).toHaveURL(/\/busca\?q=Arrow/)
  await expect(page.getByRole('heading', { name: /Resultados para/ })).toBeVisible()
  await page.locator('.product-link').first().click()

  await expect(page).toHaveURL(/\/produto\/arrow-/)
  await expect(page.getByText(/^Código CC-ARROW-/)).toBeVisible()
  const whatsapp = page.getByRole('link', { name: 'Pedir pelo WhatsApp' })
  await expect(whatsapp).toHaveAttribute('href', /wa\.me\/.*CC-ARROW-.*produto%2Farrow-/)
})

test('produto continua utilizável em viewport móvel e via teclado', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/produto/arrow-1')
  await expect(page.getByRole('heading', { level: 1, name: 'Arrow 01' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Pedir pelo WhatsApp' })).toBeVisible()

  await page.goto('/')
  await page.keyboard.press('Tab')
  const focusedTag = await page.evaluate(() => document.activeElement?.tagName)
  expect(focusedTag).toBe('A')
})
