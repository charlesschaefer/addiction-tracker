import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

export const AppTheme = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{purple.50}',
            100: '{purple.100}',
            200: '{purple.200}',
            300: '{purple.300}',
            400: '{purple.400}',
            500: '{purple.500}',
            600: '{purple.600}',
            700: '{purple.700}',
            800: '{purple.800}',
            900: '{purple.900}',
            950: '{purple.950}'
        }
    },
    components: {
        menu: {
            colorScheme: {
                light: {
                    submenuLabel: {
                        color: '{text.muted.color}'
                    }
                }
            }
        },
        inputtext: {
            root: {
                sm: {
                    fontSize: '0.8rem'
                }
            }
        }
    }
});
