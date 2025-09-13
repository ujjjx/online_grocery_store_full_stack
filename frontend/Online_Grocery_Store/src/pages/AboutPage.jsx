import { Heart, Users, Truck, Award } from "lucide-react";

export default function AboutPage() {
  
  const team = [
    {
      name: 'Ujjwal Gupta',
      role: 'WebSite Developer',
      description: 'My first full stack grocery store project',
    },
    {
      name: 'Jane Doe',
      role: 'Product Manager',
      description: 'Overseeing product development and ensuring customer satisfaction.',
    },
    {
      name: 'Alice Smith',
      role: 'Marketing Specialist',
      description: 'Crafting marketing strategies to promote our products and engage customers.',
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">About GroceryApp</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Since 2020, we've been your trusted neighborhood grocery store, committed to providing 
          fresh, quality products at affordable prices while building lasting relationships with our community.
        </p>
      </div>

      {/* Story Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">Our Story</h2>
          <div className="space-y-4 text-gray-600">
            <p className="text-xl text-gray-600 max-w-3xl mx-auto text-center">
              This is my first full stack grocery store project. I started GroceryApp with console based python project. My interest
              in learning full stack development led me to create this application, and I'm excited to share it with you.
            </p>
          </div>
        </div>

      </div>

      <div className="mb-16">
        <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-green-100 p-6 text-center">
              <div className="text-6xl mb-4">{member.image}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{member.name}</h3>
              <p className="text-green-600 font-medium mb-3">{member.role}</p>
              <p className="text-gray-600">{member.description}</p>
            </div>
          ))}
        </div>
        <br></br>
      </div>

      {/* Contact CTA Section */}
      <div className="bg-green-600 rounded-lg p-9 text-center text-white h-full">
        <h2 className="text-2xl font-bold mb-4">Questions? We'd Love to Hear From You!</h2>
        <p className="mb-6">
          Have questions about our products or services? Our friendly team is here to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="tel:5551234567"
            className="bg-white text-green-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
          >
            Call Us: +91-9871922407
          </a>
          <a 
            href="mailto:info@groceryapp.com"
            className="border border-white text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 transition-colors"
          >
            Email Us
          </a>
          
        </div>
      </div>
    </div>
  );
}