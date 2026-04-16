import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { db, auth, handleFirestoreError, OperationType } from '@/src/firebase';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2, User } from 'lucide-react';

import { useAuth } from '@/src/hooks/useAuth';

const memberSchema = z.object({
  memberId: z.string().min(1, 'Member ID is required'),
  memberType: z.enum(['Life', 'General', 'Associate']),
  name: z.string().min(1, 'Name is required').max(100),
  fathersName: z.string().optional(),
  mothersName: z.string().optional(),
  mobileNo: z.string().min(10, 'Mobile number must be at least 10 digits').max(13),
  emailAddress: z.string().email('Invalid email address'),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  gender: z.enum(['Male', 'Female', 'Other']),
  designation: z.string().optional(),
  committee: z.string().optional(),
  occupation: z.string().min(1, 'Occupation is required'),
  installationDate: z.string().min(1, 'Installation date is required'),
  joinDate: z.string().min(1, 'Join date is required'),
  monthlyFee: z.number().min(0, 'Monthly fee must be positive'),
  isDeceased: z.boolean(),
  deceasedDate: z.string().optional(),
  presentAddress: z.string().min(1, 'Present address is required').max(250),
  permanentAddress: z.string().min(1, 'Permanent address is required').max(250),
  businessAddress: z.string().min(1, 'Business address is required').max(250),
  photoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type MemberFormValues = z.infer<typeof memberSchema>;

export default function MemberForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      memberId: '',
      memberType: 'General',
      name: user?.displayName || '',
      fathersName: '',
      mothersName: '',
      mobileNo: '',
      emailAddress: user?.email || '',
      bloodGroup: 'O+',
      gender: 'Male',
      designation: '',
      committee: '',
      occupation: '',
      installationDate: new Date().toISOString().split('T')[0],
      joinDate: new Date().toISOString().split('T')[0],
      monthlyFee: 500,
      isDeceased: false,
      deceasedDate: '',
      presentAddress: '',
      permanentAddress: '',
      businessAddress: '',
      photoUrl: user?.photoURL || '',
    },
  });

  useEffect(() => {
    if (!id && user) {
      form.setValue('name', user.displayName || '');
      form.setValue('emailAddress', user.email || '');
      form.setValue('photoUrl', user.photoURL || '');
    }
  }, [id, user, form]);

  useEffect(() => {
    if (id) {
      const fetchMember = async () => {
        try {
          const docRef = doc(db, 'members', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as MemberFormValues;
            form.reset(data);
          } else {
            toast.error('Member not found');
            navigate('/admin/members');
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `members/${id}`);
        } finally {
          setFetching(false);
        }
      };
      fetchMember();
    }
  }, [id, navigate, form]);

  const onSubmit = async (values: MemberFormValues) => {
    if (!auth.currentUser) return;
    
    setLoading(true);
    try {
      const memberData = {
        ...values,
        updatedBy: auth.currentUser.uid,
        updatedDate: serverTimestamp(),
      } as any;

      if (id) {
        await setDoc(doc(db, 'members', id), memberData, { merge: true });
        toast.success('Member updated successfully');
      } else {
        memberData.createdBy = auth.currentUser.uid;
        memberData.createdDate = serverTimestamp();
        await addDoc(collection(db, 'members'), memberData);
        toast.success('Member added successfully');
      }
      navigate('/admin/members');
    } catch (error) {
      toast.error(id ? 'Failed to update member' : 'Failed to add member');
      handleFirestoreError(error, id ? OperationType.UPDATE : OperationType.CREATE, id ? `members/${id}` : 'members');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex items-center justify-center p-12">Loading member data...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/admin/members')}
            className="text-text-muted hover:text-text-main"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-sidebar">{id ? 'Edit Member' : 'Add New Member'}</h1>
            <p className="text-sm text-text-muted">
              {id ? `Updating member ID: ${id}` : 'Create a new member record in the directory'}
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="bg-white border-card-border rounded-lg shadow-none overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-card-border">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-bold text-sidebar">Basic Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="memberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Member ID / SL</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 001" {...field} className="bg-white border-card-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="memberType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Member Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white border-card-border">
                            <SelectValue placeholder="Select member type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Life">Life Member</SelectItem>
                          <SelectItem value="General">General Member</SelectItem>
                          <SelectItem value="Associate">Associate Member</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} className="bg-white border-card-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fathersName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Father's Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter father's name" {...field} className="bg-white border-card-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mothersName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Mother's Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter mother's name" {...field} className="bg-white border-card-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white border-card-border">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bloodGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Blood Group</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white border-card-border">
                            <SelectValue placeholder="Select blood group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                            <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-card-border rounded-lg shadow-none overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-card-border">
              <CardTitle className="text-lg font-bold text-sidebar">Contact & Professional</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="mobileNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Mobile Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 01712884433" {...field} className="bg-white border-card-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emailAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. name@example.com" {...field} className="bg-white border-card-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Occupation</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter occupation" {...field} className="bg-white border-card-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Designation</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter designation" {...field} className="bg-white border-card-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="committee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Committee</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter committee name (if any)" {...field} className="bg-white border-card-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="installationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Installation Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="bg-white border-card-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="joinDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Join Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="bg-white border-card-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="monthlyFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Monthly Fee (৳)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(Number(e.target.value))}
                          className="bg-white border-card-border" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="photoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Photo URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/photo.jpg" {...field} className="bg-white border-card-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-card-border rounded-lg shadow-none overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-card-border">
              <CardTitle className="text-lg font-bold text-sidebar">Addresses</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <FormField
                control={form.control}
                name="presentAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Present Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter present address" className="min-h-[80px] bg-white border-card-border" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permanentAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Permanent Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter permanent address" className="min-h-[80px] bg-white border-card-border" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Business Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter business address" className="min-h-[80px] bg-white border-card-border" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="bg-white border-card-border rounded-lg shadow-none overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-card-border">
              <CardTitle className="text-lg font-bold text-sidebar">Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row gap-8">
                <FormField
                  control={form.control}
                  name="isDeceased"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-card-border p-4 bg-slate-50/30">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-bold text-sidebar">Member is Deceased</FormLabel>
                        <FormDescription className="text-xs">
                          Check this if the member has passed away.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch('isDeceased') && (
                  <FormField
                    control={form.control}
                    name="deceasedDate"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Deceased Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="bg-white border-card-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/admin/members')}
              className="border-card-border text-text-muted hover:text-text-main"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-white font-bold px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {id ? 'Update Member' : 'Save Member'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
