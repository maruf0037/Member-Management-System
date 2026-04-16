import React, { useEffect, useState, useRef } from 'react';
import { db, handleFirestoreError, OperationType, auth } from '@/src/firebase';
import { collection, onSnapshot, query, orderBy, doc, setDoc, addDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { FinancialRecord, AppSettings } from '@/src/types';
import Papa from 'papaparse';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Download, ArrowUpCircle, ArrowDownCircle, Wallet, Settings as SettingsIcon, Upload, Loader2, UploadCloud, Landmark, Receipt, Info, CheckCircle, CreditCard, Calendar, Tags, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function Finances() {
  const [finances, setFinances] = useState<FinancialRecord[]>([]);
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Transaction Form State
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [type, setType] = useState<'Income' | 'Expense'>('Expense');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Opening Balance Form State
  const [isBalanceOpen, setIsBalanceOpen] = useState(false);
  const [newBalance, setNewBalance] = useState('');

  // Import State
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'finances'), orderBy('date', 'desc'));
    const unsubscribeFinances = onSnapshot(q, (snapshot) => {
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
      unsubscribeFinances();
      unsubscribeSettings();
    };
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setSubmitting(true);
    try {
      const record: Omit<FinancialRecord, 'id'> = {
        type,
        category,
        amount: Number(amount),
        date,
        description,
        recordedBy: auth.currentUser.uid,
        recordedAt: serverTimestamp() as any
      };
      
      await addDoc(collection(db, 'finances'), record);
      toast.success('Transaction added successfully');
      setIsTransactionOpen(false);
      // Reset form
      setCategory('');
      setAmount('');
      setDescription('');
    } catch (error) {
      toast.error('Failed to add transaction');
      handleFirestoreError(error, OperationType.CREATE, 'finances');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setSubmitting(true);
    try {
      await setDoc(doc(db, 'settings', 'finance'), {
        openingBalance: Number(newBalance),
        updatedBy: auth.currentUser.uid,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      toast.success('Opening balance updated');
      setIsBalanceOpen(false);
      setNewBalance('');
    } catch (error) {
      toast.error('Failed to update balance');
      handleFirestoreError(error, OperationType.UPDATE, 'settings/finance');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadTemplate = () => {
    const headers = ['type', 'category', 'amount', 'date', 'description'];
    const example = ['Expense', 'Office Rent', '5000', '2024-04-15', 'Monthly office rent'];
    const csv = headers.join(',') + '\n' + example.join(',');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finances_template.csv';
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
            if (!row.amount || !row.category || !row.type) continue;

            const docRef = doc(collection(db, 'finances'));
            
            const record = {
              type: row.type === 'Income' ? 'Income' : 'Expense',
              category: row.category,
              amount: Number(row.amount),
              date: row.date || new Date().toISOString().split('T')[0],
              description: row.description || '',
              recordedBy: auth.currentUser?.uid || 'system',
              recordedAt: serverTimestamp()
            };

            batch.set(docRef, record);
            count++;
          }

          if (count > 0) {
            await batch.commit();
            toast.success(`Successfully imported ${count} financial records`);
            setIsImportOpen(false);
          } else {
            toast.error('No valid records found in CSV.');
          }
        } catch (error) {
          toast.error('Failed to import finances');
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

  const totalIncome = finances
    .filter(f => f.type === 'Income')
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const totalExpense = finances
    .filter(f => f.type === 'Expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netBalance = openingBalance + totalIncome - totalExpense;

  const filteredFinances = finances.filter(f => 
    f.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sidebar">Financial Reports</h1>
          <p className="text-sm text-text-muted">Transparent income and expense tracking</p>
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
                <DialogTitle className="text-2xl font-bold text-sidebar">Import Finances</DialogTitle>
                <DialogDescription className="text-text-muted mt-2">
                  Upload a CSV file to bulk import income and expense records.
                </DialogDescription>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                     <Info className="h-4 w-4 text-blue-600" />
                    <h4 className="font-semibold text-sm text-blue-900">Format Guidelines</h4>
                  </div>
                  <ul className="text-xs text-blue-800 space-y-2">
                    <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 mt-0.5 text-blue-500 shrink-0" /> Download the template to see the required columns.</li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 mt-0.5 text-blue-500 shrink-0" /> <strong>type</strong>, <strong>category</strong>, and <strong>amount</strong> are mandatory.</li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 mt-0.5 text-blue-500 shrink-0" /> Type must be: Income or Expense.</li>
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

          <Dialog open={isBalanceOpen} onOpenChange={setIsBalanceOpen}>
            <DialogTrigger render={<Button variant="outline" className="border-card-border cursor-pointer" />}>
              <SettingsIcon className="mr-2 h-4 w-4" />
              Set Opening Balance
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-slate-50 px-6 py-6 border-b border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center shrink-0">
                  <Landmark className="h-6 w-6 text-slate-700" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-sidebar">Opening Balance</DialogTitle>
                  <DialogDescription className="text-text-muted mt-1">
                    Set the initial foundation balance.
                  </DialogDescription>
                </div>
              </div>
              <form onSubmit={handleUpdateBalance} className="p-6 space-y-6">
                <div className="space-y-3">
                  <Label className="text-xs font-bold text-text-muted uppercase tracking-wider text-center block">Amount (৳)</Label>
                  <Input 
                    type="number" 
                    required 
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    placeholder="0.00"
                    className="h-16 text-center text-3xl font-bold bg-slate-50 border-slate-200 focus-visible:ring-primary/20"
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-base font-bold" disabled={submitting}>
                  {submitting ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...</>
                  ) : (
                    'Save Balance'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isTransactionOpen} onOpenChange={setIsTransactionOpen}>
            <DialogTrigger render={<Button className="bg-primary hover:bg-primary/90 text-white font-bold cursor-pointer" />}>
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-primary/5 px-6 py-6 border-b border-primary/10 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <Receipt className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-sidebar">Add Transaction</DialogTitle>
                  <DialogDescription className="text-text-muted mt-1">
                    Record a new income or expense.
                  </DialogDescription>
                </div>
              </div>
              <form onSubmit={handleAddTransaction} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-text-muted uppercase tracking-wider">Type</Label>
                      <Select value={type} onValueChange={(v: any) => setType(v)}>
                        <SelectTrigger className={cn("h-12 border-slate-200 font-semibold", type === 'Income' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200')}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Income" className="text-emerald-700 font-medium">Income</SelectItem>
                          <SelectItem value="Expense" className="text-rose-700 font-medium">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-text-muted uppercase tracking-wider">Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="pl-10 h-12 bg-slate-50 border-slate-200" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-text-muted uppercase tracking-wider">Category</Label>
                    <div className="relative">
                      <Tags className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input required placeholder="e.g., Social Work, Office Rent, Donation" value={category} onChange={(e) => setCategory(e.target.value)} className="pl-10 h-12 bg-slate-50 border-slate-200" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-text-muted uppercase tracking-wider">Amount (৳)</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input type="number" required min="0" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="pl-10 h-12 bg-slate-50 border-slate-200 font-semibold" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-text-muted uppercase tracking-wider">Description</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Textarea required placeholder="Details about this transaction..." value={description} onChange={(e) => setDescription(e.target.value)} className="pl-10 min-h-[100px] bg-slate-50 border-slate-200 resize-none" />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full h-12 text-base font-bold" disabled={submitting}>
                    {submitting ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...</>
                    ) : (
                      'Save Transaction'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border-card-border shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                <Wallet size={20} />
              </div>
              <Badge className="bg-slate-100 text-slate-700 border-none">Opening</Badge>
            </div>
            <h3 className="text-2xl font-bold text-sidebar">৳{openingBalance.toLocaleString()}</h3>
            <p className="text-xs text-text-muted mt-1">Initial Balance</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-card-border shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <ArrowUpCircle size={20} />
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border-none">Income</Badge>
            </div>
            <h3 className="text-2xl font-bold text-emerald-600">৳{totalIncome.toLocaleString()}</h3>
            <p className="text-xs text-text-muted mt-1">Total collections</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-card-border shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                <ArrowDownCircle size={20} />
              </div>
              <Badge className="bg-rose-50 text-rose-700 border-none">Expenses</Badge>
            </div>
            <h3 className="text-2xl font-bold text-rose-600">৳{totalExpense.toLocaleString()}</h3>
            <p className="text-xs text-text-muted mt-1">Total spent</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-card-border shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Wallet size={20} />
              </div>
              <Badge className="bg-blue-50 text-blue-700 border-none">Current</Badge>
            </div>
            <h3 className="text-2xl font-bold text-blue-600">৳{netBalance.toLocaleString()}</h3>
            <p className="text-xs text-text-muted mt-1">Available Funds</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="bg-white border-card-border rounded-lg shadow-none overflow-hidden">
        <CardHeader className="border-b border-card-border pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted h-4 w-4" />
              <Input 
                placeholder="Search transactions..." 
                className="pl-10 bg-slate-50 border-card-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-card-border hover:bg-transparent">
                <TableHead className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Category</TableHead>
                <TableHead className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Description</TableHead>
                <TableHead className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Type</TableHead>
                <TableHead className="text-[11px] font-bold text-text-muted uppercase tracking-wider text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFinances.map((record) => (
                <TableRow key={record.id} className="border-card-border hover:bg-slate-50/50 transition-colors">
                  <TableCell className="text-sm text-sidebar font-medium">{record.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-card-border text-text-muted font-normal">
                      {record.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-text-muted max-w-xs truncate">
                    {record.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {record.type === 'Income' ? (
                        <ArrowUpCircle size={14} className="text-emerald-500" />
                      ) : (
                        <ArrowDownCircle size={14} className="text-rose-500" />
                      )}
                      <span className={cn(
                        "text-xs font-bold uppercase tracking-wider",
                        record.type === 'Income' ? "text-emerald-600" : "text-rose-600"
                      )}>
                        {record.type}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      "text-sm font-bold",
                      record.type === 'Income' ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {record.type === 'Income' ? '+' : '-'}৳{record.amount.toLocaleString()}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {filteredFinances.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-text-muted">
                    {loading ? 'Loading transactions...' : 'No transaction records found.'}
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
