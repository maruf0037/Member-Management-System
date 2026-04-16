import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Menu, X, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'bn' : 'en';
    i18n.changeLanguage(newLang);
  };

  const navLinks = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.activities'), href: '/activities' },
    { name: t('nav.donate'), href: '/donate' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-card-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2">
                <img src="/logo.png" alt="Zero Seven Foundation" className="w-10 h-10 object-contain bg-white rounded-lg p-1" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold hidden">
                  07
                </div>
                <span className="text-xl font-bold text-sidebar hidden sm:block">Zero Seven Foundation</span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm font-medium text-text-muted hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex items-center gap-3 ml-4">
                <Button variant="ghost" size="sm" onClick={toggleLanguage} className="text-text-muted hover:text-primary">
                  <Globe className="mr-2 h-4 w-4" />
                  {i18n.language === 'en' ? 'বাংলা' : 'English'}
                </Button>
                <Button variant="ghost" asChild size="sm">
                  <Link to="/login">{t('nav.memberLogin')}</Link>
                </Button>
                <Button className="bg-primary hover:bg-primary/90 text-white font-bold" size="sm" asChild>
                  <Link to="/donate">
                    <Heart className="mr-2 h-4 w-4" />
                    {t('nav.donate')}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-card-border p-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="block text-base font-medium text-text-muted hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 flex flex-col gap-3 border-t border-card-border">
              <Button variant="outline" onClick={() => { toggleLanguage(); setIsMenuOpen(false); }} className="w-full">
                <Globe className="mr-2 h-4 w-4" />
                {i18n.language === 'en' ? 'বাংলা' : 'English'}
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>{t('nav.memberLogin')}</Link>
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-white font-bold w-full" asChild>
                <Link to="/donate" onClick={() => setIsMenuOpen(false)}>
                  <Heart className="mr-2 h-4 w-4" />
                  {t('nav.donate')}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-sidebar text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-xl font-bold mb-4">Zero Seven Foundation</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {t('footer.desc')}
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">{t('footer.quickLinks')}</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/" className="hover:text-white">{t('nav.home')}</Link></li>
                <li><Link to="/activities" className="hover:text-white">{t('nav.activities')}</Link></li>
                <li><Link to="/donate" className="hover:text-white">{t('nav.donate')}</Link></li>
                <li><Link to="/login" className="hover:text-white">{t('nav.memberLogin')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">{t('footer.contactUs')}</h4>
              <p className="text-sm text-slate-400">
                Haragach, Rangpur, Bangladesh<br />
                Email: info@zerosevenfoundation.org<br />
                Phone: +880 1712-884433
              </p>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} {t('footer.rights')}
          </div>
        </div>
      </footer>
    </div>
  );
}
