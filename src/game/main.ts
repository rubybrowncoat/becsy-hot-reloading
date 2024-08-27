import Phaser from 'phaser'
import { Boot } from '../scenes/Boot'
import { GameScene } from '../scenes/GameScene'
import { RegionManagerPlugin } from '../plugins/RegionManagerPlugin'
import { MapManagerPlugin } from '../plugins/MapManagerPlugin'
import { FactionManagerPlugin } from '../plugins/FactionManagerPlugin'

const width = window.innerWidth
const height = window.innerHeight

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#028af8',
  antialias: false,
  scale: {
      mode: Phaser.Scale.ScaleModes.RESIZE,
      width,
      height,
  },
  plugins: {
    global: [
      { key: 'MapManagerPlugin', plugin: MapManagerPlugin, mapping: 'mapManager', start: true },
      { key: 'RegionManagerPlugin', plugin: RegionManagerPlugin, mapping: 'regionManager', start: true },
      { key: 'FactionManagerPlugin', plugin: FactionManagerPlugin, mapping: 'factionManager', start: true },
    ]
  },
  scene: [
      Boot,
      GameScene,
  ],
}

const StartGame = (parent: string) => {
  const $parent = document.querySelector(`#${parent}`)
  if ($parent) {
    $parent.innerHTML = ''
  }

  return new Phaser.Game({ ...config, parent })
}

export default StartGame