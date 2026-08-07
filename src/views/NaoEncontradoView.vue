<template>
  <section class="section container erro">
    <div class="icone">🫖</div>
    <h2>Página não encontrada</h2>
    <p>O link que você abriu não existe mais ou foi movido.</p>
    <RouterLink class="btn" to="/colecoes">Ver todas as coleções</RouterLink>
  </section>
</template>

<style scoped>
.erro{text-align:center;padding:70px 20px}
.icone{font-size:56px;margin-bottom:10px}
.erro h2{margin:0 0 6px;font-size:28px}
.erro p{margin:0 0 20px;color:var(--muted)}
</style>
