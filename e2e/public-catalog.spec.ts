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
  await expect(page.locator('.quick-card')).toHaveCount(5)
  await expect(page.locator('.quick-card').filter({ hasText: 'Personalizadas' })).toHaveCount(0)
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
  await expect(page.getByText('23 modelos para escolher')).toBeVisible()
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
  await expect(page.getByText('50 modelos para escolher')).toBeVisible()
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
  await expect(page.getByText('50 modelos para escolher')).toBeVisible()
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
  await expect(page.getByText('50 modelos para escolher')).toBeVisible()
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
  await expect(page.getByText('50 modelos para escolher')).toBeVisible()
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
  await expect(page.getByText('36 modelos para escolher')).toBeVisible()
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
  await expect(page.getByText('141 modelos para escolher')).toBeVisible()
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
  await expect(page.getByText('72 modelos para escolher')).toBeVisible()
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

test('catálogo móvel mantém grade compacta sem sobreposição do WhatsApp flutuante', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/colecao/series')

  await expect(page.getByRole('heading', { level: 1, name: 'Séries' })).toBeVisible()
  await expect(page.getByText('80 modelos para escolher')).toBeVisible()
  await expect(page.locator('.wa')).toBeHidden()
  await expect(page.locator('article.card').first().getByText('Adicionar', { exact: true })).toBeVisible()
  await expect(page.locator('article.card').first().getByText('Adicionar ao orçamento', { exact: true })).toBeHidden()

  const [firstCard, secondCard] = await Promise.all([
    page.locator('article.card').nth(0).boundingBox(),
    page.locator('article.card').nth(1).boundingBox(),
  ])
  expect(firstCard).not.toBeNull()
  expect(secondCard).not.toBeNull()
  expect(secondCard?.x ?? 0).toBeGreaterThan(firstCard?.x ?? 0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)

  await page.goto('/busca?q=Arrow')
  await expect(page.locator('.wa')).toBeHidden()
  await expect(page.locator('article.card')).toHaveCount(4)

  await page.goto('/produto/geek-16')
  await expect(page.locator('.wa')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name: 'Breaking Bad — Walter e Jesse' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Pedir este modelo pelo WhatsApp' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
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

test('coleção usa tema e ordenação sem controles de preço redundantes', async ({ page }) => {
  await page.goto('/colecao/series')
  await expect(page.getByLabel('Faixa de preço')).toHaveCount(0)
  await expect(page.getByRole('option', { name: 'Menor preço' })).toHaveCount(0)
  await expect(page.getByRole('option', { name: 'Maior preço' })).toHaveCount(0)
  await expect(page.getByLabel('Ordenar produtos')).toHaveValue('default')
  await expect(page.getByLabel('Ordenar produtos')).toContainText('Destaques')
  await page.getByLabel('Filtrar por tema').selectOption({ label: 'Arrow' })
  await expect(page.getByText('4 modelos encontrados')).toBeVisible()
  await expect(page.locator('article.card')).toHaveCount(4)

  await page.getByLabel('Ordenar produtos').selectOption('name')
  await expect(page.getByLabel('Ordenar produtos')).toHaveValue('name')

  await page.getByRole('button', { name: 'Limpar filtros' }).click()
  await expect(page.locator('article.card')).toHaveCount(20)
})

test('endereços antigos levam às ofertas atuais sem apresentar páginas desatualizadas', async ({ page }) => {
  await page.goto('/colecao/personalizada')
  await expect(page).toHaveURL(/\/personalizada$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Caneca Personalizada' })).toBeVisible()

  await page.goto('/com-fotos')
  await expect(page).toHaveURL(/\/personalizada$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Caneca Personalizada' })).toBeVisible()

  await page.goto('/dia-dos-pais')
  await expect(page).toHaveURL(/\/presentes$/)
  await expect(page.getByRole('heading', { level: 1, name: /Presentes/ })).toBeVisible()
})

test('personalização aparece como ação, não como coleção vazia', async ({ page }) => {
  await page.goto('/colecoes')
  await expect(page.getByRole('link', { name: /Personalizadas/ })).toHaveCount(0)

  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Criar minha caneca' })).toHaveAttribute('href', '/personalizada')
})

test('arte pronta chega ao WhatsApp com serviço e valor específicos', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/125 Mobile Safari/537.36',
    })
    Object.defineProperty(navigator, 'canShare', {
      configurable: true,
      value: (data: ShareData) => Boolean(data.files?.length),
    })
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (data: ShareData) => {
        const target = window as typeof window & { __sharedRequest?: { files: string[]; text: string } }
        target.__sharedRequest = {
          files: data.files?.map((file) => file.name) ?? [],
          text: data.text ?? '',
        }
      },
    })
  })

  await page.goto('/personalizada')
  await expect(page.getByRole('heading', { name: 'Escolha como quer personalizar' })).toBeVisible()
  await expect(page.getByText('Escolha uma das opções acima para continuar.')).toBeVisible()
  await expect(page.locator('.send-card')).toHaveCount(0)
  await expect(page.getByText(/não vendemos canecas sem estampa/i)).toBeVisible()
  await expect(page.getByRole('heading', { level: 3, name: 'Caneca personalizada com foto' })).toHaveCount(0)
  await expect(page.getByText('Vou enviar a arte pronta', { exact: true })).toBeVisible()
  await expect(page.getByText('R$ 39,90', { exact: true })).toBeVisible()
  await expect(page.getByText('Quero criação ou adaptação', { exact: true })).toBeVisible()
  await expect(page.getByText('R$ 44,90', { exact: true })).toBeVisible()
  await expect(page.getByText(/Sem alterações de texto, cores ou montagem/)).toBeVisible()
  await expect(page.getByText(/Criamos ou adaptamos sua ideia/)).toBeVisible()
  await expect(page.getByText(/taxa/i)).toHaveCount(0)
  await expect(page.locator('.navbar')).not.toContainText('Caneca Mágica')
  await expect(page.locator('.navbar')).not.toContainText('Canecas com Foto')
  await expect(page.getByLabel('Modelo da caneca')).toHaveCount(0)
  await expect(page.getByLabel('Nome ou frase')).toHaveCount(0)
  await expect(page.locator('input[type=file]')).toHaveCount(0)
  await page.getByRole('radio', { name: /Vou enviar a arte pronta/ }).check()
  await expect(page.getByRole('heading', { name: 'Envie sua arte pronta para conferência' })).toBeVisible()
  await expect(page.locator('.selected-service')).toContainText('Arte pronta para impressão')
  await expect(page.locator('.selected-service')).toContainText('R$ 39,90')
  await page.locator('input[type=file]').setInputFiles('public/img/logo.png')
  await expect(page.locator('.upload-button')).toContainText('logo.png')
  await expect(page.locator('.selected-file')).toContainText('Arquivo pronto para enviar: logo.png')
  await expect(page.getByText('O site não armazena nem envia sua imagem sozinho.')).toBeVisible()
  await expect(page.getByText('Prévia 3D', { exact: true })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Ajuste sua foto' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Baixar prévia 21 × 8,7 cm' })).toHaveCount(0)
  await expect(page.getByLabel('Nome ou frase')).toHaveCount(0)
  await page.getByLabel('Observação sobre a arte pronta').fill('Arquivo finalizado em alta resolução')

  await expect(page.locator('.send-card').getByRole('link', { name: /WhatsApp/ })).toHaveCount(0)
  await page.getByRole('button', { name: 'Enviar arte pronta pelo WhatsApp' }).click()
  await expect(page.getByText(/Arte pronta e pedido compartilhados/)).toBeVisible()
  const sharedRequest = await page.evaluate(() => {
    const target = window as typeof window & { __sharedRequest?: { files: string[]; text: string } }
    return target.__sharedRequest
  })
  expect(sharedRequest?.files).toEqual(['logo.png'])
  expect(sharedRequest?.text).toContain('Opção escolhida: Arte pronta para impressão — R$ 39,90.')
  expect(sharedRequest?.text).toContain('Modelo: Caneca personalizada')
  expect(sharedRequest?.text).toContain('Arquivo da arte: logo.png')
  expect(sharedRequest?.text).not.toContain('Frase:')
  expect(sharedRequest?.text).toContain('Detalhes: Arquivo finalizado em alta resolução')
  expect(sharedRequest?.text).toContain('Não preciso de criação ou adaptação')
  expect(sharedRequest?.text).not.toContain('R$ 44,90')
  expect(sharedRequest?.text).not.toContain('Taxa')
  expect(sharedRequest?.text).toContain('Cidade/CEP:')
  expect(sharedRequest?.text).not.toContain('enquadramento, cores e texto')
})

test('pedido de criação chega ao WhatsApp com serviço e valor específicos', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36',
    })
    Object.defineProperty(navigator, 'canShare', {
      configurable: true,
      value: () => true,
    })
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async () => undefined,
    })
  })

  await page.goto('/personalizada')
  await expect(page.getByRole('heading', { name: 'Escolha como quer personalizar' })).toBeVisible()
  await expect(page.locator('input[type=file]')).toHaveCount(0)
  await expect(page.getByLabel('Modelo da caneca')).toHaveCount(0)
  await expect(page.locator('.send-card')).toHaveCount(0)
  await page.getByRole('radio', { name: /Quero criação ou adaptação/ }).check()
  await expect(page.getByRole('heading', { name: 'Envie para criarmos o mockup' })).toBeVisible()
  await expect(page.locator('.selected-service')).toContainText('Criação ou adaptação pela equipe')
  await expect(page.locator('.selected-service')).toContainText('R$ 44,90')
  await page.getByLabel('Nome ou frase').fill('Melhor mãe do mundo')
  await page.getByLabel('Como você imagina sua caneca?').fill('Usar tons de rosa')
  await expect(page.getByRole('button', { name: /WhatsApp/ })).toHaveCount(0)
  const whatsapp = page.getByRole('link', { name: 'Pedir criação pelo WhatsApp' })
  await expect(whatsapp).toBeVisible()
  const href = await whatsapp.getAttribute('href')
  const whatsappUrl = new URL(href ?? '')
  const message = whatsappUrl.searchParams.get('text') ?? ''
  expect(whatsappUrl.pathname).toBe('/5548991992341')
  expect(message).toContain('Modelo: Caneca personalizada')
  expect(message).toContain('Opção escolhida: Criação ou adaptação pela equipe — R$ 44,90.')
  expect(message).toContain('Frase: Melhor mãe do mundo')
  expect(message).toContain('Detalhes: Usar tons de rosa')
  expect(message).toContain('Preciso que vocês criem ou adaptem a composição')
  expect(message).not.toContain('R$ 39,90')
  expect(message).not.toContain('Taxa')
  expect(message).not.toContain('Foto:')
  await expect(page.getByText(/Anexe sua foto, logo ou referência diretamente no WhatsApp/)).toBeVisible()
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
