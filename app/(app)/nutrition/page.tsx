import { calculateMacros, getDailyNutritionSummary } from '@/app/actions/nutrition';
import { NutritionDashboard } from '@/components/nutrition/NutritionDashboard';
import { NutritionCoach } from '@/components/nutrition/NutritionCoach';

const DEMO_USER = 'demo-user';

export default async function NutritionPage() {
  // Get today's date
  const today = new Date().toISOString().split('T')[0];

  // Calculate daily requirements based on today's planned activities
  let dailyRequirements = null;
  try {
    dailyRequirements = await calculateMacros(DEMO_USER, today);
  } catch (error) {
    console.error('[Nutrition] Error calculating macros:', error);
  }

  // Get today's nutrition summary
  let nutritionSummary = null;
  try {
    nutritionSummary = await getDailyNutritionSummary(DEMO_USER, today);
  } catch (error) {
    console.error('[Nutrition] Error fetching nutrition summary:', error);
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Nutrition</h1>
        <p className="text-text-secondary">
          Track your meals and get personalized nutrition guidance
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Nutrition Dashboard (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <NutritionDashboard
            userId={DEMO_USER}
            date={today}
            requirements={dailyRequirements}
            summary={nutritionSummary}
          />
        </div>

        {/* Right Column: AI Nutrition Coach (1/3 width on large screens) */}
        <div className="lg:col-span-1">
          <NutritionCoach
            userId={DEMO_USER}
            currentRequirements={dailyRequirements}
            currentSummary={nutritionSummary}
          />
        </div>
      </div>
    </div>
  );
}
