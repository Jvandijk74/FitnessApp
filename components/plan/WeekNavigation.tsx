'use client';

import { useState } from 'react';

interface WeekNavigationProps {
  currentWeek: number;
  currentYear: number;
  onWeekChange: (week: number, year: number) => void;
}

export function WeekNavigation({ currentWeek, currentYear, onWeekChange }: WeekNavigationProps) {
  const [showYearView, setShowYearView] = useState(false);

  const getWeekDates = (week: number, year: number) => {
    const jan4 = new Date(year, 0, 4);
    const daysToAdd = (week - 1) * 7 - jan4.getDay() + 1;
    const weekStart = new Date(year, 0, 4 + daysToAdd);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return {
      start: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      end: weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  };

  const dates = getWeekDates(currentWeek, currentYear);
  const totalWeeks = 52;

  const goToPreviousWeek = () => {
    if (currentWeek === 1) {
      onWeekChange(52, currentYear - 1);
    } else {
      onWeekChange(currentWeek - 1, currentYear);
    }
  };

  const goToNextWeek = () => {
    if (currentWeek === 52) {
      onWeekChange(1, currentYear + 1);
    } else {
      onWeekChange(currentWeek + 1, currentYear);
    }
  };

  const goToCurrentWeek = () => {
    const now = new Date();
    const onejan = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil((((now.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
    onWeekChange(week, now.getFullYear());
  };

  return (
    <div className="card">
      {/* Main Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousWeek}
          className="h-10 w-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex-1 text-center">
          <button
            onClick={() => setShowYearView(!showYearView)}
            className="inline-flex items-center gap-2 hover:text-primary transition-colors"
          >
            <div>
              <h2 className="text-2xl font-bold text-white">Week {currentWeek}, {currentYear}</h2>
              <p className="text-sm text-white/60">{dates.start} - {dates.end}</p>
            </div>
            <svg className={`w-5 h-5 transition-transform ${showYearView ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <button
          onClick={goToNextWeek}
          className="h-10 w-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button
          onClick={goToCurrentWeek}
          className="btn-secondary flex-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Current Week
        </button>
        <button
          onClick={() => setShowYearView(!showYearView)}
          className="btn-secondary flex-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Year View
        </button>
      </div>

      {/* Year View Grid */}
      {showYearView && (
        <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => onWeekChange(currentWeek, currentYear - 1)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-lg font-bold">{currentYear}</h3>
            <button
              onClick={() => onWeekChange(currentWeek, currentYear + 1)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-13 gap-1 max-h-80 overflow-y-auto custom-scrollbar">
            {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((week) => {
              const isCurrentWeek = week === currentWeek;
              const now = new Date();
              const onejan = new Date(now.getFullYear(), 0, 1);
              const thisWeek = Math.ceil((((now.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
              const isToday = week === thisWeek && currentYear === now.getFullYear();

              return (
                <button
                  key={week}
                  onClick={() => {
                    onWeekChange(week, currentYear);
                    setShowYearView(false);
                  }}
                  className={`
                    h-10 rounded-md text-xs font-medium transition-all
                    ${isCurrentWeek
                      ? 'bg-primary text-white ring-2 ring-primary/50'
                      : isToday
                      ? 'bg-accent/20 text-accent ring-1 ring-accent/40'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }
                  `}
                  title={`Week ${week}`}
                >
                  {week}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 mt-4 text-xs text-white/60">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-primary"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-accent/20 ring-1 ring-accent/40"></div>
              <span>Current</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
