import React, { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '@/src/firebase';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { Member, FinancialRecord, AppSettings } from '@/src/types';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  TrendingUp,
  ArrowUpRight,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Activity as ActivityIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [finances, setFinances] = useState<FinancialRecord[]>([]);
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qMembers = query(collection(db, 'members'), orderBy('createdDate', 'desc'));
    const unsubscribeMembers = onSnapshot(qMembers, (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member));
      setMembers(membersData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'members');
    });

    const qFinances = query(collection(db, 'finances'), orderBy('date', 'desc'));
    const unsubscribeFinances = onSnapshot(qFinances, (snapshot) => {
      const financesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinancialRecord));
      setFinances(financesData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'finances');
      setLoading(false);
    });

    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'finance'), (docSnap) => {
      if (docSnap.exists()) {
        setOpeningBalance(docSnap.data().openingBalance || 0);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/finance');
    });

    return () => {
      unsubscribeMembers();
      unsubscribeFinances();
      unsubscribeSettings();
    };
  }, []);

  const totalIncome = finances
    .filter(f => f.type === 'Income')
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const totalExpense = finances
    .filter(f => f.type === 'Expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netBalance = openingBalance + totalIncome - totalExpense;

  const stats = [
    { name: 'Total Balance', value: `৳${netBalance.toLocaleString()}`, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Total Income', value: `৳${totalIncome.toLocaleString()}`, icon: ArrowUpCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Total Expenses', value: `৳${totalExpense.toLocaleString()}`, icon: ArrowDownCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
    { name: 'Total Members', value: members.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const typeData = [
    { name: 'Life', value: members.filter(m => m.memberType === 'Life').length },
    { name: 'General', value: members.filter(m => m.memberType === 'General').length },
    { name: 'Associate', value: members.filter(m => m.memberType === 'Associate').length },
  ];

  const COLORS = ['#10b981', '#f59e0b', '#8b5cf6'];

  const recentMembers = members.slice(0, 5);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sidebar">Dashboard</h1>
          <p className="text-sm text-text-muted">Overview of members and finances</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white font-semibold px-6" asChild>
          <Link to="/admin/finances">
            <ArrowUpRight className="mr-2 h-4 w-4" />
            View Reports
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-white border-card-border rounded-lg shadow-none overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-bold text-text-muted uppercase tracking-[0.05em]">{stat.name}</p>
                  <div className={cn("p-2 rounded-md", stat.bg, "bg-opacity-10")}>
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-sidebar">
                    {stat.value.toLocaleString()}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Chart */}
        <Card className="lg:col-span-2 bg-white border-card-border rounded-lg shadow-none overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-sidebar">Membership Growth</CardTitle>
            <CardDescription className="text-text-muted">New members over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }} 
                  />
                  <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribution Chart */}
        <Card className="bg-white border-card-border rounded-lg shadow-none overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-sidebar">Member Types</CardTitle>
            <CardDescription className="text-text-muted">Distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {typeData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs font-medium text-text-muted">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Members */}
        <Card className="bg-white border-card-border rounded-lg shadow-none overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-bold text-sidebar">Recent Members</CardTitle>
              <CardDescription className="text-text-muted">Latest additions to the directory</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="border-card-border text-text-muted hover:text-text-main">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-background transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border border-card-border">
                      <AvatarImage src={member.photoUrl} />
                      <AvatarFallback className="bg-slate-100 text-sidebar font-bold">
                        {member.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold text-sidebar">{member.name}</p>
                      <p className="text-xs text-text-muted">{member.occupation}</p>
                    </div>
                  </div>
                  <Badge className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    member.memberType === 'Life' ? "bg-blue-50 text-blue-700 border-blue-100" :
                    member.memberType === 'General' ? "bg-slate-50 text-slate-700 border-slate-100" :
                    "bg-emerald-50 text-emerald-700 border-emerald-100"
                  )}>
                    {member.memberType}
                  </Badge>
                </div>
              ))}
              {recentMembers.length === 0 && (
                <div className="text-center py-8 text-text-muted">No members found.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Finances */}
        <Card className="bg-white border-card-border rounded-lg shadow-none overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-bold text-sidebar">Recent Transactions</CardTitle>
              <CardDescription className="text-text-muted">Latest income and expenses</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="border-card-border text-text-muted hover:text-text-main">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {finances.slice(0, 5).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-background transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2 rounded-md",
                      record.type === 'Income' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    )}>
                      {record.type === 'Income' ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-sidebar">{record.category}</p>
                      <p className="text-xs text-text-muted">{record.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-sm font-bold",
                      record.type === 'Income' ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {record.type === 'Income' ? '+' : '-'}৳{record.amount.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-text-muted truncate max-w-[100px]">{record.description}</p>
                  </div>
                </div>
              ))}
              {finances.length === 0 && (
                <div className="text-center py-8 text-text-muted">No transactions found.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
