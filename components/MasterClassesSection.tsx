import React from "react";
import { Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { MasterClass } from "@/lib/googleCalendar";
import { MasterClassCardWithAuth } from "./MasterClassCardWithAuth";

interface MasterClassesSectionProps {
  masterClasses: MasterClass[];
  showAll?: boolean;
}

export function MasterClassesSection({ 
  masterClasses, 
  showAll = false 
}: MasterClassesSectionProps) {
  // Show only first 3 on home page, all on dedicated page
  const displayedClasses = showAll ? masterClasses : masterClasses.slice(0, 3);
  
  if (masterClasses.length === 0) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Calendar className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold">Upcoming MasterClasses</h2>
            </div>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              No upcoming masterclasses scheduled at the moment. Check back soon for exciting sessions with industry experts!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calendar className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold">
              {showAll ? 'All MasterClasses' : 'Upcoming MasterClasses'}
            </h2>
          </div>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join live sessions with industry experts and thought leaders. 
            Interactive workshops, Q&A sessions, and exclusive insights.
          </p>
          
          {!showAll && masterClasses.length > 3 && (
            <Link
              href="/masterclasses"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
            >
              View All MasterClasses
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* MasterClass Grid */}
        <div className={`relative ${
          displayedClasses.length === 1
            ? "flex justify-center"
            : `grid gap-8 ${
                displayedClasses.length === 2
                ? "grid-cols-1 md:grid-cols-2 justify-items-center md:justify-items-stretch"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              }`
        }`}>
          {/* Special background for single event */}
          {displayedClasses.length === 1 && (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl -z-10 transform scale-110" />
          )}
          {displayedClasses.map((masterClass) => (
            <div
              key={masterClass.id}
              className={
                displayedClasses.length === 1
                  ? "max-w-md w-full relative z-10 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
                  : displayedClasses.length === 2
                  ? "max-w-md w-full"
                  : ""
              }
            >
              <MasterClassCardWithAuth
                masterClass={masterClass}
              />
            </div>
          ))}
        </div>

        {/* Live Sessions Notice */}
        {masterClasses.some(mc => mc.status === 'live') && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full border border-red-200">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Live sessions are happening now!</span>
            </div>
          </div>
        )}

        {/* Call to Action */}
        {!showAll && (
          <div className="mt-16 text-center">
            <div className="bg-muted/50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-4">Want to Host a MasterClass?</h3>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Share your expertise with our community. We're always looking for industry experts to lead sessions.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Get in Touch
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default MasterClassesSection;
