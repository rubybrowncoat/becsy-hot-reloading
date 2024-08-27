import { FactionManagerPlugin } from '@/plugins/FactionManagerPlugin'
import { MapManagerPlugin } from '@/plugins/MapManagerPlugin'
import { RegionManagerPlugin } from '@/plugins/RegionManagerPlugin'

export abstract class BaseScene extends Phaser.Scene {
  mapManager!: MapManagerPlugin
  regionManager!: RegionManagerPlugin
  factionManager!: FactionManagerPlugin
}
