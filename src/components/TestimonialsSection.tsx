
import { Star } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Maria Santos",
      country: "🇧🇷 Brazil",
      rating: 5,
      quote: "ABC Teachy helped me gain confidence in speaking English. My tutor was so patient and encouraging!",
      avatar: "👩‍💼"
    },
    {
      name: "Hiroshi Tanaka",
      country: "🇯🇵 Japan",
      rating: 5,
      quote: "The flexible scheduling made it perfect for my busy work life. I improved so much in just 3 months!",
      avatar: "👨‍💻"
    },
    {
      name: "Ahmed Hassan",
      country: "🇪🇬 Egypt",
      rating: 5,
      quote: "My pronunciation has improved dramatically. The one-on-one lessons were exactly what I needed.",
      avatar: "👨‍🎓"
    }
  ];

  return (
    <section className="w-full bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Student Success Stories
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how ABC Teachy has helped students from around the world improve their English
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-gray-700 mb-6">
                "{testimonial.quote}"
              </blockquote>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-coral-light rounded-full flex items-center justify-center">
                  <span className="text-lg">{testimonial.avatar}</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.country}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
