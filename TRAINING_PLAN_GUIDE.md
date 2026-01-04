# Training Plan System Guide

## Overview

The Fitness App has a comprehensive training plan system with multiple ways to create and schedule workouts.

## System Architecture

### 1. **Week-Long Templates**
Full 7-day training plans that can be reused week after week.

**Database Tables:**
- `workout_templates` - Template metadata (name, description)
- `workout_template_days` - Individual days within the template
- `workout_template_exercises` - Exercises for each day
- `user_active_templates` - Tracks which template is active for a user in a specific week

**How to Create:**
1. Go to "Create Training" page
2. Select "Week Template" mode
3. Configure each day (Monday-Sunday) with exercises
4. Click "Save Training Template"
5. Choose to activate it for specific weeks

### 2. **Single-Day Templates**
Reusable individual workout templates (e.g., "Upper Body Push Day", "Easy 5K Run")

**Database Tables:**
- `day_templates` - Template metadata
- `day_template_exercises` - Exercises for the template

**How to Create:**
1. Go to "Create Training" page
2. Select "Single Day" mode
3. Fill in workout details (strength exercises OR run details)
4. Click "Save Template"

**How to Use:**
1. Go to "Create Training" page
2. Select "Browse Templates" or "Schedule" mode
3. Select a template
4. Choose a date to schedule it

### 3. **Scheduled Workouts**
Individual workouts planned for specific dates.

**Database Tables:**
- `scheduled_workouts` - Workout details for specific dates
- `scheduled_workout_exercises` - Exercises for scheduled workouts

**How workouts appear:**
- Scheduled workouts OVERRIDE template workouts for the same day
- If no scheduled workout exists, the active template workout shows
- Monday-Sunday order is enforced

## User Flow for Planning Training

### Method 1: Create a Week Template and Activate It

```
1. Create Training → Week Template mode
2. Design your full week (Mon-Sun)
3. Save Template
4. Activate for Week 1 (2026-01-04)
5. Optionally clone for multiple weeks
```

### Method 2: Create Single-Day Templates and Schedule Them

```
1. Create Training → Single Day mode
2. Create "Leg Day" template
3. Save Template
4. Go to Create Training → Schedule mode
5. Select "Leg Day" template
6. Schedule it for Monday (2026-01-06)
7. Repeat for other days
```

### Method 3: AI-Generated Plan

```
1. Create Training → AI Generated mode
2. Let AI create a custom plan
3. Plan is automatically scheduled
```

## Current Week Display Logic

The Dashboard and Training Plan pages show workouts using this priority:

1. **Scheduled workouts** (highest priority - user explicitly scheduled these)
2. **Active template workouts** (fallback - from the active week template)
3. **Empty/Rest** (if neither exists)

## Verification Checklist

- [ ] Can create week-long templates
- [ ] Can activate templates for specific weeks
- [ ] Can create single-day templates
- [ ] Can browse template library
- [ ] Can schedule workouts from templates
- [ ] Dashboard carousel shows scheduled workouts
- [ ] Training Plan page shows workouts in Monday-Sunday order
- [ ] Can log workouts and mark them complete
- [ ] AI feedback is generated after completion

## API Endpoints

**Templates:**
- `createWorkoutTemplate()` - Save 7-day template
- `getUserTemplates()` - List user's templates
- `getTemplateDetails()` - Get full template with exercises
- `activateTemplate()` - Activate template for a week
- `getActiveTemplate()` - Get active template for a week

**Day Templates:**
- `createDayTemplate()` - Save single-day template
- `getDayTemplates()` - List user's day templates
- `scheduleFromTemplate()` - Schedule a day template for a specific date

**Scheduled Workouts:**
- `scheduleWorkout()` - Create a scheduled workout
- `getScheduledWorkouts()` - Get workouts for a date range
- `completeWorkout()` - Mark workout as complete + generate AI feedback

**Combined View:**
- `getWeekWorkouts()` - Get combined view of scheduled + template workouts for a week
