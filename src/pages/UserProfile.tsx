import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import type { NutriProfile, NutriGoal, DietaryPref } from '../context/authContext';

const AVATARS = ['🧑','👩','👨','🧒','👧','👦','🧓','🏃','🧘','💪','🥗','🍎'];
const uid = () => Math.random().toString(36).slice(2, 10);

const GOALS: { value: NutriGoal; label: string; icon: string }[] = [
  { value: 'weight-loss',    label: 'Lose Weight',   icon: '🔥' },
  { value: 'muscle-gain',    label: 'Build Muscle',  icon: '💪' },
  { value: 'maintenance',    label: 'Maintain',      icon: '⚖️' },
  { value: 'general-health', label: 'Stay Healthy',  icon: '🌱' },
];

const DIET_PREFS: { value: DietaryPref; label: string }[] = [
  { value: 'vegetarian',  label: '🥦 Vegetarian'  },
  { value: 'vegan',       label: '🌱 Vegan'        },
  { value: 'gluten-free', label: '🌾 Gluten-Free'  },
  { value: 'dairy-free',  label: '🥛 Dairy-Free'   },
  { value: 'low-carb',    label: '🥩 Low Carb'     },
  { value: 'high-protein',label: '🍗 High Protein' },
];

interface ProfileForm {
  name: string; age: string;
  gender: 'Male' | 'Female' | 'Other' | '';
  weight: string; height: string;
}
const INIT: ProfileForm = { name: '', age: '', gender: '', weight: '', height: '' };

const inputCls = 'w-full rounded-xl bg-[#0e1117] border border-white/8 text-white placeholder-gray-600 px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 hover:border-white/15';

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-emerald-400 tracking-[0.12em] uppercase">{label}</label>
    {children}
    {hint && <p className="text-[11px] text-gray-600">{hint}</p>}
  </div>
);

const UserProfile = () => {
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [form,   setForm]   = useState<ProfileForm>(INIT);
  const [goal,   setGoal]   = useState<NutriGoal | ''>('');
  const [diets,  setDiets]  = useState<Set<DietaryPref>>(new Set());
  const [errors, setErrors] = useState<Partial<ProfileForm & { goal: string }>>({});
  const { addProfile, profiles } = useAuth();
  const navigate = useNavigate();

  const set = (f: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(p => ({ ...p, [f]: e.target.value }));
    if (errors[f]) setErrors(p => ({ ...p, [f]: '' }));
  };

  const toggleDiet = (d: DietaryPref) => setDiets(prev => {
    const n = new Set(prev);
    if (n.has(d)) { n.delete(d); } else { n.add(d); }
    return n;
  });

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim())  e.name = 'Name is required';
    const age = Number(form.age);
    if (!form.age || isNaN(age) || age < 1 || age > 120) e.age = 'Enter a valid age (1–120)';
    if (!form.gender) e.gender = 'Please select a gender';
    const wt = Number(form.weight);
    if (!form.weight || isNaN(wt) || wt < 1 || wt > 500) e.weight = 'Valid weight required (kg)';
    const ht = Number(form.height);
    if (!form.height || isNaN(ht) || ht < 30 || ht > 300) e.height = 'Valid height required (cm)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate() || profiles.length >= 5) return;
    const p: NutriProfile = {
      id: uid(), avatar,
      name: form.name.trim(),
      age: Number(form.age),
      gender: form.gender as NutriProfile['gender'],
      weight: Number(form.weight),
      height: Number(form.height),
      goal: goal || undefined,
      dietaryPreferences: diets.size ? Array.from(diets) : undefined,
    };
    addProfile(p);
    navigate('/profile-select', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#070a0e] flex items-center justify-center px-6 py-16">

      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-600/6 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
            bg-emerald-500/10 border border-emerald-500/25 mb-5 glow-green-sm">
            <span className="text-3xl">🥗</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Create Profile</h1>
          <p className="text-gray-500 text-sm mt-2">Tell us about yourself for personalised meal suggestions</p>
        </div>

        <div className="glass rounded-3xl p-8 space-y-6">

          {/* Avatar */}
          <div>
            <p className="text-xs font-bold text-emerald-400 tracking-[0.12em] uppercase mb-3">Choose Avatar</p>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map(em => (
                <button key={em} type="button" onClick={() => setAvatar(em)}
                  className={`w-11 h-11 text-2xl rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer
                    ${avatar === em ? 'bg-emerald-500/20 ring-2 ring-emerald-500 scale-110' : 'bg-white/5 hover:bg-white/10 hover:scale-105'}`}>
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <Field label="Full Name">
            <input id="field-name" type="text" placeholder="e.g. Priya Sharma" value={form.name} onChange={set('name')}
              className={`${inputCls} ${errors.name ? 'border-red-500' : ''}`} />
            {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
          </Field>

          {/* Age + Gender row */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Age" hint="Years old">
              <input id="field-age" type="number" inputMode="numeric" min={1} max={120}
                placeholder="25" value={form.age} onChange={set('age')}
                className={`${inputCls} ${errors.age ? 'border-red-500' : ''}`} />
              {errors.age && <p className="text-xs text-red-400">{errors.age}</p>}
            </Field>
            <Field label="Gender">
              <div className="relative">
                <select id="field-gender" value={form.gender} onChange={set('gender')}
                  className={`${inputCls} appearance-none cursor-pointer pr-10
                    ${errors.gender ? 'border-red-500' : ''}
                    ${form.gender === '' ? 'text-gray-600' : 'text-white'}`}>
                  <option value="" disabled>Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 6 8 10 12 6"/>
                  </svg>
                </span>
              </div>
              {errors.gender && <p className="text-xs text-red-400">{errors.gender}</p>}
            </Field>
          </div>

          {/* Weight + Height row */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Weight" hint="kg">
              <input id="field-weight" type="number" inputMode="decimal" min={1} max={500}
                placeholder="70" value={form.weight} onChange={set('weight')}
                className={`${inputCls} ${errors.weight ? 'border-red-500' : ''}`} />
              {errors.weight && <p className="text-xs text-red-400">{errors.weight}</p>}
            </Field>
            <Field label="Height" hint="cm">
              <input id="field-height" type="number" inputMode="decimal" min={30} max={300}
                placeholder="175" value={form.height} onChange={set('height')}
                className={`${inputCls} ${errors.height ? 'border-red-500' : ''}`} />
              {errors.height && <p className="text-xs text-red-400">{errors.height}</p>}
            </Field>
          </div>

          {/* Goal */}
          <div>
            <p className="text-xs font-bold text-emerald-400 tracking-[0.12em] uppercase mb-3">
              Your Goal <span className="text-gray-700 normal-case tracking-normal font-medium">(optional)</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {GOALS.map(g => (
                <button key={g.value} type="button" onClick={() => setGoal(v => v === g.value ? '' : g.value)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-semibold
                    transition-all duration-150 cursor-pointer text-left
                    ${goal === g.value
                      ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300'
                      : 'border-white/6 bg-white/2 text-gray-400 hover:border-white/12 hover:text-gray-200'}`}>
                  <span>{g.icon}</span> {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary preferences */}
          <div>
            <p className="text-xs font-bold text-emerald-400 tracking-[0.12em] uppercase mb-3">
              Dietary Preferences <span className="text-gray-700 normal-case tracking-normal font-medium">(optional)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {DIET_PREFS.map(d => (
                <button key={d.value} type="button" onClick={() => toggleDiet(d.value)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold
                    transition-all duration-150 cursor-pointer
                    ${diets.has(d.value)
                      ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300'
                      : 'border-white/6 bg-white/2 text-gray-500 hover:border-white/12 hover:text-gray-300'}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate('/profile-select', { replace: true })}
              className="flex-1 py-3 rounded-2xl border border-white/8 bg-transparent text-gray-400
                hover:border-white/15 hover:text-white text-sm font-semibold transition-all duration-200 cursor-pointer">
              ← Back
            </button>
            <button id="btn-save-profile" type="button" onClick={handleSave}
              className="flex-2 px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400
                active:scale-[0.98] text-gray-950 font-black text-sm transition-all duration-200
                shadow-lg shadow-emerald-900/40 cursor-pointer">
              Save Profile →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
