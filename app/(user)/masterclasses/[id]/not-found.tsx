import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";

export default function MasterClassNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-md mx-auto">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">MasterClass Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The MasterClass you're looking for doesn't exist or may have been removed.
          </p>
          <Link
            href="/masterclasses"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to MasterClasses
          </Link>
        </div>
      </div>
    </div>
  );
}
