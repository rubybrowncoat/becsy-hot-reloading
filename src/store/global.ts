import { World } from '@lastolivegames/becsy'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface GlobalState {
  world: Nullable<World>
}

export const useGlobalStore = create<GlobalState>()(
  devtools(
    (_set) => ({
      world: null,
    }),
    {
      name: 'global-store',
    }
  )
)
