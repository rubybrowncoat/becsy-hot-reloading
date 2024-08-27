import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react'

import StartGame from './main'
import { EventBus } from '../lib/eventBus'

export interface IRefPhaserGame {
  game: Phaser.Game | null
  scene: Phaser.Scene | null
}

interface PhaserGameProps {
  currentActiveScene?: (sceneInstance: Phaser.Scene) => void
}

const PhaserGame = forwardRef<IRefPhaserGame, PhaserGameProps>((props, ref) => {
  const currentActiveScene = props.currentActiveScene
  const game = useRef<Phaser.Game | null>(null)

  useLayoutEffect(() => {
    if (game.current === null) {
      console.log('Creating new game instance')
      game.current = StartGame('game-container')

      if (typeof ref === 'function') {
        ref({ game: game.current, scene: null })
      } else if (ref) {
        ref.current = { game: game.current, scene: null }
      }
    }

    return () => {
      if (game.current) {
        const gameInstance = game.current

        gameInstance.plugins.plugins.map(plugin => plugin.key).forEach(key => gameInstance.plugins.removeGlobalPlugin(key))
        gameInstance.destroy(true)
        
        console.log('Destroyed game instance...')
        if (gameInstance !== null) {
          game.current = null
        }
      }
    }
  }, [ref])

  useEffect(() => {
    EventBus.on('current-scene-ready', (sceneInstance: Phaser.Scene) => {
      if (currentActiveScene && typeof currentActiveScene === 'function') {
        currentActiveScene(sceneInstance)
      }

      if (typeof ref === 'function') {
        ref({ game: game.current, scene: sceneInstance })
      } else if (ref) {
        ref.current = { game: game.current, scene: sceneInstance }
      }
    })

    return () => {
      EventBus.removeListener('current-scene-ready')
    }
  }, [currentActiveScene, ref])

  return (
    <div id="game-container" className="m-0"></div>
  )
})

export default PhaserGame
