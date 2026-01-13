# Fitness App - UI Design Proposal

## Design Philosophy
Modern, data-driven fitness dashboard with emphasis on:
- **Clarity**: Easy to scan and understand training data
- **Performance**: Fast, responsive interactions
- **Motivation**: Visual progress indicators and achievements
- **Integration**: Seamless Strava/Supabase connection status

---

## Color Palette

### Primary Colors
- **Primary Blue**: `#0ea5e9` (Sky 500) - Actions, highlights
- **Primary Dark**: `#0c4a6e` (Sky 900) - Headers, emphasis
- **Accent Orange**: `#f97316` (Orange 500) - CTAs, warnings

### Background & Surfaces
- **Background**: `#020617` (Slate 950) - App background
- **Surface**: `#0f172a` (Slate 900) - Card backgrounds
- **Surface Elevated**: `#1e293b` (Slate 800) - Hover states

### Semantic Colors
- **Success**: `#10b981` (Emerald 500)
- **Warning**: `#f59e0b` (Amber 500)
- **Error**: `#ef4444` (Red 500)
- **Info**: `#3b82f6` (Blue 500)

### Text
- **Primary**: `#f8fafc` (Slate 50)
- **Secondary**: `#cbd5e1` (Slate 300)
- **Tertiary**: `#64748b` (Slate 500)

---

## Typography

### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
```

### Scale
- **Display**: 48px / 3rem (Page titles)
- **H1**: 36px / 2.25rem (Section headers)
- **H2**: 30px / 1.875rem (Card titles)
- **H3**: 24px / 1.5rem (Subsections)
- **Body**: 16px / 1rem (Main content)
- **Small**: 14px / 0.875rem (Metadata)
- **Tiny**: 12px / 0.75rem (Labels)

### Weights
- **Regular**: 400 (Body text)
- **Medium**: 500 (Emphasis)
- **Semibold**: 600 (Headings)
- **Bold**: 700 (Display)

---

## Layout Structure

### Navigation
**Sidebar Navigation** (Desktop) / **Bottom Navigation** (Mobile)

```
┌─────────────────────────────────────┐
│ [Logo] Fitness Coach                │
│                                     │
│ ► Dashboard                         │
│   Training Plan                     │
│   Activity Log                      │
│   Analytics                         │
│   Integrations                      │
│   Settings                          │
│                                     │
│ ─────────────────                   │
│                                     │
│ [Profile Card]                      │
│ Demo User                           │
│ Threshold: 4:54/km                  │
└─────────────────────────────────────┘
```

### Dashboard Grid (Desktop)
```
┌────────────────────────────────────────────────────────┐
│  Stats Cards (4 columns)                               │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                 │
│  │Weekly│ │Total │ │Avg   │ │Ready-│                 │
│  │Volume│ │Runs  │ │HR    │ │ness  │                 │
│  └──────┘ └──────┘ └──────┘ └──────┘                 │
├────────────────────────────────────────────────────────┤
│  Strava Integration Card                               │
│  ┌─────────────────────────────────────────────────┐  │
│  │ [Strava Logo] Connected • Last sync: 2 min ago  │  │
│  │ [Sync Button] [Settings]                        │  │
│  └─────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────┤
│  Weekly Training Plan                                  │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Mon  Tue  Wed  Thu  Fri  Sat  Sun               │  │
│  │ ───────────────────────────────────             │  │
│  │ [Easy] [Str] [Tempo] [Str] [2x] [Rest] [Long]  │  │
│  └─────────────────────────────────────────────────┘  │
├──────────────────────┬─────────────────────────────────┤
│ Quick Log Run        │ Quick Log Strength              │
│ ┌─────────────────┐  │ ┌────────────────────────────┐  │
│ │ Distance: __km  │  │ │ Exercise: [Select]         │  │
│ │ Duration: __min │  │ │ Weight: __kg  Reps: __     │  │
│ │ [Log Activity]  │  │ │ [Add Set] [Log]            │  │
│ └─────────────────┘  │ └────────────────────────────┘  │
├────────────────────────────────────────────────────────┤
│  Recent Insights                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │ ✓ Tempo pace improving at same HR               │  │
│  │ ⚠ Strength RPE trending up → fatigue risk       │  │
│  │ ℹ Long run HR drift rising                      │  │
│  └─────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## Key Components

### 1. Stats Card
**Purpose**: Display key metrics at a glance

**Design**:
```
┌─────────────────────┐
│ Weekly Volume       │
│ ───────────────     │
│      42.5 km        │ ← Large, bold number
│   ↗ +12% vs last    │ ← Trend indicator
└─────────────────────┘
```

**Features**:
- Icon/emoji representing metric
- Large number display
- Trend indicator (up/down arrow + percentage)
- Subtle gradient background
- Hover effect: slight elevation

**Variants**:
- Success (green border) - on track
- Warning (amber border) - attention needed
- Neutral (blue border) - informational

---

### 2. Training Plan Timeline
**Purpose**: Visual weekly training schedule

**Design**:
```
Mon        Tue          Wed         Thu         Fri
───────────────────────────────────────────────────
🏃 Easy    💪 Strength  🏃 Tempo    💪 Strength 🏃 2x Run
6km • Z2   3 exercises  8km • Z3    3 exercises 5km+3km

Sat        Sun
───────────────────────
😴 Rest    🏃 Long Run
Active rec 18km • Z2
```

**Features**:
- Horizontal timeline with clear day markers
- Icons for workout types
- Color-coded by intensity
- Expandable cards showing full workout details
- Progress indicators (completed/pending)
- Drag-to-reschedule capability

---

### 3. Strava Integration Card
**Purpose**: Show connection status and sync controls

**Design**:
```
┌──────────────────────────────────────────────┐
│ [Strava Logo]  Connected to Strava           │
│ Athlete ID: 12345678                         │
│ Last synced: 2 minutes ago                   │
│                                              │
│ [Sync Now ↻] [View Activities →] [Settings] │
│                                              │
│ ✓ 23 activities imported this month          │
└──────────────────────────────────────────────┘
```

**States**:
- **Connected**: Green accent, pulse animation
- **Disconnected**: Gray, prominent "Connect" button
- **Syncing**: Loading animation, disabled buttons
- **Error**: Red accent, error message

---

### 4. Activity Log Card
**Purpose**: Quick logging interface

**Design**:
```
┌─────────────────────────────────────┐
│ Log Run 🏃                          │
│ ───────────────────                 │
│                                     │
│ Distance (km)    [_______]          │
│ Duration (min)   [_______]          │
│ Avg HR (bpm)     [_______]          │
│ RPE (1-10)       [● ● ● ○ ○]       │ ← Visual slider
│                                     │
│         [Cancel] [Log Activity]     │
└─────────────────────────────────────┘
```

**Features**:
- Auto-calculate pace from distance/duration
- RPE as visual slider with emoji feedback
- Heart rate zone indicator
- "Import from Strava" quick link
- Form validation with helpful errors

---

### 5. Insights Feed
**Purpose**: Surface important training insights

**Design**:
```
┌──────────────────────────────────────────────┐
│ Insights                            [See All]│
│ ────────────────────────────────             │
│                                              │
│ ✓ Positive Trend                             │
│   Tempo pace improving at same HR            │
│   Last 3 tempo runs: 4:45/km @ 170bpm        │
│   Previous avg: 4:55/km                      │
│   2 hours ago                                │
│                                              │
│ ⚠ Attention Needed                           │
│   Strength RPE trending upward               │
│   Avg RPE: 8.2 (target: 7.0)                │
│   Consider deload week                       │
│   5 hours ago                                │
└──────────────────────────────────────────────┘
```

**Features**:
- Icon-based severity (✓ positive, ⚠ warning, ℹ info)
- Expandable for full details
- Actionable suggestions
- Timestamp
- Color-coded borders

---

### 6. Profile Card (Sidebar)
**Purpose**: Quick athlete info

**Design**:
```
┌─────────────────────┐
│   [Avatar/Initials] │
│                     │
│    Demo User        │
│    demo@fitness.app │
│                     │
│ ─────────────────   │
│ Threshold Pace      │
│ 4:54 /km            │
│                     │
│ Threshold HR        │
│ 170 bpm             │
│                     │
│ Readiness: ●●●●○    │
│ 62%                 │
└─────────────────────┘
```

---

## Interactions & Animations

### Micro-interactions
1. **Button Hover**: Scale 1.02, slight shadow increase
2. **Card Hover**: Elevate 2px, border glow
3. **Stats Cards**: Count-up animation on load
4. **Success Actions**: Green checkmark animation
5. **Strava Sync**: Rotating icon during sync
6. **Toggle States**: Smooth slide transition

### Page Transitions
- Fade in + slide up (200ms, ease-out)
- Loading states: Skeleton screens (no spinners)

### Feedback
- **Success**: Toast notification (top-right, auto-dismiss 3s)
- **Error**: Inline error messages + shake animation
- **Loading**: Progress bar at top of screen

---

## Responsive Breakpoints

### Mobile (< 768px)
- Single column layout
- Bottom navigation bar
- Collapsible sections
- Full-width cards
- Swipeable training plan

### Tablet (768px - 1024px)
- Two column grid
- Side navigation (collapsible)
- Hybrid card sizes

### Desktop (> 1024px)
- Full sidebar navigation
- Three column grid where appropriate
- Hover effects enabled
- Keyboard shortcuts

---

## Accessibility

### WCAG 2.1 AA Compliance
- ✓ Color contrast ratio ≥ 4.5:1
- ✓ Focus indicators on all interactive elements
- ✓ Keyboard navigation support
- ✓ ARIA labels for screen readers
- ✓ Semantic HTML structure
- ✓ Skip to content link

### Features
- Dark mode (default) with light mode option
- Reduce motion support
- Font scaling support
- High contrast mode

---

## Component Library Structure

```
components/
├── layout/
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── MobileNav.tsx
│   └── PageContainer.tsx
├── stats/
│   ├── StatsCard.tsx
│   └── TrendIndicator.tsx
├── plan/
│   ├── TrainingTimeline.tsx
│   ├── WorkoutCard.tsx
│   └── DayPill.tsx
├── integrations/
│   ├── StravaCard.tsx
│   └── ConnectionStatus.tsx
├── logging/
│   ├── RunLogCard.tsx
│   ├── StrengthLogCard.tsx
│   └── RPESlider.tsx
├── insights/
│   ├── InsightFeed.tsx
│   └── InsightCard.tsx
└── shared/
    ├── Button.tsx
    ├── Card.tsx
    ├── Badge.tsx
    ├── Toast.tsx
    └── Skeleton.tsx
```

---

## Implementation Priority

### Phase 1: Core Layout ⭐
1. Sidebar/mobile navigation
2. Dashboard grid structure
3. Stats cards component
4. Basic theme system

### Phase 2: Data Display
1. Enhanced training timeline
2. Activity log cards
3. Insight feed
4. Strava integration card

### Phase 3: Polish
1. Animations & transitions
2. Loading states
3. Error handling
4. Toast notifications

### Phase 4: Advanced
1. Analytics charts
2. Settings page
3. Profile management
4. Export features

---

## Design Tokens

```typescript
// colors.ts
export const colors = {
  primary: {
    50: '#f0f9ff',
    500: '#0ea5e9',
    900: '#0c4a6e',
  },
  accent: {
    500: '#f97316',
  },
  background: '#020617',
  surface: '#0f172a',
  surfaceElevated: '#1e293b',
  text: {
    primary: '#f8fafc',
    secondary: '#cbd5e1',
    tertiary: '#64748b',
  },
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
};

// spacing.ts
export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
};

// borderRadius.ts
export const borderRadius = {
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  full: '9999px',
};
```

---

## Next Steps

1. **Review & Approve** this design
2. **Create component library** with Storybook (optional)
3. **Implement Phase 1** (core layout)
4. **Iterate** based on feedback
5. **Polish** with animations and interactions

Ready to build? 🚀
