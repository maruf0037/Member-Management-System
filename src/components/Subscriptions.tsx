import React, { useEffect, useState, useRef } from 'react';
import { db, handleFirestoreError, OperationType, auth } from '@/src/firebase';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import { Subscription, Member, FinancialRecord } from '@/src/types';
import Papa from 'papaparse';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Download, Upload, Loader2, UploadCloud, Receipt, Info, CheckCircle, CreditCard, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  // Import State
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const qSubs = query(collection(db, 'subscriptions'), orderBy('recordedAt', 'desc'));
    const unsubscribeSubs = onSnapshot(qSubs, (snapshot) => {
      const subsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subscription));
      setSubscriptions(subsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'subscriptions');
    });

    const qMembers = query(collection(db, 'members'), orderBy('name', 'asc'));
    const unsubscribeMembers = onSnapshot(qMembers, (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member));
      setMembers(membersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'members');
      setLoading(false);
    });

    return () => {
      unsubscribeSubs();
      unsubscribeMembers();
    };
  }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    const member = members.find(m => m.id === selectedMemberId);
    if (!member) {
      toast.error('Please select a member');
      return;
    }

    setSubmitting(true);
    try {
      const subRecord: Omit<Subscription, 'id'> = {
        memberId: member.memberId || member.id || '',
        memberName: member.name,
        month,
        year,
        amount: Number(amount),
        paymentDate,
        status: 'Paid',
        recordedBy: auth.currentUser.uid,
        recordedAt: serverTimestamp() as any
      };
      
      // 1. Add subscription record
      const subRef = await addDoc(collection(db, 'subscriptions'), subRecord);

      // 2. Add financial record (Income)
      const finRecord: Omit<FinancialRecord, 'id'> = {
        type: 'Income',
        category: 'Subscription',
        amount: Number(amount),
        date: paymentDate,
        description: `Monthly fee for ${new Date(0, month - 1).toLocaleString('default', { month: 'long' })} ${year} - ${member.name}`,
        referenceId: subRef.id,
        recordedBy: auth.currentUser.uid,
        recordedAt: serverTimestamp() as any
      };
      await addDoc(collection(db, 'finances'), finRecord);

      toast.success('Payment recorded successfully');
      setIsFormOpen(false);
      setAmount('');
    } catch (error) {
      toast.error('Failed to record payment');
      handleFirestoreError(error, OperationType.CREATE, 'subscriptions');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadTemplate = () => {
    const headers = ['memberId', 'memberName', 'month', 'year', 'amount', 'paymentDate', 'status'];
    const example = ['001', 'John Doe', '4', '2024', '500', '2024-04-15', 'Paid'];
    const csv = headers.join(',') + '\n' + example.join(',');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscriptions_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const batch = writeBatch(db);
          let count = 0;
          
          for (const row of results.data as any[]) {
            if (!row.amount || !row.month || !row.year) continue;

            // Try to find member to ensure consistency, but fallback to CSV data
            const member = members.find(m => m.memberId === row.memberId || m.name === row.memberName);
            
            const subDocRef = doc(collection(db, 'subscriptions'));
            const finDocRef = doc(collection(db, 'finances'));
            
            const subRecord = {
              memberId: member?.id || member?.memberId || row.memberId || '',
              memberName: member?.name || row.memberName || 'Unknown',
              month: Number(row.month),
              year: Number(row.year),
              amount: Number(row.amount),
              paymentDate: row.paymentDate || new Date().toISOString().split('T')[0],
              status: row.status === 'Due' ? 'Due' : 'Paid',
              recordedBy: auth.currentUser?.uid || 'system',
              recordedAt: serverTimestamp()
            };

            batch.set(subDocRef, subRecord);

            if (subRecord.status === 'Paid') {
              const finRecord = {
                type: 'Income',
                category: 'Subscription',
                amount: Number(row.amount),
                date: subRecord.paymentDate,
                description: `Monthly fee for ${new Date(0, subRecord.month - 1).toLocaleString('default', { month: 'long' })} ${subRecord.year} - ${subRecord.memberName}`,
                referenceId: subDocRef.id,
                recordedBy: auth.currentUser?.uid || 'system',
                recordedAt: serverTimestamp()
              };
              batch.set(finDocRef, finRecord);
            }
            
            count++;
          }

          if (count > 0) {
            await batch.commit();
            toast.success(`Successfully imported ${count} subscription records`);
            setIsImportOpen(false);
          } else {
            toast.error('No valid records found in CSV.');
          }
        } catch (error) {
          toast.error('Failed to import subscriptions');
          console.error(error);
        } finally {
          setUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      },
      error: (error) => {
        toast.error(`Error parsing CSV: ${error.message}`);
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
  };

  const filteredSubs = subscriptions.filter(sub => 
    sub.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.memberId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sidebar">Subscription Tracking</h1>
          <p className="text-sm text-text-muted">Manage monthly fee payments and dues</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger render={<Button variant="outline" className="border-card-border text-text-muted hover:text-text-main cursor-pointer" />}>
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-primary/5 px-6 py-8 text-center border-b border-primary/10">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <UploadCloud className="h-6 w-6 text-primary" />
                </div>
                <DialogTitle className="text-2xl font-bold text-sidebar">Import Subscriptions</DialogTitle>
                <DialogDescription className="text-text-muted mt-2">
                  Upload a CSV file to bulk import subscription payments.
                </DialogDescription>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="h-4 w-4 text-blue-600" />
                    <h4 className="font-semibold text-sm text-blue-900">Format Guidelines</h4>
                  </div>
                  <ul className="text-xs text-blue-800 space-y-2">
                    <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 mt-0.5 text-blue-500 shrink-0" /> <strong>month</strong>, <strong>year</strong>, and <strong>amount</strong> are mandatory.</li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 mt-0.5 text-blue-500 shrink-0" /> Status must be: Paid or Due.</li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 mt-0.5 text-blue-500 shrink-0" /> Importing "Paid" subscriptions will automatically add them to Finances as Income.</li>
                  </ul>
                  <Button variant="link" className="px-0 text-blue-600 h-auto mt-3 font-semibold hover:text-blue-700" onClick={downloadTemplate}>
                    Download CSV Template
                  </Button>
                </div>
                
                <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                
                <div 
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
                    uploading ? "border-slate-200 bg-slate-50 opacity-70 cursor-not-allowed" : "border-slate-300 hover:border-primary hover:bg-primary/5 cursor-pointer"
                  )}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                      <p className="text-sm font-bold text-sidebar">Importing Data...</p>
                      <p className="text-xs text-text-muted mt-1">Please wait while we process your file</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="h-8 w-8 text-slate-400 mb-3" />
                      <p className="text-sm font-bold text-sidebar">Click to select CSV file</p>
                      <p className="text-xs text-text-muted mt-1">Maximum file size: 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="border-card-border">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger render={<Button className="bg-primary hover:bg-primary/90 text-white font-bold cursor-pointer" />}>
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-primary/5 px-6 py-6 border-b border-primary/10 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <Receipt className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-sidebar">Record Payment</DialogTitle>
                  <DialogDescription className="text-text-muted mt-1">
                    Add a new subscription payment for a member.
                  </DialogDescription>
                </div>
              </div>
              <form onSubmit={handleRecordPayment} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-text-muted uppercase tracking-wider">Select Member</Label>
                    <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                      <SelectTrigger className="h-12 bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Search and select a member..." />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map(m => (
                          <SelectItem key={m.id} value={m.id || ''}>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{m.name}</span>
                              <span className="text-xs text-text-muted">({m.memberId || 'No ID'})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-text-muted uppercase tracking-wider">Month</Label>
                      <Select value={month.toString()} onValueChange={(v) => setMonth(Number(v))}>
                        <SelectTrigger className="h-12 bg-slate-50 border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {new Date(0, i).toLocaleString('default', { month: 'long' })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-text-muted uppercase tracking-wider">Year</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input type="number" required value={year} onChange={(e) => setYear(Number(e.target.value))} className="pl-10 h-12 bg-slate-50 border-slate-200" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-text-muted uppercase tracking-wider">Amount (৳)</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input type="number" required min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="pl-10 h-12 bg-slate-50 border-slate-200 font-semibold" placeholder="0.00" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-text-muted uppercase tracking-wider">Payment Date</Label>
                      <Input type="date" required value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="h-12 bg-slate-50 border-slate-200" />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full h-12 text-base font-bold" disabled={submitting}>
                    {submitting ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                    ) : (
                      'Confirm Payment'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-white border-card-border rounded-lg shadow-none overflow-hidden">
        <CardHeader className="border-b border-card-border pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted h-4 w-4" />
              <Input 
                placeholder="Search by member name or ID..." 
                className="pl-10 bg-slate-50 border-card-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-text-muted">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-card-border hover:bg-transparent">
                <TableHead className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Member</TableHead>
                <TableHead className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Period</TableHead>
                <TableHead className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Amount</TableHead>
                <TableHead className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-[11px] font-bold text-text-muted uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubs.map((sub) => (
                <TableRow key={sub.id} className="border-card-border hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-sidebar">{sub.memberName}</span>
                      <span className="text-[10px] text-text-muted uppercase tracking-tighter">ID: {sub.memberId}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-sidebar">
                      {new Date(0, sub.month - 1).toLocaleString('default', { month: 'long' })} {sub.year}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-bold text-sidebar">৳{sub.amount.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-text-muted">{sub.paymentDate}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      sub.status === 'Paid' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"
                    )}>
                      {sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-primary font-bold">Details</Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSubs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-text-muted">
                    {loading ? 'Loading subscriptions...' : 'No subscription records found.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
