import { Users, Target, Award, Heart } from "lucide-react"

const About = () => {
  return (
    <div className="container mx-auto mt-12 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground/90 text-center mb-4">About Us</h1>
        <p className="text-muted-foreground text-center mb-12">
          Your trusted e-commerce platform for quality products
        </p>

        <div className="bg-card border border-border rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-card-foreground mb-4">Our Story</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Founded with a vision to revolutionize online shopping, we bring you the best products at competitive prices. 
            Our platform connects buyers with trusted sellers, ensuring quality and satisfaction in every transaction.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            We believe in creating a seamless shopping experience that combines convenience, variety, and trust.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <Users className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-card-foreground mb-2">Customer First</h3>
            <p className="text-muted-foreground text-sm">
              Your satisfaction is our priority. We're committed to providing exceptional service.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <Target className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-card-foreground mb-2">Quality Products</h3>
            <p className="text-muted-foreground text-sm">
              Every product is carefully curated to meet our high standards of quality.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <Award className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-card-foreground mb-2">Trusted Sellers</h3>
            <p className="text-muted-foreground text-sm">
              We partner with verified sellers to ensure authenticity and reliability.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <Heart className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-card-foreground mb-2">Community Driven</h3>
            <p className="text-muted-foreground text-sm">
              Built by the community, for the community. Your feedback shapes our platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
