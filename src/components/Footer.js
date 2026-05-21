export default function Footer() {
  return (
    <footer className="mt-auto py-8 bg-[var(--color-surface)] border-t border-[var(--color-tile)] flex flex-col items-center justify-center text-[var(--color-text-secondary)] text-sm">
      <div className="text-2xl font-black italic tracking-wider text-white mb-4 opacity-50">
        Stake
      </div>
      <div className="flex gap-6 mb-4 font-semibold">
        <a href="#" className="hover:text-white transition-colors">Games</a>
        <a href="#" className="hover:text-white transition-colors">Promotions</a>
        <a href="#" className="hover:text-white transition-colors">Support</a>
      </div>
      <p className="mb-2">&copy; {new Date().getFullYear()} Stake Clone. All rights reserved.</p>
      <p className="flex items-center gap-1 font-medium text-white/50 text-xs">
        created by love ❤️ enjoy playing
      </p>
    </footer>
  );
}
