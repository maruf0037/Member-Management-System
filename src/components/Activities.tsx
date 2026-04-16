import React, { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '@/src/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Activity } from '@/src/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, DollarSign, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const q = query(collection(db, 'activities'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activitiesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
      setActivities(activitiesData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'activities');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Example data if no activities found
  const exampleActivities: Activity[] = [
    {
      id: 'ex1',
      title: 'Winter Clothing Distribution',
      description: 'Distributed warm clothes and blankets to over 200 families in Haragach during the severe cold wave.',
      date: '2024-01-15',
      location: 'Haragach High School Grounds',
      images: ['https://picsum.photos/seed/winter/800/600'],
      cost: 45000,
      status: 'Completed',
      createdAt: new Date()
    },
    {
      id: 'ex2',
      title: 'Free Medical Camp',
      description: 'A day-long medical camp providing free checkups and essential medicines for underprivileged residents.',
      date: '2023-11-20',
      location: 'Community Health Center',
      images: ['https://picsum.photos/seed/medical/800/600'],
      cost: 60000,
      status: 'Completed',
      createdAt: new Date()
    },
    {
      id: 'ex3',
      title: 'Scholarship for Meritorious Students',
      description: 'Providing financial aid to 10 students from low-income families to continue their higher education.',
      date: '2023-09-10',
      location: 'Foundation Office',
      images: ['https://picsum.photos/seed/education/800/600'],
      cost: 30000,
      status: 'Completed',
      createdAt: new Date()
    }
  ];

  const displayActivities = activities.length > 0 ? activities : exampleActivities;

  return (
    <div className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-sidebar mb-4 tracking-tight">{t('nav.activities')}</h1>
          <p className="text-text-muted max-w-2xl mx-auto">
            {t('home.ourActivities')}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white border-card-border rounded-xl shadow-none overflow-hidden hover:shadow-xl transition-all h-full flex flex-col">
                  <div className="relative h-56 overflow-hidden">
                    {activity.images && activity.images.length > 0 ? (
                      <img 
                        src={activity.images[0]} 
                        alt={activity.title} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <ImageIcon size={48} />
                      </div>
                    )}
                    <Badge className="absolute top-4 right-4 bg-primary text-white border-none font-bold">
                      {activity.status}
                    </Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
                      <Calendar size={14} className="text-primary" />
                      {activity.date}
                    </div>
                    <CardTitle className="text-xl font-bold text-sidebar leading-tight">
                      {activity.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-sm text-text-muted mb-6 line-clamp-3">
                      {activity.description}
                    </p>
                    <div className="mt-auto space-y-3 pt-4 border-t border-card-border">
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <MapPin size={14} className="text-primary" />
                        {activity.location}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-sidebar">
                        <DollarSign size={14} className="text-primary" />
                        Cost: ৳{activity.cost.toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
