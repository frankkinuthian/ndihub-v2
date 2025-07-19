"use client";

import { createStripeCheckout } from "@/actions/createStripeCheckout";
import { createIntaSendCheckout } from "@/actions/createIntaSendCheckout";
import { useUser } from "@clerk/nextjs";
import { CheckCircle, CreditCard, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";

type PaymentMethod = "stripe" | "intasend";

function EnrollButtonWithPaymentOptions({
  courseId,
  isEnrolled,
  showPaymentOptions = true,
}: {
  courseId: string;
  isEnrolled: boolean;
  showPaymentOptions?: boolean;
}) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("intasend");
  const [showOptions, setShowOptions] = useState(false);

  const handleEnroll = async (courseId: string, paymentMethod: PaymentMethod) => {
    startTransition(async () => {
      try {
        const userId = user?.id;
        if (!userId) return;

        let url: string | undefined;

        if (paymentMethod === "intasend") {
          const result = await createIntaSendCheckout(courseId, userId);
          url = result.url;
        } else if (paymentMethod === "stripe") {
          const result = await createStripeCheckout(courseId, userId);
          url = result.url;
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

  // Show loading state while checking user is loading
  if (!isUserLoaded || isPending) {
    return (
      <div className="w-full h-12 rounded-lg bg-gray-100 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Show enrolled state with link to course
  if (isEnrolled) {
    return (
      <Link
        prefetch={false}
        href={`/dashboard/courses/${courseId}`}
        className="w-full rounded-lg px-6 py-3 font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transition-all duration-300 h-12 flex items-center justify-center gap-2 group"
      >
        <span>Access Course</span>
        <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </Link>
    );
  }

  // Show payment options if enabled
  if (showPaymentOptions && showOptions) {
    return (
      <div className="w-full space-y-3">
        <div className="text-sm font-medium text-center text-gray-600 mb-3">
          Choose Payment Method
        </div>
        
        {/* IntaSend Option (Primary) */}
        <button
          className="w-full rounded-lg px-6 py-3 font-medium transition-all duration-300 ease-in-out h-12 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 flex items-center justify-center gap-2 shadow-lg"
          onClick={() => handleEnroll(courseId, "intasend")}
          disabled={!user?.id || isPending}
        >
          <Smartphone className="w-5 h-5" />
          <span>Pay with M-Pesa (Recommended)</span>
        </button>

        {/* Stripe Option (Alternative) */}
        <button
          className="w-full rounded-lg px-6 py-3 font-medium transition-all duration-300 ease-in-out h-12 bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2"
          onClick={() => handleEnroll(courseId, "stripe")}
          disabled={!user?.id || isPending}
        >
          <CreditCard className="w-5 h-5" />
          <span>Pay with Card (International)</span>
        </button>

        {/* Back Button */}
        <button
          className="w-full rounded-lg px-6 py-3 font-medium transition-all duration-300 ease-in-out h-12 bg-gray-100 text-gray-600 hover:bg-gray-200"
          onClick={() => setShowOptions(false)}
        >
          Back
        </button>
      </div>
    );
  }

  // Show single enroll button (default behavior)
  return (
    <button
      className={`w-full rounded-lg px-6 py-3 font-medium transition-all duration-300 ease-in-out relative h-12
        ${
          isPending || !user?.id
            ? "bg-gray-100 text-gray-400 cursor-not-allowed hover:scale-100"
            : "bg-white text-black hover:scale-105 hover:shadow-lg hover:shadow-black/10"
        }
      `}
      disabled={!user?.id || isPending}
      onClick={() => {
        if (showPaymentOptions) {
          setShowOptions(true);
        } else {
          handleEnroll(courseId, selectedPaymentMethod);
        }
      }}
    >
      {!user?.id ? (
        <span className={`${isPending ? "opacity-0" : "opacity-100"}`}>
          Sign in to Enroll
        </span>
      ) : (
        <span className={`${isPending ? "opacity-0" : "opacity-100"}`}>
          {showPaymentOptions ? "Choose Payment Method" : "Enroll Now"}
        </span>
      )}
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
    </button>
  );
}

export default EnrollButtonWithPaymentOptions;
