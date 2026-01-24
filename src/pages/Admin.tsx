import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Shield, Flag, CheckCircle, XCircle, Clock, AlertTriangle, User, MessageSquare, MapPin } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

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

      // Fetch reporter and reported user info separately
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

export default function Admin() {
  const { isAdmin, isModerator, loading } = useAdmin();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');

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
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Moderation Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Review and manage user reports
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="pending" className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
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
      </div>
    </AppShell>
  );
}
