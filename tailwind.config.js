/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				violet: {
					DEFAULT: '#7c3aed',
					light: '#a78bfa',
					dark: '#6d28d9'
				},
				lime: {
					DEFAULT: '#84cc16',
					light: '#a3e635',
					dark: '#65a30d'
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
				forest: {
					DEFAULT: '#064E3B',
					light: '#10B981'
				},
				ink: {
					dark: '#0d0820',
					surface: '#120e2e',
					card: '#1a1535'
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
				'mesh-violet': 'radial-gradient(ellipse 80% 60% at 5% 0%, rgba(124,58,237,0.25) 0%, transparent 55%)'
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
				violet: '0 0 30px rgba(124,58,237,0.35)',
				lime: '0 0 20px rgba(132,204,22,0.3)',
				amber: '0 0 20px rgba(245,158,11,0.3)'
			}
		}
	},
	plugins: []
};
