import { BaseScene } from './BaseScene'

export class Boot extends BaseScene {
  constructor() {
    super('Boot')
  }

  preload() {
    this.load.image('background', 'assets/bg.png')
  }

  init() {
    console.log('Init on Boot')

    this.events.on('destroy', () => {
      console.log('Destroy on Boot')
    })
  }

  create() {
    this.scene.start('GameScene')
  }
}
