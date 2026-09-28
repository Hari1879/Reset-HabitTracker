import React from 'react';
import { View, Text, Platform } from 'react-native';
import { useTheme } from '@/theme';
import { ProgressRing } from '@/components/ProgressRing';
import { DotProgress } from '@/components/DotProgress';
import { IconGlyph, type IconName } from '@/components/IconGlyph';
import type { AccentColor, WidgetSize, WidgetStyle } from '@/types';

interface Props {
  widgetStyle: WidgetStyle;
  size: WidgetSize;
  accent: AccentColor;
  icon: IconName;
  habitTitle: string;
  streakDays: number;
  nextMilestoneLabel: string;
  progress: number;
}

const DIMENSIONS: Record<WidgetSize, { width: number; height: number }> = {
  small: { width: 148, height: 148 },
  medium: { width: 300, height: 148 },
  large: { width: 300, height: 300 },
};

const MONOSPACE = Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' });

// Warm/light accents need dark ink text for contrast on a solid fill; cooler/darker
// accents read fine with light text. Only boldBlock uses a full-bleed accent fill.
const LIGHT_TEXT_ACCENTS: AccentColor[] = ['teal', 'aqua', 'lavender'];

// Sticky Note uses a light paper background per accent — like real sticky-note pads —
// rather than the ink-dark background every other style shares.
const STICKY_PAPER_COLORS: Record<AccentColor, string> = {
  teal: '#D7F0EC',
  aqua: '#DCF0F7',
  lavender: '#EAE3FB',
  coral: '#FDE1D6',
  gold: '#FCEEB0',
};
const STICKY_INK = '#3A3020';

/**
 * Realistic static preview of a home-screen widget, rendered entirely with in-app
 * SVG/components. This is what ships inside the React Native app even before the
 * native WidgetKit / Glance extensions are connected (see modules/reset-widget-bridge).
 *
 * Nine original layouts, each its own visual language (not a reskin of one shape):
 * Progress Ring, Dot Grid, Minimal Countdown, Grid Blocks, Terminal, Bold Block,
 * Pulse Bars, Week Grid, Sticky Note.
 */
export function WidgetPreview({ widgetStyle, size, accent, icon, habitTitle, streakDays, nextMilestoneLabel, progress }: Props) {
  const theme = useTheme();
  const accentValue = theme[accent].base;
  const { width, height } = DIMENSIONS[size];

  const isBoldBlock = widgetStyle === 'boldBlock';
  const isTerminal = widgetStyle === 'terminal';
  const isStickyNote = widgetStyle === 'stickyNote';
  const backgroundColor = isBoldBlock ? accentValue : isTerminal ? '#050505' : isStickyNote ? STICKY_PAPER_COLORS[accent] : '#0A0E17';

  return (
    <View
      style={{
        width,
        height,
        borderRadius: isStickyNote ? 6 : 26,
        backgroundColor,
        padding: 16,
        justifyContent: widgetStyle === 'minimalCountdown' ? 'center' : 'space-between',
        overflow: 'hidden',
        borderWidth: isStickyNote ? 0 : 1,
        borderColor: isTerminal ? 'rgba(90,255,140,0.25)' : 'rgba(255,255,255,0.08)',
        transform: isStickyNote ? [{ rotate: '-2.5deg' }] : [],
        ...(isStickyNote
          ? { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 5 }
          : {}),
      }}
    >
      {widgetStyle === 'progressRing' && (
        <RingLayout size={size} accent={accentValue} icon={icon} habitTitle={habitTitle} streakDays={streakDays} nextMilestoneLabel={nextMilestoneLabel} progress={progress} />
      )}
      {widgetStyle === 'dotGrid' && (
        <DotLayout size={size} accent={accentValue} habitTitle={habitTitle} streakDays={streakDays} nextMilestoneLabel={nextMilestoneLabel} progress={progress} />
      )}
      {widgetStyle === 'minimalCountdown' && (
        <CountdownLayout size={size} accent={accentValue} streakDays={streakDays} nextMilestoneLabel={nextMilestoneLabel} progress={progress} />
      )}
      {widgetStyle === 'gridBlocks' && (
        <GridBlocksLayout size={size} accent={accentValue} icon={icon} habitTitle={habitTitle} streakDays={streakDays} progress={progress} />
      )}
      {widgetStyle === 'terminal' && (
        <TerminalLayout size={size} accent={accentValue} habitTitle={habitTitle} streakDays={streakDays} nextMilestoneLabel={nextMilestoneLabel} progress={progress} />
      )}
      {widgetStyle === 'boldBlock' && (
        <BoldBlockLayout
          size={size}
          icon={icon}
          habitTitle={habitTitle}
          streakDays={streakDays}
          nextMilestoneLabel={nextMilestoneLabel}
          progress={progress}
          textColor={LIGHT_TEXT_ACCENTS.includes(accent) ? '#0A0E17' : '#F4F6FA'}
        />
      )}
      {widgetStyle === 'pulseBars' && (
        <PulseBarsLayout size={size} accent={accentValue} habitTitle={habitTitle} streakDays={streakDays} nextMilestoneLabel={nextMilestoneLabel} progress={progress} />
      )}
      {widgetStyle === 'weekGrid' && (
        <WeekGridLayout size={size} accent={accentValue} habitTitle={habitTitle} streakDays={streakDays} progress={progress} />
      )}
      {widgetStyle === 'stickyNote' && (
        <StickyNoteLayout size={size} icon={icon} habitTitle={habitTitle} streakDays={streakDays} nextMilestoneLabel={nextMilestoneLabel} />
      )}
    </View>
  );
}

function RingLayout({ size, accent, icon, habitTitle, streakDays, nextMilestoneLabel, progress }: any) {
  const ringSize = size === 'small' ? 70 : size === 'medium' ? 80 : 130;
  return (
    <View style={{ flex: 1, alignItems: size === 'medium' ? 'flex-start' : 'center', flexDirection: size === 'medium' ? 'row' : 'column', justifyContent: 'center' }}>
      <ProgressRing progress={progress} size={ringSize} strokeWidth={size === 'large' ? 10 : 7} color={accent} trackColor="rgba(255,255,255,0.12)">
        <Text style={{ color: '#F4F6FA', fontSize: size === 'large' ? 26 : 16, fontWeight: '800' }}>{streakDays}</Text>
        <Text style={{ color: 'rgba(244,246,250,0.6)', fontSize: 10, fontWeight: '600' }}>days</Text>
      </ProgressRing>
      {size !== 'small' && (
        <View style={{ marginLeft: size === 'medium' ? 16 : 0, marginTop: size === 'large' ? 14 : 0, alignItems: size === 'medium' ? 'flex-start' : 'center' }}>
          <Text style={{ color: '#F4F6FA', fontWeight: '700', fontSize: 15 }} numberOfLines={1}>{habitTitle}</Text>
          <Text style={{ color: 'rgba(244,246,250,0.6)', fontSize: 12, marginTop: 2 }}>{nextMilestoneLabel}</Text>
        </View>
      )}
    </View>
  );
}

function DotLayout({ size, accent, habitTitle, streakDays, nextMilestoneLabel, progress }: any) {
  const total = size === 'small' ? 12 : size === 'medium' ? 16 : 30;
  const columns = size === 'small' ? 4 : size === 'medium' ? 8 : 6;
  const dotSize = size === 'large' ? 12 : 8;
  return (
    <View style={{ flex: 1, justifyContent: 'space-between' }}>
      {size !== 'small' && <Text style={{ color: '#F4F6FA', fontWeight: '700', fontSize: 14 }} numberOfLines={1}>{habitTitle}</Text>}
      <DotProgress total={total} filled={Math.round(total * progress)} columns={columns} dotSize={dotSize} gap={6} color={accent} trackColor="rgba(255,255,255,0.12)" />
      <View>
        <Text style={{ color: '#F4F6FA', fontWeight: '800', fontSize: size === 'small' ? 18 : 22 }}>{streakDays}d</Text>
        {size !== 'small' && <Text style={{ color: 'rgba(244,246,250,0.6)', fontSize: 11, marginTop: 2 }}>{nextMilestoneLabel}</Text>}
      </View>
    </View>
  );
}

function CountdownLayout({ size, accent, streakDays, nextMilestoneLabel, progress }: any) {
  return (
    <View>
      <Text style={{ color: '#F4F6FA', fontWeight: '800', fontSize: size === 'small' ? 18 : size === 'medium' ? 22 : 28 }}>
        {streakDays} days stronger
      </Text>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.12)', marginTop: 14, overflow: 'hidden' }}>
        <View style={{ height: 8, borderRadius: 4, width: `${Math.round(progress * 100)}%`, backgroundColor: accent }} />
      </View>
      {size !== 'small' && (
        <Text style={{ color: 'rgba(244,246,250,0.6)', fontSize: 12, marginTop: 10 }}>{nextMilestoneLabel}</Text>
      )}
    </View>
  );
}

const GRID_DIMENSIONS: Record<WidgetSize, { rows: number; cols: number }> = {
  small: { rows: 4, cols: 4 },
  medium: { rows: 3, cols: 11 },
  large: { rows: 8, cols: 8 },
};

/** Full-bleed grid of rounded-square cells filling nearly the whole card — a single compact
 * header line, then the grid itself is the hero, edge to edge, top to bottom. */
function GridBlocksLayout({ size, accent, icon, habitTitle, streakDays, progress }: any) {
  const { rows, cols } = GRID_DIMENSIONS[size as WidgetSize];
  const total = rows * cols;
  const filled = Math.round(total * progress);
  const gap = size === 'large' ? 6 : 5;
  const cellRadius = size === 'large' ? 6 : 4;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <IconGlyph name={icon} size={14} color={accent} />
        <Text style={{ color: '#F4F6FA', fontWeight: '700', fontSize: 13, marginLeft: 6, flex: 1 }} numberOfLines={1}>{habitTitle}</Text>
        <Text style={{ color: accent, fontWeight: '800', fontSize: 13 }}>{streakDays}d</Text>
      </View>
      <View style={{ flex: 1 }}>
        {Array.from({ length: rows }, (_, r) => (
          <View key={r} style={{ flex: 1, flexDirection: 'row', marginBottom: r === rows - 1 ? 0 : gap }}>
            {Array.from({ length: cols }, (_, c) => {
              const i = r * cols + c;
              return (
                <View
                  key={c}
                  style={{
                    flex: 1,
                    marginRight: c === cols - 1 ? 0 : gap,
                    borderRadius: cellRadius,
                    backgroundColor: i < filled ? accent : 'rgba(255,255,255,0.10)',
                  }}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

/** A quiet nod to terminal UIs — monospace, bracketed, dashed progress box. Original copy
 * ("free" / uppercase habit name), not a reproduction of any specific retro-computer OS. */
function TerminalLayout({ size, accent, habitTitle, streakDays, nextMilestoneLabel, progress }: any) {
  const barCells = size === 'small' ? 6 : 10;
  const filledCells = Math.round(barCells * progress);
  return (
    <View style={{ flex: 1, justifyContent: 'space-between' }}>
      <Text style={{ color: accent, fontFamily: MONOSPACE, fontWeight: '700', fontSize: size === 'small' ? 10 : 11, letterSpacing: 0.5 }} numberOfLines={1}>
        {habitTitle.toUpperCase()}
      </Text>

      <View>
        <View
          style={{
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: accent,
            borderRadius: 6,
            paddingVertical: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: accent, fontFamily: MONOSPACE, fontWeight: '700', fontSize: size === 'large' ? 30 : size === 'medium' ? 22 : 18 }}>
            {streakDays}d free
          </Text>
        </View>

        {size !== 'small' && (
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            {Array.from({ length: barCells }, (_, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: 10,
                  marginRight: i === barCells - 1 ? 0 : 3,
                  borderWidth: 1,
                  borderColor: accent,
                  backgroundColor: i < filledCells ? accent : 'transparent',
                }}
              />
            ))}
          </View>
        )}
      </View>

      <Text style={{ color: 'rgba(90,255,140,0.55)', fontFamily: MONOSPACE, fontSize: 9 }} numberOfLines={1}>
        {'> ' + nextMilestoneLabel.toLowerCase()}
      </Text>
    </View>
  );
}

/** Flat, full-bleed accent color with oversized type — a Swiss-poster treatment. Text
 * color adapts per accent so it stays readable against both warm and cool fills. */
function BoldBlockLayout({ size, icon, habitTitle, streakDays, nextMilestoneLabel, progress, textColor }: any) {
  const ringSize = size === 'small' ? 30 : 40;
  return (
    <View style={{ flex: 1, justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Text
          style={{ color: textColor, fontWeight: '800', fontSize: size === 'large' ? 22 : size === 'medium' ? 18 : 15, flex: 1, marginRight: 8 }}
          numberOfLines={2}
        >
          {habitTitle}
        </Text>
        <IconGlyph name={icon} size={18} color={textColor} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: textColor, fontWeight: '800', fontSize: size === 'large' ? 40 : size === 'medium' ? 30 : 22 }}>{streakDays}d</Text>
          {size !== 'small' && (
            <Text style={{ color: textColor, opacity: 0.75, fontSize: 12, marginTop: 2 }} numberOfLines={1}>{nextMilestoneLabel}</Text>
          )}
        </View>
        {size !== 'small' && (
          <ProgressRing progress={progress} size={ringSize} strokeWidth={5} color={textColor} trackColor="rgba(255,255,255,0.25)" />
        )}
      </View>
    </View>
  );
}

const BAR_COUNT: Record<WidgetSize, number> = { small: 6, medium: 10, large: 12 };
const BAR_AREA_HEIGHT: Record<WidgetSize, number> = { small: 64, medium: 56, large: 150 };

/** Thick rounded capsule bars — solid for elapsed days, hollow-outlined for what's ahead.
 * A colorful, non-monospace cousin of Terminal's thin segmented bar. */
function PulseBarsLayout({ size, accent, habitTitle, streakDays, nextMilestoneLabel, progress }: any) {
  const barCount = BAR_COUNT[size as WidgetSize];
  const filled = Math.round(barCount * progress);
  const gap = size === 'large' ? 8 : 6;

  return (
    <View style={{ flex: 1, justifyContent: 'space-between' }}>
      <View>
        <Text style={{ color: '#F4F6FA', fontWeight: '700', fontSize: size === 'large' ? 17 : 14 }} numberOfLines={1}>{habitTitle}</Text>
        <Text style={{ color: 'rgba(244,246,250,0.6)', fontSize: 12, marginTop: 2 }}>{streakDays}d free</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: BAR_AREA_HEIGHT[size as WidgetSize], marginTop: 12 }}>
        {Array.from({ length: barCount }, (_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: '100%',
              marginRight: i === barCount - 1 ? 0 : gap,
              borderRadius: 999,
              borderWidth: i < filled ? 0 : 1.5,
              borderColor: accent,
              backgroundColor: i < filled ? accent : 'transparent',
            }}
          />
        ))}
      </View>
      {size !== 'small' && (
        <Text style={{ color: 'rgba(244,246,250,0.5)', fontSize: 11, marginTop: 10 }} numberOfLines={1}>{nextMilestoneLabel}</Text>
      )}
    </View>
  );
}

const WEEK_GRID_DIMENSIONS: Record<WidgetSize, { rows: number; cols: number }> = {
  small: { rows: 3, cols: 4 },
  medium: { rows: 3, cols: 9 },
  large: { rows: 5, cols: 5 },
};

/** Coarse calendar-style grid of larger squares — solid for elapsed, hollow-outlined for
 * what's ahead, echoing a small weekly calendar rather than a dense pixel field. */
function WeekGridLayout({ size, accent, habitTitle, streakDays, progress }: any) {
  const { rows, cols } = WEEK_GRID_DIMENSIONS[size as WidgetSize];
  const total = rows * cols;
  const filled = Math.round(total * progress);
  const gap = size === 'large' ? 8 : 6;

  return (
    <View style={{ flex: 1, justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: '#F4F6FA', fontWeight: '700', fontSize: size === 'large' ? 16 : 13, flex: 1 }} numberOfLines={1}>{habitTitle}</Text>
        <Text style={{ color: accent, fontWeight: '800', fontSize: 13 }}>{streakDays}d</Text>
      </View>
      <View style={{ flex: 1, marginTop: 10 }}>
        {Array.from({ length: rows }, (_, r) => (
          <View key={r} style={{ flex: 1, flexDirection: 'row', marginBottom: r === rows - 1 ? 0 : gap }}>
            {Array.from({ length: cols }, (_, c) => {
              const i = r * cols + c;
              const isFilled = i < filled;
              return (
                <View
                  key={c}
                  style={{
                    flex: 1,
                    marginRight: c === cols - 1 ? 0 : gap,
                    borderRadius: size === 'large' ? 8 : 6,
                    borderWidth: isFilled ? 0 : 1.5,
                    borderColor: accent,
                    backgroundColor: isFilled ? accent : 'transparent',
                  }}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

/** A pinned paper note — slight tilt on the outer card (see WidgetPreview), a small "pin"
 * dot, and a folded corner. Warm, handwritten-feeling, and unlike every other dark-bg style. */
function StickyNoteLayout({ size, icon, habitTitle, streakDays, nextMilestoneLabel }: any) {
  const foldSize = size === 'small' ? 18 : 24;
  return (
    <View style={{ flex: 1, justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconGlyph name={icon} size={16} color={STICKY_INK} />
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(58,48,32,0.28)' }} />
      </View>

      <View>
        <Text style={{ color: STICKY_INK, fontWeight: '800', fontSize: size === 'large' ? 42 : size === 'medium' ? 32 : 24 }}>
          {streakDays}d
        </Text>
        <Text style={{ color: STICKY_INK, fontWeight: '700', fontSize: size === 'small' ? 12 : 14, marginTop: 2 }} numberOfLines={1}>
          {habitTitle}
        </Text>
        {size !== 'small' && (
          <Text style={{ color: 'rgba(58,48,32,0.62)', fontSize: 11, marginTop: 6 }} numberOfLines={1}>
            {nextMilestoneLabel}
          </Text>
        )}
      </View>

      <View
        style={{
          position: 'absolute',
          right: -16,
          bottom: -16,
          width: foldSize,
          height: foldSize,
          backgroundColor: 'rgba(0,0,0,0.10)',
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}
