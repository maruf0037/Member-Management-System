import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Phone, Mail, MapPin, CreditCard, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export default function Donate() {
  const { t } = useTranslation();

  return (
    <div className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-sidebar mb-4 tracking-tight">{t('donate.title')}</h1>
          <p className="text-text-muted max-w-2xl mx-auto">
            {t('donate.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Donation Info */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-2xl font-bold text-sidebar mb-6">{t('donate.howToDonate')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Card className="bg-white border-card-border shadow-none">
                  <CardHeader className="pb-2">
                    <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center text-pink-600 mb-2">
                      <CreditCard size={20} />
                    </div>
                    <CardTitle className="text-lg font-bold">bKash / Nagad</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-text-muted mb-2">Personal Number:</p>
                    <p className="text-lg font-bold text-sidebar">+880 1712-884433</p>
                    <p className="text-[10px] text-text-muted mt-2 uppercase tracking-wider">Reference: Donation</p>
                  </CardContent>
                </Card>

                <Card className="bg-white border-card-border shadow-none">
                  <CardHeader className="pb-2">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-2">
                      <CreditCard size={20} />
                    </div>
                    <CardTitle className="text-lg font-bold">Bank Transfer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Dutch-Bangla Bank</p>
                    <p className="text-sm font-bold text-sidebar">Zero Seven Foundation</p>
                    <p className="text-sm text-text-muted">A/C: 123.456.7890</p>
                    <p className="text-xs text-text-muted">Haragach Branch</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-sidebar mb-6">{t('donate.contactUs')}</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white border border-card-border rounded-xl">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Phone</p>
                    <p className="text-sm font-bold text-sidebar">+880 1712-884433</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white border border-card-border rounded-xl">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Email</p>
                    <p className="text-sm font-bold text-sidebar">info@zerosevenfoundation.org</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white border border-card-border rounded-xl">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Location</p>
                    <p className="text-sm font-bold text-sidebar">Haragach, Rangpur, Bangladesh</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="bg-white border-card-border shadow-xl h-full">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-sidebar">{t('donate.getInTouch')}</CardTitle>
                <CardDescription>
                  {t('donate.getInTouchDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('donate.fullName')}</Label>
                      <Input id="name" placeholder="John Doe" className="border-card-border" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('donate.email')}</Label>
                      <Input id="email" type="email" placeholder="john@example.com" className="border-card-border" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">{t('donate.subject')}</Label>
                    <Input id="subject" placeholder="How can we help?" className="border-card-border" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">{t('donate.message')}</Label>
                    <textarea 
                      id="message" 
                      rows={6} 
                      className="w-full rounded-md border border-card-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      placeholder="Your message here..."
                    ></textarea>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12">
                    <Send className="mr-2 h-4 w-4" />
                    {t('donate.sendMessage')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
