'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Sparkles, Zap, Shield, Star, Globe, Users } from 'lucide-react';

const HomePage = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: 'easeOut' }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const features = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Lightning Fast",
      description: "Experience blazing fast performance with our optimized solution."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure by Default",
      description: "Enterprise-grade security to protect your data and privacy."
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global Access",
      description: "Access your data from anywhere with our cloud infrastructure."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 flex flex-col items-center justify-center min-h-[80vh]">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="text-center max-w-4xl space-y-8"
        >
          <motion.div variants={fadeInUp}>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <Sparkles className="mr-2 h-4 w-4" />
              Introducing Our Platform
            </span>
          </motion.div>
          
          <motion.h1 
            variants={fadeInUp}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight"
          >
            Transform Your <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Digital Experience</span>
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            A revolutionary platform designed to elevate your workflow, enhance productivity, and deliver exceptional results.
          </motion.p>
          
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
          >
            <Button size="lg" className="h-12 px-8 text-base">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8 text-base">
              View Demo
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { value: "99.9%", label: "Uptime" },
            { value: "10k+", label: "Active Users" },
            { value: "24/7", label: "Support" }
          ].map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <h3 className="text-4xl font-bold mb-2">{stat.value}</h3>
              <p className="text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to succeed in one integrated platform
          </p>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Testimonial Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="flex justify-center mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <blockquote className="text-xl italic mb-4">
            "This platform has completely transformed how our team works. The efficiency gains are incredible!"
          </blockquote>
          <cite className="text-muted-foreground">- Sarah Johnson, CEO at TechCorp</cite>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-8 md:p-12"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of satisfied users who have transformed their workflow with our platform.
            </p>
            <Button size="lg" className="h-12 px-8 text-base">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;