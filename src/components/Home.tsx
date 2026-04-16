import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { Heart, Users, Target, History, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-sidebar">
        <div className="absolute inset-0 opacity-30">
          <img 
            src="https://picsum.photos/seed/foundation-hero/1920/1080" 
            alt="Foundation" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-32 h-32 bg-white rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-2xl p-4">
              {/* Placeholder for the logo provided in image */}
              <div className="text-sidebar font-black text-4xl">07</div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              {t('home.title')}
            </h1>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('home.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8 text-lg" asChild>
                <Link to="/donate">{t('home.supportCause')}</Link>
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-sidebar h-12 px-8 text-lg" asChild>
                <Link to="/activities">{t('home.ourActivities')}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-sidebar mb-8 flex items-center gap-3">
                <Target className="text-primary" />
                {t('home.missionVision')}
              </h2>
              <div className="space-y-8">
                <div className="p-6 bg-slate-50 rounded-xl border border-card-border">
                  <h3 className="font-bold text-xl mb-3 text-sidebar">{t('home.mission')}</h3>
                  <p className="text-text-muted leading-relaxed">
                    {t('home.missionText')}
                  </p>
                </div>
                <div className="p-6 bg-slate-50 rounded-xl border border-card-border">
                  <h3 className="font-bold text-xl mb-3 text-sidebar">{t('home.vision')}</h3>
                  <p className="text-text-muted leading-relaxed">
                    {t('home.visionText')}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://picsum.photos/seed/mission/800/600" 
                alt="Mission" 
                className="rounded-2xl shadow-xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-6 -left-6 bg-primary text-white p-8 rounded-2xl shadow-lg hidden lg:block">
                <p className="text-4xl font-bold mb-1">100+</p>
                <p className="text-sm font-medium opacity-80">{t('home.projectsCompleted')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-sidebar mb-12 flex items-center justify-center gap-3">
            <History className="text-primary" />
            {t('home.storyTitle')}
          </h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-text-muted leading-relaxed mb-8">
              {t('home.storyP1')}
            </p>
            <p className="text-lg text-text-muted leading-relaxed mb-12">
              {t('home.storyP2')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4">
                  <Users className="text-primary" />
                </div>
                <h4 className="font-bold text-sidebar">{t('home.batch')}</h4>
                <p className="text-xs text-text-muted">{t('home.foundation')}</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4">
                  <Heart className="text-primary" />
                </div>
                <h4 className="font-bold text-sidebar">{t('home.socialWelfare')}</h4>
                <p className="text-xs text-text-muted">{t('home.purpose')}</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4">
                  <Target className="text-primary" />
                </div>
                <h4 className="font-bold text-sidebar">{t('home.haragach')}</h4>
                <p className="text-xs text-text-muted">{t('home.roots')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">{t('home.joinJourney')}</h2>
          <p className="text-white/80 mb-10 max-w-xl mx-auto">
            {t('home.joinText')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="bg-white text-primary hover:bg-slate-100 font-bold h-12 px-8" asChild>
              <Link to="/donate">{t('home.donateNow')}</Link>
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white/10 h-12 px-8" asChild>
              <Link to="/activities">{t('home.viewWork')} <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
