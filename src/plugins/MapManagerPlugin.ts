import { World } from '@lastolivegames/becsy'
import Graph from 'graphology'
import RBush from 'rbush'

export class MapManagerPlugin extends Phaser.Plugins.BasePlugin {
  public world: Nullable<World> = null
  public rTree = new RBush(9)
  public graph = new Graph()

  constructor(pluginManager: Phaser.Plugins.PluginManager) {
    super(pluginManager)
  }
}
