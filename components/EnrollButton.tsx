"use client";

import { createStripeCheckout } from "@/actions/createStripeCheckout";
import { createIntaSendCheckout } from "@/actions/createIntaSendCheckout";
import { useUser } from "@clerk/nextjs";
import { CheckCircle, Smartphone, CreditCard, ChevronDown, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { useEnrollmentStatus } from "@/hooks/useEnrollmentStatus";

type PaymentMethod = "intasend" | "stripe";

function EnrollButton({
  courseId,
  isEnrolled: initialIsEnrolled,
  showPaymentOptions = false,
}: {
  courseId: string;
  isEnrolled: boolean;
  showPaymentOptions?: boolean;
}) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showOptions, setShowOptions] = useState(false);
  const [defaultMethod] = useState<PaymentMethod>("intasend"); // IntaSend is now default!

  // Use client-side enrollment status checking
  const { isEnrolled: clientIsEnrolled, isLoading: enrollmentLoading, refetch } = useEnrollmentStatus(courseId);

  // Use client-side enrollment status if available, otherwise fall back to server-side
  const isEnrolled = clientIsEnrolled || initialIsEnrolled;

  const handleEnroll = async (courseId: string, paymentMethod: PaymentMethod = defaultMethod) => {
    startTransition(async () => {
      try {
        const userId = user?.id;
        if (!userId) return;

        let url: string | undefined;

        if (paymentMethod === "intasend") {
          const result = await createIntaSendCheckout(courseId, userId);
          url = result.url;
        } else {
          const result = await createStripeCheckout(courseId, userId);
          url = result.url || undefined;
        }

        if (url) {
          router.push(url);
        }
      } catch (error) {
        console.error("Error in handleEnroll:", error);
        throw new Error("Failed to create checkout session");
      }
    });
  };

  // Show loading state while checking user or enrollment status
  if (!isUserLoaded || isPending || enrollmentLoading) {
    return (
      <div className="w-full h-12 rounded-lg bg-gray-100 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Show enrolled state with link to course
  if (isEnrolled) {
    return (
      <div className="w-full space-y-2">
        <Link
          prefetch={false}
          href={`/dashboard/courses/${courseId}`}
          className="w-full rounded-lg px-6 py-3 font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transition-all duration-300 h-12 flex items-center justify-center gap-2 group"
        >
          <span>Access Course</span>
          <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </Link>
        {/* Small refresh button for debugging */}
        <button
          onClick={refetch}
          className="w-full text-xs text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1 py-1"
          disabled={enrollmentLoading}
        >
          <RefreshCw className={`w-3 h-3 ${enrollmentLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>
    );
  }

  // Show payment options if enabled and user clicked to see options
  if (showPaymentOptions && showOptions && user?.id) {
    return (
      <div className="w-full space-y-3">
        <div className="text-sm font-medium text-center text-gray-600 mb-3">
          Choose Payment Method
        </div>

        {/* IntaSend Option (Default/Primary) */}
        <button
          className="w-full rounded-lg px-6 py-3 font-medium transition-all duration-300 ease-in-out h-12 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 flex items-center justify-center gap-2 shadow-lg"
          onClick={() => handleEnroll(courseId, "intasend")}
          disabled={isPending}
        >
          <Smartphone className="w-5 h-5" />
          <span>Pay with M-Pesa (Recommended)</span>
        </button>

        {/* Stripe Option (Alternative) */}
        <button
          className="w-full rounded-lg px-6 py-3 font-medium transition-all duration-300 ease-in-out h-12 bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2"
          onClick={() => handleEnroll(courseId, "stripe")}
          disabled={isPending}
        >
          <CreditCard className="w-5 h-5" />
          <span>Pay with Card (International)</span>
        </button>

        {/* Back Button */}
        <button
          className="w-full rounded-lg px-6 py-3 font-medium transition-all duration-300 ease-in-out h-12 bg-gray-100 text-gray-600 hover:bg-gray-200"
          onClick={() => setShowOptions(false)}
          disabled={isPending}
        >
          Back
        </button>
      </div>
    );
  }

  // Show main enroll button
  return (
    <button
      className={`w-full rounded-lg px-6 py-3 font-medium transition-all duration-300 ease-in-out relative h-12
        ${
          isPending || !user?.id
            ? "bg-gray-100 text-gray-400 cursor-not-allowed hover:scale-100"
            : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:scale-105 hover:shadow-lg shadow-md"
        }
      `}
      disabled={!user?.id || isPending}
      onClick={() => {
        if (showPaymentOptions && user?.id) {
          setShowOptions(true);
        } else {
          handleEnroll(courseId, defaultMethod);
        }
      }}
    >
      {!user?.id ? (
        <span className={`${isPending ? "opacity-0" : "opacity-100"}`}>
          Sign in to Enroll
        </span>
      ) : (
        <div className={`flex items-center justify-center gap-2 ${isPending ? "opacity-0" : "opacity-100"}`}>
          <Smartphone className="w-5 h-5" />
          <span>
            {showPaymentOptions ? "Choose Payment Method" : "Enroll with M-Pesa"}
          </span>
          {showPaymentOptions && <ChevronDown className="w-4 h-4" />}
        </div>
      )}
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
    </button>
  );
}

export default EnrollButton;
