import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const publicPages = [
  { name: 'home', path: '/' },
  { name: 'coleção', path: '/colecao/series' },
  { name: 'busca', path: '/busca?q=Arrow' },
  { name: 'produto', path: '/produto/arrow-1' },
  { name: 'informações', path: '/informacoes' },
  { name: 'personalizada', path: '/personalizada' },
  { name: 'presentes', path: '/presentes' },
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

test('home apresenta produto, caminhos de compra e processo antes da entrega detalhada', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { level: 1, name: /Canecas personalizadas feitas para encantar/ })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ver modelos' })).toHaveAttribute('href', '/colecoes')
  await expect(page.getByRole('link', { name: 'Criar minha caneca' })).toHaveAttribute('href', '/personalizada')
  await expect(page.getByRole('link', { name: 'Ver modelo Aniversário 01' })).toHaveAttribute('href', '/produto/aniversario-01')
  await expect(page.getByRole('heading', { level: 2, name: 'Categorias em destaque' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: 'Da ideia à caneca em três passos' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: 'Escolha como receber' })).toBeVisible()

  const sectionOrder = await page.locator('main section').evaluateAll((sections) =>
    sections.map((section) => section.textContent?.trim() ?? ''),
  )
  expect(sectionOrder.findIndex((text) => text.includes('Categorias em destaque')))
    .toBeLessThan(sectionOrder.findIndex((text) => text.includes('Escolha como receber')))
})

test('placeholder de imagem permanece acessível quando o Storage falha', async ({ page }) => {
  await page.route('**/storage/v1/object/public/product-images/**', (route) => route.abort())
  await page.goto('/produto/arrow-1')

  const fallback = page.getByRole('img', { name: /Arrow 01.*imagem indisponível/i })
  await expect(fallback).toBeVisible()

  const results = await new AxeBuilder({ page })
    .include('.catalog-image-fallback')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()

  expect(results.violations).toEqual([])
})

test('fluxo busca → produto → WhatsApp preserva contexto comercial', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('searchbox', { name: 'Buscar' }).fill('Arrow')
  await page.getByRole('button', { name: 'Buscar' }).click()

  await expect(page).toHaveURL(/\/busca\?q=Arrow/)
  await expect(page.getByRole('heading', { name: /Resultados para/ })).toBeVisible()
  await page.locator('.product-link').first().click()

  await expect(page).toHaveURL(/\/produto\/arrow-/)
  await expect(page.getByText(/^Código CC-ARROW-/)).toBeVisible()
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /https:\/\/criativa-canecas\.vercel\.app\/produto\/arrow-/)
  const whatsapp = page.getByRole('link', { name: 'Pedir este modelo pelo WhatsApp' })
  await expect(whatsapp).toHaveAttribute('href', /wa\.me\/.*CC-ARROW-.*criativa-canecas\.vercel\.app%2Fproduto%2Farrow-/)
  const message = new URL(await whatsapp.getAttribute('href') ?? '').searchParams.get('text') ?? ''
  expect(message).toContain('Tenho interesse na caneca')
  expect(message).not.toContain('personalizar')
  expect(message).toContain('Minha cidade/CEP')
})

test('busca ignora acentos, aceita SKU e pagina resultados extensos', async ({ page }) => {
  await page.goto('/busca?q=sao%20paulo')
  await expect(page.getByText('7 produtos e 0 coleções')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ver detalhes de São Paulo 01' })).toBeVisible()

  await page.goto('/busca?q=CC-ARROW-1')
  await expect(page.getByRole('link', { name: 'Ver detalhes de Arrow 01' })).toBeVisible()

  await page.goto('/busca?q=01')
  await expect(page.locator('article.card')).toHaveCount(20)
  await expect(page.getByText(/Página 1 de/)).toBeVisible()
  await page.getByRole('button', { name: 'Próxima' }).click()
  await expect(page.getByText(/Página 2 de/)).toBeVisible()
})

test('coleção de aniversário contém somente os 23 modelos reconciliados', async ({ page }) => {
  await page.goto('/colecao/aniversario')
  await expect(page.getByText('23 modelos disponíveis')).toBeVisible()
  await expect(page.locator('article.card')).toHaveCount(20)
  await expect(page.getByRole('link', { name: 'Ver detalhes de Aniversário 01' })).toBeVisible()

  await page.getByRole('button', { name: 'Próxima' }).click()
  await expect(page.getByText('Página 2 de 2')).toBeVisible()
  await expect(page.locator('article.card')).toHaveCount(3)
  await expect(page.getByRole('link', { name: 'Ver detalhes de Aniversário 23' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ver detalhes de Aniversário 24' })).toHaveCount(0)
})

test('coleção de pets contém os 50 modelos publicados', async ({ page }) => {
  await page.goto('/colecao/pets')
  await expect(page.getByText('50 modelos disponíveis')).toBeVisible()
  await expect(page.locator('article.card')).toHaveCount(20)
  await expect(page.getByRole('link', { name: 'Ver detalhes de Pets 01' })).toBeVisible()

  await page.getByRole('button', { name: 'Próxima' }).click()
  await expect(page.getByText('Página 2 de 3')).toBeVisible()
  await expect(page.locator('article.card')).toHaveCount(20)

  await page.getByRole('button', { name: 'Próxima' }).click()
  await expect(page.getByText('Página 3 de 3')).toBeVisible()
  await expect(page.locator('article.card')).toHaveCount(10)
  await expect(page.getByRole('link', { name: 'Ver detalhes de Pets 50' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ver detalhes de Pets 51' })).toHaveCount(0)
})

test('coleção Futebol & Esportes contém os 50 modelos publicados', async ({ page }) => {
  await page.goto('/colecao/futebol')
  await expect(page.getByText('50 modelos disponíveis')).toBeVisible()
  await expect(page.locator('article.card')).toHaveCount(20)
  await expect(page.getByRole('link', { name: 'Ver detalhes de Flamengo 01' })).toBeVisible()

  await page.getByRole('button', { name: 'Próxima' }).click()
  await expect(page.getByText('Página 2 de 3')).toBeVisible()
  await expect(page.locator('article.card')).toHaveCount(20)

  await page.getByRole('button', { name: 'Próxima' }).click()
  await expect(page.getByText('Página 3 de 3')).toBeVisible()
  await expect(page.locator('article.card')).toHaveCount(10)
  await expect(page.getByRole('link', { name: 'Ver detalhes de Chelsea 02' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ver detalhes de Chelsea 03' })).toHaveCount(0)
})

test('coleção Profissões contém os 50 modelos com estampa disponível', async ({ page }) => {
  await page.goto('/colecao/profissoes')
  await expect(page.getByText('50 modelos disponíveis')).toBeVisible()
  await expect(page.locator('article.card')).toHaveCount(20)
  await expect(page.getByRole('link', { name: 'Ver detalhes de Administração 01' })).toBeVisible()

  await page.getByRole('button', { name: 'Próxima' }).click()
  await expect(page.getByText('Página 2 de 3')).toBeVisible()
  await expect(page.locator('article.card')).toHaveCount(20)

  await page.getByRole('button', { name: 'Próxima' }).click()
  await expect(page.getByText('Página 3 de 3')).toBeVisible()
  await expect(page.locator('article.card')).toHaveCount(10)
  await expect(page.getByRole('link', { name: 'Ver detalhes de Veterinária 01' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ver detalhes de Profissões 51' })).toHaveCount(0)
})

test('coleção Religião contém 50 modelos com estampas respeitosamente identificadas', async ({ page }) => {
  await page.goto('/colecao/religiao')
  await expect(page.getByText('50 modelos disponíveis')).toBeVisible()
  await expect(page.locator('article.card')).toHaveCount(20)
  await expect(page.getByRole('link', { name: 'Ver detalhes de Porque Ele Vive' })).toBeVisible()

  await page.getByRole('button', { name: 'Próxima' }).click()
  await expect(page.getByText('Página 2 de 3')).toBeVisible()
  await expect(page.locator('article.card')).toHaveCount(20)

  await page.getByRole('button', { name: 'Próxima' }).click()
  await expect(page.getByText('Página 3 de 3')).toBeVisible()
  await expect(page.locator('article.card')).toHaveCount(10)
  await expect(page.getByRole('link', { name: 'Ver detalhes de Unidos pelo Amor do Pai' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ver detalhes de Religião 51' })).toHaveCount(0)
})

test('coleção Divertidas contém somente os 36 mockups aprovados com estampa', async ({ page }) => {
  await page.goto('/colecao/divertidas')
  await expect(page.getByText('36 modelos disponíveis')).toBeVisible()
  await expect(page.locator('article.card')).toHaveCount(20)
  await expect(page.getByRole('link', { name: 'Ver detalhes de Vem Ni Mim' })).toBeVisible()

  await page.getByRole('button', { name: 'Próxima' }).click()
  await expect(page.getByText('Página 2 de 2')).toBeVisible()
  await expect(page.locator('article.card')).toHaveCount(16)
  await expect(page.getByRole('link', { name: 'Ver detalhes de Surte e Atirei o Pau na Dona Chica' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ver detalhes de Divertidas 37' })).toHaveCount(0)
})

test('coleção Animes contém os 43 modelos anteriores e os 98 mockups aprovados', async ({ page }) => {
  await page.goto('/colecao/animes')
  await expect(page.getByText('141 modelos disponíveis')).toBeVisible()
  await expect(page.locator('article.card')).toHaveCount(20)

  for (let pageNumber = 2; pageNumber <= 8; pageNumber += 1) {
    await page.getByRole('button', { name: 'Próxima' }).click()
    await expect(page.getByText(`Página ${pageNumber} de 8`)).toBeVisible()
  }

  await expect(page.locator('article.card')).toHaveCount(1)
  await expect(page.getByRole('link', { name: 'Ver detalhes de Studio Ghibli 01' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ver detalhes de Studio Ghibli 02' })).toHaveCount(0)

  await page.goto('/produto/animes-017')
  await expect(page.getByRole('heading', { level: 1, name: 'Cavaleiros do Zodíaco Dourados 13' })).toBeVisible()

  await page.goto('/produto/animes-027')
  await expect(page.getByRole('heading', { level: 2, name: 'Página não encontrada' })).toBeVisible()

  await page.goto('/produto/animes-083')
  await expect(page.getByRole('heading', { level: 2, name: 'Página não encontrada' })).toBeVisible()

  await page.goto('/produto/fairy-tail-35')
  await expect(page.getByRole('heading', { level: 1, name: 'Fairy Tail 01' })).toBeVisible()
})

test('coleção Amizade inclui os 30 novos mockups sem repetição de rota', async ({ page }) => {
  await page.goto('/colecao/amizade')
  await expect(page.getByText('72 modelos disponíveis')).toBeVisible()
  await expect(page.locator('article.card')).toHaveCount(20)

  for (let pageNumber = 2; pageNumber <= 4; pageNumber += 1) {
    await page.getByRole('button', { name: 'Próxima' }).click()
    await expect(page.getByText(`Página ${pageNumber} de 4`)).toBeVisible()
  }

  await expect(page.locator('article.card')).toHaveCount(12)
  await expect(page.getByRole('link', { name: 'Ver detalhes de Amizade 72' })).toBeVisible()

  await page.goto('/produto/amizade-43')
  await expect(page.getByRole('heading', { level: 1, name: 'Amizade 43' })).toBeVisible()

  await page.goto('/produto/amizade-72')
  await expect(page.getByRole('heading', { level: 1, name: 'Amizade 72' })).toBeVisible()
})

test('produto continua utilizável em viewport móvel e via teclado', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/produto/arrow-1')
  await expect(page.getByRole('heading', { level: 1, name: 'Arrow 01' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: 'Escolha como receber' })).toBeVisible()
  await expect(page.locator('.delivery-options').getByText('O valor exibido corresponde à caneca. O frete não está incluído.')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Pedir este modelo pelo WhatsApp' })).toBeVisible()

  await page.goto('/')
  await page.keyboard.press('Tab')
  const focusIsInteractive = await page.evaluate(() =>
    document.activeElement?.matches('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'),
  )
  expect(focusIsInteractive).toBe(true)
})

test('galeria amplia dentro da própria imagem por cursor, toque e teclado', async ({ page }, testInfo) => {
  await page.goto('/produto/arrow-1')
  const gallery = page.getByRole('button', { name: 'Zoom de Arrow 01' })
  if (testInfo.project.name === 'mobile-safari') {
    await gallery.tap()
    await expect(gallery).toHaveAttribute('aria-pressed', 'true')
    await expect(gallery.locator('img')).toHaveCSS('transform', /matrix\(2\.4/)
    await gallery.tap()
    await expect(gallery).toHaveAttribute('aria-pressed', 'false')
  } else {
    const bounds = await gallery.boundingBox()
    expect(bounds).not.toBeNull()
    await page.mouse.move((bounds?.x ?? 0) + (bounds?.width ?? 0) * 0.75, (bounds?.y ?? 0) + (bounds?.height ?? 0) * 0.3)
    await expect(gallery).toHaveAttribute('aria-pressed', 'true')
    await expect(gallery.locator('img')).toHaveCSS('transform', /matrix\(2\.4/)
    expect(await gallery.locator('img').evaluate((image) => image.style.transformOrigin)).not.toBe('50% 50%')
    await page.mouse.move(0, 0)
    await expect(gallery).toHaveAttribute('aria-pressed', 'false')
  }

  await gallery.focus()
  await page.keyboard.press('Enter')
  await expect(gallery).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('Escape')
  await expect(gallery).toHaveAttribute('aria-pressed', 'false')
})

test('coleção pode ser refinada por tema, preço e ordenação', async ({ page }) => {
  await page.goto('/colecao/series')
  await page.getByLabel('Filtrar por tema').selectOption({ label: 'Arrow' })
  await expect(page.getByText('4 modelos encontrados')).toBeVisible()
  await expect(page.locator('article.card')).toHaveCount(4)

  await page.getByLabel('Faixa de preço').selectOption('over-50')
  await expect(page.getByText('0 modelos encontrados')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Nenhum modelo neste filtro' })).toBeVisible()

  await page.getByRole('button', { name: 'Limpar filtros' }).click()
  await expect(page.locator('article.card')).toHaveCount(20)
})

test('prévia local de personalização preserva contexto no WhatsApp', async ({ page }) => {
  await page.goto('/personalizada')
  await expect(page.getByRole('heading', { name: 'Opções personalizadas e valores' })).toBeVisible()
  await expect(page.getByText('Não vendemos canecas sem estampa.')).toBeVisible()
  await expect(page.getByRole('heading', { level: 3, name: 'Caneca tradicional personalizada' })).toBeVisible()
  await expect(page.getByText('Caneca branca', { exact: true })).toHaveCount(0)
  await page.getByLabel('Modelo da caneca').selectOption('Caneca colorida personalizada')
  await page.getByLabel('Nome ou frase').fill('Melhor mãe do mundo')
  await page.getByLabel('Observações para a criação').fill('Usar tons de rosa')

  const whatsapp = page.getByRole('link', { name: 'Continuar pelo WhatsApp' })
  const href = await whatsapp.getAttribute('href')
  const message = new URL(href ?? '').searchParams.get('text') ?? ''
  expect(message).toContain('Modelo escolhido: Caneca colorida personalizada')
  expect(message).toContain('Melhor mãe do mundo')
  expect(message).toContain('Usar tons de rosa')
  expect(message).toContain('prévia do site é apenas uma simulação')
  expect(message).toContain('Minha cidade/CEP')
})

test('orçamento persiste, ajusta quantidade e gera mensagem consolidada', async ({ page }) => {
  await page.goto('/produto/arrow-1')
  await page.getByRole('button', { name: 'Adicionar Arrow 01 ao orçamento' }).click()
  await expect(page.getByRole('button', { name: /Meu orçamento/ })).toContainText('1')

  await page.getByRole('button', { name: /Meu orçamento/ }).click()
  await expect(page.getByRole('dialog', { name: 'Sua seleção' })).toBeVisible()
  await page.getByRole('button', { name: 'Aumentar Arrow 01' }).click()
  await expect(page.getByLabel('2 unidades')).toBeVisible()

  await page.reload()
  await expect(page.getByRole('button', { name: /Meu orçamento/ })).toContainText('2')
  await page.getByRole('button', { name: /Meu orçamento/ }).click()
  const sendLink = page.getByRole('link', { name: 'Enviar lista pelo WhatsApp' })
  const href = await sendLink.getAttribute('href')
  const message = new URL(href ?? '').searchParams.get('text') ?? ''
  expect(message).toContain('2x Arrow 01 (CC-ARROW-1)')
  expect(message).toContain('/produto/arrow-1')
  expect(message).toContain('Total estimado:')
  expect(message).toContain('não inclui frete')
  expect(message).toContain('Minha cidade/CEP')
  expect(message).toContain('não reserva estoque nem confirma o pedido')

  page.once('dialog', (confirmation) => confirmation.accept())
  await page.getByRole('button', { name: 'Limpar seleção' }).click()
  await expect(page.getByRole('heading', { name: 'Seu orçamento está vazio' })).toBeVisible()
})

test('drawer de orçamento funciona em viewport móvel', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/produto/arrow-1')
  await page.getByRole('button', { name: 'Adicionar Arrow 01 ao orçamento' }).click()
  await page.getByRole('button', { name: /Meu orçamento/ }).click()
  await expect(page.getByRole('dialog', { name: 'Sua seleção' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Enviar lista pelo WhatsApp' })).toBeVisible()
})

test('informações publicadas exibem cartões e FAQ', async ({ page }) => {
  await page.goto('/informacoes')
  await expect(page.getByRole('heading', { level: 1, name: 'Informações e cuidados' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: 'Personalização' })).toBeVisible()
  await expect(page.getByText('Como funciona a personalização?')).toBeVisible()
  await expect(page.locator('.contact').getByRole('link', { name: 'Falar no WhatsApp' })).toBeVisible()
})

test('editor de informações exige autenticação administrativa', async ({ page }) => {
  await page.goto('/admin/informacoes')
  await expect(page).toHaveURL(/\/admin\/login\?redirect=\/admin\/informacoes/)
  await expect(page.getByRole('heading', { name: 'Painel administrativo' })).toBeVisible()
})
