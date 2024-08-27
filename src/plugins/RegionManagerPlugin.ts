import Phaser from 'phaser'
import { Entity, System } from '@lastolivegames/becsy'
import { MapManagerPlugin } from './MapManagerPlugin'
import { GraphNode, PhaserShape } from '@/lib/becsy'

function heuristicText(scene: Phaser.Scene, name: string, x: number, y: number, width: number, height: number) {
  let heuristicSize = Math.floor((width - 50) / name.length)
  const text = new Phaser.GameObjects.Text(scene, x + width / 2, y + height / 2, name, { fontFamily: 'Verdana, sans-serif', fontStyle: 'bold', color: '#FFFFFF' })

  text.setAlpha(0.2)
  text.setFontSize(heuristicSize)

  while (text.width > width || text.height > height) {
    heuristicSize = text.width > width ? (heuristicSize * (width - 50)) / text.width : (heuristicSize * (height - 50)) / text.height 
    
    text.setFontSize(heuristicSize)
  }

  text.setX(x - text.width / 2)
  text.setY(y - text.height / 2)

  scene.add.existing(text)
}

export class RegionManagerPlugin extends Phaser.Plugins.BasePlugin {
  public regions: Entity[]
  public regionShapes: Phaser.GameObjects.Rectangle[]
  
  constructor(pluginManager: Phaser.Plugins.PluginManager) {
    super(pluginManager)

    this.regions = []
    this.regionShapes = []
  }

  createRegion(worldBuilder: System, scene: Phaser.Scene, name: string, x: number, y: number, width: number, height: number) {
    const mapManagerPlugin = this.pluginManager.get('MapManagerPlugin') as MapManagerPlugin

    const shape = new Phaser.GameObjects.Rectangle(scene, x, y, width, height, 0xffffff, 0.1).setStrokeStyle(4, 0xffffff, 0.6)
    this.regionShapes.push(shape)

    shape.setData('graphNode', name)

    heuristicText(scene, name, x, y, width, height)
  
    scene.add.existing(shape)
  
    mapManagerPlugin.graph.addNode(name, {
      x,
      y,
      width,
      height,
    })
  
    const region = worldBuilder.createEntity(PhaserShape, { shape }, GraphNode, { node: name }).hold()
    this.regions.push(region)

    return region
  }

  rescaleRegionStrokes(scale: number) {
    this.regionShapes.forEach(shape => {
      shape.lineWidth = scale
    })
  }
}