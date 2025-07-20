"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Clock,
  Mail,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalMasterClasses: number;
  upcomingMasterClasses: number;
  liveMasterClasses: number;
  totalEnrollments: number;
  totalRevenue: number;
  recentEnrollments: number;
}

interface MasterClass {
  id: string;
  title: string;
  instructor?: string;
  startTime: string;
  status: string;
  isPremium: boolean;
  price?: number;
  currency?: string;
  attendees?: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMasterClasses: 0,
    upcomingMasterClasses: 0,
    liveMasterClasses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    recentEnrollments: 0
  });
  const [recentMasterClasses, setRecentMasterClasses] = useState<MasterClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch MasterClasses
      const response = await fetch('/api/admin/masterclass-pricing');
      const data = await response.json();
      
      if (data.success) {
        const masterClasses = data.data;
        
        // Calculate stats
        const totalMasterClasses = masterClasses.length;
        const upcomingMasterClasses = masterClasses.filter((mc: MasterClass) => mc.status === 'upcoming').length;
        const liveMasterClasses = masterClasses.filter((mc: MasterClass) => mc.status === 'live').length;
        const totalEnrollments = masterClasses.reduce((sum: number, mc: MasterClass) => sum + (mc.attendees || 0), 0);
        const totalRevenue = masterClasses
          .filter((mc: MasterClass) => mc.isPremium && mc.price)
          .reduce((sum: number, mc: MasterClass) => sum + ((mc.price || 0) * (mc.attendees || 0)), 0);

        setStats({
          totalMasterClasses,
          upcomingMasterClasses,
          liveMasterClasses,
          totalEnrollments,
          totalRevenue,
          recentEnrollments: totalEnrollments // Simplified for now
        });

        // Get recent MasterClasses (upcoming and live)
        const recent = masterClasses
          .filter((mc: MasterClass) => mc.status === 'upcoming' || mc.status === 'live')
          .sort((a: MasterClass, b: MasterClass) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
          .slice(0, 5);
        
        setRecentMasterClasses(recent);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'upcoming':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome to Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your MasterClasses, pricing, and enrollments from here.
          </p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total MasterClasses</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMasterClasses}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingMasterClasses} upcoming, {stats.liveMasterClasses} live
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              Across all MasterClasses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From premium MasterClasses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.recentEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              Recent enrollments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/pricing">
              <Button className="w-full justify-start" variant="outline">
                <DollarSign className="w-4 h-4 mr-2" />
                Manage Pricing
              </Button>
            </Link>
            <Link href="/admin/enrollments">
              <Button className="w-full justify-start" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                View Enrollments
              </Button>
            </Link>
            <Link href="/admin/invites">
              <Button className="w-full justify-start" variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Send Invites
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent MasterClasses</CardTitle>
            <CardDescription>Upcoming and live sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentMasterClasses.length > 0 ? (
              <div className="space-y-3">
                {recentMasterClasses.map((masterClass) => (
                  <div key={masterClass.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(masterClass.status)}
                      <div>
                        <p className="font-medium text-sm">{masterClass.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {masterClass.instructor && `${masterClass.instructor} • `}
                          {formatDate(masterClass.startTime)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {masterClass.isPremium && masterClass.price && (
                        <Badge variant="secondary" className="text-xs">
                          {masterClass.currency} {masterClass.price}
                        </Badge>
                      )}
                      <Badge variant={masterClass.status === 'live' ? 'destructive' : 'default'} className="text-xs">
                        {masterClass.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No upcoming MasterClasses found
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/masterclasses">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>MasterClasses</span>
              </CardTitle>
              <CardDescription>
                View and manage all MasterClass events
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/analytics">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Analytics</span>
              </CardTitle>
              <CardDescription>
                Revenue and performance metrics
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/settings">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Settings</span>
              </CardTitle>
              <CardDescription>
                Configure system settings
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
