

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { cva, type VariantProps } from "class-variance-authority";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { X, Send, User, Mail, MessageSquare, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const bookingFormVariants = cva(
  "relative overflow-hidden max-w-md w-full transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-background rounded-3xl shadow-xl border-2 border-coral/10",
        modal: "bg-background rounded-3xl shadow-2xl border-2 border-coral/10",
        card: "bg-background rounded-2xl shadow-lg border",
      },
      size: {
        default: "p-8",
        sm: "p-6",
        lg: "p-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const bookingFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(50, { message: "Name must be less than 50 characters." }),
  email: z
    .string()
    .email({ message: "Please enter a valid email address." }),
  message: z
    .string()
    .max(500, { message: "Message must be less than 500 characters." })
    .optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export interface BookingFormProps
  extends React.ComponentPropsWithoutRef<"div">,
    VariantProps<typeof bookingFormVariants> {
  onClose: () => void;
  onSuccess?: (data: BookingFormValues) => void;
  title?: string;
  description?: string;
  submitText?: string;
}

const BookingForm = React.forwardRef<HTMLDivElement, BookingFormProps>(
  ({
    className,
    variant,
    size,
    onClose,
    onSuccess,
    title = "Book Your Tutor",
    description = "Let's find you the perfect English tutor!",
    submitText = "Book My Tutor",
    ...props
  }, ref) => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<BookingFormValues>({
      resolver: zodResolver(bookingFormSchema),
      defaultValues: {
    name: "",
    email: "",
        message: "",
      },
  });

    const onSubmit = async (data: BookingFormValues) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('tutor_bookings')
        .insert([
          {
              name: data.name,
              email: data.email,
              message: data.message || null
          }
        ]);

      if (error) throw error;

      toast({
        title: "Booking Request Sent! 🎉",
        description: "We'll connect you with the perfect tutor soon!",
      });

        form.reset();
        
        if (onSuccess) {
          onSuccess(data);
        } else {
      onClose();
        }
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast({
        title: "Oops! Something went wrong",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div
        ref={ref}
        className={cn(bookingFormVariants({ variant, size }), className)}
        {...props}
      >
      {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
        onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-muted"
          aria-label="Close booking form"
      >
          <X className="h-4 w-4" />
        </Button>

      {/* Header */}
      <div className="text-center mb-6">
          <h2 className="text-2xl font-bold font-duolingo-heading text-foreground mb-2">
            {title}
          </h2>
          <p className="text-muted-foreground font-duolingo-body">
            {description}
          </p>
      </div>

      {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Full Name</FormLabel>
                  <FormControl>
        <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Your full name"
                        className="pl-10 h-12 border-2 focus:border-coral rounded-xl font-duolingo-body"
                        {...field}
          />
        </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Email Address</FormLabel>
                  <FormControl>
        <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Your email address"
                        className="pl-10 h-12 border-2 focus:border-coral rounded-xl font-duolingo-body"
                        {...field}
          />
        </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Learning Goals (Optional)</FormLabel>
                  <FormControl>
        <div className="relative">
                      <MessageSquare className="absolute left-3 top-4 w-5 h-5 text-muted-foreground" />
          <Textarea
            placeholder="Tell us about your English learning goals (optional)"
                        className="pl-10 pt-4 min-h-[100px] border-2 focus:border-coral rounded-xl resize-none font-duolingo-body"
                        {...field}
          />
        </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

        <Button
          type="submit"
          disabled={isSubmitting}
              className={cn(
                "w-full bg-coral hover:bg-coral/90 text-white h-12 rounded-xl",
                "font-semibold font-duolingo-body text-lg transition-all duration-200",
                "transform hover:scale-105 disabled:transform-none disabled:opacity-50"
              )}
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Send className="w-5 h-5" />
                  <span>{submitText}</span>
            </div>
          )}
        </Button>
      </form>
        </Form>

      {/* Decorative elements */}
        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-coral/10 rounded-full opacity-50" />
      <div className="absolute -top-2 -left-2 w-8 h-8 bg-coral/20 rounded-full" />
    </div>
  );
  }
);

BookingForm.displayName = "BookingForm";

export { BookingForm, bookingFormVariants };
export type { BookingFormValues };
export default BookingForm;
