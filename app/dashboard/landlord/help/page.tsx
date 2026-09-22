import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function LandlordHelpPage() {
  // Sample FAQs data for landlords
  const faqs = [
    {
      id: 1,
      question: "How do I add a new property to my portfolio?",
      answer: "Navigate to the Properties section and click 'Add Property'. Fill in all required information including property details, unit configurations, and rental rates. You can upload photos and documents during the setup process.",
      category: "Property Management",
      helpful: 67
    },
    {
      id: 2,
      question: "How do I handle maintenance requests from tenants?",
      answer: "All maintenance requests appear in your Maintenance dashboard. You can assign them to technicians, track progress, and communicate with tenants. Set up automated notifications to stay updated on request status.",
      category: "Maintenance",
      helpful: 84
    },
    {
      id: 3,
      question: "What reports are available for financial tracking?",
      answer: "Access comprehensive financial reports including rent collection, expense tracking, profit/loss statements, and tax documentation. Reports can be generated monthly, quarterly, or annually and exported to PDF or Excel.",
      category: "Financial",
      helpful: 72
    },
    {
      id: 4,
      question: "How do I screen potential tenants?",
      answer: "Use our integrated tenant screening service to run background checks, credit reports, and employment verification. You can also set screening criteria and let the system automatically filter applications.",
      category: "Tenant Management",
      helpful: 91
    },
    {
      id: 5,
      question: "Can I customize lease agreements for my properties?",
      answer: "Yes, you can create custom lease templates or use our standard templates. Include property-specific clauses, rental terms, and policies. All leases are legally compliant and can be signed electronically.",
      category: "Legal",
      helpful: 58
    },
    {
      id: 6,
      question: "How do I handle late rent payments and fees?",
      answer: "Set up automated late fee policies and payment reminders. The system can automatically charge late fees, send notifications to tenants, and generate reports for tracking payment issues.",
      category: "Financial",
      helpful: 76
    }
  ]

  // Sample support tickets for landlords
  const supportTickets = [
    {
      id: "#BIZ-001",
      subject: "Integration with accounting software",
      status: "open",
      priority: "medium",
      created: "2024-05-01",
      lastUpdated: "2024-05-02",
      description: "Need help setting up QuickBooks integration for financial reporting."
    },
    {
      id: "#BIZ-002", 
      subject: "Bulk property import assistance",
      status: "resolved",
      priority: "low",
      created: "2024-04-28",
      lastUpdated: "2024-04-30",
      description: "Request for assistance with importing 50+ properties from previous system."
    },
    {
      id: "#BIZ-003",
      subject: "Tenant screening API questions",
      status: "in-progress",
      priority: "high", 
      created: "2024-04-30",
      lastUpdated: "2024-05-01",
      description: "Questions about customizing tenant screening criteria and reports."
    }
  ]

  // Sample business resources
  const resources = [
    {
      id: 1,
      title: "Property Management Best Practices",
      type: "PDF",
      size: "3.2 MB",
      description: "Comprehensive guide to effective property management strategies",
      category: "Business Guide"
    },
    {
      id: 2,
      title: "Tenant Screening Masterclass",
      type: "Video",
      duration: "12:30",
      description: "Learn how to effectively screen tenants and reduce vacancy rates",
      category: "Training"
    },
    {
      id: 3,
      title: "Financial Reporting Templates",
      type: "Excel",
      size: "2.1 MB",
      description: "Pre-built templates for tracking income, expenses, and ROI",
      category: "Templates"
    },
    {
      id: 4,
      title: "Legal Compliance Checklist",
      type: "PDF",
      size: "1.8 MB",
      description: "State-by-state requirements for rental property compliance",
      category: "Legal"
    },
    {
      id: 5,
      title: "Marketing Your Properties",
      type: "Video",
      duration: "8:45",
      description: "Effective strategies for advertising and filling vacancies",
      category: "Marketing"
    },
    {
      id: 6,
      title: "API Documentation",
      type: "Web",
      description: "Complete technical documentation for system integrations",
      category: "Technical"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="relative overflow-hidden rounded-3xl glass-card border border-border/50 p-6 md:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-background to-orange-500/10" />
        <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-r from-purple-500/20 to-orange-500/20 rounded-full blur-3xl" />
        
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-orange-600 text-white shadow-lg">
              <Icon name="HelpCircle" className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold gradient-text">Business Support</h1>
              <p className="text-muted-foreground text-base md:text-lg">Get expert help for your property management business.</p>
            </div>
            <Button className="btn-primary shadow-lg hover:shadow-xl w-full sm:w-auto">
              <Icon name="MessageSquare" className="mr-2 h-4 w-4" />
              Business Support
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-4">
        <Card className="glass-card border border-border/50 hover:border-primary/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-500 group overflow-hidden cursor-pointer">
          <CardContent className="p-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-100/50 dark:from-blue-950/30 dark:to-cyan-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Icon name="Briefcase" className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">Business Line</h3>
                <p className="text-muted-foreground text-sm">Priority business support</p>
                <p className="text-lg font-bold text-primary mt-2">(555) 247-BIZ</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border border-border/50 hover:border-primary/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-500 group overflow-hidden cursor-pointer">
          <CardContent className="p-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100/50 dark:from-green-950/30 dark:to-emerald-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Icon name="Mail" className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">Account Manager</h3>
                <p className="text-muted-foreground text-sm">Dedicated account support</p>
                <p className="text-sm font-medium text-primary mt-2">business@gingerly.com</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border border-border/50 hover:border-primary/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-500 group overflow-hidden cursor-pointer">
          <CardContent className="p-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-100/50 dark:from-orange-950/30 dark:to-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Icon name="Users" className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">Training Sessions</h3>
                <p className="text-muted-foreground text-sm">Live training & webinars</p>
                <p className="text-sm font-medium text-primary mt-2">Schedule Session</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border border-border/50 hover:border-primary/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-500 group overflow-hidden cursor-pointer">
          <CardContent className="p-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-100/50 dark:from-purple-950/30 dark:to-pink-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Icon name="Clock" className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">Business Hours</h3>
                <p className="text-muted-foreground text-sm">Monday - Saturday</p>
                <p className="text-sm font-medium text-primary mt-2">7:00 AM - 8:00 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="glass-card border border-border/50 p-1 bg-background/80 backdrop-blur-sm rounded-2xl shadow-md w-full md:w-auto">
          <TabsTrigger 
            value="faq" 
            className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-xl font-medium transition-all duration-200 flex-1 md:flex-none"
          >
            <Icon name="HelpCircle" className="mr-2 h-4 w-4" />
            Business FAQ
          </TabsTrigger>
          <TabsTrigger 
            value="tickets"
            className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-xl font-medium transition-all duration-200 flex-1 md:flex-none"
          >
            <Icon name="MessageSquare" className="mr-2 h-4 w-4" />
            Support Cases
          </TabsTrigger>
          <TabsTrigger 
            value="resources"
            className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-xl font-medium transition-all duration-200 flex-1 md:flex-none"
          >
            <Icon name="Book" className="mr-2 h-4 w-4" />
            Business Resources
          </TabsTrigger>
          <TabsTrigger 
            value="contact"
            className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-xl font-medium transition-all duration-200 flex-1 md:flex-none"
          >
            <Icon name="Phone" className="mr-2 h-4 w-4" />
            Contact Business
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-6">
          {/* Search */}
          <div className="glass-card border border-border/50 p-6 rounded-2xl bg-background/80 backdrop-blur-sm">
            <div className="relative">
              {/* h-4 w-4 restates .input-icon's size: <Icon> defaults to h-5 w-5, and
                  tailwind-merge cannot see that a non-Tailwind class sets a size. */}
              <Icon name="Search" className="input-icon h-4 w-4" />
              <Input 
                type="search" 
                placeholder="Search business FAQs and property management questions..." 
                /* !pl-10 because .input-modern @applies px-4 and lands later in the
                   utilities layer, so a plain pl-10 never wins and the placeholder
                   ran under the search icon. */
                className="input-modern !pl-10"
              />
            </div>
          </div>

          <Card className="glass-card border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-orange-600 text-white">
                  <Icon name="HelpCircle" className="h-5 w-5" />
                </div>
                Business & Property Management FAQ
              </CardTitle>
              <CardDescription className="text-base">Expert answers to common property management questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((faq, i) => (
                <Card key={faq.id} className="glass-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-4 md:p-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors duration-200 flex-1">
                          {faq.question}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge className={`px-2 py-1 text-xs font-semibold ${
                            faq.category === 'Property Management'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200'
                              : faq.category === 'Financial'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200'
                                : faq.category === 'Legal'
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200'
                                  : faq.category === 'Maintenance'
                                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200'
                          }`}>
                            {faq.category}
                          </Badge>
                          <Icon name="ChevronDown" className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-dashed border-border/50">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Icon name="ThumbsUp" className="h-4 w-4" />
                          <span>{faq.helpful} property managers found this helpful</span>
                        </div>
                        <Button variant="outline" size="sm" className="btn-outline">
                          <Icon name="ThumbsUp" className="mr-2 h-4 w-4" />
                          Helpful
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Business Support Cases</h2>
              <p className="text-muted-foreground">Manage your business support requests and technical issues</p>
            </div>
            <Button className="btn-primary w-full sm:w-auto">
              <Icon name="Plus" className="mr-2 h-4 w-4" />
              New Business Case
            </Button>
          </div>

          <Card className="glass-card border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <Icon name="MessageSquare" className="h-5 w-5" />
                </div>
                Your Support Cases
              </CardTitle>
              <CardDescription className="text-base">Track business support requests and technical assistance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {supportTickets.map((ticket, i) => (
                <Card key={ticket.id} className="glass-card border border-border/50 hover:border-primary/30 hover:shadow-lg hover:scale-[1.01] transition-all duration-300 group">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-2xl ${
                          ticket.status === 'open'
                            ? 'bg-gradient-to-r from-orange-500 to-yellow-600'
                            : ticket.status === 'in-progress'
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-600'
                              : 'bg-gradient-to-r from-green-500 to-emerald-600'
                        } flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          {ticket.status === 'open' && <Icon name="AlertTriangle" className="h-6 w-6" />}
                          {ticket.status === 'in-progress' && <Icon name="Clock" className="h-6 w-6" />}
                          {ticket.status === 'resolved' && <Icon name="CheckCircle" className="h-6 w-6" />}
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <p className="font-bold text-lg group-hover:text-primary transition-colors duration-200">{ticket.subject}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 px-2 py-1 text-xs font-semibold">
                                {ticket.id}
                              </Badge>
                              <Badge className={`px-2 py-1 text-xs font-semibold ${
                                ticket.priority === 'high'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200'
                                  : ticket.priority === 'medium'
                                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200'
                                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200'
                              }`}>
                                {ticket.priority} priority
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{ticket.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Created: {ticket.created}</span>
                            <span>• Last updated: {ticket.lastUpdated}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge className={`px-3 py-1 font-semibold ${
                          ticket.status === 'open'
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200'
                            : ticket.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200'
                              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200'
                        }`}>
                          {ticket.status === 'open' ? 'Open' : ticket.status === 'in-progress' ? 'In Progress' : 'Resolved'}
                        </Badge>
                        <Button variant="outline" size="sm" className="btn-outline hover:shadow-md">
                          <Icon name="MessageSquare" className="mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">Manage</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <Card className="glass-card border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-blue-600 text-white">
                  <Icon name="Book" className="h-5 w-5" />
                </div>
                Business Resources & Training
              </CardTitle>
              <CardDescription className="text-base">Expert guides, training materials, and business tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resources.map((resource, i) => (
                <Card key={resource.id} className="glass-card border border-border/50 hover:border-primary/30 hover:shadow-lg hover:scale-[1.01] transition-all duration-300 group">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-2xl ${
                          resource.type === 'PDF'
                            ? 'bg-gradient-to-r from-red-500 to-pink-600'
                            : resource.type === 'Video'
                              ? 'bg-gradient-to-r from-purple-500 to-blue-600'
                              : resource.type === 'Excel'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                : 'bg-gradient-to-r from-orange-500 to-yellow-600'
                        } flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          {resource.type === 'PDF' && <Icon name="FileText" className="h-6 w-6" />}
                          {resource.type === 'Video' && <Icon name="Video" className="h-6 w-6" />}
                          {resource.type === 'Excel' && <Icon name="BarChart3" className="h-6 w-6" />}
                          {resource.type === 'Web' && <Icon name="ExternalLink" className="h-6 w-6" />}
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <p className="font-bold text-lg group-hover:text-primary transition-colors duration-200">{resource.title}</p>
                            <Badge className={`px-2 py-1 text-xs font-semibold w-fit ${
                              resource.category === 'Business Guide'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200'
                                : resource.category === 'Training'
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200'
                                  : resource.category === 'Templates'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200'
                                    : resource.category === 'Legal'
                                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200'
                                      : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200'
                            }`}>
                              {resource.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{resource.description}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{resource.type}</span>
                            {resource.size && <span>• {resource.size}</span>}
                            {resource.duration && <span>• {resource.duration}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Button variant="outline" size="sm" className="btn-outline hover:shadow-md">
                          {resource.type === 'Web' ? <Icon name="ExternalLink" className="mr-2 h-4 w-4" /> : 
                           resource.type === 'Video' ? <Icon name="ExternalLink" className="mr-2 h-4 w-4" /> :
                           <Icon name="Download" className="mr-2 h-4 w-4" />}
                          <span className="hidden sm:inline">
                            {resource.type === 'Web' ? 'View' : 
                             resource.type === 'Video' ? 'Watch' : 'Download'}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Contact Form */}
            <Card className="glass-card border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-orange-600 text-white">
                    <Icon name="Send" className="h-5 w-5" />
                  </div>
                  Business Support Request
                </CardTitle>
                <CardDescription className="text-base">Get expert help for your property management business</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Name</label>
                  <Input placeholder="Your property management company" className="input-modern" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input placeholder="What business challenge can we help with?" className="input-modern" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select>
                    <SelectTrigger className="glass border border-border/50 rounded-xl">
                      <SelectValue placeholder="Select business category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="property-management">Property Management</SelectItem>
                      <SelectItem value="financial">Financial & Reporting</SelectItem>
                      <SelectItem value="tenant-management">Tenant Management</SelectItem>
                      <SelectItem value="integrations">Integrations & API</SelectItem>
                      <SelectItem value="training">Training & Onboarding</SelectItem>
                      <SelectItem value="account">Account Management</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select>
                    <SelectTrigger className="glass border border-border/50 rounded-xl">
                      <SelectValue placeholder="Business priority level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - General inquiry</SelectItem>
                      <SelectItem value="medium">Medium - Business impact</SelectItem>
                      <SelectItem value="high">High - Urgent business need</SelectItem>
                      <SelectItem value="critical">Critical - System down</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Portfolio Size</label>
                  <Select>
                    <SelectTrigger className="glass border border-border/50 rounded-xl">
                      <SelectValue placeholder="How many properties do you manage?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-5">1-5 properties</SelectItem>
                      <SelectItem value="6-20">6-20 properties</SelectItem>
                      <SelectItem value="21-50">21-50 properties</SelectItem>
                      <SelectItem value="51-100">51-100 properties</SelectItem>
                      <SelectItem value="100+">100+ properties</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea 
                    placeholder="Please describe your business needs or technical requirements in detail..." 
                    className="min-h-[120px] resize-none glass border border-border/50 rounded-xl"
                  />
                </div>
                <Button className="w-full btn-primary">
                  <Icon name="Send" className="mr-2 h-4 w-4" />
                  Submit Business Request
                </Button>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="glass-card border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      <Icon name="Info" className="h-5 w-5" />
                    </div>
                    Business Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-800">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center text-white">
                      <Icon name="Briefcase" className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Business Support Line</p>
                      <p className="text-lg font-bold text-primary">(555) 247-BIZ</p>
                      <p className="text-sm text-muted-foreground">Mon-Sat 7AM-8PM PST</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white">
                      <Icon name="Mail" className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Account Management</p>
                      <p className="text-lg font-bold text-primary">business@gingerly.com</p>
                      <p className="text-sm text-muted-foreground">Dedicated account support</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-200 dark:border-orange-800">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white">
                      <Icon name="TrendingUp" className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Sales & Upgrades</p>
                      <p className="text-lg font-bold text-primary">sales@gingerly.com</p>
                      <p className="text-sm text-muted-foreground">Business growth solutions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold">Business Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full btn-outline justify-start">
                    <Icon name="BarChart3" className="mr-2 h-4 w-4" />
                    Financial Reports
                  </Button>
                  <Button variant="outline" className="w-full btn-outline justify-start">
                    <Icon name="Building2" className="mr-2 h-4 w-4" />
                    Property Analytics
                  </Button>
                  <Button variant="outline" className="w-full btn-outline justify-start">
                    <Icon name="Users" className="mr-2 h-4 w-4" />
                    Tenant Screening
                  </Button>
                  <Button variant="outline" className="w-full btn-outline justify-start">
                    <Icon name="Settings" className="mr-2 h-4 w-4" />
                    API Documentation
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 