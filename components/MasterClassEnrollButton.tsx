"use client";

import { createMasterClassCheckoutSimple } from "@/actions/createMasterClassCheckoutSimple";
import { useUser, SignInButton } from "@clerk/nextjs";
import { CheckCircle, Smartphone, CreditCard, ChevronDown, Video, Lock } from "lucide-react";

import { useTransition, useState } from "react";
import { MasterClass } from "@/lib/googleCalendar";

type PaymentMethod = "intasend" | "stripe";

function MasterClassEnrollButton({
  masterClass,
  isEnrolled,
  showPaymentOptions = false,
}: {
  masterClass: MasterClass;
  isEnrolled: boolean;
  showPaymentOptions?: boolean;
}) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [isPending, startTransition] = useTransition();
  const [showOptions, setShowOptions] = useState(false);
  const [defaultMethod] = useState<PaymentMethod>("intasend"); // IntaSend is default

  const isLive = masterClass.status === 'live';
  const isUpcoming = masterClass.status === 'upcoming';
  const isPremium = masterClass.isPremium && !masterClass.isFree;

  const handleEnrollment = (paymentMethod: PaymentMethod) => {
    if (!user) {
      // This shouldn't happen since the button is only shown when user is authenticated
      console.warn("User not authenticated when trying to enroll");
      return;
    }

    startTransition(async () => {
      try {
        await createMasterClassCheckoutSimple(masterClass.id, paymentMethod);
      } catch (error) {
        console.error("Enrollment error:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        alert(`Failed to start enrollment process: ${errorMessage}`);
      }
    });
  };

  const handleJoinMeeting = () => {
    if (masterClass.meetingLink) {
      window.open(masterClass.meetingLink, '_blank');
    }
  };

  // Show loading state while checking user or processing
  if (!isUserLoaded || isPending) {
    return (
      <div className="w-full h-12 rounded-lg bg-gray-100 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Show enrolled state with access to meeting
  if (isEnrolled) {
    return (
      <div className="w-full space-y-2">
        {isLive && masterClass.meetingLink ? (
          <button
            onClick={handleJoinMeeting}
            className="w-full rounded-lg px-6 py-3 font-medium bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-300 h-12 flex items-center justify-center gap-2 group animate-pulse"
          >
            <Video className="w-5 h-5" />
            <span>🔴 Join Live Session</span>
          </button>
        ) : (
          <div className="w-full rounded-lg px-6 py-3 font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white h-12 flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>✅ Enrolled - {isUpcoming ? 'Ready for Session' : 'Session Complete'}</span>
          </div>
        )}
      </div>
    );
  }

  // Show sign-in prompt for non-authenticated users
  if (!user) {
    return (
      <SignInButton mode="modal">
        <button className="w-full rounded-lg px-6 py-3 font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 h-12 flex items-center justify-center gap-2">
          <span>Sign in to {isPremium ? 'Enroll' : 'Register'}</span>
        </button>
      </SignInButton>
    );
  }

  // Free masterclass - direct registration
  if (!isPremium) {
    return (
      <div className="w-full space-y-2">
        {masterClass.registrationLink ? (
          <a
            href={masterClass.registrationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-lg px-6 py-3 font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transition-all duration-300 h-12 flex items-center justify-center gap-2"
          >
            <span>Register Free</span>
          </a>
        ) : isLive && masterClass.meetingLink ? (
          <button
            onClick={handleJoinMeeting}
            className="w-full rounded-lg px-6 py-3 font-medium bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-300 h-12 flex items-center justify-center gap-2 animate-pulse"
          >
            <Video className="w-5 h-5" />
            <span>🔴 Join Live Session</span>
          </button>
        ) : (
          <div className="w-full rounded-lg px-6 py-3 font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white h-12 flex items-center justify-center gap-2">
            <span>Free Session</span>
          </div>
        )}
      </div>
    );
  }

  // Premium masterclass - payment required
  if (showPaymentOptions && showOptions) {
    return (
      <div className="w-full space-y-3">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-3">Choose your payment method:</p>
        </div>

        {/* IntaSend (M-Pesa) - Primary */}
        <button
          onClick={() => handleEnrollment("intasend")}
          disabled={isPending}
          className="w-full rounded-lg px-6 py-3 font-medium bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 transition-all duration-300 h-12 flex items-center justify-center gap-3 group relative overflow-hidden"
        >
          <Smartphone className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <div className="text-left">
            <div className="font-semibold">Enroll with M-Pesa</div>
            <div className="text-xs opacity-90">🌟 Recommended for Kenya</div>
          </div>
        </button>

        {/* Stripe (International Cards) - Secondary */}
        <button
          onClick={() => handleEnrollment("stripe")}
          disabled={isPending}
          className="w-full rounded-lg px-6 py-3 font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-300 h-12 flex items-center justify-center gap-3 group"
        >
          <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <div className="text-left">
            <div className="font-semibold">Pay with Card</div>
            <div className="text-xs opacity-90">International Cards</div>
          </div>
        </button>

        {/* Back to single button */}
        <button
          onClick={() => setShowOptions(false)}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
        >
          ← Back
        </button>
      </div>
    );
  }

  // Default premium enrollment button
  return (
    <div className="w-full space-y-2">
      {showPaymentOptions ? (
        <button
          onClick={() => setShowOptions(true)}
          className="w-full rounded-lg px-6 py-3 font-medium bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary/80 transition-all duration-300 h-12 flex items-center justify-center gap-2 group"
        >
          <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Choose Payment Method</span>
          <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
        </button>
      ) : (
        <button
          onClick={() => handleEnrollment(defaultMethod)}
          disabled={isPending}
          className="w-full rounded-lg px-6 py-3 font-medium bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 transition-all duration-300 h-12 flex items-center justify-center gap-2 group"
        >
          <Smartphone className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Enroll with M-Pesa</span>
        </button>
      )}
    </div>
  );
}

export default MasterClassEnrollButton;
