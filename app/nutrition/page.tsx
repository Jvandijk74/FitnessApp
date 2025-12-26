export default function NutritionPage() {
  const fuelReminders = [
    'Aim for 30–60g carbs per hour on tempo and long runs.',
    'Protein target: 1.6–2.2g/kg/day with post-strength 25–35g servings.',
    'Hydrate with 500–750ml per hour on runs longer than 60 minutes.'
  ];

  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-white/60">Nutrition</p>
        <h1 className="text-3xl font-semibold">Fueling guidance</h1>
        <p className="text-white/70">Simple, rule-based guidance to support the fixed weekly training cadence.</p>
      </header>
      <div className="card space-y-3">
        <h2 className="text-xl font-semibold">Key reminders</h2>
        <ul className="space-y-2 text-white/80 list-disc list-inside">
          {fuelReminders.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="card">
        <h2 className="text-xl font-semibold mb-2">Next up</h2>
        <p className="text-white/70">
          Meal logging and carb periodization will live here. For now, use these rules alongside your weekly plan.
        </p>
      </div>
    </section>
  );
}
