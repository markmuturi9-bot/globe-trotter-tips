import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  Shield, Flag, CheckCircle, XCircle, Clock, AlertTriangle, User, MessageSquare, 
  MapPin, Users, FileText, Activity, Crown, UserX, Trash2, Eye, BarChart3
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';
type AppRole = 'admin' | 'moderator' | 'user';

interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  reported_tip_id: string | null;
  reported_message_id: string | null;
  reason: string;
  description: string | null;
  status: ReportStatus;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  reporter?: { username: string } | null;
  reported_user?: { username: string } | null;
}

interface UserWithRole {
  id: string;
  username: string;
  email: string;
  created_at: string;
  roles: AppRole[];
}

interface Tip {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  username?: string;
  country_name?: string;
}

// ==================== HOOKS ====================

function useReports(status: ReportStatus | 'all') {
  return useQuery({
    queryKey: ['admin-reports', status],
    queryFn: async () => {
      let query = supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;

      const reports = data || [];
      const enrichedReports = await Promise.all(
        reports.map(async (report) => {
          let reporter = null;
          let reported_user = null;

          if (report.reporter_id) {
            const { data: reporterData } = await supabase
              .from('profiles_public')
              .select('username')
              .eq('id', report.reporter_id)
              .maybeSingle();
            reporter = reporterData;
          }

          if (report.reported_user_id) {
            const { data: reportedData } = await supabase
              .from('profiles_public')
              .select('username')
              .eq('id', report.reported_user_id)
              .maybeSingle();
            reported_user = reportedData;
          }

          return {
            ...report,
            reporter,
            reported_user,
          };
        })
      );

      return enrichedReports as Report[];
    },
  });
}

function useUpdateReportStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ reportId, status }: { reportId: string; status: ReportStatus }) => {
      const { error } = await supabase
        .from('reports')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq('id', reportId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      toast({
        title: 'Report updated',
        description: 'The report status has been updated.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [usersRes, tipsRes, reportsRes, rolesRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('tips').select('id', { count: 'exact', head: true }),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('user_roles').select('id', { count: 'exact', head: true }),
      ]);

      return {
        totalUsers: usersRes.count || 0,
        totalTips: tipsRes.count || 0,
        pendingReports: reportsRes.count || 0,
        usersWithRoles: rolesRes.count || 0,
      };
    },
  });
}

function useAllUsers() {
  const { isAdmin } = useAdmin();
  
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Use the admin-only RPC function to get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .rpc('admin_get_all_profiles');

      if (profilesError) throw profilesError;

      // Get all roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Merge roles into profiles
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile: any) => ({
        id: profile.id,
        username: profile.username,
        email: profile.email,
        created_at: profile.created_at,
        roles: (roles || [])
          .filter(r => r.user_id === profile.id)
          .map(r => r.role as AppRole),
      }));

      return usersWithRoles;
    },
    enabled: isAdmin,
  });
}

function useAllTips() {
  return useQuery({
    queryKey: ['admin-tips'],
    queryFn: async () => {
      const { data: tips, error } = await supabase
        .from('tips')
        .select('id, title, user_id, created_at, countries!tips_country_id_fkey(name)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Get unique user IDs
      const userIds = [...new Set((tips || []).map(t => t.user_id))];
      
      // Fetch usernames
      const { data: profiles } = await supabase
        .from('profiles_public')
        .select('id, username')
        .in('id', userIds);

      const profileMap = new Map((profiles || []).map(p => [p.id, p.username]));

      return (tips || []).map(tip => ({
        id: tip.id,
        title: tip.title,
        user_id: tip.user_id,
        created_at: tip.created_at,
        username: profileMap.get(tip.user_id) || 'Unknown',
        country_name: (tip.countries as any)?.name || 'Unknown',
      })) as Tip[];
    },
  });
}

function useManageRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, role, action }: { userId: string; role: AppRole; action: 'add' | 'remove' }) => {
      if (action === 'add') {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
        if (error) {
          if (error.code === '23505') {
            throw new Error('User already has this role');
          }
          throw error;
        }
      } else {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);
        if (error) throw error;
      }
    },
    onSuccess: (_, { action, role }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast({
        title: action === 'add' ? 'Role added' : 'Role removed',
        description: `Successfully ${action === 'add' ? 'assigned' : 'removed'} ${role} role.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update role',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

function useDeleteTipAdmin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (tipId: string) => {
      const { error } = await supabase
        .from('tips')
        .delete()
        .eq('id', tipId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tips'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['tips'] });
      toast({
        title: 'Tip deleted',
        description: 'The tip has been permanently removed.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete tip',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// ==================== COMPONENTS ====================

function StatsCards() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Total Users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats?.totalUsers}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Total Tips
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats?.totalTips}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-destructive" />
            Pending Reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-destructive">{stats?.pendingReports}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Staff Members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats?.usersWithRoles}</p>
        </CardContent>
      </Card>
    </div>
  );
}

function getReasonIcon(reason: string) {
  switch (reason) {
    case 'spam': return <AlertTriangle className="w-4 h-4" />;
    case 'harassment': return <User className="w-4 h-4" />;
    case 'inappropriate': return <XCircle className="w-4 h-4" />;
    default: return <Flag className="w-4 h-4" />;
  }
}

function getStatusBadge(status: ReportStatus) {
  const variants: Record<ReportStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
    pending: { variant: 'destructive', icon: <Clock className="w-3 h-3 mr-1" /> },
    reviewed: { variant: 'secondary', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
    resolved: { variant: 'default', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
    dismissed: { variant: 'outline', icon: <XCircle className="w-3 h-3 mr-1" /> },
  };

  const { variant, icon } = variants[status];
  return (
    <Badge variant={variant} className="flex items-center">
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function ReportCard({ report, onUpdateStatus }: { report: Report; onUpdateStatus: (status: ReportStatus) => void }) {
  const getReportType = () => {
    if (report.reported_tip_id) return { type: 'Tip', icon: <MapPin className="w-4 h-4" /> };
    if (report.reported_message_id) return { type: 'Message', icon: <MessageSquare className="w-4 h-4" /> };
    if (report.reported_user_id) return { type: 'User', icon: <User className="w-4 h-4" /> };
    return { type: 'Unknown', icon: <Flag className="w-4 h-4" /> };
  };

  const { type, icon } = getReportType();

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getReasonIcon(report.reason)}
            <CardTitle className="text-base font-medium capitalize">
              {report.reason.replace('_', ' ')}
            </CardTitle>
            <Badge variant="outline" className="flex items-center gap-1">
              {icon}
              {type}
            </Badge>
          </div>
          {getStatusBadge(report.status as ReportStatus)}
        </div>
        <CardDescription className="text-xs">
          Reported by @{report.reporter?.username || 'unknown'} • {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {report.reported_user && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Reported user:</span> @{report.reported_user.username}
          </p>
        )}
        
        {report.description && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm">{report.description}</p>
          </div>
        )}

        {report.status === 'pending' && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => onUpdateStatus('resolved')}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Resolve
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onUpdateStatus('reviewed')}
            >
              Mark Reviewed
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateStatus('dismissed')}
            >
              Dismiss
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReportsList({ status }: { status: ReportStatus | 'all' }) {
  const { data: reports, isLoading, error } = useReports(status);
  const updateStatus = useUpdateReportStatus();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">Error loading reports: {(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!reports?.length) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Flag className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No reports found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          onUpdateStatus={(newStatus) => updateStatus.mutate({ reportId: report.id, status: newStatus })}
        />
      ))}
    </div>
  );
}

function UsersManagement() {
  const { data: users, isLoading, error } = useAllUsers();
  const { user: currentUser } = useAuth();
  const manageRole = useManageRole();
  const [selectedRole, setSelectedRole] = useState<AppRole>('moderator');

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">Error loading users: {(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">User Roles Management</CardTitle>
          <CardDescription>Assign or remove admin and moderator roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">@{user.username}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {user.roles.length === 0 && (
                          <Badge variant="outline">User</Badge>
                        )}
                        {user.roles.map(role => (
                          <Badge 
                            key={role} 
                            variant={role === 'admin' ? 'default' : 'secondary'}
                            className="flex items-center gap-1"
                          >
                            {role === 'admin' && <Crown className="w-3 h-3" />}
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                            {user.id !== currentUser?.id && (
                              <button
                                onClick={() => manageRole.mutate({ userId: user.id, role, action: 'remove' })}
                                className="ml-1 hover:text-destructive"
                                disabled={manageRole.isPending}
                              >
                                <XCircle className="w-3 h-3" />
                              </button>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.id !== currentUser?.id && (
                        <div className="flex items-center gap-2 justify-end">
                          <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
                            <SelectTrigger className="w-[120px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="moderator">Moderator</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => manageRole.mutate({ userId: user.id, role: selectedRole, action: 'add' })}
                            disabled={manageRole.isPending || user.roles.includes(selectedRole)}
                          >
                            Add Role
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TipsManagement() {
  const { data: tips, isLoading, error } = useAllTips();
  const deleteTip = useDeleteTipAdmin();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">Error loading tips: {(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content Moderation</CardTitle>
          <CardDescription>Review and manage all user-generated tips</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tips?.map((tip) => (
                  <TableRow key={tip.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{tip.title}</TableCell>
                    <TableCell className="text-muted-foreground">@{tip.username}</TableCell>
                    <TableCell className="text-muted-foreground">{tip.country_name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(tip.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" className="h-8">
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Tip</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to permanently delete "{tip.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteTip.mutate(tip.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== MAIN PAGE ====================

export default function Admin() {
  const { isAdmin, isModerator, loading } = useAdmin();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Show loading state
  if (loading || authLoading) {
    return (
      <AppShell activeView="profile">
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  // Redirect if not authorized
  if (!user || (!isAdmin && !isModerator)) {
    return <Navigate to="/" replace />;
  }

  return (
    <AppShell activeView="profile">
      <div className="p-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {isAdmin ? 'Full administrative access' : 'Moderator access'}
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-1">
              <Flag className="w-4 h-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="users" className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="content" className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <StatsCards />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
                <CardDescription>Common moderation tasks</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Button variant="outline" onClick={() => setActiveTab('reports')} className="justify-start">
                  <Flag className="w-4 h-4 mr-2" />
                  Review Pending Reports
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('content')} className="justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Moderate Content
                </Button>
                {isAdmin && (
                  <Button variant="outline" onClick={() => setActiveTab('users')} className="justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Manage User Roles
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Tabs defaultValue="pending">
              <TabsList className="mb-4">
                <TabsTrigger value="pending">
                  <Clock className="w-4 h-4 mr-1" />
                  Pending
                </TabsTrigger>
                <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                <ReportsList status="pending" />
              </TabsContent>
              <TabsContent value="reviewed">
                <ReportsList status="reviewed" />
              </TabsContent>
              <TabsContent value="resolved">
                <ReportsList status="resolved" />
              </TabsContent>
              <TabsContent value="all">
                <ReportsList status="all" />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="users">
              <UsersManagement />
            </TabsContent>
          )}

          <TabsContent value="content">
            <TipsManagement />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
