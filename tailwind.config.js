/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				primary: {
					DEFAULT: '#16a34a', // Forest Green
					light: '#4ade80',
					dark: '#166534'
				},
				secondary: {
					DEFAULT: '#ea580c', // Vibrant Orange
					light: '#f97316',
					surface: '#fff7ed'
				},
				accent: {
					DEFAULT: '#ea580c', // Orange accent
					light: '#f97316'
				},
				/* Legacy aliases — kept so existing Tailwind classes don't break */
				violet: {
					DEFAULT: '#16a34a', // → Forest Green
					light: '#4ade80',
					dark: '#166534'
				},
				lime: {
					DEFAULT: '#ea580c', // → Vibrant Orange
					light: '#f97316',
					dark: '#c2410c'
				},
				/* Brand greens */
				forest: {
					DEFAULT: '#166534',
					light: '#16a34a',
					bright: '#4ade80'
				},
				/* Brand oranges */
				orange: {
					DEFAULT: '#ea580c',
					light: '#f97316',
					bright: '#fb923c'
				},
				amber: {
					DEFAULT: '#f59e0b',
					light: '#fcd34d',
					dark: '#d97706'
				},
				rose: {
					DEFAULT: '#e11d48',
					light: '#fb7185'
				},
				ink: {
					dark: '#071a0d',
					surface: '#0a2010',
					card: '#0f2d16'
				}
			},
			fontFamily: {
				display: ['"DM Serif Display"', 'serif'],
				body: ['"DM Sans"', 'sans-serif'],
				mono: ['"JetBrains Mono"', 'monospace'],
				title: ['"Bebas Neue"', 'cursive']
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'mesh-green': 'radial-gradient(ellipse 80% 60% at 5% 0%, rgba(22,163,74,0.18) 0%, transparent 55%)',
				'mesh-orange': 'radial-gradient(ellipse 60% 50% at 95% 100%, rgba(234,88,12,0.12) 0%, transparent 55%)'
			},
			animation: {
				float: 'float 4s ease-in-out infinite',
				'float-2': 'float 5s ease-in-out infinite 1.5s',
				drift: 'drift 14s ease-in-out infinite alternate',
				blink: 'blink 2s ease-in-out infinite',
				'fade-up': 'fadeUp 0.65s cubic-bezier(0.4,0,0.2,1) forwards',
				shimmer: 'shimmer 3s linear infinite'
			},
			keyframes: {
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-8px)' }
				},
				drift: {
					'0%': { transform: 'translate(0,0)' },
					'100%': { transform: 'translate(30px,20px) scale(1.08)' }
				},
				blink: {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.3' }
				},
				fadeUp: {
					from: { opacity: '0', transform: 'translateY(24px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				shimmer: {
					from: { backgroundPosition: '-200% center' },
					to: { backgroundPosition: '200% center' }
				}
			},
			boxShadow: {
				green: '0 0 30px rgba(22,163,74,0.35)',
				orange: '0 0 20px rgba(234,88,12,0.3)',
				amber: '0 0 20px rgba(245,158,11,0.3)'
			}
		}
	},
	plugins: []
};
