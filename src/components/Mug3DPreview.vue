<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RotateCcw, RotateCw } from '@lucide/vue'
import {
  ACESFilmicToneMapping,
  BackSide,
  CanvasTexture,
  CircleGeometry,
  CylinderGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshPhysicalMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShadowMaterial,
  SRGBColorSpace,
  TorusGeometry,
  WebGLRenderer,
  type Material,
} from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import {
  drawPersonalizationArtwork,
  MUG_TEXTURE_HEIGHT,
  MUG_TEXTURE_WIDTH,
  resolveMugAppearance,
} from '@/utils/mugPersonalization'

const props = defineProps<{
  imageUrl: string
  imageScale: number
  imageX: number
  imageY: number
  phrase: string
  model: string
}>()

const canvas = ref<HTMLCanvasElement>()
const canvasFrame = ref<HTMLDivElement>()
const status = ref<'loading' | 'ready' | 'fallback'>('loading')
const statusMessage = ref('Preparando a prévia 3D')
const modelDescription = computed(() => `Caneca em 3D com a personalização escolhida. Modelo: ${props.model}.`)

let renderer: WebGLRenderer | undefined
let scene: Scene | undefined
let camera: PerspectiveCamera | undefined
let controls: OrbitControls | undefined
let mugGroup: Group | undefined
let artworkTexture: CanvasTexture | undefined
let bodyMaterial: MeshPhysicalMaterial | undefined
let handleMaterial: MeshPhysicalMaterial | undefined
let handleGuardMaterial: MeshPhysicalMaterial | undefined
let interiorMaterial: MeshPhysicalMaterial | undefined
let rimMaterial: MeshPhysicalMaterial | undefined
let resizeObserver: ResizeObserver | undefined
let textureCanvas: HTMLCanvasElement | undefined
let loadedImage: HTMLImageElement | undefined
let imageLoadVersion = 0
let renderFrame = 0

function requestRender() {
  if (!renderer || !scene || !camera || renderFrame) return
  renderFrame = requestAnimationFrame(() => {
    renderFrame = 0
    renderer?.render(scene as Scene, camera as PerspectiveCamera)
  })
}

function drawArtwork() {
  if (!textureCanvas || !artworkTexture) return
  const context = textureCanvas.getContext('2d')
  if (!context) return
  drawPersonalizationArtwork(context, MUG_TEXTURE_WIDTH, MUG_TEXTURE_HEIGHT, {
    image: loadedImage,
    imageWidth: loadedImage?.naturalWidth ?? 1,
    imageHeight: loadedImage?.naturalHeight ?? 1,
    imageScale: props.imageScale,
    imageX: props.imageX,
    imageY: props.imageY,
    phrase: props.phrase,
  })

  artworkTexture.needsUpdate = true
  requestRender()
}

function loadArtworkImage() {
  const version = ++imageLoadVersion
  loadedImage = undefined
  if (!props.imageUrl) {
    drawArtwork()
    return
  }

  const image = new Image()
  image.decoding = 'async'
  image.onload = () => {
    if (version !== imageLoadVersion) return
    loadedImage = image
    drawArtwork()
  }
  image.onerror = () => {
    if (version !== imageLoadVersion) return
    loadedImage = undefined
    drawArtwork()
  }
  image.src = props.imageUrl
}

function updateMugAppearance() {
  const appearance = resolveMugAppearance(props.model)
  bodyMaterial?.color.setHex(appearance.body)
  handleMaterial?.color.setHex(appearance.handle)
  handleGuardMaterial?.color.setHex(appearance.body)
  interiorMaterial?.color.setHex(appearance.interior)
  rimMaterial?.color.setHex(appearance.rim)
  drawArtwork()
  requestRender()
}

function rotateMug(direction: -1 | 1) {
  if (!mugGroup) return
  mugGroup.rotation.y += direction * 0.28
  requestRender()
}

function resetView() {
  if (mugGroup) mugGroup.rotation.set(0, -0.18, 0)
  controls?.reset()
  requestRender()
}

function handleKeyboard(event: KeyboardEvent) {
  if (status.value !== 'ready') return
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault()
    rotateMug(event.key === 'ArrowLeft' ? -1 : 1)
  } else if (event.key === 'Home' || event.key === 'Escape') {
    event.preventDefault()
    resetView()
  }
}

function resizeRenderer() {
  if (!renderer || !camera || !canvasFrame.value) return
  const width = Math.max(280, canvasFrame.value.clientWidth)
  const height = Math.max(300, canvasFrame.value.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
  renderer.setSize(width, height, false)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  requestRender()
}

function disposeMaterial(material: Material | Material[]) {
  if (Array.isArray(material)) material.forEach((item) => item.dispose())
  else material.dispose()
}

function disposeScene() {
  imageLoadVersion += 1
  resizeObserver?.disconnect()
  controls?.dispose()
  if (scene) {
    scene.traverse((object) => {
      const mesh = object as Mesh
      mesh.geometry?.dispose()
      if (mesh.material) disposeMaterial(mesh.material)
    })
  }
  artworkTexture?.dispose()
  renderer?.dispose()
  if (renderFrame) cancelAnimationFrame(renderFrame)
  renderer = undefined
  scene = undefined
  camera = undefined
  controls = undefined
  mugGroup = undefined
}

async function initialize() {
  if (!canvas.value || !canvasFrame.value) return
  const supportsWebGl2 = Boolean(document.createElement('canvas').getContext('webgl2'))
  if (!supportsWebGl2) {
    status.value = 'fallback'
    statusMessage.value = 'Prévia 3D indisponível neste dispositivo. Use os controles para montar a simulação 2D.'
    return
  }

  try {
    if (!canvas.value || !canvasFrame.value) return

    scene = new Scene()
    camera = new PerspectiveCamera(34, 1, 0.1, 100)
    camera.position.set(0, 0.45, 7.2)

    renderer = new WebGLRenderer({
      canvas: canvas.value,
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    })
    renderer.outputColorSpace = SRGBColorSpace
    renderer.toneMapping = ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.12
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = PCFSoftShadowMap

    controls = new OrbitControls(camera, canvas.value)
    controls.enablePan = false
    controls.enableDamping = false
    controls.minDistance = 5.3
    controls.maxDistance = 9
    controls.minPolarAngle = Math.PI * 0.28
    controls.maxPolarAngle = Math.PI * 0.7
    controls.target.set(0, 0.05, 0)
    controls.update()
    controls.saveState()
    controls.addEventListener('change', requestRender)

    scene.add(new HemisphereLight(0xfff8fb, 0x6e5660, 2.5))
    const keyLight = new DirectionalLight(0xffffff, 4.6)
    keyLight.position.set(-3.5, 5, 5)
    keyLight.castShadow = true
    scene.add(keyLight)
    const fillLight = new DirectionalLight(0xffcfe0, 2.2)
    fillLight.position.set(4, 1.5, 3)
    scene.add(fillLight)

    mugGroup = new Group()
    mugGroup.rotation.y = -0.18
    scene.add(mugGroup)

    bodyMaterial = new MeshPhysicalMaterial({ roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.1 })
    handleMaterial = new MeshPhysicalMaterial({ roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.12 })
    handleGuardMaterial = new MeshPhysicalMaterial({
      roughness: 0.24,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      polygonOffset: true,
      polygonOffsetFactor: -4,
    })
    interiorMaterial = new MeshPhysicalMaterial({ roughness: 0.34, side: BackSide })
    rimMaterial = new MeshPhysicalMaterial({ roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08 })

    const body = new Mesh(new CylinderGeometry(1.35, 1.23, 2.6, 96, 5, true), bodyMaterial)
    body.castShadow = true
    body.receiveShadow = true
    mugGroup.add(body)

    const inside = new Mesh(new CylinderGeometry(1.19, 1.13, 2.38, 96, 2, true), interiorMaterial)
    inside.position.y = 0.06
    mugGroup.add(inside)

    const bottom = new Mesh(new CircleGeometry(1.23, 96), bodyMaterial)
    bottom.rotation.x = -Math.PI / 2
    bottom.position.y = -1.3
    bottom.receiveShadow = true
    mugGroup.add(bottom)

    const innerBottom = new Mesh(new CircleGeometry(1.13, 96), interiorMaterial)
    innerBottom.rotation.x = Math.PI / 2
    innerBottom.position.y = -1.1
    mugGroup.add(innerBottom)

    const rim = new Mesh(new TorusGeometry(1.27, 0.075, 20, 112), rimMaterial)
    rim.rotation.x = Math.PI / 2
    rim.position.y = 1.3
    rim.castShadow = true
    mugGroup.add(rim)

    const handle = new Mesh(new TorusGeometry(0.72, 0.17, 24, 96), handleMaterial)
    handle.scale.y = 1.16
    handle.position.set(1.57, 0.02, -0.08)
    handle.castShadow = true
    mugGroup.add(handle)

    textureCanvas = document.createElement('canvas')
    textureCanvas.width = MUG_TEXTURE_WIDTH
    textureCanvas.height = MUG_TEXTURE_HEIGHT
    artworkTexture = new CanvasTexture(textureCanvas)
    artworkTexture.colorSpace = SRGBColorSpace
    artworkTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())

    const artworkMaterial = new MeshPhysicalMaterial({
      map: artworkTexture,
      transparent: true,
      alphaTest: 0.01,
      roughness: 0.34,
      clearcoat: 0.65,
      clearcoatRoughness: 0.12,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    })
    const artwork = new Mesh(
      new CylinderGeometry(1.363, 1.243, 2.13, 128, 1, true, -Math.PI * 0.72, Math.PI * 1.44),
      artworkMaterial,
    )
    artwork.position.y = -0.02
    artwork.renderOrder = 1
    mugGroup.add(artwork)

    const handleGuard = new Mesh(
      new CylinderGeometry(1.369, 1.249, 2.17, 48, 1, true, Math.PI * 0.35, Math.PI * 0.3),
      handleGuardMaterial,
    )
    handleGuard.position.y = -0.02
    handleGuard.renderOrder = 2
    mugGroup.add(handleGuard)

    const floorMaterial = new ShadowMaterial({ color: 0x6d4454, opacity: 0.18 })
    const floor = new Mesh(new PlaneGeometry(8, 6), floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -1.34
    floor.receiveShadow = true
    scene.add(floor)

    resizeObserver = new ResizeObserver(resizeRenderer)
    resizeObserver.observe(canvasFrame.value)
    resizeRenderer()
    updateMugAppearance()
    loadArtworkImage()
    status.value = 'ready'
    statusMessage.value = 'Prévia 3D pronta. Arraste para girar e use a roda do mouse ou gesto de pinça para aproximar.'
    requestRender()
  } catch (error) {
    console.error('Não foi possível iniciar a prévia 3D.', error)
    disposeScene()
    status.value = 'fallback'
    statusMessage.value = 'Não foi possível abrir a prévia 3D. A simulação 2D continua disponível.'
  }
}

watch(() => props.imageUrl, loadArtworkImage)
watch(() => [props.imageScale, props.imageX, props.imageY, props.phrase], drawArtwork)
watch(() => props.model, updateMugAppearance)

onMounted(initialize)
onBeforeUnmount(disposeScene)
</script>

<template>
  <div class="mug-viewer">
    <div
      ref="canvasFrame"
      class="mug-canvas-frame"
      :class="{ fallback: status === 'fallback' }"
      role="group"
      :aria-label="modelDescription"
      aria-describedby="mug-3d-status mug-3d-help"
      tabindex="0"
      @keydown="handleKeyboard"
    >
      <canvas ref="canvas" :aria-hidden="status !== 'ready'" />
      <div v-if="status === 'loading'" class="viewer-message" role="status">Preparando sua caneca em 3D…</div>
      <div v-else-if="status === 'fallback'" class="viewer-message" role="status">
        <div class="fallback-mug">
          <div class="fallback-print">
            <img
              v-if="imageUrl"
              :src="imageUrl"
              alt="Imagem escolhida na simulação 2D"
              :style="{ transform: `translate(${imageX}%, ${imageY}%) scale(${imageScale / 100})` }"
            />
            <span v-if="phrase">{{ phrase }}</span>
            <span v-else-if="!imageUrl">Sua arte</span>
          </div>
        </div>
        <strong>Prévia 2D ativa</strong>
        <span>Seu navegador não abriu o modelo tridimensional.</span>
      </div>
      <span class="viewer-badge">Prévia 3D</span>
    </div>

    <div class="viewer-controls" aria-label="Controles da caneca 3D">
      <button type="button" :disabled="status !== 'ready'" aria-label="Girar caneca para a esquerda" @click="rotateMug(-1)"><RotateCcw :size="18" /></button>
      <button type="button" :disabled="status !== 'ready'" @click="resetView">Centralizar</button>
      <button type="button" :disabled="status !== 'ready'" aria-label="Girar caneca para a direita" @click="rotateMug(1)"><RotateCw :size="18" /></button>
    </div>
    <p id="mug-3d-help" class="viewer-help">Arraste para girar. Use pinça ou a roda do mouse para aproximar. No teclado, use ← → e Home.</p>
    <p id="mug-3d-status" class="sr-only" aria-live="polite">{{ statusMessage }}</p>
  </div>
</template>

<style scoped>
.mug-viewer{width:100%}.mug-canvas-frame{position:relative;width:100%;height:390px;overflow:hidden;border-radius:18px;background:radial-gradient(circle at 48% 35%,#fff 0 20%,#f7edf1 55%,#ead6de 100%);outline:none}.mug-canvas-frame:focus-visible{box-shadow:0 0 0 4px #f3a8c1}.mug-canvas-frame canvas{display:block;width:100%;height:100%;touch-action:none}.viewer-badge{position:absolute;top:12px;left:12px;padding:6px 9px;border:1px solid rgba(154,35,59,.16);border-radius:999px;background:rgba(255,255,255,.88);color:#8f2948;font-size:10px;font-weight:950;letter-spacing:.08em;text-transform:uppercase;pointer-events:none}.viewer-message{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:7px;padding:24px;color:#6f4454;text-align:center;font-size:12px}.fallback-mug{display:grid;place-items:center;width:150px;height:125px;margin-bottom:8px;overflow:hidden;border-radius:18px 18px 27px 27px;background:linear-gradient(105deg,#f2eef0,#fff 38%,#e6dfe2);box-shadow:0 16px 24px rgba(58,36,45,.16)}.fallback-print{display:flex;flex-direction:column;align-items:center;justify-content:center;width:118px;height:102px;overflow:hidden}.fallback-print img{display:block;max-width:88px;max-height:70px;object-fit:contain;transform-origin:center}.fallback-print span{max-width:115px;color:#8a2947;font-weight:900;overflow-wrap:anywhere}.fallback-print img + span{margin-top:3px;font-size:10px;line-height:1.1}.viewer-controls{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:10px}.viewer-controls button{display:flex;align-items:center;justify-content:center;min-width:42px;min-height:40px;padding:8px 13px;border:1px solid #dfb8c6;border-radius:10px;background:#fff;color:#7e2946;font:inherit;font-size:12px;font-weight:900;cursor:pointer}.viewer-controls button:focus-visible{outline:3px solid #f3a8c1;outline-offset:2px}.viewer-controls button:disabled{cursor:not-allowed;opacity:.5}.viewer-help{margin:8px auto 0;max-width:440px;color:var(--muted);font-size:11px;line-height:1.45;text-align:center}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media(max-width:800px){.mug-canvas-frame{height:340px}.viewer-help{padding:0 8px}}
@media(prefers-reduced-motion:reduce){.mug-canvas-frame canvas{scroll-behavior:auto}}
</style>
