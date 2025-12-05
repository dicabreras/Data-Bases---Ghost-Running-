export const theme = {
	colors: {
		background: '#000000',
		surface: '#1a1a1a',
		primary: '#FF6B00',
		textPrimary: '#FFFFFF',
		textSecondary: '#888888',
		border: '#1a1a1a'
	},
	spacing: {
		xs: 4,
		s: 8,
		m: 12,
		l: 16,
		xl: 20,
		xxl: 24
	},
	radii: {
		s: 8,
		m: 12,
		l: 15,
		full: 999
	},
	typography: {
		size: {
			s: 12,
			m: 14,
			l: 16,
			xl: 20,
			xxl: 24
		},
		weight: {
			regular: '400' as const,
			semibold: '600' as const,
			bold: '700' as const
		}
	}
};
