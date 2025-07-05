'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface HostRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  reason: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage: string | null;
  };
}

export default function HostRequestsPage() {
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState<HostRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/signin');
    }

    if (session?.user && !session.user.isAdmin) {
      redirect('/');
    }

    fetchRequests();
  }, [session, status]);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/host-requests');
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching host requests:', error);
      toast.error('Failed to load host requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      setProcessing(requestId);
      const response = await fetch(`/api/host-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) throw new Error('Failed to process request');

      toast.success(`Request ${action}d successfully`);
      fetchRequests();
    } catch (error) {
      console.error('Error processing request:', error);
      toast.error('Failed to process request');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Host Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No host requests found.
                  </TableCell>
                </TableRow>
              )}
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src={request.user.profileImage || undefined} />
                        <AvatarFallback>
                          {request.user.firstName[0]}
                          {request.user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {request.user.firstName} {request.user.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {request.user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{request.email}</div>
                      <div className="text-muted-foreground">{request.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {request.reason}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        request.status === 'approved'
                          ? 'secondary'
                          : request.status === 'rejected'
                          ? 'destructive'
                          : 'default'
                      }
                    >
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(request.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleRequest(request.id, 'approve')}
                          disabled={!!processing}
                        >
                          {processing === request.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Approve'
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRequest(request.id, 'reject')}
                          disabled={!!processing}
                        >
                          {processing === request.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Reject'
                          )}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 