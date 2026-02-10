'use client';

import {
  Linkedin,
  Instagram,
  Facebook
} from 'lucide-react';
import {useLocale} from '@/contexts/LocaleContext';

const Footer = () => {
  const {t} = useLocale();
 
  return (
    <footer className="bg-slate-900 text-white pt-8 pb-4 px-2 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-8">
          <div className="col-span-1">
            <h2 className="text-4xl font-bold mb-8">{t('footer.helpLive')}</h2>
            <div className="flex gap-4">
              <a className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all" href="#">
                <Linkedin className="h-4 w-4" />
              </a>
              <a className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all" href="#">
                <Instagram className="h-4 w-4" />
              </a>
              <a className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all" href="#">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-6">{t('footer.officeAddress')}</h4>
            <address className="not-italic text-lg opacity-80 leading-relaxed">
              PureMed Healthcare Solutions<br/>
              House #12, Road #5,<br/>
              Medical District, 1212,<br/>
              Global City
            </address>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-6">{t('footer.quickLinks')}</h4>
            <ul className="space-y-4 font-medium opacity-80">
              <li><a className="hover:text-primary transition-colors" href="#">{t('nav.aboutUs')}</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">{t('nav.services')}</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">{t('nav.doctors')}</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">{t('nav.appointments')}</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">{t('nav.blog')}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-6">{t('footer.contact')}</h4>
            <div className="mb-8">
              <p className="text-sm opacity-50 mb-2 font-bold uppercase">{t('footer.email')}</p>
              <a className="text-2xl font-bold hover:text-primary transition-colors tracking-tight" href="mailto:info@puremed.com">info@puremed.com</a>
            </div>
            <div>
              <p className="text-sm opacity-50 mb-2 font-bold uppercase">{t('footer.phone')}</p>
              <a className="text-2xl font-bold hover:text-primary transition-colors tracking-tight" href="tel:+12395550108">(239) 555-0108</a>
            </div>
          </div>
        </div>
        <div className="pt-4 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-sm opacity-50">
          <p>{t('footer.copyright')}</p>
          <div className="flex gap-8">
            <a className="hover:opacity-100 transition-opacity" href="#">{t('footer.privacy')}</a>
            <a className="hover:opacity-100 transition-opacity" href="#">{t('footer.terms')}</a>
            <a className="hover:opacity-100 transition-opacity" href="#">{t('footer.cookies')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
 
export default Footer;
