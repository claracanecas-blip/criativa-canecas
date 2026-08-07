<script setup>
import { site, linkWhatsapp } from '@/data/site'

const ano = new Date().getFullYear()
</script>

<template>
  <footer>
    <div class="container footer">
      <div class="footer-brand">
        <img :src="site.logo" alt="Criativa Canecas">
        <div>
          <strong>Criativa Canecas</strong>
          <span>Personalizadas com amor,<br>feitas para encantar!</span>
        </div>
      </div>

      <div>
        <strong>Catálogo</strong>
        <RouterLink to="/colecoes">Todas as coleções</RouterLink>
        <RouterLink to="/colecao/series">Séries</RouterLink>
        <RouterLink to="/presentes">Presentes</RouterLink>
      </div>

      <div>
        <strong>Atendimento</strong>
        <a :href="linkWhatsapp()" target="_blank" rel="noopener">WhatsApp</a>
        <span>Pedidos sob encomenda</span>
      </div>
    </div>
    <div class="copy">© {{ ano }} Criativa Canecas • Todos os direitos reservados.</div>
  </footer>
</template>

<style scoped>
footer{background:linear-gradient(135deg,var(--pink),var(--pink-dark));color:#fff}
.footer{display:grid;grid-template-columns:1.3fr .8fr .8fr;gap:30px;padding:35px 0}
.footer-brand{display:flex;gap:12px}
.footer-brand img{width:70px;height:70px;border-radius:50%;background:#fff;object-fit:contain}
.footer-brand strong{font-size:19px}
.footer a,.footer span{display:block;color:#fff2f6;font-size:12px;margin:7px 0}
.footer a:hover{text-decoration:underline}
.copy{text-align:center;padding:14px;border-top:1px solid rgba(255,255,255,.22);font-size:11px}

@media(max-width:700px){
  .footer{grid-template-columns:1fr}
}
</style>
