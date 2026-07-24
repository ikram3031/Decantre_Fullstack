// src/utils/theme.js

export const themes = {
  dark: {
    name: 'Luxury Dark',
    bg: 'bg-[#050505]',
    containerBg: 'bg-[#0a0a0a]',
    text: 'text-[#f5f5f5]',
    textMuted: 'text-[#a0a0a0]',
    primaryGold: '#C5A059',
    secondaryColor: '#1A1A1A',
    borderColor: 'border-[#C5A059]/25',
    button: {
      primary: 'bg-[#C5A059] text-[#050505] hover:bg-[#b59049] border border-[#C5A059]',
      secondary: 'bg-[#1a1a1a] text-[#C5A059] hover:bg-[#2a2a2a] border border-[#C5A059]/20',
      outline: 'bg-transparent text-[#C5A059] border border-[#C5A059] hover:bg-[#C5A059]/10',
      ghost: 'bg-transparent text-[#C5A059] hover:bg-[#C5A059]/5 border border-transparent'
    }
  },
  light: {
    name: 'Luxury Light',
    bg: 'bg-[#FAF9F6]',
    containerBg: 'bg-[#ffffff]',
    text: 'text-[#1c1a17]',
    textMuted: 'text-[#706a5e]',
    primaryGold: '#9A7B3E',
    secondaryColor: '#E8E6E1',
    borderColor: 'border-[#9A7B3E]/25',
    button: {
      primary: 'bg-[#9A7B3E] text-[#ffffff] hover:bg-[#856730] border border-[#9A7B3E]',
      secondary: 'bg-[#e8e6e1] text-[#9A7B3E] hover:bg-[#dedcd6] border border-[#9A7B3E]/20',
      outline: 'bg-transparent text-[#9A7B3E] border border-[#9A7B3E] hover:bg-[#9A7B3E]/8',
      ghost: 'bg-transparent text-[#9A7B3E] hover:bg-[#9A7B3E]/4 border border-transparent'
    }
  }
};
