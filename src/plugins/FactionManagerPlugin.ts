import Phaser from 'phaser'
import { component, Entity, field, System } from '@lastolivegames/becsy'

@component
export class PlanetFactionAffiliationComponent {
  @field.ref declare faction: Entity
}

@component
export class FactionComponent {
  @field.object declare instance: Faction

  @field.backrefs(PlanetFactionAffiliationComponent) declare planets: Entity[]
}

export class Faction {
  public credits: number = 0

  constructor(public name: string, public ticker: string, public color: Phaser.Display.Color) {}

  addCredits(amount: number) {
    this.credits += amount
  }

  removeCredits(amount: number) {
    this.credits -= amount
  }
}

export class FactionManagerPlugin extends Phaser.Plugins.BasePlugin {
  public factions: Entity[]
  
  constructor(pluginManager: Phaser.Plugins.PluginManager) {
    super(pluginManager)

    this.factions = []
  }

  createFaction(worldBuilder: System, name: string, ticker: string, color: Phaser.Display.Color) {
    const factionInstance = new Faction(name, ticker, color)
    factionInstance.addCredits(250000000)

    const factionEntity = worldBuilder.createEntity(FactionComponent, {
      instance: factionInstance,
    }).hold()

    this.factions.push(factionEntity)
  }

  getFactionInstanceByTicker(ticker: string) {
    return this.factions.find(faction => faction.read(FactionComponent).instance.ticker === ticker)?.read(FactionComponent).instance
  }
}