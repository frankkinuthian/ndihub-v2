"use client";

import React from "react";

import { Calendar, Clock, Users, Video, MapPin, ExternalLink, Lock } from "lucide-react";
import { MasterClass } from "@/lib/googleCalendar";
import Link from "next/link";
import { FormattedDescription } from "./FormattedDescription";
import { PriceTag } from "./CurrencyDisplay";

interface MasterClassCardProps {
  masterClass: MasterClass;
  isEnrolled?: boolean;
}

export function MasterClassCard({ masterClass, isEnrolled = false }: MasterClassCardProps) {
  const startDate = new Date(masterClass.startTime);
  const endDate = new Date(masterClass.endTime);
  const isLive = masterClass.status === 'live';
  const isUpcoming = masterClass.status === 'upcoming';

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusBadge = () => {
    switch (masterClass.status) {
      case 'live':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
            🔴 LIVE NOW
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            📅 Upcoming
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            ✅ Completed
          </span>
        );
    }
  };



  return (
    <Link href={`/masterclasses/${masterClass.id}`} className="block group">
      <div className="bg-card rounded-xl overflow-hidden shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:translate-y-[-4px] border border-border flex flex-col h-full">
        {/* Header with Status */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-bold text-foreground line-clamp-2 flex-1 group-hover:text-primary transition-colors">
              {masterClass.title}
            </h3>
            {getStatusBadge()}
          </div>

        <FormattedDescription
          description={masterClass.description || ''}
          maxLines={3}
          className="mb-4"
        />

        {/* Pricing Display */}
        {masterClass.isPremium && !masterClass.isFree && masterClass.price && (
          <div className="mb-4">
            <PriceTag
              amount={masterClass.price}
              currency={masterClass.currency || 'KES'}
              size="sm"
              variant="card"
            />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="px-6 pb-4 space-y-3 flex-1">
        {/* Date and Time */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(startDate)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{formatTime(startDate)} - {formatTime(endDate)}</span>
        </div>

        {/* Instructor */}
        {masterClass.instructor && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs">👨‍🏫</span>
            </div>
            <span>{masterClass.instructor}</span>
          </div>
        )}

        {/* Attendees */}
        {(masterClass.attendees !== undefined || masterClass.maxAttendees) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>
              {masterClass.attendees || 0}
              {masterClass.maxAttendees && ` / ${masterClass.maxAttendees}`} attendees
            </span>
          </div>
        )}

        {/* Location */}
        {masterClass.location && !masterClass.meetingLink && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{masterClass.location}</span>
          </div>
        )}

        {/* Online indicator with conference type */}
        {masterClass.isOnline && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Video className="w-4 h-4" />
            <span>
              {masterClass.conferenceType || 'Online Event'}
              {masterClass.conferenceType && ' Meeting'}
            </span>
          </div>
        )}
      </div>

        {/* Action Preview */}
        <div className="p-6 pt-0">
          {isEnrolled ? (
            <div className="w-full bg-green-600 text-white font-medium py-3 px-4 rounded-lg text-center flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              ✅ Enrolled - View Details
            </div>
          ) : isLive ? (
            <div className="w-full bg-red-600 text-white font-medium py-3 px-4 rounded-lg text-center flex items-center justify-center gap-2">
              <Video className="w-4 h-4" />
              🔴 LIVE - {masterClass.isPremium && !masterClass.isFree ? 'Enroll to Join' : 'Click to Join'}
            </div>
          ) : isUpcoming ? (
            <div className="w-full bg-primary text-primary-foreground font-medium py-3 px-4 rounded-lg text-center flex items-center justify-center gap-2">
              {masterClass.isPremium && !masterClass.isFree ? (
                <>
                  <Lock className="w-4 h-4" />
                  Enroll to Access
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  View Details & Register
                </>
              )}
            </div>
          ) : (
            <div className="w-full bg-muted text-muted-foreground font-medium py-3 px-4 rounded-lg text-center">
              View Details
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default MasterClassCard;
