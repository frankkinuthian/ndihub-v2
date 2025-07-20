import React from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Users, Video, MapPin, User } from "lucide-react";
import Link from "next/link";
import { getMasterClasses } from "@/lib/googleCalendar";
import { Metadata } from "next";
import { FormattedDescription } from "@/components/FormattedDescription";
import { auth } from "@clerk/nextjs/server";
import { isEnrolledInMasterClass } from "@/sanity/lib/masterclass/isEnrolledInMasterClass";
import MasterClassEnrollButton from "@/components/MasterClassEnrollButton";
import { PriceTag } from "@/components/CurrencyDisplay";
import { MasterClassPageClient } from "@/components/MasterClassPageClient";

interface MasterClassPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: MasterClassPageProps): Promise<Metadata> {
  const { id } = await params;
  const masterClasses = await getMasterClasses().catch(() => []);
  const masterClass = masterClasses.find(mc => mc.id === id);

  if (!masterClass) {
    return {
      title: "MasterClass Not Found | NDIHub",
    };
  }

  return {
    title: `${masterClass.title} | NDIHub`,
    description: masterClass.description || `Join ${masterClass.instructor} for an exclusive MasterClass session.`,
  };
}

export default async function MasterClassPage({ params }: MasterClassPageProps) {
  const { id } = await params;
  const masterClasses = await getMasterClasses().catch(() => []);
  const masterClass = masterClasses.find(mc => mc.id === id);

  if (!masterClass) {
    notFound();
  }

  // Check enrollment status if user is authenticated and masterclass is premium
  let isEnrolled = false;
  let userId: string | null = null;

  try {
    const authResult = await auth();
    userId = authResult.userId;

    if (userId && masterClass.isPremium && !masterClass.isFree) {
      try {
        isEnrolled = await isEnrolledInMasterClass(userId, masterClass.id);
      } catch (error) {
        console.error("Error checking enrollment:", error);
        isEnrolled = false;
      }
    }
  } catch {
    console.log("Auth not available, continuing without enrollment check");
    userId = null;
    isEnrolled = false;
  }



  return (
    <MasterClassPageClient
      masterClass={masterClass}
      initialIsEnrolled={isEnrolled}
    />
  );
}

// Keep the original page content as a fallback or for SEO
/*
function MasterClassPageContent({ masterClass }: { masterClass: MasterClass }) {
  const startDate = new Date(masterClass.startTime);
  const endDate = new Date(masterClass.endTime);

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
*/
