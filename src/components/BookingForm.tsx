
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { X, Send, User, Mail, MessageSquare } from "lucide-react";

interface BookingFormProps {
  onClose: () => void;
}

const BookingForm = ({ onClose }: BookingFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('tutor_bookings')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            message: formData.message || null
          }
        ]);

      if (error) throw error;

      toast({
        title: "Booking Request Sent! 🎉",
        description: "We'll connect you with the perfect tutor soon!",
      });

      // Reset form
      setFormData({ name: "", email: "", message: "" });
      onClose();
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-learning-blue/10 relative overflow-hidden max-w-md w-full hover-glow">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors hover-lift"
      >
        <X className="w-4 h-4 text-gray-600" />
      </button>

      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-learning-blue rounded-full flex items-center justify-center mx-auto mb-4 pulse-trust">
          <span className="text-white text-2xl">👩‍🏫</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Book Your Tutor</h2>
        <p className="text-gray-600">Let's find you the perfect English tutor!</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Your full name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="pl-10 h-12 border-2 border-gray-200 focus:border-learning-blue rounded-xl transition-all duration-200"
            required
          />
        </div>

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="email"
            placeholder="Your email address"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="pl-10 h-12 border-2 border-gray-200 focus:border-learning-blue rounded-xl transition-all duration-200"
            required
          />
        </div>

        <div className="relative">
          <MessageSquare className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
          <Textarea
            placeholder="Tell us about your English learning goals (optional)"
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            className="pl-10 pt-4 min-h-[100px] border-2 border-gray-200 focus:border-learning-blue rounded-xl resize-none transition-all duration-200"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-learning-blue hover:bg-learning-blue-dark text-white h-12 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none pulse-trust"
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Sending...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Send className="w-5 h-5" />
              <span>Book My Tutor</span>
            </div>
          )}
        </Button>
      </form>

      {/* Decorative elements */}
      <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-progress-green-light rounded-full opacity-50" />
      <div className="absolute -top-2 -left-2 w-8 h-8 bg-learning-blue/20 rounded-full animate-glow" />
    </div>
  );
};

export default BookingForm;
