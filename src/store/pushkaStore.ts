import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  type Chip,
  type PushkaTarget,
  type RunningStats,
  type RoundScore,
  createDefaultJar,
  shuffleChips,
  computeStats,
  isBust,
  scoreRound,
  pickTarget,
  applyShopAdd,
  applyShopRemove,
  applyShopSwap,
  SHOP_PRICES,
} from '../utils/pushkaEngine'

export type GamePhase = 'intro' | 'drawing' | 'bust' | 'result' | 'shop'

interface PushkaState {
  phase: GamePhase
  jar: Chip[]
  drawn: Chip[]
  lastDrawn: Chip | null
  shekels: number
  round: number
  currentTarget: PushkaTarget
  lastScore: RoundScore | null
  stats: RunningStats
  totalRoundsPlayed: number
  totalShekelsEarned: number

  // Actions
  startRound: () => void
  drawChip: () => void
  stop: () => void
  dismissBust: () => void
  goToShop: () => void
  buyAdd: (value: number, price: number) => void
  buyRemove: () => void
  buySwap: () => void
  nextRound: () => void
  reset: () => void
}

const initialTarget = pickTarget(0)

export const usePushkaStore = create<PushkaState>()(
  persist(
    (set, get) => ({
      phase: 'intro',
      jar: shuffleChips(createDefaultJar()),
      drawn: [],
      lastDrawn: null,
      shekels: 8,
      round: 0,
      currentTarget: initialTarget,
      lastScore: null,
      stats: computeStats([]),
      totalRoundsPlayed: 0,
      totalShekelsEarned: 0,

      startRound: () => set(s => ({
        phase: 'drawing',
        jar: shuffleChips([...s.jar, ...s.drawn]),
        drawn: [],
        lastDrawn: null,
        stats: computeStats([]),
        lastScore: null,
        currentTarget: pickTarget(s.round),
      })),

      drawChip: () => {
        const { jar, drawn, currentTarget } = get()
        if (jar.length === 0) return
        const idx = Math.floor(Math.random() * jar.length)
        const chip = jar[idx]
        const newDrawn = [...drawn, chip]
        const newJar = jar.filter((_, i) => i !== idx)
        const stats = computeStats(newDrawn)
        const bust = isBust(stats)

        set({
          jar: newJar,
          drawn: newDrawn,
          lastDrawn: chip,
          stats,
          phase: bust ? 'bust' : 'drawing',
          lastScore: bust ? scoreRound(stats, currentTarget, jar.length + drawn.length, true) : null,
        })
      },

      stop: () => {
        const { stats, currentTarget, jar, drawn, shekels } = get()
        const score = scoreRound(stats, currentTarget, jar.length + drawn.length, false)
        set({
          phase: 'result',
          lastScore: score,
          shekels: shekels + score.shekels,
          totalRoundsPlayed: get().totalRoundsPlayed + 1,
          totalShekelsEarned: get().totalShekelsEarned + score.shekels,
        })
      },

      dismissBust: () => {
        const { stats, currentTarget, jar, drawn, shekels } = get()
        const score = scoreRound(stats, currentTarget, jar.length + drawn.length, true)
        set({
          phase: 'result',
          lastScore: score,
          shekels: Math.max(0, shekels + score.shekels),
          totalRoundsPlayed: get().totalRoundsPlayed + 1,
        })
      },

      goToShop: () => set({ phase: 'shop' }),

      buyAdd: (value: number, price: number) => {
        const { jar, shekels } = get()
        if (shekels < price) return
        set({ jar: applyShopAdd(jar, value), shekels: shekels - price })
      },

      buyRemove: () => {
        const { jar, shekels } = get()
        if (shekels < SHOP_PRICES.REMOVE || jar.length <= 4) return
        set({ jar: applyShopRemove(jar), shekels: shekels - SHOP_PRICES.REMOVE })
      },

      buySwap: () => {
        const { jar, shekels } = get()
        if (shekels < SHOP_PRICES.SWAP) return
        set({ jar: applyShopSwap(jar), shekels: shekels - SHOP_PRICES.SWAP })
      },

      nextRound: () => set(s => ({
        phase: 'intro',
        round: s.round + 1,
        drawn: [],
        lastDrawn: null,
        stats: computeStats([]),
        lastScore: null,
      })),

      reset: () => set({
        phase: 'intro',
        jar: shuffleChips(createDefaultJar()),
        drawn: [],
        lastDrawn: null,
        shekels: 8,
        round: 0,
        currentTarget: pickTarget(0),
        lastScore: null,
        stats: computeStats([]),
        totalRoundsPlayed: 0,
        totalShekelsEarned: 0,
      }),
    }),
    {
      name: 'pushka-game-state',
      partialize: (s) => ({
        jar: s.jar,
        shekels: s.shekels,
        round: s.round,
        totalRoundsPlayed: s.totalRoundsPlayed,
        totalShekelsEarned: s.totalShekelsEarned,
      }),
    }
  )
)
