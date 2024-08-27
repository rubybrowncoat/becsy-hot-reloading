import { useRef, useState } from 'react'

import Phaser from 'phaser'

import './App.css'

import PhaserGame, { IRefPhaserGame } from './game/PhaserGame'
import { GameScene } from './scenes/GameScene'

const App = () => {
  const [wat, setWat] = useState(false)

  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef<IRefPhaserGame | null>(null)

  const changeScene = () => {
    if (phaserRef.current) {
      const scene = phaserRef.current.scene as GameScene

      if (scene) {
        scene.changeScene()
      }
    }
  }

  const currentScene = (_scene: Phaser.Scene) => {
    // TODO: actual implementation
    
    setWat((prev) => !prev)
  }

  return (
    <div id="app">
      <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
    </div>
  )
}

export default App
