'use client';

import { motion } from 'framer-motion';
import { themes, themeList, ThemeName } from '@/lib/themes';
import { Check } from 'lucide-react';

interface ThemeSelectorProps {
    currentTheme: ThemeName;
    onThemeChange: (theme: ThemeName) => void;
}

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
    return (
        <div className="w-full">
            <h3 className="text-center text-xs font-bold text-white/50 mb-4 uppercase tracking-widest">
                Card Theme
            </h3>
            <div className="flex justify-center gap-3">
                {themeList.map((theme) => {
                    const isSelected = currentTheme === theme.name;
                    return (
                        <motion.button
                            key={theme.name}
                            onClick={() => onThemeChange(theme.name)}
                            className={`
                                relative w-12 h-12 rounded-xl overflow-hidden
                                border-2 transition-all duration-200
                                ${isSelected
                                    ? 'border-white shadow-lg shadow-white/20 scale-110'
                                    : 'border-white/20 hover:border-white/40 hover:scale-105'
                                }
                            `}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            title={theme.label}
                        >
                            {/* Gradient swatch */}
                            <div
                                className="absolute inset-0"
                                style={{
                                    background: `linear-gradient(135deg, ${theme.swatchPrimary} 0%, ${theme.swatchSecondary} 100%)`
                                }}
                            />

                            {/* Selected checkmark */}
                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute inset-0 flex items-center justify-center bg-black/30"
                                >
                                    <Check className="w-5 h-5 text-white drop-shadow-md" />
                                </motion.div>
                            )}
                        </motion.button>
                    );
                })}
            </div>
            <p className="text-center text-[10px] text-white/40 mt-3">
                {themes[currentTheme].label} Theme
            </p>
        </div>
    );
}
