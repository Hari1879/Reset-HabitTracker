import React from 'react';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';

export type IconName =
  | 'noSmoke'
  | 'noDrink'
  | 'moonOff'
  | 'leaf'
  | 'shield'
  | 'spark'
  | 'wallet'
  | 'droplet'
  | 'plus'
  | 'check'
  | 'flame'
  | 'calendar'
  | 'chevronRight'
  | 'chevronLeft'
  | 'archive'
  | 'trash'
  | 'edit'
  | 'bell'
  | 'download'
  | 'lock'
  | 'ring'
  | 'grid'
  | 'bar'
  | 'close'
  | 'info'
  | 'sun'
  | 'moon'
  | 'phone';

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/** Original, minimal line-icon set — hand-drawn for Reset, not sourced from any icon library. */
export function IconGlyph({ name, size = 24, color = '#F4F6FA', strokeWidth = 1.8 }: Props) {
  const common = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {renderIcon(name, common, color)}
    </Svg>
  );
}

function renderIcon(name: IconName, common: any, color: string) {
  switch (name) {
    case 'noSmoke':
      return (
        <>
          <Path d="M3 16.5h11a2.5 2.5 0 0 0 0-5" {...common} />
          <Line x1="3" y1="16.5" x2="20" y2="16.5" {...common} />
          <Line x1="4" y1="5" x2="20" y2="19" {...common} />
        </>
      );
    case 'noDrink':
      return (
        <>
          <Path d="M7 3h10l-1.5 8a3.5 3.5 0 0 1-7 0L7 3z" {...common} />
          <Line x1="12" y1="14" x2="12" y2="21" {...common} />
          <Line x1="8.5" y1="21" x2="15.5" y2="21" {...common} />
          <Line x1="4" y1="4" x2="20" y2="20" {...common} />
        </>
      );
    case 'moonOff':
      return (
        <>
          <Path d="M15 3.5a7.5 7.5 0 1 0 5.5 12.7A8.8 8.8 0 0 1 15 3.5z" {...common} />
          <Line x1="4" y1="4" x2="20" y2="20" {...common} />
        </>
      );
    case 'moon':
      return <Path d="M15 3.5a7.5 7.5 0 1 0 5.5 12.7A8.8 8.8 0 0 1 15 3.5z" {...common} />;
    case 'sun':
      return (
        <>
          <Circle cx="12" cy="12" r="4.2" {...common} />
          <Line x1="12" y1="2.5" x2="12" y2="5" {...common} />
          <Line x1="12" y1="19" x2="12" y2="21.5" {...common} />
          <Line x1="2.5" y1="12" x2="5" y2="12" {...common} />
          <Line x1="19" y1="12" x2="21.5" y2="12" {...common} />
          <Line x1="4.9" y1="4.9" x2="6.7" y2="6.7" {...common} />
          <Line x1="17.3" y1="17.3" x2="19.1" y2="19.1" {...common} />
          <Line x1="4.9" y1="19.1" x2="6.7" y2="17.3" {...common} />
          <Line x1="17.3" y1="6.7" x2="19.1" y2="4.9" {...common} />
        </>
      );
    case 'leaf':
      return (
        <>
          <Path d="M5 19c-1-6 2.5-12.5 14-14.5C20 16 12.5 19.5 5 19z" {...common} />
          <Path d="M5 19c2-3 5-6 9-8.5" {...common} />
        </>
      );
    case 'shield':
      return <Path d="M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-3z" {...common} />;
    case 'spark':
      return (
        <Path
          d="M12 2.5c.6 3.4 1.6 5.9 3.2 7.6 1.7 1.6 4.2 2.6 7.6 3.2-3.4.6-5.9 1.6-7.6 3.2-1.6 1.7-2.6 4.2-3.2 7.6-.6-3.4-1.6-5.9-3.2-7.6-1.7-1.6-4.2-2.6-7.6-3.2 3.4-.6 5.9-1.6 7.6-3.2 1.6-1.7 2.6-4.2 3.2-7.6z"
          {...common}
        />
      );
    case 'wallet':
      return (
        <>
          <Rect x="3" y="6" width="18" height="13" rx="2.5" {...common} />
          <Path d="M3 10h18" {...common} />
          <Circle cx="16.5" cy="14" r="1.1" fill={color} stroke="none" />
        </>
      );
    case 'droplet':
      return <Path d="M12 3s6.5 7 6.5 11.5a6.5 6.5 0 1 1-13 0C5.5 10 12 3 12 3z" {...common} />;
    case 'plus':
      return (
        <>
          <Line x1="12" y1="5" x2="12" y2="19" {...common} />
          <Line x1="5" y1="12" x2="19" y2="12" {...common} />
        </>
      );
    case 'check':
      return <Path d="M4.5 12.5l4.5 4.5 10.5-11" {...common} />;
    case 'flame':
      return (
        <Path
          d="M12 2.5c1 3 3.5 4 3.5 7.3a3.5 3.5 0 1 1-7 0c0-1 .3-1.8.9-2.6-.2 1.4.5 2.1 1.1 1.5-.7-3 .3-4.7 1.5-6.2z"
          {...common}
        />
      );
    case 'calendar':
      return (
        <>
          <Rect x="3.5" y="5" width="17" height="15.5" rx="2.5" {...common} />
          <Line x1="3.5" y1="9.5" x2="20.5" y2="9.5" {...common} />
          <Line x1="8" y1="3" x2="8" y2="6.5" {...common} />
          <Line x1="16" y1="3" x2="16" y2="6.5" {...common} />
        </>
      );
    case 'chevronRight':
      return <Path d="M9 5l7 7-7 7" {...common} />;
    case 'chevronLeft':
      return <Path d="M15 5l-7 7 7 7" {...common} />;
    case 'archive':
      return (
        <>
          <Rect x="3.5" y="4.5" width="17" height="4.5" rx="1.5" {...common} />
          <Path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" {...common} />
          <Line x1="10" y1="13" x2="14" y2="13" {...common} />
        </>
      );
    case 'trash':
      return (
        <>
          <Path d="M5 7h14" {...common} />
          <Path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2" {...common} />
          <Path d="M7 7l1 12.5A2 2 0 0 0 10 21h4a2 2 0 0 0 2-1.5L17 7" {...common} />
        </>
      );
    case 'edit':
      return (
        <>
          <Path d="M4 20l.9-3.6L15.7 5.6a1.8 1.8 0 0 1 2.6 0l1.1 1.1a1.8 1.8 0 0 1 0 2.6L8.6 20.1 4 20z" {...common} />
          <Line x1="14.5" y1="6.8" x2="17.3" y2="9.6" {...common} />
        </>
      );
    case 'bell':
      return (
        <>
          <Path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2.2H4.5L6 17z" {...common} />
          <Path d="M10 20.5a2 2 0 0 0 4 0" {...common} />
        </>
      );
    case 'download':
      return (
        <>
          <Line x1="12" y1="3.5" x2="12" y2="14.5" {...common} />
          <Path d="M7.5 11l4.5 4.5 4.5-4.5" {...common} />
          <Path d="M4.5 17.5v2A2 2 0 0 0 6.5 21.5h11a2 2 0 0 0 2-2v-2" {...common} />
        </>
      );
    case 'lock':
      return (
        <>
          <Rect x="5" y="10.5" width="14" height="10" rx="2.2" {...common} />
          <Path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" {...common} />
        </>
      );
    case 'ring':
      return <Circle cx="12" cy="12" r="7.5" {...common} />;
    case 'grid':
      return (
        <>
          {[0, 1, 2].flatMap((row) =>
            [0, 1, 2].map((col) => (
              <Circle key={`${row}-${col}`} cx={7 + col * 5} cy={7 + row * 5} r="1.4" fill={color} stroke="none" />
            )),
          )}
        </>
      );
    case 'bar':
      return (
        <>
          <Rect x="3" y="10.5" width="18" height="3" rx="1.5" fill={color} stroke="none" opacity={0.25} />
          <Rect x="3" y="10.5" width="11" height="3" rx="1.5" fill={color} stroke="none" />
        </>
      );
    case 'close':
      return (
        <>
          <Line x1="6" y1="6" x2="18" y2="18" {...common} />
          <Line x1="18" y1="6" x2="6" y2="18" {...common} />
        </>
      );
    case 'info':
      return (
        <>
          <Circle cx="12" cy="12" r="8.5" {...common} />
          <Line x1="12" y1="11" x2="12" y2="16" {...common} />
          <Circle cx="12" cy="8" r="0.9" fill={color} stroke="none" />
        </>
      );
    case 'phone':
      return <Rect x="7" y="2.5" width="10" height="19" rx="2.3" {...common} />;
    default:
      return <Circle cx="12" cy="12" r="8" {...common} />;
  }
}
