"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Users, Video, MapPin, ExternalLink, User } from "lucide-react";
import Link from "next/link";
import { MasterClass } from "@/lib/googleCalendar";
import { FormattedDescription } from "./FormattedDescription";
import MasterClassEnrollButton from "./MasterClassEnrollButton";
import { PriceTag } from "./CurrencyDisplay";

interface MasterClassPageClientProps {
  masterClass: MasterClass;
  initialIsEnrolled: boolean;
}

export function MasterClassPageClient({ 
  masterClass, 
  initialIsEnrolled 
}: MasterClassPageClientProps) {
  const searchParams = useSearchParams();
  const [isEnrolled, setIsEnrolled] = useState(initialIsEnrolled);
  const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(false);

  // Check for payment success and refresh enrollment status
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    
    if (paymentStatus === 'success') {
      console.log('Payment success detected, checking enrollment status...');
      setIsCheckingEnrollment(true);
      
      // Wait for webhook to process, then check enrollment with retries
      const checkEnrollment = async () => {
        try {
          let attempts = 0;
          const maxAttempts = 6; // Try for up to 30 seconds

          while (attempts < maxAttempts) {
            attempts++;
            console.log(`Checking enrollment attempt ${attempts}/${maxAttempts}...`);

            // Wait longer on first attempt, then shorter intervals
            const delay = attempts === 1 ? 3000 : 2000; // 3s first, then 2s intervals
            await new Promise(resolve => setTimeout(resolve, delay));

            const response = await fetch(`/api/masterclass/enrollment-status?masterclassId=${masterClass.id}`);
            if (response.ok) {
              const data = await response.json();
              console.log(`Enrollment status after payment (attempt ${attempts}):`, data.isEnrolled);

              if (data.isEnrolled) {
                setIsEnrolled(true);
                console.log('✅ Enrollment confirmed!');
                break;
              }
            }

            // If this was the last attempt, stop checking
            if (attempts >= maxAttempts) {
              console.log('⚠️ Enrollment not confirmed after maximum attempts');
              break;
            }
          }
        } catch (error) {
          console.error('Error checking enrollment after payment:', error);
        } finally {
          setIsCheckingEnrollment(false);
        }
      };

      checkEnrollment();
    }
  }, [searchParams, masterClass.id]);

  const startDate = new Date(masterClass.startTime);
  const endDate = new Date(masterClass.endTime);
  const isLive = masterClass.status === 'live';
  const isUpcoming = masterClass.status === 'upcoming';
  const isCompleted = masterClass.status === 'completed';

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800 animate-pulse">
            🔴 LIVE NOW
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
            📅 Upcoming
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            ✅ Completed
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Payment Success Banner */}
      {searchParams.get('payment') === 'success' && (
        <div className="bg-green-50 border-b border-green-200">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-green-800">
              <span className="text-green-600">✅</span>
              <span className="font-medium">
                {isCheckingEnrollment
                  ? "Payment successful! Confirming your enrollment... (this may take up to 30 seconds)"
                  : isEnrolled
                  ? "Payment successful! You're now enrolled in this MasterClass."
                  : "Payment successful! Your enrollment is being processed. Please refresh the page if the status doesn't update."}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/20 via-background to-secondary/20 overflow-hidden">
        <div className="container mx-auto px-4 py-16">
          {/* Back Button */}
          <Link
            href="/masterclasses"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to MasterClasses
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <div className="mb-6">
                {getStatusBadge()}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                {masterClass.title}
              </h1>
              
              <FormattedDescription 
                description={masterClass.description || ''} 
                maxLines={6}
                className="text-xl mb-8 leading-relaxed"
              />

              {/* Quick Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">{formatDate(startDate)}</div>
                    <div className="text-sm text-muted-foreground">Date</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">{formatTime(startDate)} - {formatTime(endDate)}</div>
                    <div className="text-sm text-muted-foreground">Time</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:min-w-[300px]">
              {/* Instructor */}
              {masterClass.instructor && (
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Instructor</div>
                    <div className="text-white/80">{masterClass.instructor}</div>
                  </div>
                </div>
              )}

              {/* Attendees */}
              {(masterClass.attendees !== undefined || masterClass.maxAttendees) && (
                <div className="flex items-center gap-3 mb-6 text-white/80">
                  <Users className="w-5 h-5" />
                  <span>
                    {masterClass.attendees || 0}
                    {masterClass.maxAttendees && ` / ${masterClass.maxAttendees}`} attendees
                  </span>
                </div>
              )}

              {/* Location/Format */}
              <div className="flex items-center gap-3 mb-6 text-white/80">
                {masterClass.isOnline ? (
                  <>
                    <Video className="w-5 h-5" />
                    <div>
                      <div className="font-medium">
                        {masterClass.conferenceType || 'Online Event'}
                      </div>
                      {masterClass.conferenceType && (
                        <div className="text-sm text-white/60">
                          Meeting link will be provided
                        </div>
                      )}
                    </div>
                  </>
                ) : masterClass.location ? (
                  <>
                    <MapPin className="w-5 h-5" />
                    <span className="line-clamp-1">{masterClass.location}</span>
                  </>
                ) : (
                  <>
                    <Video className="w-5 h-5" />
                    <span>Format TBA</span>
                  </>
                )}
              </div>

              {/* Pricing Display */}
              {masterClass.isPremium && !masterClass.isFree && masterClass.price && (
                <div className="mb-6">
                  <PriceTag 
                    amount={masterClass.price} 
                    currency={masterClass.currency || 'KES'} 
                    size="lg" 
                    variant="detail"
                    className="text-white"
                  />
                </div>
              )}

              {/* Action Button */}
              <MasterClassEnrollButton
                masterClass={masterClass}
                isEnrolled={isEnrolled}
                showPaymentOptions={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Details Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">About This MasterClass</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Session Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Session Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{formatDate(startDate)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">{formatTime(startDate)} - {formatTime(endDate)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">
                      {Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60))} minutes
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Format</span>
                    <span className="font-medium">
                      {masterClass.isOnline 
                        ? `Online (${masterClass.conferenceType || 'Video Call'})` 
                        : masterClass.location 
                        ? 'In-Person' 
                        : 'TBA'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* What to Expect */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">What to Expect</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Interactive Q&A session with the instructor
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Real-world insights and practical tips
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Networking opportunities with other attendees
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Downloadable resources and materials
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
