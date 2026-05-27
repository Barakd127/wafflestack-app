import { motion } from 'framer-motion'
import { usePushkaStore } from '../../store/pushkaStore'
import { SHOP_PRICES } from '../../utils/pushkaEngine'

export default function ChipShop() {
  const { shekels, jar, buyAdd, buyRemove, buySwap, nextRound } = usePushkaStore()

  const outlierCount = jar.filter(c => c.isOutlier).length

  const shopItems = [
    {
      label: 'הוסף שבב נמוך (3)',
      sub: 'מוריד את הממוצע — עוזר אם הצנצנת גבוהה מדי',
      price: SHOP_PRICES.ADD_LOW,
      action: () => buyAdd(3, SHOP_PRICES.ADD_LOW),
      icon: '🔴',
      disabled: shekels < SHOP_PRICES.ADD_LOW,
    },
    {
      label: 'הוסף שבב אמצעי (5)',
      sub: 'מדחיס את ההתפלגות לכיוון האמצע',
      price: SHOP_PRICES.ADD_MID,
      action: () => buyAdd(5, SHOP_PRICES.ADD_MID),
      icon: '🔵',
      disabled: shekels < SHOP_PRICES.ADD_MID,
    },
    {
      label: 'הוסף שבב גבוה (7)',
      sub: 'מעלה את הממוצע — עוזר אם הצנצנת נמוכה מדי',
      price: SHOP_PRICES.ADD_HIGH,
      action: () => buyAdd(7, SHOP_PRICES.ADD_HIGH),
      icon: '🟢',
      disabled: shekels < SHOP_PRICES.ADD_HIGH,
    },
    {
      label: 'הסר שבב קיצוני',
      sub: outlierCount > 0
        ? `מסיר את השבב עם הסטייה הגדולה ביותר`
        : 'אין שבבים קיצוניים כרגע',
      price: SHOP_PRICES.REMOVE,
      action: buyRemove,
      icon: '✂️',
      disabled: shekels < SHOP_PRICES.REMOVE || jar.length <= 4 || outlierCount === 0,
    },
    {
      label: 'החלף קיצוני ב-5',
      sub: 'מוחק שבב קיצוני ומחליף בשבב ניטרלי',
      price: SHOP_PRICES.SWAP,
      action: buySwap,
      icon: '🔄',
      disabled: shekels < SHOP_PRICES.SWAP || outlierCount === 0,
    },
  ]

  return (
    <motion.div
      dir="rtl"
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl overflow-hidden"
      style={{
        background: '#16181d',
        border: '1px solid #2a2e36',
        borderBottom: 'none',
        maxHeight: '80vh',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.6)',
      }}
    >
      {/* Handle */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 rounded-full" style={{ background: '#2a2e36' }} />
      </div>

      <div className="px-4 pb-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 40px)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#e8eaed', fontFamily: 'Heebo, sans-serif' }}>
              🏪 חנות השבבים
            </h2>
            <p className="text-xs" style={{ color: '#8a8f99' }}>שנה את הצנצנת לפני הסיבוב הבא</p>
          </div>
          <div
            className="px-3 py-1.5 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(255,215,0,0.15)', color: '#FFD700', fontFamily: 'Heebo, sans-serif' }}
          >
            💰 {shekels} ₪
          </div>
        </div>

        {/* Current jar preview */}
        <div
          className="rounded-xl p-3 mb-4"
          style={{ background: '#1c1f26', border: '1px solid #2a2e36' }}
        >
          <div className="text-xs mb-2" style={{ color: '#8a8f99' }}>
            הצנצנת הנוכחית ({jar.length} שבבים):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[...jar].sort((a, b) => a.value - b.value).map(chip => (
              <div
                key={chip.id}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: chip.value <= 2 ? '#ef4444' : chip.value <= 4 ? '#f59e0b' : chip.value <= 6 ? '#3b82f6' : chip.value <= 7 ? '#10b981' : '#FFD700',
                  color: '#fff',
                  border: chip.isOutlier ? '2px solid rgba(255,255,255,0.5)' : 'none',
                  fontFamily: 'Heebo, sans-serif',
                }}
              >
                {chip.value}
              </div>
            ))}
          </div>
          <div className="text-xs mt-2" style={{ color: '#8a8f99' }}>
            ממוצע נוכחי: {(jar.reduce((a, b) => a + b.value, 0) / jar.length).toFixed(1)}
            {outlierCount > 0 && ` · ${outlierCount} שבבים קיצוניים`}
          </div>
        </div>

        {/* Shop items */}
        <div className="flex flex-col gap-2 mb-4">
          {shopItems.map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              disabled={item.disabled}
              className="w-full rounded-xl p-3 flex items-center gap-3 text-right transition-all"
              style={{
                background: item.disabled ? '#1c1f26' : 'rgba(59,130,246,0.08)',
                border: `1px solid ${item.disabled ? '#2a2e36' : '#3b82f6'}`,
                opacity: item.disabled ? 0.5 : 1,
                cursor: item.disabled ? 'not-allowed' : 'pointer',
              }}
            >
              <span style={{ fontSize: 24 }}>{item.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold" style={{ color: '#e8eaed', fontFamily: 'Heebo, sans-serif' }}>
                  {item.label}
                </div>
                <div className="text-xs" style={{ color: '#8a8f99' }}>{item.sub}</div>
              </div>
              <div
                className="px-2 py-1 rounded-lg text-xs font-bold shrink-0"
                style={{
                  background: item.disabled ? 'rgba(42,46,54,0.5)' : 'rgba(255,215,0,0.15)',
                  color: item.disabled ? '#8a8f99' : '#FFD700',
                  fontFamily: 'Heebo, sans-serif',
                }}
              >
                {item.price} ₪
              </div>
            </button>
          ))}
        </div>

        {/* Continue button */}
        <button
          onClick={nextRound}
          className="w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff',
            fontFamily: 'Heebo, sans-serif',
            boxShadow: '0 4px 20px rgba(16,185,129,0.4)',
          }}
        >
          ➡ המשך לסיבוב הבא
        </button>
      </div>
    </motion.div>
  )
}
