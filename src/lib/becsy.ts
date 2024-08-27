import { BaseScene } from "@/scenes/BaseScene"
import { component, Entity, field, System, system } from "@lastolivegames/becsy"

// Becsy components
@component
export class GameState {
  @field.boolean declare running: boolean

  @field.object declare scene: BaseScene
}

@component
export class PhaserShape {
  @field.object declare shape: Phaser.GameObjects.Shape | Phaser.GameObjects.Image
}

@component
export class PhaserContainer {
  @field.object declare container: Phaser.GameObjects.Container
}

@component
export class GraphNode {
  @field.object declare node: string
}

@component
export class GraphPosition {
  @field.dynamicString(200) declare node: string
}

@component
export class PositionComponent {
  @field.float64 declare x: number
  @field.float64 declare y: number
}

@component
export class NavigationComponent {
  @field.dynamicString(200) declare target: string
  @field.dynamicString(200) declare nextNode?: string

  @field.float64 declare x: number
  @field.float64 declare y: number
}

@component
export class Wait {
  @field.float64 declare time: number

  @field.object declare callback?: (entity: Entity) => void
}

@component
export class Planet {
  @field.dynamicString(200) declare name: string
}

@system
class PauseSystem extends System {
  private gameState = this.singleton.write(GameState, {
    running: true,
  })

  private onKeydown = (evt: KeyboardEvent) => {
    if (evt.key === ' ') {
      const scene = this.gameState.scene
      this.gameState.running = !this.gameState.running

      if (!this.gameState.running) {
        console.log('Paused')

        scene.mapManager.world?.control({
          stop: [WaitSystem],
          restart: [],
        })
      } else {
        console.log('Resumed')

        scene.mapManager.world?.control({
          stop: [],
          restart: [WaitSystem],
        })
      }
    }
  }

  initialize(): void {
    document.addEventListener('keydown', this.onKeydown)
  }

  finalize(): void {
    document.removeEventListener('keydown', this.onKeydown)
  }
}

@system((system) => system.after(PauseSystem))
export class PositionSystem extends System {
  private gameState = this.singleton.read(GameState)
  private readonly objects = this.query((q) => q.current.with(PositionComponent).write.and.with(PhaserContainer).read)

  async execute() {
    if (!this.gameState.running) return

    for (const entity of this.objects.current) {
      const phaserContainerComponent = entity.read(PhaserContainer)
      const container = phaserContainerComponent.container

      const positionComponent = entity.read(PositionComponent)

      container.x = positionComponent.x
      container.y = positionComponent.y
    }
  }
}

@system((system) => system.afterWritersOf(Wait))
class WaitSystem extends System {
  private gameState = this.singleton.read(GameState)
  private readonly entities = this.query((q) => q.current.with(Wait).write)

  private ownTime: number = 0
  private nextTime: number = 0

  execute(): void {
    // console.log('Uncomment me to see the hot-reload issue in action!')

    if (!this.gameState.running) {
      return
    }

    this.ownTime += this.delta
    if (this.ownTime < this.nextTime) {
      return
    }

    this.nextTime = this.ownTime + 1

    for (const entity of this.entities.current) {
      const wait = entity.write(Wait)

      if (wait.time < this.ownTime) {
        entity.remove(Wait)

        console.log('Done waiting...?')
      }
    }
  }
}