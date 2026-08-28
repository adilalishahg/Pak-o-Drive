'use client';

import React, { useId } from 'react';
import { useSiteTheme } from './DynamicThemeProvider';

export interface PakODriveLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  width?: string | number;
  height?: string | number;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  text1?: string;
  text2?: string;
  fontFamily?: string;
  fontWeight?: string | number;
  letterSpacing?: number;
  fontSize?: number;
  fontStyle?: 'normal' | 'italic';
  showIcon?: boolean;
  showText?: boolean;
}

export const PakODriveLogo: React.FC<PakODriveLogoProps> = ({
  className = '',
  width,
  height,
  primaryColor: propPrimary,
  secondaryColor: propSecondary,
  accentColor: propAccent,
  text1: propText1,
  text2: propText2,
  fontFamily: propFontFamily,
  fontWeight: propFontWeight,
  letterSpacing: propLetterSpacing,
  fontSize: propFontSize,
  fontStyle: propFontStyle,
  showIcon: propShowIcon,
  showText: propShowText,
  style,
  ...props
}) => {
  const uniqueId = useId().replace(/[:]/g, '');

  let themeSvgLogo;
  try {
    const siteTheme = useSiteTheme();
    themeSvgLogo = siteTheme?.theme?.svgLogo;
  } catch {
    // context not available
  }

  const primaryColor   = propPrimary ?? themeSvgLogo?.primaryColor ?? '#00A8E8';
  const secondaryColor = propSecondary ?? themeSvgLogo?.secondaryColor ?? '#0066CC';
  const accentColor    = propAccent ?? themeSvgLogo?.accentColor ?? '#FF7A00';
  const text1          = propText1 ?? themeSvgLogo?.text1 ?? 'PAKO';
  const text2          = propText2 ?? themeSvgLogo?.text2 ?? 'DRIVE';
  const fontFamily     = propFontFamily ?? themeSvgLogo?.fontFamily ?? 'Montserrat';
  const fontWeight     = propFontWeight ?? themeSvgLogo?.fontWeight ?? '900';
  const letterSpacing  = propLetterSpacing ?? themeSvgLogo?.letterSpacing ?? 5;
  const fontSize       = propFontSize ?? themeSvgLogo?.fontSize ?? 105;
  const fontStyle      = propFontStyle ?? themeSvgLogo?.fontStyle ?? 'normal';
  const showIcon       = propShowIcon ?? themeSvgLogo?.showIcon ?? true;
  const showText       = propShowText ?? themeSvgLogo?.showText ?? true;
  const configuredHeight = height ?? themeSvgLogo?.height ?? 38;

  const blueGlowId = `blueGlow-${uniqueId}`;
  const orangeGlowId = `orangeGlow-${uniqueId}`;
  const darkBlueArcId = `darkBlueArc-${uniqueId}`;

  // If only icon is shown
  if (showIcon && !showText) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 340 320"
        height={configuredHeight}
        width={width || 'auto'}
        fill="none"
        className={className}
        style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
        {...props}
      >
        <defs>
          <linearGradient id={blueGlowId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
          <linearGradient id={orangeGlowId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={accentColor} />
            <stop offset="100%" stopColor="#FFA000" />
          </linearGradient>
          <linearGradient id={darkBlueArcId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={secondaryColor} />
            <stop offset="100%" stopColor="#004499" />
          </linearGradient>
        </defs>

        <g id="logo-icon" transform="translate(10, 10)">
          <path d="M 175 65 A 95 95 0 0 1 250 170" stroke={accentColor} strokeWidth="12" strokeLinecap="round" fill="none" opacity="0.95" />
          <path d="M 70 210 A 95 95 0 0 1 110 260" stroke={accentColor} strokeWidth="12" strokeLinecap="round" fill="none" opacity="0.9" />
          <path d="M 85 105 A 85 85 0 0 1 200 70" stroke={`url(#${darkBlueArcId})`} strokeWidth="10" strokeLinecap="round" fill="none" />
          <path d="M 120 250 A 85 85 0 0 0 240 215" stroke={`url(#${blueGlowId})`} strokeWidth="12" strokeLinecap="round" fill="none" />
          <path d="M 145 268 A 95 95 0 0 0 230 245" stroke={primaryColor} strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M 50 150 A 110 110 0 0 0 95 240" stroke={primaryColor} strokeWidth="14" strokeLinecap="round" fill="none" />
          <path d="M 38 185 C 36 225, 80 255, 140 240 C 205 220, 245 155, 275 85" stroke={`url(#${orangeGlowId})`} strokeWidth="18" strokeLinecap="round" fill="none" />
          <polygon points="275,55 295,95 248,82" fill={accentColor} />
          <polygon points="275,55 248,82 265,98" fill="#E65100" opacity="0.6" />
          <polygon points="215,20 162,130 220,130 115,280 158,165 105,165" fill={secondaryColor} />
          <polygon points="210,25 168,135 225,135 125,270 162,160 112,160" fill={`url(#${blueGlowId})`} />
          <polygon points="210,25 178,135 198,135 125,270 155,160 128,160" fill="#E0F7FF" opacity="0.35" />
        </g>
      </svg>
    );
  }

  // If only text is shown
  if (!showIcon && showText) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 580 340"
        height={configuredHeight}
        width={width || 'auto'}
        fill="none"
        className={className}
        style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
        {...props}
      >
        <g id="logo-text" transform="translate(10, 140)">
          <text
            x="0"
            y="0"
            fontFamily={`'${fontFamily}', 'Montserrat', 'Arial Black', sans-serif`}
            fontSize={fontSize}
            fontWeight={fontWeight}
            fontStyle={fontStyle}
            letterSpacing={letterSpacing}
            fill={primaryColor}
          >
            {text1}
          </text>
          <text
            x="0"
            y="95"
            fontFamily={`'${fontFamily}', 'Montserrat', 'Arial Black', sans-serif`}
            fontSize={fontSize}
            fontWeight={fontWeight}
            fontStyle={fontStyle}
            letterSpacing={letterSpacing}
            fill={accentColor}
          >
            {text2}
          </text>
          <path d="M 0 108 C 80 108, 140 125, 230 122 C 310 118, 355 106, 385 96 C 360 112, 290 130, 200 130 C 110 130, 50 112, 0 108 Z" fill={primaryColor} />
          <path d="M 140 122 C 175 145, 220 160, 275 152 C 330 144, 380 125, 410 105 C 385 128, 325 152, 250 148 C 190 145, 155 130, 140 122 Z" fill={accentColor} />
        </g>
      </svg>
    );
  }

  // Full Logo (Icon + Typography)
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 980 360"
      height={configuredHeight}
      width={width || 'auto'}
      fill="none"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
      {...props}
    >
      <defs>
        {/* Lightning Bolt Gradient */}
        <linearGradient id={blueGlowId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primaryColor} />
          <stop offset="100%" stopColor={secondaryColor} />
        </linearGradient>

        {/* Speed Arrow & Arc Gradient */}
        <linearGradient id={orangeGlowId} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={accentColor} />
          <stop offset="100%" stopColor="#FFA000" />
        </linearGradient>

        {/* Darker Shadow Blue for 3D Layering */}
        <linearGradient id={darkBlueArcId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={secondaryColor} />
          <stop offset="100%" stopColor="#004499" />
        </linearGradient>
      </defs>

      {/* ==================== LEFT ICON ==================== */}
      {showIcon && (
        <g id="logo-icon" transform="translate(30, 25)">
          {/* Base Circular Energy Rings (Orange & Blue Tracks) */}
          <path d="M 175 65 A 95 95 0 0 1 250 170" stroke={accentColor} strokeWidth="12" strokeLinecap="round" fill="none" opacity="0.95" />
          <path d="M 70 210 A 95 95 0 0 1 110 260" stroke={accentColor} strokeWidth="12" strokeLinecap="round" fill="none" opacity="0.9" />

          {/* Inner Blue Dynamic Track */}
          <path d="M 85 105 A 85 85 0 0 1 200 70" stroke={`url(#${darkBlueArcId})`} strokeWidth="10" strokeLinecap="round" fill="none" />
          <path d="M 120 250 A 85 85 0 0 0 240 215" stroke={`url(#${blueGlowId})`} strokeWidth="12" strokeLinecap="round" fill="none" />
          <path d="M 145 268 A 95 95 0 0 0 230 245" stroke={primaryColor} strokeWidth="7" strokeLinecap="round" fill="none" />

          {/* Bottom-Left Outer Blue Arc */}
          <path d="M 50 150 A 110 110 0 0 0 95 240" stroke={primaryColor} strokeWidth="14" strokeLinecap="round" fill="none" />

          {/* Dynamic Orange Speed Swoosh with Arrow */}
          <path d="M 38 185 C 36 225, 80 255, 140 240 C 205 220, 245 155, 275 85" stroke={`url(#${orangeGlowId})`} strokeWidth="18" strokeLinecap="round" fill="none" />

          {/* Kinetic Arrowhead pointing up-right */}
          <polygon points="275,55 295,95 248,82" fill={accentColor} />
          <polygon points="275,55 248,82 265,98" fill="#E65100" opacity="0.6" />

          {/* Sharp Electric Lightning Bolt */}
          <polygon points="215,20 162,130 220,130 115,280 158,165 105,165" fill={secondaryColor} />
          <polygon points="210,25 168,135 225,135 125,270 162,160 112,160" fill={`url(#${blueGlowId})`} />
          <polygon points="210,25 178,135 198,135 125,270 155,160 128,160" fill="#E0F7FF" opacity="0.35" />
        </g>
      )}

      {/* ==================== RIGHT TYPOGRAPHY ==================== */}
      {showText && (
        <g id="logo-text" transform="translate(410, 160)">
          {/* WORD 1 */}
          <text
            x="0"
            y="0"
            fontFamily={`'${fontFamily}', 'Montserrat', 'Arial Black', -apple-system, sans-serif`}
            fontSize={fontSize}
            fontWeight={fontWeight}
            fontStyle={fontStyle}
            letterSpacing={letterSpacing}
            fill={primaryColor}
          >
            {text1}
          </text>

          {/* WORD 2 */}
          <text
            x="0"
            y="95"
            fontFamily={`'${fontFamily}', 'Montserrat', 'Arial Black', -apple-system, sans-serif`}
            fontSize={fontSize}
            fontWeight={fontWeight}
            fontStyle={fontStyle}
            letterSpacing={letterSpacing}
            fill={accentColor}
          >
            {text2}
          </text>

          {/* Dynamic Double Underline Swooshes */}
          <path
            d="M 0 108 C 80 108, 140 125, 230 122 C 310 118, 355 106, 385 96 C 360 112, 290 130, 200 130 C 110 130, 50 112, 0 108 Z"
            fill={primaryColor}
          />
          <path
            d="M 140 122 C 175 145, 220 160, 275 152 C 330 144, 380 125, 410 105 C 385 128, 325 152, 250 148 C 190 145, 155 130, 140 122 Z"
            fill={accentColor}
          />
        </g>
      )}
    </svg>
  );
};

export default PakODriveLogo;
