import { useState, useRef, useEffect } from 'react'
import { useLearningStore } from '../store/learningStore'

// ── Types ──────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7

interface OnboardingFlowProps {
  onComplete: () => void
}

// ── Onboarding Flow ────────────────────────────────────────────────────────────

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const completeOnboarding = useLearningStore(s => s.completeOnboarding)
  const recordAnswer = useLearningStore(s => s.recordAnswer)

  const [step, setStep] = useState<Step>(1)
  const [name, setName] = useState('')
  const [nameShake, setNameShake] = useState(false)
  const [nameError, setNameError] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [answerInput, setAnswerInput] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [answerState, setAnswerState] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [showHint, setShowHint] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [partialReward, setPartialReward] = useState(false)
  const [buildingAnimPhase, setBuildingAnimPhase] = useState(0)
  const [navTourStep, setNavTourStep] = useState(0)
  const [skipConfirm, setSkipConfirm] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Auto-focus name input on mount
  useEffect(() => {
    if (step === 1) nameInputRef.current?.focus()
  }, [step])

  // Building animation sequence when entering step 6
  useEffect(() => {
    if (step === 6) {
      let phase = 0
      const tick = () => {
        phase++
        setBuildingAnimPhase(phase)
        if (phase < 4) setTimeout(tick, 800)
      }
      setTimeout(tick, 400)
    }
  }, [step])

  // ── Helpers ────────────────────────────────────────────────────────────────

  const advance = (to: Step) => setStep(to)

  const handleNameSubmit = () => {
    if (!name.trim()) {
      setNameShake(true)
      setNameError(true)
      setTimeout(() => setNameShake(false), 600)
      return
    }
    setNameError(false)
    advance(2)
  }

  const handleSkipConfirmed = () => {
    const finalName = name || 'סטודנט'
    localStorage.setItem('userName', finalName)
    completeOnboarding(finalName)
    onComplete()
  }

  const handleAnswerCheck = () => {
    const val = parseInt(answerInput.trim(), 10)
    if (val === 140) {
      setAnswerState('correct')
      recordAnswer('onboarding-mean', true, 10)
      setTimeout(() => advance(6), 800)
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      setAnswerState('wrong')
      if (newAttempts >= 2) setShowHint(true)
      if (newAttempts >= 3) setShowSolution(true)
    }
  }

  const handleShowSolution = () => {
    setPartialReward(true)
    recordAnswer('onboarding-mean', false, 0)
    setTimeout(() => advance(6), 4000)
  }

  const handleNavTourNext = () => {
    if (navTourStep < 2) {
      setNavTourStep(n => n + 1)
    } else {
      localStorage.setItem('userName', name)
      completeOnboarding(name)
      onComplete()
    }
  }

  // ── Shared UI ──────────────────────────────────────────────────────────────

  const StepIndicator = ({ current, total }: { current: number; total: number }) => (
    <div className="text-xs text-white/40 text-center mb-4" dir="rtl">
      {current} מתוך {total}
    </div>
  )

  const PrimaryBtn = ({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-900 font-bold text-base transition-all active:scale-[0.98]"
      dir="rtl"
    >
      {label}
    </button>
  )

  const GhostBtn = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="text-white/40 hover:text-white/70 text-sm transition-colors underline underline-offset-2"
      dir="rtl"
    >
      {label}
    </button>
  )

  // ── Skip confirmation overlay ──────────────────────────────────────────────

  if (skipConfirm) {
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm" dir="rtl">
        <div className="bg-slate-800 border border-white/10 rounded-3xl p-8 max-w-xs w-full mx-4 text-center space-y-5">
          <p className="text-white text-lg font-semibold">?בטוח</p>
          <p className="text-white/60 text-sm">נסביר לך איך להרוויח בניינים.</p>
          <div className="flex gap-3">
            <button
              onClick={handleSkipConfirmed}
              className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 text-sm transition-colors"
            >
              כן, דלג
            </button>
            <button
              onClick={() => setSkipConfirm(false)}
              className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-sm transition-colors"
            >
              המשך בהדרכה
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 1: Name Collection ────────────────────────────────────────────────

  if (step === 1) {
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900" dir="rtl">
        <div className="w-full max-w-sm mx-4 space-y-8 text-center">
          <div className="space-y-2">
            <div className="text-5xl mb-2">🧇</div>
            <h1 className="text-3xl font-bold text-white">WaffleStack</h1>
          </div>

          <div className="space-y-5">
            <h2 className="text-2xl font-semibold text-white">.?איך קוראים לך</h2>

            <div className="space-y-2">
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setNameError(false) }}
                onKeyDown={e => e.key === 'Enter' && handleNameSubmit()}
                placeholder="שם פרטי"
                className={`w-full px-5 py-4 rounded-2xl bg-white/10 border text-white text-center text-lg placeholder-white/30 outline-none focus:border-amber-400/70 transition-all ${
                  nameShake ? 'animate-[shake_0.5s_ease-in-out]' : ''
                } ${nameError ? 'border-red-400/60' : 'border-white/20'}`}
              />
              {nameError && (
                <p className="text-red-400/80 text-sm">נא להזין שם כדי להמשיך.</p>
              )}
              <p className="text-white/30 text-xs">נשתמש בשם שלך כדי לאישי את החוויה</p>
            </div>

            <PrimaryBtn label="!בואו נתחיל" onClick={handleNameSubmit} />
          </div>
        </div>

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-5px); }
            80% { transform: translateX(5px); }
          }
        `}</style>
      </div>
    )
  }

  // ── Step 2: Personalized Welcome ───────────────────────────────────────────

  if (step === 2) {
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 animate-[fadeIn_0.3s_ease-in-out]" dir="rtl">
        <div className="w-full max-w-sm mx-4 space-y-8 text-center">
          {/* Starter city illustration */}
          <div className="relative mx-auto w-48 h-36 flex items-end justify-center gap-1">
            {['h-12', 'h-20', 'h-8', 'h-16', 'h-10'].map((h, i) => (
              <div
                key={i}
                className={`w-8 ${h} rounded-t-lg opacity-30 border border-white/20`}
                style={{ background: `hsl(${200 + i * 30}, 60%, 50%)` }}
              />
            ))}
            <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-20">🔒</div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white leading-tight">
              ,ברוך הבא, {name || 'חבר'}<br />
              !בואו לבנות עיר ביחד
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              כאן תלמד סטטיסטיקה על ידי ניהול עיר אמיתית.
              כל נושא שתלמד יוסיף בניין חדש לעיר שלך.
            </p>
          </div>

          <PrimaryBtn label="!יאללה, מתחילים" onClick={() => advance(3)} />
        </div>

        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      </div>
    )
  }

  // ── Step 3: City Metaphor ──────────────────────────────────────────────────

  if (step === 3) {
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900" dir="rtl">
        <div className="w-full max-w-sm mx-4 space-y-6 text-center">
          <StepIndicator current={3} total={7} />

          {/* Before/After illustration */}
          <div className="flex gap-3 items-stretch">
            <div className="flex-1 bg-red-900/30 border border-red-500/20 rounded-2xl p-4 space-y-2">
              <div className="text-2xl">😕</div>
              <div className="flex items-end justify-center gap-0.5 h-10">
                {[4, 8, 2, 10, 3, 7].map((h, i) => (
                  <div key={i} className="w-3 rounded-t opacity-50 bg-red-400" style={{ height: `${h * 4}px`, transform: `rotate(${(i % 2) * 3 - 1}deg)` }} />
                ))}
              </div>
              <p className="text-red-300/60 text-xs">ללא נתונים</p>
            </div>
            <div className="flex items-center text-white/30 text-xl">←</div>
            <div className="flex-1 bg-teal-900/30 border border-teal-500/20 rounded-2xl p-4 space-y-2">
              <div className="text-2xl">😊</div>
              <div className="flex items-end justify-center gap-0.5 h-10">
                {[4, 6, 8, 7, 9, 8].map((h, i) => (
                  <div key={i} className="w-3 rounded-t bg-teal-400 opacity-70" style={{ height: `${h * 4}px` }} />
                ))}
              </div>
              <p className="text-teal-300/60 text-xs">עם נתונים</p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white">עיר טובה מתחילה בנתונים טובים</h2>
            <p className="text-white/55 text-sm leading-relaxed">
              ראש עיר חכם יודע לנתח מידע: כמה תושבים יש? מה השכר הממוצע?
              ככל שתשלוט בסטטיסטיקה, כך העיר שלך תצמח.
            </p>
          </div>

          <div className="space-y-3">
            <PrimaryBtn label="המשך" onClick={() => advance(4)} />
            <GhostBtn label="דלג על ההדרכה" onClick={() => setSkipConfirm(true)} />
          </div>
        </div>
      </div>
    )
  }

  // ── Step 4: How It Works — Reward Loop Carousel ────────────────────────────

  const carouselPanels = [
    {
      icon: '📖',
      heading: '.לומדים נושא בסטטיסטיקה',
      body: 'שאלות, הסברים וטיפים מהמורה האישי שלך בבינה מלאכותית.',
    },
    {
      icon: '✅',
      heading: '.עונים על שאלות',
      body: 'כל תשובה נכונה מרוויחה לך נקודות בנייה.',
    },
    {
      icon: '🏗️',
      heading: '!בניין חדש מופיע בעיר שלך',
      body: 'כל נושא שתסיים יוסיף מבנה ייחודי שרק אתה תכנן.',
    },
  ]

  if (step === 4) {
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900" dir="rtl">
        <div className="w-full max-w-sm mx-4 space-y-6 text-center">
          <StepIndicator current={4} total={7} />
          <h2 className="text-xl font-bold text-white">ככה זה עובד</h2>

          {/* Carousel */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(${carouselIndex * 100}%)` }}
            >
              {carouselPanels.map((panel, i) => (
                <div key={i} className="min-w-full px-1">
                  <div className="bg-white/8 border border-white/10 rounded-3xl p-8 space-y-4">
                    <div className="text-5xl">{panel.icon}</div>
                    <h3 className="text-lg font-semibold text-white">{panel.heading}</h3>
                    <p className="text-white/55 text-sm leading-relaxed">{panel.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2">
            {carouselPanels.map((_, i) => (
              <button
                key={i}
                onClick={() => setCarouselIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === carouselIndex ? 'bg-amber-400 w-4' : 'bg-white/25'}`}
              />
            ))}
          </div>

          <div className="space-y-3">
            {carouselIndex < 2 ? (
              <PrimaryBtn label="הבא ←" onClick={() => setCarouselIndex(i => Math.min(i + 1, 2))} />
            ) : (
              <PrimaryBtn label="!בואו ננסה" onClick={() => advance(5)} />
            )}
            <GhostBtn label="דלג על ההדרכה" onClick={() => setSkipConfirm(true)} />
          </div>
        </div>
      </div>
    )
  }

  // ── Step 5: First Statistics Lesson — Mean ─────────────────────────────────

  if (step === 5) {
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900" dir="rtl">
        <div className="w-full max-w-sm mx-4 space-y-5">
          <StepIndicator current={5} total={7} />

          {/* Onboarding tip banner */}
          <div className="flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 rounded-2xl px-4 py-3 text-sm text-indigo-200">
            <span>🏗️</span>
            <span>זו השאלה הראשונה שלך — ענה נכון ותרוויח את הבניין הראשון בעיר!</span>
          </div>

          {/* Breadcrumb */}
          <p className="text-white/35 text-xs">ממוצע {'>'} שאלה ראשונה</p>

          {/* Question card */}
          <div className="bg-white/8 border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center text-xs text-white/35">
              <span>שאלה 1 מתוך 1</span>
            </div>
            <p className="text-white text-base leading-relaxed">
              בעיר שלך גרים 5 שכונות. מספר התושבים בכל שכונה הוא:
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              {[120, 200, 80, 160, 140].map(n => (
                <span key={n} className="bg-indigo-500/25 border border-indigo-400/30 px-3 py-1 rounded-lg text-indigo-200 font-mono font-bold">{n}</span>
              ))}
            </div>
            <p className="text-white font-semibold">?מה מספר התושבים הממוצע בשכונה</p>
          </div>

          {/* Answer input */}
          <div className="space-y-2">
            <label className="text-white/50 text-sm block">התשובה שלך</label>
            <input
              type="number"
              inputMode="numeric"
              value={answerInput}
              onChange={e => { setAnswerInput(e.target.value); setAnswerState('idle') }}
              onKeyDown={e => e.key === 'Enter' && !showSolution && handleAnswerCheck()}
              placeholder="הכנס מספר..."
              className={`w-full px-4 py-3 rounded-2xl bg-white/10 border text-white text-center text-xl outline-none transition-all ${
                answerState === 'correct' ? 'border-teal-400 bg-teal-500/15' :
                answerState === 'wrong' ? 'border-red-400 bg-red-500/10' :
                'border-white/20 focus:border-amber-400/60'
              }`}
            />

            {answerState === 'wrong' && (
              <p className="text-red-300/80 text-sm text-center">
                {attempts === 1 ? 'לא בדיוק. נסה שוב — כדאי לחבר את כל המספרים קודם.' : 'נסה שוב.'}
              </p>
            )}

            {showHint && answerState !== 'correct' && (
              <div className="bg-amber-500/15 border border-amber-400/25 rounded-xl px-4 py-3 text-amber-200 text-sm">
                רמז: סכום כל התושבים הוא 700. עכשיו חלק ב-5.
              </div>
            )}

            {showSolution && answerState !== 'correct' && (
              <div className="bg-teal-500/15 border border-teal-400/25 rounded-xl px-4 py-3 text-teal-200 text-sm space-y-1">
                <p className="font-semibold">הפתרון:</p>
                <p>120+200+80+160+140 = 700</p>
                <p>700 ÷ 5 = <strong>140</strong></p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {!showSolution ? (
              <PrimaryBtn label="בדוק תשובה" onClick={handleAnswerCheck} disabled={!answerInput.trim()} />
            ) : (
              <PrimaryBtn label="הצג פתרון ועבור הלאה" onClick={handleShowSolution} />
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Step 6: First Building Reward ──────────────────────────────────────────

  if (step === 6) {
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/85 backdrop-blur-md" dir="rtl">
        <div className="w-full max-w-sm mx-4 text-center space-y-6">

          {/* Building animation */}
          <div className="relative flex items-end justify-center h-44">
            {/* Ground */}
            <div className="absolute bottom-0 w-40 h-3 bg-slate-600/50 rounded-full blur-sm" />

            {/* Building grows up */}
            <div
              className="relative transition-all duration-700 ease-out"
              style={{
                height: buildingAnimPhase >= 2 ? '140px' : '0px',
                opacity: buildingAnimPhase >= 1 ? 1 : 0,
              }}
            >
              {/* Main tower */}
              <div className="w-24 h-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-2xl mx-auto relative overflow-hidden">
                {/* Windows */}
                <div className="grid grid-cols-3 gap-1 p-2 pt-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="bg-amber-300/70 rounded-sm h-2" />
                  ))}
                </div>
                {/* Door */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-7 bg-amber-400/80 rounded-t-md" />
              </div>

              {/* Particles on reveal */}
              {buildingAnimPhase >= 2 && (
                <div className="absolute inset-0 pointer-events-none">
                  {['✨', '⭐', '🌟', '✨', '⭐'].map((star, i) => (
                    <span
                      key={i}
                      className="absolute text-lg animate-[floatUp_1s_ease-out_forwards]"
                      style={{ left: `${10 + i * 20}%`, bottom: '100%', animationDelay: `${i * 0.1}s` }}
                    >
                      {star}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Celebration text */}
          {buildingAnimPhase >= 3 && (
            <div className="space-y-3 animate-[fadeIn_0.4s_ease-in-out]">
              <h2 className="text-3xl font-bold text-white">!בניין ראשון</h2>
              <p className="text-white/60 text-sm leading-relaxed">
                השכונה הראשונה שלך נוצרה. ככל שתלמד יותר, העיר תצמח.
              </p>

              <div className="flex items-center justify-center gap-3">
                <span className="bg-indigo-500/25 border border-indigo-400/30 px-3 py-1 rounded-lg text-indigo-200 text-sm font-medium">
                  מרכז הקהילה
                </span>
                <span className="bg-teal-500/25 border border-teal-400/30 px-3 py-1 rounded-lg text-teal-200 text-sm">
                  {partialReward ? 'ממוצע ○' : 'ממוצע ✓'}
                </span>
              </div>

              {partialReward && (
                <p className="text-amber-300/70 text-xs">כל הכבוד על הניסיון! תוכל לנסות שוב אחרי.</p>
              )}

              <PrimaryBtn label="!בואו נראה את העיר שלי" onClick={() => advance(7)} />
            </div>
          )}
        </div>

        <style>{`
          @keyframes floatUp {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(-60px); opacity: 0; }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    )
  }

  // ── Step 7: Navigation Tour ────────────────────────────────────────────────

  const navTourSteps = [
    {
      icon: '📚',
      title: 'כאן לומדים',
      body: 'שאלות, הסברים ותרגול. כל שיעור שתסיים מרוויח בניין חדש.',
      label: 'אזור לימוד',
    },
    {
      icon: '🌆',
      title: 'העיר שלך',
      body: 'פה תמצא את כל הבניינים שבנית. העיר צומחת איתך.',
      label: 'העולם שלי',
    },
    {
      icon: '🗺️',
      title: 'מפת הלמידה',
      body: 'רוצה לדעת מה מחכה לך קדימה? כאן תוכל לראות את כל הנושאים ואיפה אתה עומד.',
      label: 'מפת לימוד',
    },
  ]

  const currentTour = navTourSteps[navTourStep]

  return (
    <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center" dir="rtl">
      <div className="w-full max-w-sm mx-4 space-y-1">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {navTourSteps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === navTourStep ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/25'}`} />
          ))}
        </div>

        <div className="bg-slate-800/95 border border-white/10 rounded-3xl p-8 space-y-5 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-3xl mx-auto">
            {currentTour.icon}
          </div>

          <div className="space-y-2">
            <div className="inline-block bg-indigo-500/20 border border-indigo-400/25 px-3 py-1 rounded-lg text-indigo-300 text-xs font-medium mb-1">
              {currentTour.label}
            </div>
            <h2 className="text-xl font-bold text-white">{currentTour.title}</h2>
            <p className="text-white/55 text-sm leading-relaxed">{currentTour.body}</p>
          </div>

          <PrimaryBtn
            label={navTourStep < 2 ? 'הבא ←' : '!סיימנו'}
            onClick={handleNavTourNext}
          />
        </div>

        <div className="text-center pt-3">
          <GhostBtn label="דלג על הסיור" onClick={handleSkipConfirmed} />
        </div>
      </div>
    </div>
  )
}
