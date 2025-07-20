"use client";

import React from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, RefreshCw } from 'lucide-react';

export function AdminHeader() {
  const { user, isLoaded } = useUser();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Page Title - will be dynamic based on current page */}
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-xl font-semibold">Admin Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Manage your MasterClasses and courses
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            Beta
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm">
            <Bell className="w-4 h-4" />
          </Button>

          {/* Refresh */}
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>

          {/* User Info */}
          <div className="flex items-center space-x-3">
            {isLoaded && user && (
              <div className="text-right">
                <p className="text-sm font-medium">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Administrator
                </p>
              </div>
            )}
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8"
                }
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
