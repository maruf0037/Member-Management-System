import React, { useEffect, useState, useRef } from 'react';
import { db, handleFirestoreError, OperationType, auth } from '@/src/firebase';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { Member } from '@/src/types';
import Papa from 'papaparse';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye,
  Download,
  Plus,
  Upload,
  Loader2
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/src/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function MemberList() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'members'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member));
      setMembers(membersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'members');
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await deleteDoc(doc(db, 'members', id));
        toast.success('Member deleted successfully');
      } catch (error) {
        toast.error('Failed to delete member');
        handleFirestoreError(error, OperationType.DELETE, `members/${id}`);
      }
    }
  };

  const downloadTemplate = () => {
    const headers = [
      'memberId', 'memberType', 'name', 'fathersName', 'mothersName', 
      'mobileNo', 'emailAddress', 'bloodGroup', 'gender', 'designation', 
      'committee', 'occupation', 'installationDate', 'monthlyFee', 
      'presentAddress', 'permanentAddress', 'businessAddress'
    ];
    const example = [
      '001', 'General', 'John Doe', 'Father Name', 'Mother Name', 
      '01700000000', 'john@example.com', 'O+', 'Male', 'Member', 
      'Executive', 'Business', '2024-01-01', '500', 
      'Dhaka', 'Dhaka', 'Dhaka'
    ];
    
    const csv = headers.join(',') + '\n' + example.join(',');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'member_template.csv';
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
            // Basic validation
            if (!row.name || !row.mobileNo) continue;

            const docRef = doc(collection(db, 'members'));
            
            const memberData: any = {
              memberId: row.memberId || '',
              memberType: ['Life', 'General', 'Associate'].includes(row.memberType) ? row.memberType : 'General',
              name: row.name,
              fathersName: row.fathersName || '',
              mothersName: row.mothersName || '',
              mobileNo: row.mobileNo,
              emailAddress: row.emailAddress || '',
              bloodGroup: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(row.bloodGroup) ? row.bloodGroup : 'O+',
              gender: ['Male', 'Female', 'Other'].includes(row.gender) ? row.gender : 'Male',
              designation: row.designation || '',
              committee: row.committee || '',
              occupation: row.occupation || 'N/A',
              installationDate: row.installationDate || new Date().toISOString().split('T')[0],
              isDeceased: false,
              presentAddress: row.presentAddress || 'N/A',
              permanentAddress: row.permanentAddress || 'N/A',
              businessAddress: row.businessAddress || 'N/A',
              monthlyFee: Number(row.monthlyFee) || 500,
              joinDate: new Date().toISOString().split('T')[0],
              createdBy: auth.currentUser?.uid || 'system',
              createdDate: serverTimestamp()
            };

            batch.set(docRef, memberData);
            count++;
          }

          if (count > 0) {
            await batch.commit();
            toast.success(`Successfully imported ${count} members`);
            setIsImportOpen(false);
          } else {
            toast.error('No valid members found in CSV. Please check the template.');
          }
        } catch (error) {
          toast.error('Failed to import members');
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

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.emailAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.mobileNo.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sidebar">Member Directory</h1>
          <p className="text-sm text-text-muted">Schema: [Management].[MembersInfo]</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger render={<Button variant="outline" className="border-card-border text-text-muted hover:text-text-main cursor-pointer" />}>
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Members from CSV</DialogTitle>
                <DialogDescription>
                  Upload a CSV file to bulk import members. Make sure your file matches the required format.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-card-border">
                  <h4 className="font-semibold text-sm mb-2">Instructions:</h4>
                  <ul className="text-xs text-text-muted space-y-1 list-disc list-inside">
                    <li>Download the template to see the required columns.</li>
                    <li><strong>Name</strong> and <strong>Mobile No</strong> are mandatory.</li>
                    <li>Member Type must be: Life, General, or Associate.</li>
                    <li>Blood Group must be: A+, A-, B+, B-, AB+, AB-, O+, O-.</li>
                  </ul>
                  <Button 
                    variant="link" 
                    className="px-0 text-primary h-auto mt-2"
                    onClick={downloadTemplate}
                  >
                    Download CSV Template
                  </Button>
                </div>
                
                <input 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <Button 
                  className="w-full" 
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Select CSV File
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" className="border-card-border text-text-muted hover:text-text-main">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button 
            onClick={() => navigate('/admin/members/add')}
            className="bg-primary hover:bg-primary/90 text-white font-semibold"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Member
          </Button>
        </div>
      </div>

      <div className="bg-white border border-card-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-card-border bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Search members by name, mobile, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-card-border focus-visible:ring-primary"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="border-card-border hover:bg-transparent">
                <TableHead className="text-[11px] font-bold text-text-muted uppercase tracking-wider py-4">Member Name</TableHead>
                <TableHead className="text-[11px] font-bold text-text-muted uppercase tracking-wider py-4">Committee</TableHead>
                <TableHead className="text-[11px] font-bold text-text-muted uppercase tracking-wider py-4">Member Type</TableHead>
                <TableHead className="text-[11px] font-bold text-text-muted uppercase tracking-wider py-4">Mobile No</TableHead>
                <TableHead className="text-[11px] font-bold text-text-muted uppercase tracking-wider py-4">Blood Group</TableHead>
                <TableHead className="text-[11px] font-bold text-text-muted uppercase tracking-wider py-4">Installation Date</TableHead>
                <TableHead className="text-[11px] font-bold text-text-muted uppercase tracking-wider py-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id} className="border-card-border hover:bg-slate-50/50 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-card-border">
                        <AvatarImage src={member.photoUrl} />
                        <AvatarFallback className="bg-slate-100 text-sidebar font-bold text-[10px]">
                          {member.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-bold text-sidebar">{member.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-text-main font-medium">{member.committee || '-'}</TableCell>
                  <TableCell className="py-4">
                    <Badge className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      member.memberType === 'Life' ? "bg-blue-50 text-blue-700 border-blue-100" :
                      member.memberType === 'General' ? "bg-slate-50 text-slate-700 border-slate-100" :
                      "bg-emerald-50 text-emerald-700 border-emerald-100"
                    )}>
                      {member.memberType}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-text-main font-medium">{member.mobileNo}</TableCell>
                  <TableCell className="py-4">
                    <span className="text-red-500 font-bold text-xs">{member.bloodGroup}</span>
                  </TableCell>
                  <TableCell className="py-4 text-text-muted text-sm">{member.installationDate}</TableCell>
                  <TableCell className="text-right py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted hover:text-text-main" />}>
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 border-card-border">
                        <DropdownMenuItem 
                          onClick={() => navigate(`/admin/members/${member.id}`)}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => navigate(`/admin/members/edit/${member.id}`)}
                          className="cursor-pointer"
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit Member
                        </DropdownMenuItem>
                        {profile?.role === 'admin' && (
                          <DropdownMenuItem 
                            onClick={() => handleDelete(member.id || '')}
                            className="text-red-600 focus:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Member
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredMembers.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-text-muted">
                    No members found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
