"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, DollarSign, Calendar, Users, Clock } from 'lucide-react';

interface MasterClass {
  id: string;
  title: string;
  instructor?: string;
  startTime: string;
  endTime: string;
  isPremium: boolean;
  isFree: boolean;
  price?: number;
  currency?: string;
  status: string;
  maxAttendees?: number;
  attendees?: number;
}

export function MasterClassPricingAdmin() {
  const [masterClasses, setMasterClasses] = useState<MasterClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    price: '',
    currency: 'KES',
    isPremium: false,
    isFree: false
  });

  useEffect(() => {
    fetchMasterClasses();
  }, []);

  const fetchMasterClasses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/masterclass-pricing');
      const data = await response.json();
      
      if (data.success) {
        setMasterClasses(data.data);
      } else {
        console.error('Failed to fetch MasterClasses:', data.error);
      }
    } catch (error) {
      console.error('Error fetching MasterClasses:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (masterClass: MasterClass) => {
    setEditingId(masterClass.id);
    setEditForm({
      price: masterClass.price?.toString() || '',
      currency: masterClass.currency || 'KES',
      isPremium: masterClass.isPremium,
      isFree: masterClass.isFree
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({
      price: '',
      currency: 'KES',
      isPremium: false,
      isFree: false
    });
  };

  const updatePricing = async (masterclassId: string) => {
    try {
      setUpdating(masterclassId);

      const response = await fetch('/api/admin/masterclass-pricing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          masterclassId,
          price: editForm.isFree ? 0 : parseFloat(editForm.price) || 0,
          currency: editForm.currency,
          isPremium: editForm.isPremium,
          isFree: editForm.isFree
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Pricing updated successfully');
        await fetchMasterClasses(); // Refresh the list
        setEditingId(null);
      } else {
        console.error('Failed to update pricing:', data.error);
        alert('Failed to update pricing: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating pricing:', error);
      alert('Error updating pricing');
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      live: 'destructive',
      upcoming: 'default',
      completed: 'secondary'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPricingBadge = (masterClass: MasterClass) => {
    if (masterClass.isFree) {
      return <Badge variant="secondary">Free</Badge>;
    } else if (masterClass.isPremium && masterClass.price) {
      return (
        <Badge variant="default">
          {masterClass.currency} {masterClass.price.toLocaleString()}
        </Badge>
      );
    } else {
      return <Badge variant="outline">No Pricing</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading MasterClasses...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">MasterClass Pricing Management</h2>
          <p className="text-muted-foreground">
            Manage pricing for all MasterClass events
          </p>
        </div>
        <Button onClick={fetchMasterClasses} variant="outline">
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {masterClasses.map((masterClass) => (
          <Card key={masterClass.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{masterClass.title}</CardTitle>
                  <CardDescription>
                    {masterClass.instructor && (
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {masterClass.instructor}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(masterClass.status)}
                  {getPricingBadge(masterClass)}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatDate(masterClass.startTime)}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {Math.round((new Date(masterClass.endTime).getTime() - new Date(masterClass.startTime).getTime()) / (1000 * 60))} min
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {masterClass.attendees || 0}
                  {masterClass.maxAttendees && ` / ${masterClass.maxAttendees}`} attendees
                </div>
              </div>

              {editingId === masterClass.id ? (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="0"
                        value={editForm.price}
                        onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                        disabled={editForm.isFree}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={editForm.currency}
                        onValueChange={(value) => setEditForm(prev => ({ ...prev, currency: value }))}
                        disabled={editForm.isFree}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="KES">KES (M-Pesa)</SelectItem>
                          <SelectItem value="USD">USD (Stripe)</SelectItem>
                          <SelectItem value="EUR">EUR (Stripe)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isFree"
                          checked={editForm.isFree}
                          onCheckedChange={(checked) => setEditForm(prev => ({ 
                            ...prev, 
                            isFree: checked,
                            isPremium: checked ? false : prev.isPremium
                          }))}
                        />
                        <Label htmlFor="isFree">Free Event</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isPremium"
                          checked={editForm.isPremium}
                          onCheckedChange={(checked) => setEditForm(prev => ({ 
                            ...prev, 
                            isPremium: checked,
                            isFree: checked ? false : prev.isFree
                          }))}
                          disabled={editForm.isFree}
                        />
                        <Label htmlFor="isPremium">Premium Event</Label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => updatePricing(masterClass.id)}
                      disabled={updating === masterClass.id}
                      size="sm"
                    >
                      {updating === masterClass.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Updating...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                    <Button
                      onClick={cancelEditing}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <Button
                    onClick={() => startEditing(masterClass)}
                    variant="outline"
                    size="sm"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Edit Pricing
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {masterClasses.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No MasterClasses found. Create some events in Google Calendar first.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
