/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			blink: {
  				'0%': {
  					opacity: '0.2'
  				},
  				'20%': {
  					opacity: '1'
  				},
  				'100%': {
  					opacity: '0.2'
  				}
  			},
  			float: {
  				'0%, 100%': { transform: 'translateY(0)' },
  				'50%': { transform: 'translateY(-20px)' },
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'blink': 'blink 1.4s infinite both',
  			'float': 'float 6s ease-in-out infinite',
  			'float-delayed': 'float 6s ease-in-out 2s infinite',
  			'float-slow': 'float 8s ease-in-out 1s infinite',
  		},
  		height: {
  			screen: ['100vh', '100dvh']
  		},
  		minHeight: {
  			screen: ['100vh', '100dvh']
  		}
  	}
  },
  plugins: [
  	require("tailwindcss-animate"),
  	require("daisyui"),
  	function({ addBase }) {
  		addBase({
  			":root": {
  				"--background": "0 0% 100%",
  				"--foreground": "224 71.4% 4.1%",
  				"--card": "0 0% 100%",
  				"--card-foreground": "224 71.4% 4.1%",
  				"--popover": "0 0% 100%",
  				"--popover-foreground": "224 71.4% 4.1%",
  				"--primary": "262.1 83.3% 57.8%",
  				"--primary-foreground": "210 20% 98%",
  				"--secondary": "220 14.3% 95.9%",
  				"--secondary-foreground": "220.9 39.3% 11%",
  				"--muted": "220 14.3% 95.9%",
  				"--muted-foreground": "220 8.9% 46.1%",
  				"--accent": "220 14.3% 95.9%",
  				"--accent-foreground": "220.9 39.3% 11%",
  				"--destructive": "0 84.2% 60.2%",
  				"--destructive-foreground": "210 20% 98%",
  				"--border": "220 13% 91%",
  				"--input": "220 13% 91%",
  				"--ring": "262.1 83.3% 57.8%",
  				"--radius": "0.5rem"
  			},
  			".dark": {
  				"--background": "224 71.4% 4.1%",
  				"--foreground": "210 20% 98%",
  				"--card": "224 71.4% 4.1%",
  				"--card-foreground": "210 20% 98%",
  				"--popover": "224 71.4% 4.1%",
  				"--popover-foreground": "210 20% 98%",
  				"--primary": "263.4 70% 50.4%",
  				"--primary-foreground": "210 20% 98%",
  				"--secondary": "215 27.9% 16.9%",
  				"--secondary-foreground": "210 20% 98%",
  				"--muted": "215 27.9% 16.9%",
  				"--muted-foreground": "217.9 10.6% 64.9%",
  				"--accent": "215 27.9% 16.9%",
  				"--accent-foreground": "210 20% 98%",
  				"--destructive": "0 62.8% 30.6%",
  				"--destructive-foreground": "210 20% 98%",
  				"--border": "215 27.9% 16.9%",
  				"--input": "215 27.9% 16.9%",
  				"--ring": "263.4 70% 50.4%"
  			}
  		});
  	},
  	function({ addComponents }) {
  		addComponents({
  			'.loading-dots': {
  				animation: 'blink 1.4s infinite both'
  			},
  			'.loading-dots span': {
  				animationDelay: '0.2s'
  			},
  			'.loading-dots span + span': {
  				animationDelay: '0.4s'
  			}
  		});
  	}
  ],
};
