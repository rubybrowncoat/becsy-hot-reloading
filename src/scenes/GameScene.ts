import { FactionComponent, PlanetFactionAffiliationComponent } from '@/plugins/FactionManagerPlugin'
import { useGlobalStore } from '@/store/global'
import { ComponentType, Entity, System, World } from '@lastolivegames/becsy'
import Phaser from 'phaser'

import { GameState, GraphNode, GraphPosition, PhaserShape, Planet, PositionComponent } from '@/lib/becsy'
import { EventBus } from '@/lib/eventBus'

import { BaseScene } from './BaseScene'

const zoomShapes: (Phaser.GameObjects.Container | Phaser.GameObjects.Shape | Phaser.GameObjects.Image)[] = []

const drawPlanetTooltip = (planet: Phaser.GameObjects.GameObject, entity: Entity, tooltip: HTMLElement) => {
  tooltip.innerHTML = '' // Clear tooltip

  const planetComponent = entity.read(Planet)
  const name = `Planet ${planetComponent.name}`

  const nameText = document.createElement('div')
  nameText.innerText = name
  tooltip.appendChild(nameText)

  setTimeout(() => {
    if (planet.getData('refreshing')) {
      drawPlanetTooltip(planet, entity, tooltip)
    }
  }, 500)
}

const createPlanet = (worldBuilder: System, scene: GameScene, name: string, location: Entity, faction: Entity, x: number, y: number, components: (ComponentType<any> | Record<string, unknown>)[] = []) => {
  const locationPhaserShape = location.read(PhaserShape).shape
  const locationGraphNode = location.read(GraphNode).node

  const absoluteX = locationPhaserShape.x + x
  const absoluteY = locationPhaserShape.y + y

  const factionInstance = faction.read(FactionComponent).instance
  const factionColor = factionInstance.color.color

  const planet = new Phaser.GameObjects.Rectangle(scene, absoluteX, absoluteY, 12, 12, factionColor, 0.4).setStrokeStyle(2, factionColor)
  planet.setDepth(120)
  scene.add.existing(planet)

  zoomShapes.push(planet)
  scene.mapManager.rTree.insert({ minX: absoluteX - 6, minY: absoluteY - 6, maxX: absoluteX + 6, maxY: absoluteY + 6 })

  const entity = worldBuilder.createEntity(Planet, { name: name }, PositionComponent, { x: absoluteX, y: absoluteY }, PhaserShape, { shape: planet }, GraphPosition, { node: locationGraphNode }, ...components).hold()

  planet.setData('name', name)

  planet.setInteractive()
  planet.on('pointerover', (pointer: Phaser.Input.Pointer) => {
    const tooltip = document.getElementById('tooltip')

    if (tooltip) {
      tooltip.style.display = 'block'
      tooltip.style.left = `${pointer.x + 20}px`
      tooltip.style.top = `${pointer.y - 10}px`
      tooltip.style.padding = '10px'
      tooltip.style.backgroundColor = 'black'
      tooltip.style.color = 'white'
      tooltip.style.borderRadius = '5px'
      tooltip.style.border = '2px solid white'

      planet.setData('refreshing', true)
      drawPlanetTooltip(planet, entity, tooltip)
    }
  })

  planet.on('pointerout', () => {
    const tooltip = document.getElementById('tooltip')

    if (tooltip) {
      planet.setData('refreshing', false)

      tooltip.style.display = 'none'
      tooltip.innerHTML = ''
    }
  })
}

let randomPlanetCount = 0
const randomPlanet = (worldBuilder: System, scene: GameScene, regions: Entity[], factions: Entity[]) => {
  randomPlanetCount += 1
  const randomFaction = factions[Math.floor(Math.random() * factions.length)]
  const randomRegion = regions[Math.floor(Math.random() * regions.length)]

  const { node: randomRegionNode } = randomRegion.read(GraphNode)
  const randomRegionNodeAttributes = scene.mapManager.graph.getNodeAttributes(randomRegionNode)

  let randomX,
    randomY,
    tries = 0
  while (true) {
    tries += 1
    randomX = 15 + Math.random() * (randomRegionNodeAttributes.width - 30) - randomRegionNodeAttributes.width / 2
    randomY = 15 + Math.random() * (randomRegionNodeAttributes.height - 30) - randomRegionNodeAttributes.height / 2

    if (tries > 100) {
      console.log('Failed to find a suitable location for planet, skipping...')

      randomPlanetCount -= 1
      return false
    }

    if (!scene.mapManager.rTree.search({ minX: randomRegionNodeAttributes.x + randomX - 15, minY: randomRegionNodeAttributes.y + randomY - 15, maxX: randomRegionNodeAttributes.x + randomX + 15, maxY: randomRegionNodeAttributes.y + randomY + 15 }).length) {
      break
    }

    console.log('Collision detected, retrying...')
  }

  // console.log('Creating planet', `Planet #${randomPlanetCount}`, 'at', randomRegionNode)
  createPlanet(worldBuilder, scene, `#${randomPlanetCount}`, randomRegion, randomFaction, randomX, randomY, [PlanetFactionAffiliationComponent, { faction: randomFaction }])

  return true
}

// Scene
export class GameScene extends BaseScene {
  camera: Phaser.Cameras.Scene2D.Camera
  background: Phaser.GameObjects.Image
  msg_text: Phaser.GameObjects.Text

  constructor() {
    super('GameScene')
  }

  init() {
    console.log('Init on GameScene')

    this.events.on('destroy', () => {
      console.log('Destroy on GameScene')

      console.log('Terminating world...')
      void this.mapManager.world?.terminate().then(() => {
        console.log('World terminated')
        this.mapManager.world = null
      })
    })
  }

  changeScene() {
    // TBD
  }

  async update(_time: number, _delta: number) {
    await this.mapManager.world?.execute()
  }

  async create() {
    this.mapManager.world = await World
      .create
      // {
      //   defs: [
      //     [PlanetFactionAffiliationComponent, FactionComponent],
      //     [GameState, PhaserShape, PhaserContainer, GraphNode, GraphPosition, PositionComponent, Wait, Planet],

      //     [PauseSystem, PositionSystem, WaitSystem],
      //   ],
      // }
      ()

    this.mapManager.world.build((worldBuilder) => {
      const gameState = worldBuilder.singleton.write(GameState)
      gameState.scene = this

      this.factionManager.createFaction(worldBuilder, 'THS', 'THS', new Phaser.Display.Color(0xd0, 0xbb, 0xa8))
      this.factionManager.createFaction(worldBuilder, 'RYG', 'RYG', new Phaser.Display.Color(0x38, 0x7f, 0x39))

      // sizes in MKm
      this.regionManager.createRegion(worldBuilder, this, 'Sol', 0, 0, 5000, 5000)

      useGlobalStore.setState({ world: this.mapManager.world }) // Testing

      for (let i = 0; i < 10; i++) {
        randomPlanet(worldBuilder, this, this.regionManager.regions, this.factionManager.factions)
      }
    })

    this.camera = this.cameras.main
    this.camera.setBackgroundColor(0x240a34)
    this.camera.setZoom(1)
    this.camera.setPosition(0, 0)

    this.input.setTopOnly(true)

    let cameraDragStartX: number
    let cameraDragStartY: number
    this.input.on('pointerdown', (_pointer: Phaser.Input.Pointer) => {
      cameraDragStartX = this.camera.scrollX
      cameraDragStartY = this.camera.scrollY

      // console.log(this.mapManager.world?.stats.components, this.mapManager.world?.stats.systems)
    })

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) {
        this.camera.scrollX = cameraDragStartX + (pointer.downX - pointer.x) / this.camera.zoom
        this.camera.scrollY = cameraDragStartY + (pointer.downY - pointer.y) / this.camera.zoom
      }
    })

    this.input.on('wheel', (pointer: Phaser.Input.Pointer, _over: Phaser.GameObjects.GameObject[], _deltaX: number, deltaY: number) => {
      const worldPoint = this.camera.getWorldPoint(pointer.x, pointer.y)

      const newZoom = Phaser.Math.Clamp(this.camera.zoom - this.camera.zoom * 0.001 * deltaY, 0.005, 20)

      this.camera.setZoom(newZoom)
      this.camera.preRender()

      const scale = newZoom > 2 ? 0.5 : 1 / newZoom
      zoomShapes.forEach((shape) => {
        shape.scaleX = scale
        shape.scaleY = scale
      })

      this.regionManager.rescaleRegionStrokes(4 * scale)

      const newWorldPoint = this.camera.getWorldPoint(pointer.x, pointer.y)
      this.camera.scrollX -= newWorldPoint.x - worldPoint.x
      this.camera.scrollY -= newWorldPoint.y - worldPoint.y
    })

    EventBus.emit('current-scene-ready', this)
  }
}
